path = require('path');

module.exports = {
  entry: ['./src/demo.coffee'],
  mode: "development",
  output: {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'dist', 'js'),
    publicPath: 'http://localhost:3000/js/'
  },
  module: {
    rules: [
      { test: /\.coffee$/, use: "coffee-loader" },
      { test: /\.css$/, use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
      ]},
      {   
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }      
    ]
  },
  resolve: {
    extensions: [".coffee", ".js", ".json"]
  },
  externals: {
    jquery: "$",
    lodash: '_'
  }
};