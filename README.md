# React + TypeScriptプロジェクトを手動で作成する(Webpack)

## 事前準備
`node`コマンドと`npm`コマンドが使えるようにしておく。  

```
node -v
v12.16.1

npm -v
6.14.8
```

## 手順

1. `package.json`を作成する

```bash
npm init -y
```

`package.json`

```json
{
  "name": "react-sample-app",
  "version": "1.0.0",
  "description": "",
  "main": "webpack.config.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack  --mode=production",
    "start": "webpack-dev-server --hot --mode=development"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```


2. 必要なパッケージをインストールする

- インストールするパッケージ  

    - webpack、webpack-cli
    - typescript、ts-loader、source-map-loader
    - react、react-dom、@types/react、@types/react-dom
    - webpack-dev-server
    - fork-ts-checker-webpack-plugin
    - html-webpack-plugin
    - react-hot-loader、@hot-loader/react-dom
    - css-loader、mini-css-extract-plugin、@types/mini-css-extract-plugin
    - optimize-css-assets-webpack-plugin、@types/optimize-css-assets-webpack-plugin

- インストールコマンド

```bash
npm install --save-dev webpack webpack-cli typescript ts-loader source-map-loader react react-dom @types/react @types/react-dom webpack-dev-server fork-ts-checker-webpack-plugin html-webpack-plugin react-hot-loader @hot-loader/react-dom css-loader mini-css-extract-plugin @types/mini-css-extract-plugin optimize-css-assets-webpack-plugin @types/optimize-css-assets-webpack-plugin
```


3. `tsconfig.json`を作成する

```bash
npx tsc --init
```

`tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "outDir": "./dist/",
    "strict": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "checkJs": true,
    "jsx": "react",
    "lib": [
      "ES2015",
      "DOM"
    ]
  }
}
```


4. `webpack.config.js`を作成する

```bash
touch webpack.config.js
```

`webpack.config.js`

```JavaScript
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
        new MiniCssExtractPlugin({ filename: "./css/style.css" }),
    ]
};
```


5. TypeScriptでReactアプリを用意する

`src`フォルダを作成し、その配下にアプリを用意する。  
アプリを用意できた時点でのフォルダ構成は次の通りとなる。  

```
.
├── package-lock.json
├── package.json
├── src
│   ├── components
│   │   ├── Bingo.tsx
│   │   ├── Card.tsx
│   │   ├── Enums.tsx
│   │   ├── Machine.tsx
│   │   └── Square.tsx
│   ├── css
│   │   └── style.css
│   ├── index.html
│   └── index.tsx
├── tsconfig.json
└── webpack.config.js
```


6. `webpack-dev-server`で開発用サーバーを起動する

```bash
npm start
```

サーバーを起動するとブラウザが開く。  
サーバー起動中はcssやtsxの変更を検知して、ブウラザに自動で反映される。  
このとき、`src/index.tsx`で`react-hot-loader`を有効にしているとtsxの変更はStateの変更を維持した反映となる。  

※ `webpack.config.js`の`devServer`で接続ポートなどの設定を変えることができる。  



7. ビルドする

```bash
npm run build
```

`dist`フォルダが新たに作成され、ビルドされたファイルが出力される。  
`index.html`をブラウザで開くとアプリを確認できる。  

```
./dist/
├── bundle.js
├── bundle.js.map
├── css
│   └── style.css
└── index.html
```

※ ビルドされたファイルがmin化されたくない場合は、`development`モードでビルドすればよい。  

```bash
npx webpack --mode=development
```


## webpack.config.jsをTypeScriptに移行

8. `ts-node`をインストールする

```bash
npm install --save-dev ts-node
```


9. `webpack.config.js`を`webpack.config.ts`に名前変更し、修正する

`webpack.config.ts`

```TypeScript
import * as path from "path";
import * as webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";

const config: webpack.ConfigurationFactory = (env, argv) => {
    const isDevelopmentMode = argv.mode === "development";

    return {
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
                                hmr: isDevelopmentMode,
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
            new MiniCssExtractPlugin({ filename: "./css/style.css" }),
        ]
    };
}

export default config;
```


10. `package.json`の`main`を修正する

`package.json` (一部抜粋)

```json
{
    "description": "",
    "main": "webpack.config.ts",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "build": "webpack  --mode=production",
        "start": "webpack-dev-server --hot --mode=development"
    },
}
```


11. 開発用サーバーの起動やビルドが同様に行えることを確認する

- 開発用サーバーを起動

    ```bash
    npm start
    ```

- ビルド

    ```bash
    npm run build
    ```



## 参考
https://qiita.com/humi/items/49a7472e9a10558ea5c0  
https://qiita.com/humi/items/72485614151fe564dceb  
https://qiita.com/SoraKumo/items/5d92b15d06778458f5e1  
https://numb86-tech.hatenablog.com/entry/2018/10/24/221130  
https://webpack.js.org/plugins/mini-css-extract-plugin/  
https://qiita.com/sathoshi-metal/items/b9ce118cca9b75b2e0a9  
