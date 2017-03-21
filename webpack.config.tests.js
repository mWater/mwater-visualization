path = require('path');

module.exports = {
  entry: ['./test/tests.js'],
  devtool: "source-map",
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: "/"
  },
  // output: {
  //   filename: 'bundle.js',
  //   path: path.resolve(__dirname, 'dist', 'js'),
  //   publicPath: 'http://localhost:3000/dist/'
  // },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: ["coffee-loader"] }
    ]
  },
  resolve: {
    extensions: [".coffee", ".js", ".json"]
  },
  externals: {
    xlsx: "XLSX"
  }  
}