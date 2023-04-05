import initKnex from "knex";
import { formatRFC3339 } from "date-fns";

export const knex = initKnex({
    client: "sqlite3",
    connection: {
        filename: ":memory:",
    },
    useNullAsDefault: true,
});

// init db
(async () => {
    await knex.schema.createTable("sessions", (table) => {
        table.uuid("id").primary();
        table.json("userSignature");
    });

    await knex.schema.createTable("bankAccounts", (table) => {
        table.uuid("id").primary();
        table.float("balance").notNullable();
        table.float("redemptionBalance").notNullable();
    });

    await knex.schema.createTable("guests", (table) => {
        table.uuid("id").primary();
        table.text("cardId").notNullable();
        table.uuid("bankAccountId").notNullable();
        table.foreign("bankAccountId").references("id").inTable("bankAccounts");
        table.text("name");
        table.datetime("enteredAt").notNullable();
        table.datetime("leftAt");
    });

    await knex.schema.createTable("citizens", (table) => {
        table.uuid("id").primary();
        table.uuid("bankAccountId").notNullable();
        table.foreign("bankAccountId").references("id").inTable("bankAccounts");
        table.text("firstName").notNullable();
        table.text("lastName").notNullable();
        table.text("password").notNullable();
        table.text("image").notNullable();
    });

    await knex.schema.createTable("companies", (table) => {
        table.uuid("id").primary();
        table.uuid("bankAccountId").notNullable();
        table.foreign("bankAccountId").references("id").inTable("bankAccounts");
        table.text("name").notNullable();
        table.text("password").notNullable();
        table.text("image").notNullable();
    });

    await knex.schema.createTable("employments", (table) => {
        table.increments("id");
        table.uuid("companyId").notNullable();
        table.foreign("companyId").references("id").inTable("companies");
        table.uuid("citizenId").notNullable();
        table.foreign("citizenId").references("id").inTable("citizens");
        table.double("salary").notNullable();
        table.integer("minWorktime").notNullable();
        table.boolean("employer").notNullable();
        table.boolean("cancelled").notNullable();
    });

    await knex.schema.createTable("worktimes", (table) => {
        table.increments("id");
        table.integer("employmentId").notNullable();
        table.foreign("employmentId").references("id").inTable("employments");
        table.dateTime("start").notNullable();
        table.dateTime("end");
    });

    await knex.schema.createTable("employmentOffers", (table) => {
        table.increments("id");
        table.uuid("companyId").notNullable();
        table.foreign("companyId").references("id").inTable("companies");
        table.uuid("citizenId").notNullable();
        table.foreign("citizenId").references("id").inTable("citizens");
        table
            .text("state")
            .notNullable()
            .checkIn(["PENDING", "REJECTED", "ACCEPTED", "DELETED"]);
        table.text("rejectionReason");
        table.double("salary").notNullable();
        table.integer("minWorktime").notNullable();
    });

    await knex.schema.createTable("transferTransactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("senderUserSignature").notNullable();
        table.json("receiverUserSignature").notNullable();
        table.double("value").notNullable();
        table.text("purpose");
    });

    await knex.schema.createTable("changeTransactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("userSignature").notNullable();
        table
            .string("action")
            .notNullable()
            .checkIn(["VIRTUAL_TO_REAL", "REAL_TO_VIRTUAL"]);
        table.double("valueVirtual").notNullable();
        table.double("valueReal").notNullable();
    });

    await knex.schema.createTable("purchaseTransactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("customerUserSignature").notNullable();
        table.uuid("companyId").notNullable();
        table.foreign("companyId").references("id").inTable("companies");
        table.double("grossPrice").notNullable();
        table.double("netPrice").notNullable();
        table.double("discount");
    });

    await knex.schema.createTable("customsTransactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("userSignature").notNullable();
        table.double("customs").notNullable();
    });

    await knex.schema.createTable("salaryTransactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.integer("employmentId").notNullable();
        table.foreign("employmentId").references("id").inTable("employments");
        table.double("grossValue").notNullable();
        table.double("netValue").notNullable();
        table.integer("worktimeId"); // null => bonus payment, not null => salary for endet shift
        table.foreign("worktimeId").references("id").inTable("worktimes");
    });

    await knex.schema.createTable("products", (table) => {
        table.uuid("id").primary();
        table.uuid("companyId").notNullable();
        table.foreign("companyId").references("id").inTable("companies");
        table.text("name").notNullable();
        table.double("price").notNullable();
        table.boolean("deleted").notNullable();
    });
    // await createInsertIdTrigger("products", productIdBytes);

    await knex.schema.createTable("productSales", (table) => {
        table.uuid("purchaseId").notNullable();
        table
            .foreign("purchaseId")
            .references("id")
            .inTable("purchaseTransactions");
        table.uuid("productId").notNullable();
        table.foreign("productId").references("id").inTable("products");
        table.primary(["purchaseId", "productId"]);
        table.integer("amount").notNullable();
        table.double("grossRevenue").notNullable();
    });

    await knex.schema.createTable("votes", (table) => {
        table.increments("id");
        table.text("type").notNullable().checkIn(["CONSENSUS", "RADIO"]);
        table.text("title").notNullable();
        table.text("description").notNullable();
        table.text("image").notNullable();
        table.datetime("endAt").notNullable();
        // string[]
        table.json("choices").notNullable();
        // number[]
        table.json("result");
        table.text("chartInfo");
    });

    await knex.schema.createTable("votingPapers", (table) => {
        table.uuid("voteId").notNullable();
        table.foreign("voteId").references("id").inTable("votes");
        table.uuid("citizenId").notNullable();
        table.foreign("citizenId").references("id").inTable("citizens");
        table.primary(["voteId", "citizenId"]);
        // number[]
        table.json("vote").notNullable();
    });

    await knex.schema.createTable("stays", (table) => {
        table.increments("id");
        table.uuid("citizenId").notNullable();
        table.foreign("citizenId").references("id").inTable("citizens");
        table.datetime("enteredAt").notNullable();
        table.datetime("leftAt");
    });

    // DEBUG data inserts
    await knex("customsTransactions").insert([
        { date: formatRFC3339(new Date()), userSignature: "", customs: 1 },
        { date: formatRFC3339(new Date()), userSignature: "", customs: 2 },
    ]);
    await knex("changeTransactions").insert([
        {
            date: formatRFC3339(new Date()),
            userSignature: "",
            action: "REAL_TO_VIRTUAL",
            valueVirtual: 1,
            valueReal: 1,
        },
        {
            date: formatRFC3339(new Date()),
            userSignature: "",
            action: "REAL_TO_VIRTUAL",
            valueVirtual: 2,
            valueReal: 2,
        },
    ]);
})().catch((err) => {
    throw err;
});
