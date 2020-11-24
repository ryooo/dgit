const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

module.exports = {
    mode: "development",
    entry: ["react-hot-loader/patch", path.resolve(__dirname, "./src/index.tsx")],
    output: {
        path: path.resolve(__dirname, "dist/"),
        filename: "bundle.js"
    },
    devtool: "source-map",
    resolve: {
        modules: ["node_modules"],
        alias: {
            "react-dom": "@hot-loader/react-dom"
        },
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.(j|t)s(x)?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                }
            },
            {
                enforce: "pre",
                test: /\.ts(x?)$/,
                loader: "source-map-loader"
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: true,
                            reloadAll: true,
                        }
                    },
                    {
                        loader: "css-loader",
                    }
                ],
            }
        ]
    },
    devServer: {
        host: "localhost",
        contentBase: path.resolve(__dirname, "dist/"),
        port: 8080,
        inline: true,
        open: true,
        hot: true,
    },
    optimization: {
        minimizer: [new OptimizeCSSAssetsPlugin({})]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({ template: "./src/index.html" }),
        new MiniCssExtractPlugin({ filename: "./css/bundle.css" }),
    ]
};