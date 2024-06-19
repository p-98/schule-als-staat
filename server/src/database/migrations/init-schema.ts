import type { Knex } from "Database";

export const name = "init-schema";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("sessions", (table) => {
        table.uuid("id").primary();
        table.json("userSignature");
        table.index("userSignature");
    });

    await knex.schema.createTable("bankAccounts", (table) => {
        table.uuid("id").primary();
        table.float("balance").notNullable();
        table.float("redemptionBalance").notNullable();
    });

    await knex.schema.createTable("guests", (table) => {
        table.uuid("id").primary();
        table.uuid("bankAccountId").notNullable().index();
        table.foreign("bankAccountId").references("id").inTable("bankAccounts");
        table.text("name");
        table.datetime("enteredAt").notNullable();
        table.datetime("leftAt");
    });

    await knex.schema.createTable("citizens", (table) => {
        table.uuid("id").primary();
        table.uuid("bankAccountId").notNullable().index();
        table.foreign("bankAccountId").references("id").inTable("bankAccounts");
        table.text("firstName").notNullable();
        table.text("lastName").notNullable();
        table.text("password").notNullable();
        table.text("image").notNullable();
        table.text("class");
    });

    await knex.schema.createTable("companies", (table) => {
        table.uuid("id").primary();
        table.uuid("bankAccountId").notNullable().index();
        table.foreign("bankAccountId").references("id").inTable("bankAccounts");
        table.text("name").notNullable();
        table.text("password").notNullable();
        table.text("image").notNullable();
    });

    await knex.schema.createTable("employments", (table) => {
        table.increments("id");
        table.uuid("companyId").notNullable().index();
        table.foreign("companyId").references("id").inTable("companies");
        table.uuid("citizenId").notNullable().index();
        table.foreign("citizenId").references("id").inTable("citizens");
        table.double("salary").notNullable();
        table.integer("minWorktime").notNullable();
        table.boolean("employer").notNullable();
        table.boolean("cancelled").notNullable();
    });

    await knex.schema.createTable("worktimes", (table) => {
        table.increments("id");
        table.integer("employmentId").notNullable().index();
        table.foreign("employmentId").references("id").inTable("employments");
        table.dateTime("start").notNullable();
        table.dateTime("end");
    });

    await knex.schema.createTable("employmentOffers", (table) => {
        table.increments("id");
        table.uuid("companyId").notNullable().index();
        table.foreign("companyId").references("id").inTable("companies");
        table.uuid("citizenId").notNullable().index();
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
        // null => draft (not paid); not null => transaction (paid)
        table.json("userSignature");
        table.text("fromCurrency").notNullable();
        table.double("fromValue").notNullable();
        table.text("toCurrency").notNullable();
        table.double("toValue").notNullable();
        table.text("clerkCitizenId").notNullable();
        table.foreign("clerkCitizenId").references("id").inTable("citizens");
        table.index("clerkCitizenId");
    });

    await knex.schema.createTable("purchaseTransactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("customerUserSignature");
        table.uuid("companyId").notNullable().index();
        table.foreign("companyId").references("id").inTable("companies");
        table.double("grossPrice").notNullable();
        table.double("tax").notNullable();
        table.double("discount");
    });

    await knex.schema.createTable("productSales", (table) => {
        table.uuid("purchaseId").notNullable().index();
        table
            .foreign("purchaseId")
            .references("id")
            .inTable("purchaseTransactions");
        table.uuid("productId").notNullable();
        table.uuid("productRevision").notNullable();
        table.index(["productId", "productRevision"]);
        table
            .foreign(["productId", "productRevision"])
            .references(["id", "revision"])
            .inTable("products");
        table.primary(["purchaseId", "productId"]);
        table.integer("amount").notNullable();
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
        table.integer("employmentId").notNullable().index();
        table.foreign("employmentId").references("id").inTable("employments");
        table.double("grossValue").notNullable();
        table.double("tax").notNullable();
        table.integer("worktimeId").index(); // null => bonus payment, not null => salary for endet shift
        table.foreign("worktimeId").references("id").inTable("worktimes");
    });

    await knex.schema.createTable("products", (table) => {
        table.uuid("id").notNullable();
        table.uuid("revision").notNullable();
        table.primary(["id", "revision"]);
        table.uuid("companyId").notNullable().index();
        table.foreign("companyId").references("id").inTable("companies");
        table.text("name").notNullable();
        table.double("price").notNullable();
        table.boolean("deleted").notNullable();
    });

    await knex.schema.createTable("votes", (table) => {
        table.uuid("id").primary();
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
        table.uuid("voteId").notNullable().index();
        table.foreign("voteId").references("id").inTable("votes");
        table.uuid("citizenId").notNullable().index();
        table.foreign("citizenId").references("id").inTable("citizens");
        table.primary(["voteId", "citizenId"]);
        // number[]
        table.json("vote").notNullable();
    });

    await knex.schema.createTable("stays", (table) => {
        table.increments("id");
        table.uuid("citizenId").notNullable().index();
        table.foreign("citizenId").references("id").inTable("citizens");
        table.datetime("enteredAt").notNullable();
        table.datetime("leftAt");
    });

    await knex.schema.createTable("warehouseOrders", (table) => {
        table.integer("purchaseId").primary();
        table
            .foreign("purchaseId")
            .references("id")
            .inTable("purchaseTransactions");
    });

    await knex.schema.createTable("cards", (table) => {
        table.text("id").primary();
        table.json("userSignature").index();
        table.boolean("blocked").notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    // reverse order to not violate foreign key constrains
    await knex.schema.dropTable("stays");
    await knex.schema.dropTable("votingPapers");
    await knex.schema.dropTable("votes");
    await knex.schema.dropTable("productSales");
    await knex.schema.dropTable("products");
    await knex.schema.dropTable("salaryTransactions");
    await knex.schema.dropTable("customsTransactions");
    await knex.schema.dropTable("purchaseTransactions");
    await knex.schema.dropTable("changeTransactions");
    await knex.schema.dropTable("transferTransactions");
    await knex.schema.dropTable("employmentOffers");
    await knex.schema.dropTable("worktimes");
    await knex.schema.dropTable("employments");
    await knex.schema.dropTable("companies");
    await knex.schema.dropTable("citizens");
    await knex.schema.dropTable("guests");
    await knex.schema.dropTable("bankAccounts");
    await knex.schema.dropTable("sessions");
}
