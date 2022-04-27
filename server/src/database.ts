import initKnex from "knex";

export const knex = initKnex({
    client: "sqlite3",
    connection: {
        filename: ":memory:",
    },
    useNullAsDefault: true,
});

// init db
knex.schema
    .createTable("sessions", (table) => {
        table.uuid("id").primary();
        table.json("user");
    })
    .catch((err) => {
        throw err;
    });
