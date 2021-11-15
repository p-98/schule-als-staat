module.exports = {
    webpack: (config, options) => {
        config.resolveLoader.modules.push("./webpack-plugins");

        config.module.rules.push({
            test: /\.(tsx|ts|js|mjs|jsx)$/,
            use: "webpack-preprocessor-pug-tsx",
        });

        return config;
    },
};
