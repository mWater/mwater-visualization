path = require('path');

module.exports = {
  module: {
    loaders: [
      { test: /\.coffee$/, loader: "coffee-loader" },
    ],
  },
  resolve: {
    extensions: ["", ".coffee", ".js", ".json"],
  },
  externals: {
  	jquery: "$"
  }
};
