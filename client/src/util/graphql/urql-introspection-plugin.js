const { introspectionFromSchema } = require("graphql");
const { minifyIntrospectionQuery } = require("@urql/introspection");

module.exports = {
    /** @type { import("@graphql-codegen/plugin-helpers").PluginFunction<{}> } */
    plugin(schema, documents, config, info) {
        const introspection = introspectionFromSchema(schema, {
            descriptions: false,
        });
        const minified = minifyIntrospectionQuery(introspection);
        return JSON.stringify(minified);
    },
};
