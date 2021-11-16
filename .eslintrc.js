const path = require("path");

const cwd = process.cwd();
const rootPath = cwd.endsWith("client") || cwd.endsWith("server") ? ".." : ".";

module.exports = {
    root: true,
    ignorePatterns: [
        "node_modules",
        "dist",
        "/server/src/types/graphql.ts", //auto generated
        ".eslintrc.js",
        "next-env.d.ts",
        "./types/**/*.d.ts",
        "next.config.js",
        "client/webpack-plugins", // production plugins,
    ],
    overrides: [
        {
            files: ["*.tsx", "*.ts", "*.jsx", "*.js"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                project: ["server/tsconfig.json", "client/tsconfig.json"],
                tsconfigRootDir: path.resolve(rootPath),
            },
            plugins: ["@typescript-eslint", "react-pug"],
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/eslint-recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking",
                "plugin:react-pug/all",
                "airbnb-typescript",
                "airbnb/hooks",
                "prettier",
            ],
            rules: {
                "react/react-in-jsx-scope": "off",
                "react/prop-types": "off",
                "consistent-return": "off",
                "react/jsx-props-no-spreading": [
                    "error",
                    {
                        html: "ignore",
                    },
                ],
                "import/no-extraneous-dependencies": "off",
                "@typescript-eslint/dot-notation": "off",
                "no-return-assign": ["error", "except-parens"],
                "no-param-reassign": [
                    "error",
                    { props: true, ignorePropertyModificationsFor: ["state"] },
                ],
                "import/prefer-default-export": "off",
                "react-pug/prop-types": "off",
                "react-pug/quotes": "off",
            },
            globals: {
                React: "writable",
            },
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
            rules: {
                "@graphql-eslint/no-unreachable-types": "error",
                "@graphql-eslint/no-deprecated": "warn",
                "@graphql-eslint/unique-fragment-name": "error",
                "@graphql-eslint/unique-operation-name": "error",
                "@graphql-eslint/no-hashtag-description": "error",
                "@graphql-eslint/no-anonymous-operations": "error",
                "@graphql-eslint/no-operation-name-suffix": "error",
                "@graphql-eslint/require-deprecation-reason": "error",
                "@graphql-eslint/avoid-operation-name-prefix": "off",
                "@graphql-eslint/selection-set-depth": "off",
                "@graphql-eslint/no-case-insensitive-enum-values-duplicates":
                    "error",
                "@graphql-eslint/require-description": [
                    "error",
                    { on: ["ObjectTypeDefinition"] },
                ],
                "@graphql-eslint/require-id-when-available": "warn",
                "@graphql-eslint/description-style": "error",
                "@graphql-eslint/naming-convention": [
                    "error",
                    {
                        FieldDefinition: "camelCase",
                        ObjectTypeDefinition: "PascalCase",
                        InputObjectTypeDefinition: "PascalCase",
                        EnumValueDefinition: "UPPER_CASE",
                        InputValueDefinition: "camelCase",
                        InterfaceTypeDefinition: "PascalCase",
                        EnumTypeDefinition: "PascalCase",
                        UnionTypeDefinition: "PascalCase",
                        ScalarTypeDefinition: "PascalCase",
                        FragmentDefinition: "UPPER_CASE",
                        OperationDefinition: "PascalCase",
                        QueryDefinition: "camelCase",
                        leadingUnderscore: "forbid",
                        trailingUnderscore: "forbid",
                    },
                ],
                "@graphql-eslint/input-name": [
                    "error",
                    { checkInputType: false },
                ],
                "@graphql-eslint/prettier": "error",
                "@graphql-eslint/fields-on-correct-type": "error",
                "@graphql-eslint/fragments-on-composite-type": "error",
                "@graphql-eslint/known-argument-names": "error",
                "@graphql-eslint/known-directives": "error",
                "@graphql-eslint/known-fragment-names": "error",
                "@graphql-eslint/known-type-names": "error",
                "@graphql-eslint/lone-anonymous-operation": "error",
                "@graphql-eslint/avoid-duplicate-fields": "error",
                "@graphql-eslint/lone-schema-definition": "error",
                "@graphql-eslint/no-fragment-cycles": "error",
                "@graphql-eslint/no-undefined-variables": "error",
                "@graphql-eslint/no-unused-fragments": "error",
                "@graphql-eslint/no-unused-variables": "error",
                "@graphql-eslint/overlapping-fields-can-be-merged": "error",
                "@graphql-eslint/possible-fragment-spread": "error",
                "@graphql-eslint/possible-type-extension": "error",
                "@graphql-eslint/provided-required-arguments": "error",
                "@graphql-eslint/scalar-leafs": "error",
                "@graphql-eslint/one-field-subscriptions": "error",
                "@graphql-eslint/unique-argument-names": "error",
                "@graphql-eslint/unique-directive-names": "error",
                "@graphql-eslint/unique-directive-names-per-location": "error",
                "@graphql-eslint/unique-enum-value-names": "error",
                "@graphql-eslint/unique-input-field-names": "error",
                "@graphql-eslint/unique-operation-types": "error",
                "@graphql-eslint/unique-variable-names": "error",
                "@graphql-eslint/value-literals-of-correct-type": "error",
                "@graphql-eslint/variables-are-input-types": "error",
                "@graphql-eslint/variables-in-allowed-position": "error",

                //TODO turn on if fixed, see: https://github.com/dotansimha/graphql-eslint/issues/277
                "@graphql-eslint/unique-type-names": "off",
                "@graphql-eslint/unique-field-definition-names": "off",
                "@graphql-eslint/executable-definitions": "off",
            },
        },
        // graphql-eslint end
    ],
};
