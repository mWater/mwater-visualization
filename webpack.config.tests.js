module.exports = {
  entry: ['webpack-dev-server/client?http://localhost:8081', './test/index.js'],
  devtool: "eval",
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.coffee$/, use: "coffee-loader" },
      { test: /\.css$/, use: "css-loader" },
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
  }
};
