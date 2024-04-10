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
const knex = await createKnex(config.database.file);
await knex.migrate.up({ name: "init-schema" });
const keller = await seedUser(knex, { type: "CITIZEN", id: "j.keller" });
const neben = await seedUser(knex, { type: "CITIZEN", id: "m.neben" });
const donutsLtd = await seedUser(knex, { type: "COMPANY", id: "donuts.ltd" });
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
        action: "VIRTUAL_TO_REAL",
        valueVirtual: 6,
        valueReal: 2,
    },
    {
        date: formatDateTimeZ(nextDate()),
        // @ts-expect-error debug insert
        userSignature: stringifyUserSignature(keller),
        action: "REAL_TO_VIRTUAL",
        valueVirtual: 6,
        valueReal: 2,
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
await knex("cards").insert({ id: "emptyCardId", blocked: false });
await knex("cards").insert({
    id: "userCardId",
    blocked: false,
    // @ts-expect-error debug insert
    userSignature: stringifyUserSignature(keller),
});
await knex.destroy();
