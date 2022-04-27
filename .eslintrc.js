const path = require("path");

const cwd = process.cwd();
const rootPath = cwd.endsWith("client") || cwd.endsWith("server") ? ".." : ".";

module.exports = {
    root: true,
    ignorePatterns: [
        "node_modules",
        "dist",
        "/server/src/types/schema.ts", //auto generated
        ".eslintrc.js",
        "webpack.config.js",
        "next-env.d.ts",
        "./types/**/*.d.ts",
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
            ],
            rules: {
                "react/react-in-jsx-scope": "off",
                "react/require-default-props": "off",
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
            extends: [
                "plugin:@graphql-eslint/schema-recommended",
                // "plugin:@graphql-eslint/operations-recommended",
            ],
            rules: {
                "@graphql-eslint/naming-convention": [
                    "error",
                    {
                        types: "PascalCase",
                        FieldDefinition: "camelCase",
                        InputValueDefinition: "camelCase",
                        Argument: "camelCase",
                        DirectiveDefinition: "camelCase",
                        EnumValueDefinition: "camelCase",
                        "FieldDefinition[parent.name.value=Query]": {
                            forbiddenPrefixes: ["query", "get"],
                            forbiddenSuffixes: ["Query"],
                        },
                        "FieldDefinition[parent.name.value=Mutation]": {
                            forbiddenPrefixes: ["mutation"],
                            forbiddenSuffixes: ["Mutation"],
                        },
                        "FieldDefinition[parent.name.value=Subscription]": {
                            forbiddenPrefixes: ["subscription"],
                            forbiddenSuffixes: ["Subscription"],
                        },
                    },
                ],
            },
        },
        // graphql-eslint end
    ],
};
