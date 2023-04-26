const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: ":memory:",
    },
    useNullAsDefault: true,
});
const {
    formatISO,
    startOfToday,
    endOfToday,
    addHours,
    subHours,
} = require("date-fns");
const eachHourOfInterval = require("date-fns/eachHourOfInterval");
const { eq, filter, keyBy, map, negate, pipe, zip } = require("lodash/fp");
const fp = require("date-fns/fp");

function values(rows) {
    const sql = rows
        .map((row) => `(${row.map(() => "?").join(",")})`)
        .join(",");
    return knex.raw(`values ${sql}`, rows.flat());
}
const clamp = (x, min, max) => `min(max(${min}, ${x}), ${max})`;
const unixepochDiff = (x, y) => `(unixepoch(${x}) - unixepoch(${y}))`;

const parseDateAndTime = (date, time) => new Date(`${date}T${time}`);
const toISOString = (date) => date.toISOString();

async function main() {
    await knex.schema.createTable("purchaseTransactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        // table.json("customerUserSignature").notNullable();
        table.uuid("companyId").notNullable();
        // table.foreign("companyId").references("id").inTable("companies");
        table.double("grossPrice").notNullable();
        table.double("netPrice").notNullable();
        // table.double("discount");
    });
    await knex.schema.createTable("salaryTransactions", (table) => {
        table.increments("id");
        // table.datetime("date").notNullable();
        table.integer("employmentId").notNullable();
        // table.foreign("employmentId").references("id").inTable("employments");
        table.double("grossValue").notNullable();
        // table.double("netValue").notNullable();
        table.integer("worktimeId");
    });
    await knex.schema.createTable("employments", (table) => {
        table.integer("id").primary();
        table.uuid("companyId").notNullable();
        // table.foreign("companyId").references("id").inTable("companies");
        // table.uuid("citizenId").notNullable();
        // table.foreign("citizenId").references("id").inTable("citizens");
        // table.double("salary").notNullable();
        // table.integer("minWorktime").notNullable();
        // table.boolean("employer").notNullable();
        // table.boolean("cancelled").notNullable();
    });
    await knex.schema.createTable("worktimes", (table) => {
        table.integer("id").primary();
        table.integer("employmentId").notNullable();
        // table.foreign("employmentId").references("id").inTable("employments");
        table.dateTime("start").notNullable();
        table.dateTime("end");
    });

    const today = formatISO(new Date(), { representation: "date" });
    const halfPast = new Date(`${today}T13:30:00.000+02:00`);
    const companyId = "companyId";
    await knex("purchaseTransactions").insert([
        {
            date: halfPast.toISOString(),
            companyId,
            grossPrice: 10,
            netPrice: 10,
        },
        {
            date: addHours(halfPast, 1).toISOString(),
            companyId,
            grossPrice: 20,
            netPrice: 20,
        },
        {
            date: addHours(halfPast, 1).toISOString(),
            companyId,
            grossPrice: 30,
            netPrice: 30,
        },
    ]);
    const employmentId = 0;
    await knex("salaryTransactions").insert([
        {
            employmentId,
            worktimeId: 0,
            grossValue: 100,
        },
        {
            employmentId,
            worktimeId: 1,
            grossValue: 200,
        },
        {
            employmentId,
            worktimeId: 2,
            grossValue: 300,
        },
        {
            employmentId,
            worktimeId: 3,
            grossValue: 400,
        },
        {
            employmentId,
            worktimeId: null,
            grossValue: 10000,
        },
    ]);
    const worktimes = await knex("worktimes").insert(
        [
            {
                id: 0,
                employmentId,
                start: subHours(halfPast, 2).toISOString(),
                end: subHours(halfPast, 1).toISOString(),
            },
            {
                id: 1,
                employmentId,
                start: subHours(halfPast, 1).toISOString(),
                end: halfPast.toISOString(),
            },
            {
                id: 2,
                employmentId,
                start: halfPast.toISOString(),
                end: addHours(halfPast, 1).toISOString(),
            },
            {
                id: 3,
                employmentId,
                start: addHours(halfPast, 1).toISOString(),
                end: addHours(halfPast, 2).toISOString(),
            },
        ],
        undefined
    );
    console.log("worktimes: ", worktimes);
    await knex("employments").insert({ id: employmentId, companyId });

    const open = "09:00:00+02:00";
    const close = "16:00:00+02:00";
    const openInterval = {
        start: parseDateAndTime(today, open),
        end: parseDateAndTime(today, close),
    };
    const startOfHours = pipe(
        eachHourOfInterval,
        filter(negate(eq(openInterval.end)))
    )(openInterval);
    const hoursStartEnd = zip(
        map(toISOString, startOfHours),
        map(pipe(fp.addHours(1), toISOString), startOfHours)
    );

    const clampToHour = (x) => clamp(x, "hours.start", "hours.end");
    const staffSql = `
        with
        hours(start, end) as (:values),
        withRatio as (
            select
                hours.start as startOfHour,
                st.grossValue as shiftSalary,
                ${unixepochDiff(
                    clampToHour("worktimes.end"),
                    clampToHour("worktimes.start")
                )} / 3600.0 as ratio
            from hours
            left join employments on employments.companyId = :companyId
            left join salaryTransactions as st on st.employmentId = employments.id
            left join worktimes on worktimes.id = st.worktimeId),
        withSalary as
            (select startOfHour, ratio, shiftSalary * ratio as hourSalary from withRatio)
        select startOfHour, total(ratio) as staff, total(hourSalary) as cost
        from withSalary
        group by startOfHour
    `.replaceAll(/\n\s*/g, " ");
    const staffQuery = knex.raw(staffSql, {
        values: values(hoursStartEnd),
        companyId,
    });
    console.log(staffQuery.toString());
    const staff = await staffQuery;
    console.table(staff);

    const startOfHour = (col) => `strftime('%Y-%m-%dT%H:00:00.000Z', ${col})`;
    const revenueQuery = knex("purchaseTransactions")
        .select(knex.raw(`${startOfHour("date")} as startOfHour`))
        .where({ companyId })
        .andWhereBetween("date", [
            startOfToday().toISOString(),
            endOfToday().toISOString(),
        ])
        .groupBy("startOfHour")
        .sum({ grossRevenue: "grossPrice" })
        .sum({ netRevenue: "netPrice" });
    console.log(revenueQuery.toString());
    const revenue = await revenueQuery;
    const revenueDic = keyBy("startOfHour", revenue);
    console.table(revenue);

    const result = staff.map(({ startOfHour, staff, cost: staffCost }) => ({
        startOfHour,
        staff,
        staffCost,
        grossRevenue: revenueDic[startOfHour]?.grossRevenue ?? 0,
        netRevenue: revenueDic[startOfHour]?.netRevenue ?? 0,
        profit: (revenueDic[startOfHour]?.netRevenue ?? 0) - staffCost,
    }));
    console.table(result);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(() => knex.destroy());
