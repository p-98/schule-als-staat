/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access */
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { HotModuleReplacementPlugin } = require("webpack");
const hq = require("alias-hq");

/** @returns {import('webpack').Configuration} */
module.exports = (env, argv) => {
    const production = argv.mode === "production";

    return {
        mode: argv.mode,
        entry: [
            ...(production ? [] : ["webpack/hot/poll?1000"]),
            "./src/index.ts",
        ],
        resolve: {
            extensions: [".js", ".ts"],
            alias: hq.get("webpack", { format: "array" }),
        },
        externals: [
            nodeExternals({
                modulesDir: "../node_modules",
                allowlist: ["webpack/hot/poll?1000"],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                    options: {
                        transpileOnly: true,
                    },
                },
                {
                    test: /\.(graphql|gql)$/,
                    exclude: /node_modules/,
                    loader: "graphql-tag/loader",
                },
            ],
        },
        output: {
            filename: "server.js",
            path: path.resolve(__dirname, "dist"),
        },
        plugins: [
            new CleanWebpackPlugin(),
            ...(production ? [new ESLintPlugin({ files: "." })] : []),
            ...(production
                ? [new ForkTsCheckerWebpackPlugin({ formatter: "basic" })]
                : []),
            ...(!production ? [new HotModuleReplacementPlugin()] : []),
        ],
        stats: production ? "normal" : "errors-warnings",
        target: "node",
        watch: !production,
    };
};
