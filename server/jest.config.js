const hp = require("alias-hq");
const { compilerOptions } = require("./tsconfig");

const { mapValues } = require("lodash/fp");

/** @type {import('jest').Config} */
module.exports = {
    roots: ["<rootDir>"],
    moduleFileExtensions: ["ts", "js", "d.ts"],
    testMatch: ["**/*.test.ts"],
    modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: hp.get("jest"),
    injectGlobals: false,
    transform: {
        "^.+\\.ts$": ["@swc/jest"],
        "^.+\\.(gql|graphql)$": "@graphql-tools/jest-transform",
    },
};
