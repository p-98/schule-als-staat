/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access */
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = (env, argv) => {
    const production = argv.mode === "production";

    return {
        mode: argv.mode,
        entry: [
            ...(production ? [] : ["webpack/hot/poll?1000"]),
            "./src/server.ts",
        ],
        resolve: {
            extensions: [".js", ".ts"],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: "./tsconfig.json",
                    extensions: [".js", ".ts"],
                }),
            ],
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
            ...(production
                ? [
                      new ForkTsCheckerWebpackPlugin({
                          eslint: {
                              files: ".",
                              // options: {
                              //     baseConfig: {},
                              // },
                          },
                          formatter: "basic",
                      }),
                  ]
                : [new webpack.HotModuleReplacementPlugin()]),
        ],
        stats: production ? "normal" : "errors-warnings",
        target: "node",
        watch: !production,
    };
};
