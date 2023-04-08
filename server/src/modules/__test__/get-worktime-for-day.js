const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: ":memory:",
    },
    useNullAsDefault: true,
});

async function main() {
    await knex.schema.createTable("test", (table) => {
        table.increments("id");
        table.integer("number");
    });

    const sumQuery = knex("test").select().sum({ sum: "number" }).first();

    console.log("before: ", await sumQuery);
    await knex("test").insert({ number: null });
    console.log("after null insert: ", await sumQuery);
    await knex("test").insert({ number: 2 });
    console.log("after number insert: ", await sumQuery);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(() => knex.destroy());
