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
            "react-dom": "@hot-loader/react-dom",
            "@styles": path.resolve(__dirname, 'styles'),
            "@src": path.resolve(__dirname, 'src'),
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
            },
            {
                test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000',
            }
        ]
    },
    devServer: {
        host: "localhost",
        contentBase: path.resolve(__dirname, "dist/"),
        port: 8080,
        inline: true,
        open: false,
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