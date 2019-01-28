var $, MWaterDataSource, Schema, _, querystring;

$ = require('jquery');

_ = require('lodash');

Schema = require('mwater-expressions').Schema;

MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');

querystring = require('querystring');

module.exports = function(options, callback) {
  var query, url;
  query = {};
  if (options.client) {
    query.client = options.client;
  }
  if (options.share) {
    query.share = options.share;
  }
  if (options.asUser) {
    query.asUser = options.asUser;
  }
  if (options.extraTables && options.extraTables.length > 0) {
    query.extraTables = options.extraTables.join(',');
  }
  url = options.apiUrl + "schema?" + querystring.stringify(query);
  return $.getJSON(url, (function(_this) {
    return function(schemaJson) {
      var dataSource, schema;
      schema = new Schema(schemaJson);
      dataSource = new MWaterDataSource(options.apiUrl, options.client, {
        serverCaching: false,
        localCaching: true
      });
      return callback(null, {
        schema: schema,
        dataSource: dataSource
      });
    };
  })(this)).fail((function(_this) {
    return function(xhr) {
      console.error(xhr.responseText);
      return callback(new Error(xhr.responseText));
    };
  })(this));
};
