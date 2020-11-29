const path = require("path");

module.exports = {
    mode: "development",
    entry: "./dist/main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        libraryTarget: "commonjs",
    },
    resolve: {
        extensions: [".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: [
                            "@babel/plugin-proposal-nullish-coalescing-operator",
                            "@babel/plugin-proposal-optional-chaining",
                        ],
                    },
                },
            },
        ],
    },
    target: "node",
    externals: ["electron"],
};
