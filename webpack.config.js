path = require('path');

module.exports = {
  entry: ['./src/demo.coffee'],
  devtool: "eval",
  output: {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'dist', 'js'),
    publicPath: 'http://localhost:3000/js/'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: ["react-hot-loader", "coffee-loader"] }
    ]
  },
  resolve: {
    extensions: [".coffee", ".js", ".json"]
  },
  externals: {
    jquery: "$",
    lodash: '_',
    underscore: '_',
    backbone: 'Backbone',
    d3: "d3",
    c3: "c3"
  }
};