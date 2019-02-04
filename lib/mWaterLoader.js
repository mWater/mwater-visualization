"use strict";

var $, MWaterDataSource, Schema, _, querystring;

$ = require('jquery');
_ = require('lodash');
Schema = require('mwater-expressions').Schema;
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');
querystring = require('querystring'); // Loads a schema and data source that is specific to mWater server
// options: 
//   apiUrl: e.g. "https://api.mwater.co/v3/". required
//   client: client id if logged in. optional
//   share: share if using a share to get schema. optional
//   asUser: Load schema as a specific user (for shared dashboards, etc). optional
//   extraTables: Extra tables to load in schema. Forms are not loaded by default as they are too many
// callback is called with (error, config) where config is { schema, dataSource }

module.exports = function (options, callback) {
  var query, url; // Load schema

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
  return $.getJSON(url, function (schemaJson) {
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
  }).fail(function (xhr) {
    console.error(xhr.responseText);
    return callback(new Error(xhr.responseText));
  });
};