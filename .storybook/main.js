const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const path = require("path");

module.exports = {
    core: {
        builder: "webpack5",
    },
    stories: [
        "../client/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
        // "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    ],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials"],

    /**
     * fixing storybook being unable to compile typescript paremeter properties from https://github.com/storybookjs/storybook/issues/13834
     */
    babel: async (options) => ({
        ...options,
        presets: [
            ["@babel/preset-env", { shippedProposals: true }],
            "@babel/preset-typescript",
            ["@babel/preset-react", { runtime: "automatic" }],
        ],
        plugins: ["@babel/plugin-transform-typescript", ...options.plugins],
    }),

    /**
     * Parts of the webpack-config from gist.github.com/justincy/b8805ae2b333ac98d5a3bd9f431e8f70
     */
    webpackFinal: (baseConfig) => {
        // Modify or replace config. Mutating the original reference object can cause unexpected bugs.
        const { module = {} } = baseConfig;

        const newConfig = {
            ...baseConfig,
            module: {
                ...module,
                rules: [...(module.rules || [])],
            },
        };

        if (!newConfig.resolve.plugins) newConfig.resolve.plugins = [];
        newConfig.resolve.plugins.push(
            new TsconfigPathsPlugin({
                configFile: "./client/tsconfig.json",
            })
        );

        // First we prevent webpack from using Storybook CSS rules to process CSS modules
        newConfig.module.rules.find(
            (rule) => rule.test.toString() === "/\\.css$/"
        ).exclude = /\.module\.css$/;

        // Then we tell webpack what to do with CSS modules
        newConfig.module.rules.push({
            test: /\.module\.css$/,
            include: path.resolve(__dirname, "../client/src"),
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        importLoaders: 1,
                        modules: true,
                    },
                },
            ],
        });

        return newConfig;
    },
};
