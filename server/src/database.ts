import initKnex from "knex";

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
        table.json("user_signature");
    });

    await knex.schema.createTable("bank_accounts", (table) => {
        table.string("id").primary();
        table.float("balance").notNullable();
        table.float("redemption_balance").notNullable();
    });

    await knex.schema.createTable("guests", (table) => {
        table.string("id").primary();
        table.string("bank_account").notNullable();
        table.string("name");
        table.datetime("entered_at").notNullable();
        table.datetime("left_at");
    });

    await knex.schema.createTable("citizens", (table) => {
        table.string("id").primary();
        table.string("bank_account").notNullable();
        table.string("first_name").notNullable();
        table.string("last_name").notNullable();
        table.string("full_name").notNullable();
        table.text("image").notNullable();
    });

    await knex.schema.createTable("companies", (table) => {
        table.string("id").primary();
        table.string("bank_account").notNullable();
        table.string("name").notNullable();
        table.text("image").notNullable();
    });

    await knex.schema.createTable("employments", (table) => {
        table.string("company_id").references("id").inTable("companies");
        table.string("employee_id").references("id").inTable("citizens");
        table.primary(["company_id", "employee_id"]);
        table.datetime("active_since");
        table.json("worktime").notNullable();
        table.double("salary").notNullable();
        table.time("hours").notNullable();
        table.boolean("cancelled");
    });

    await knex.schema.createTable("employment_offers", (table) => {
        table.string("company_id").references("id").inTable("companies");
        table.string("employee_id").references("id").inTable("citizens");
        table.primary(["company_id", "employee_id"]);
        table.string("state").notNullable().checkIn(["PENDING", "REJECTED"]);
        table.double("salary").notNullable();
        table.time("hours").notNullable();
    });

    await knex.schema.createTable("transfer_transactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("sender_signature").notNullable();
        table.json("receiver_signature").notNullable();
        table.double("value").notNullable();
        table.text("purpose");
    });

    await knex.schema.createTable("change_transactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("user_signature").notNullable();
        table
            .string("action")
            .notNullable()
            .checkIn(["VIRTUAL_TO_REAL", "REAL_TO_VIRTUAL"]);
        table.double("value_virtual").notNullable();
        table.double("value_real").notNullable();
    });

    await knex.schema.createTable("purchase_transactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("customer_signature").notNullable();
        table.json("vendor_signature").notNullable();
        table.double("gross_price").notNullable();
        table.double("net_price").notNullable();
        table.double("discount");
    });

    await knex.schema.createTable("customs_transactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.json("user_signature").notNullable();
        table.double("customs").notNullable();
    });

    await knex.schema.createTable("salary_transactions", (table) => {
        table.increments("id");
        table.datetime("date").notNullable();
        table.string("employment_id").notNullable();
        table.double("gross_value").notNullable();
        table.double("net_value").notNullable();
        table.datetime("work_start");
        table.datetime("work_end");
    });

    await knex.schema.createTable("products", (table) => {
        table.string("id").primary();
        table.string("name").notNullable();
        table.double("price").notNullable();
    });

    await knex.schema.createTable("product_sales", (table) => {
        table
            .foreign("purchase_id")
            .references("id")
            .inTable("purchase_transactions");
        table.foreign("product_id").references("id").inTable("products");
        table.primary(["purchase_id", "product_id"]);
        table.integer("amount").notNullable();
        table.double("gross_revenue").notNullable();
    });

    await knex.schema.createTable("votes", (table) => {
        table.increments("id");
        table.string("type").notNullable().checkIn(["CONSENSUS", "RADIO"]);
        table.string("title").notNullable();
        table.text("description").notNullable();
        table.text("image").notNullable();
        table.datetime("end_at").notNullable();
        table.json("choices").notNullable();
        table.json("result");
        table.text("chart_info");
    });

    await knex.schema.createTable("voting_papers", (table) => {
        table.foreign("vote_id").references("id").inTable("votes");
        table.foreign("citizen_id").references("id").inTable("citizens");
        table.primary(["vote_id", "citizen_id"]);
        table.json("vote").notNullable();
    });
})().catch((err) => {
    throw err;
});
