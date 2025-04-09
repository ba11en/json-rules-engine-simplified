const webpack = require("webpack");
const path = require("path");

module.exports = {
  mode: "production", // Enable production optimizations (including minification by default)
  context: path.resolve(__dirname, "src"), // Modernized path resolution
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
    filename: "json-rules-engine-simplified.js",
    library: "JSONSchemaForm",
    libraryTarget: "umd",
    globalObject: "this" // Ensure UMD works in both browser and Node.js environments
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
  ],
  devtool: "source-map", // Kept as-is for debugging; can change to "cheap-source-map" if build speed is a concern
  externals: [
    {
      react: {
        root: "React",
        commonjs: "react",
        commonjs2: "react",
        amd: "react"
      }
    }
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/, // Exclude node_modules for faster builds
        use: ["babel-loader"]
      }
    ]
  },
  optimization: {
    minimize: true // Enable minification (replaces --optimize-minimize)
    // Webpack 5 uses TerserPlugin by default for minification; no need to add it unless you need custom options
  }
};