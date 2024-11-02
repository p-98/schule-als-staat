const hq = require("alias-hq");

/** @type {import('jest').Config} */
module.exports = {
    moduleFileExtensions: ["ts", "js", "d.ts"],
    testMatch: ["**/*.test.ts"],
    modulePaths: ["<rootDir>"],
    moduleNameMapper: hq.get("jest", { format: "array" }),
    injectGlobals: false,
    transform: {
        "^.+\\.ts$": ["@swc/jest"],
    },
};
