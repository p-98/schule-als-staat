import { addHours } from "date-fns/fp";
import config from "../config";
import { createKnex } from "../server/src/database/database";
import { formatDateTimeZ } from "../server/src/util/date";
import { stringifyUserSignature } from "../server/src/util/parse";
import { seedUser } from "../server/src/util/test";

const dateFactory = () => {
    let currentDate = new Date();
    return {
        nextDate: () => {
            return (currentDate = addHours(1, currentDate));
        },
    };
};

const { nextDate } = dateFactory();
const [db, knex] = await createKnex(config.database.file, {
    client: "sqlite3",
});
await knex.migrate.up({ name: "init-schema" });
const keller = await seedUser(knex, {
    type: "CITIZEN",
    id: "j.keller",
    class: "5a",
});
const neben = await seedUser(knex, {
    type: "CITIZEN",
    id: "m.neben",
    class: "5b",
});
const koch = await seedUser(knex, { type: "CITIZEN", id: "m.koch" });
const donutsLtd = await seedUser(knex, { type: "COMPANY", id: "donuts.ltd" });
const bank = await seedUser(knex, {
    type: "COMPANY",
    id: config.roles.bankCompanyId,
});
const borderControl = await seedUser(knex, {
    type: "COMPANY",
    id: config.roles.borderControlCompanyId,
});
const donut = {
    id: "productId",
    revision: "productRevision",
    companyId: donutsLtd.id,
    name: "Donut",
    price: 2,
    deleted: false,
};
await knex("products").insert(donut);
const [employment] = await knex("employments")
    .insert({
        companyId: donutsLtd.id,
        citizenId: keller.id,
        salary: 4,
        minWorktime: 300,
        employer: false,
        cancelled: false,
    })
    .returning("id");
await knex("transferTransactions").insert([
    {
        date: formatDateTimeZ(nextDate()),
        senderUserSignature: stringifyUserSignature(keller),
        receiverUserSignature: stringifyUserSignature(donutsLtd),
        value: 5,
        purpose: "Just for fun",
    },
    {
        date: formatDateTimeZ(nextDate()),
        senderUserSignature: stringifyUserSignature(donutsLtd),
        receiverUserSignature: stringifyUserSignature(keller),
        value: 5,
        purpose: null,
    },
]);
await knex("changeTransactions").insert([
    {
        date: formatDateTimeZ(nextDate()),
        // @ts-expect-error debug insert
        userSignature: stringifyUserSignature(keller),
        fromCurrency: "plancko-digital",
        fromValue: 2.0,
        toCurrency: "plancko-analog",
        toValue: 4.0,
        clerkCitizenId: neben.id,
    },
    {
        date: formatDateTimeZ(nextDate()),
        // @ts-expect-error debug insert
        userSignature: stringifyUserSignature(keller),
        fromCurrency: "plancko-analog",
        fromValue: 2.0,
        toCurrency: "plancko-digital",
        toValue: 1.0,
        clerkCitizenId: neben.id,
    },
]);
const [donutPurchase] = await knex("purchaseTransactions")
    .insert([
        {
            date: formatDateTimeZ(nextDate()),
            // @ts-expect-error debug insert
            customerUserSignature: stringifyUserSignature(keller),
            companyId: donutsLtd.id,
            grossPrice: 5,
            tax: 1,
            discount: 1,
        },
    ])
    .returning("id");
await knex("productSales").insert({
    purchaseId: donutPurchase.id,
    productId: donut.id,
    productRevision: donut.revision,
    amount: 3,
});
await knex("customsTransactions").insert([
    {
        date: formatDateTimeZ(nextDate()),
        userSignature: stringifyUserSignature(keller),
        customs: 2,
    },
]);
await knex("salaryTransactions").insert({
    date: formatDateTimeZ(nextDate()),
    employmentId: employment.id,
    grossValue: 5,
    tax: 1,
    worktimeId: null,
});
await knex("cards").insert([
    { id: "emptyCardId", blocked: false },
    {
        id: "kellerCardId",
        blocked: false,
        // @ts-expect-error debug insert
        userSignature: stringifyUserSignature(keller),
    },
    {
        id: "donutsCardId",
        blocked: false,
        // @ts-expect-error debug insert
        userSignature: stringifyUserSignature(donutsLtd),
    },
]);
await knex.destroy();
