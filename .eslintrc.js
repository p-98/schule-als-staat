const path = require("path");

const cwd = process.cwd();
const rootPath = cwd.endsWith("client") || cwd.endsWith("server") ? ".." : ".";

const regexCamelCase = "[a-z][a-zA-Z0-9]*";
const regexPascalCase = "[A-Z][a-zA-Z0-9]*";
const regexUpperCase = "[A-Z]+(?:_[A-Z0-9]+)*";
const regexFragment = `(?:${regexPascalCase})_(?:${regexPascalCase})Fragment`;

module.exports = {
    root: true,
    ignorePatterns: [
        "node_modules",
        "dist",
        "/server/src/types/schema.ts", // auto-generated
        "/server/__test__/graphql/", // auto-generated
        ".eslintrc.js",
        "webpack.config.js",
        "codegen.ts",
        "client/src/util/graphql/urql-introspection-plugin.js",
        "next-env.d.ts",
        "./types/**/*.d.ts",
        "@types/*",
        "scripts/*",
    ],
    overrides: [
        {
            files: ["*.tsx", "*.ts"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                project: ["server/tsconfig.json", "client/tsconfig.json"],
                tsconfigRootDir: path.resolve(rootPath),
            },
            plugins: ["@typescript-eslint"],
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/eslint-recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking",
                "airbnb-typescript",
                "airbnb/hooks",
                "prettier",
                "plugin:lodash-fp/recommended",
            ],
            rules: {
                "react/react-in-jsx-scope": "off",
                "react/require-default-props": "off",
                "react/prop-types": "off",
                "consistent-return": "off",
                "react/jsx-props-no-spreading": ["error", { html: "ignore" }],
                "import/no-extraneous-dependencies": "off",
                "@typescript-eslint/dot-notation": "off",
                "no-return-assign": ["error", "except-parens"],
                "no-param-reassign": [
                    "error",
                    { props: true, ignorePropertyModificationsFor: ["state"] },
                ],
                "import/prefer-default-export": "off",
                "@typescript-eslint/no-non-null-assertion": "off",
                "default-case": "off",
                "@typescript-eslint/switch-exhaustiveness-check": "error",
                // covered by @typescript-eslint/naming-convention
                "no-underscore-dangle": ["off"],
                "@typescript-eslint/naming-convention": [
                    // adjusted from airbnb-typescript
                    "error",
                    {
                        selector: "variable",
                        format: ["camelCase", "PascalCase", "UPPER_CASE"],
                        // indicates shadowing local variable
                        leadingUnderscore: "allow",
                        filter: {
                            match: false,
                            regex: regexFragment,
                        },
                    },
                    {
                        selector: "function",
                        format: ["camelCase", "PascalCase"],
                    },
                    {
                        selector: "typeLike",
                        format: ["PascalCase"],
                    },
                ],
                "@typescript-eslint/explicit-module-boundary-types": "error",
                "max-classes-per-file": "off",
                "lodash-fp/consistent-name": ["error", "lodash"],
            },
            globals: {
                React: "writable",
            },
        },
        {
            files: ["*.test.ts"],
            plugins: ["jest"],
            extends: ["plugin:jest/recommended"],
            rules: {
                "jest/expect-expect": [
                    "warn",
                    { assertFunctionNames: ["assert.*", "test*"] },
                ],
                "@typescript-eslint/naming-convention": [
                    // adjusted from airbnb-typescript
                    "error",
                    {
                        selector: "variable",
                        format: ["camelCase", "PascalCase", "UPPER_CASE"],
                        leadingUnderscore: "allow",
                    },
                    {
                        selector: "function",
                        format: ["camelCase", "PascalCase"],
                    },
                    {
                        selector: "typeLike",
                        format: ["PascalCase"],
                    },
                ],
                "no-underscore-dangle": "off",
            },
        },
        {
            files: ["server/**/*.js"],
            parserOptions: { ecmaVersion: 2021 },
        },

        // special configs for storybook files
        {
            files: [
                "*.stories.tsx",
                "*.stories.ts",
                "*.stories.jsx",
                "*.stories.js",
            ],
            rules: {
                "react/jsx-props-no-spreading": "off",
                "no-param-reassign": "off",
                "@typescript-eslint/no-shadow": "off",
            },
        },

        // qraphql-eslint start
        // {
        //     "files": ["*.tsx", "*.ts", "*.jsx", "*.js"],
        //     "processor": "@graphql-eslint/graphql"
        // },
        {
            files: ["*.graphql"],
            parser: "@graphql-eslint/eslint-plugin",
            plugins: ["@graphql-eslint"],
            extends: [
                "plugin:@graphql-eslint/schema-recommended",
                // "plugin:@graphql-eslint/operations-recommended",
            ],
            rules: {
                "@graphql-eslint/description-style": [
                    "error",
                    { style: "inline" },
                ],
                "@graphql-eslint/strict-id-in-types": [
                    "error",
                    {
                        exceptions: {
                            suffixes: ["Fragment"],
                        },
                        acceptedIdTypes: ["ID", "Int"],
                    },
                ],
            },
        },
        // graphql-eslint end
    ],
};
