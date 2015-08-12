var MWaterDataSource, Schema, SchemaBuilder;

Schema = require('../../Schema');

SchemaBuilder = require('./SchemaBuilder');

MWaterDataSource = require('./MWaterDataSource');

exports.createDataSource = function(apiUrl, client) {
  return new MWaterDataSource(apiUrl, client);
};

exports.createSchema = function(apiUrl, client, cb) {
  var clientUrl;
  if (client) {
    clientUrl = "?client=" + client;
  } else {
    clientUrl = "";
  }
  return $.getJSON(apiUrl + ("entity_types" + clientUrl), (function(_this) {
    return function(entity_types) {
      return $.getJSON(apiUrl + ("properties" + clientUrl), function(properties) {
        return $.getJSON(apiUrl + ("units" + clientUrl), function(units) {
          var schema, schemaBuilder;
          schema = new Schema();
          schemaBuilder = new SchemaBuilder();
          schemaBuilder.addEntities(schema, entity_types, properties, units);
          schemaBuilder.addLegacyTables(schema);
          return cb(null, schema);
        }).fail(function(xhr) {
          return cb(new Error(xhr.responseText));
        });
      }).fail(function(xhr) {
        return cb(new Error(xhr.responseText));
      });
    };
  })(this)).fail((function(_this) {
    return function(xhr) {
      return cb(new Error(xhr.responseText));
    };
  })(this));
};
