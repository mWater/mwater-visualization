module.exports = {
  entry: ['webpack-dev-server/client?http://localhost:8081', './test/index.js'],
  devtool: "eval",
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: ["coffee-loader"] }
    ]
  },
  resolve: {
    extensions: [".coffee", ".js", ".json"]
  }
};
