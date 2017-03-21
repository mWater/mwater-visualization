module.exports = {
  entry: './test/index.js',
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
