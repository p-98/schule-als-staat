const { pathsToModuleNameMapper } = require("ts-jest");
const { defaults: tsjPreset } = require("ts-jest/presets");
const { compilerOptions } = require("./tsconfig");

const { mapValues } = require("lodash/fp");

/** @type {import('jest').Config} */
module.exports = {
    roots: ["<rootDir>"],
    moduleFileExtensions: ["js", "ts", "d.ts"],
    testMatch: ["**/*.test.ts"],
    modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: mapValues(
        (path) => `<rootDir>/${path}`,
        pathsToModuleNameMapper(compilerOptions.paths)
    ),
    injectGlobals: false,
    transform: {
        ...tsjPreset.transform,
        "\\.(gql|graphql)$": "@graphql-tools/jest-transform",
    },
};
