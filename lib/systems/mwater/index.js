var MWaterDataSource, Schema, SchemaBuilder, fs;

Schema = require('../../Schema');

SchemaBuilder = require('./SchemaBuilder');

MWaterDataSource = require('./MWaterDataSource');

fs = require('fs');

exports.SchemaBuilder = SchemaBuilder;

exports.createDataSource = function(apiUrl, client) {
  return new MWaterDataSource(apiUrl, client);
};

exports.createSchema = function(options, cb) {
  var clientUrl;
  if (options.client) {
    clientUrl = "?client=" + options.client;
  } else {
    clientUrl = "";
  }
  return $.getJSON(options.apiUrl + ("entity_types" + clientUrl), (function(_this) {
    return function(entity_types) {
      return $.getJSON(options.apiUrl + ("properties" + clientUrl), function(properties) {
        return $.getJSON(options.apiUrl + ("units" + clientUrl), function(units) {
          var schema, schemaBuilder;
          schema = new Schema();
          schemaBuilder = new SchemaBuilder(schema);
          if (options.form) {
            schemaBuilder.addForm(options.form);
          }
          schemaBuilder.addEntities(entity_types, properties, units, options.user, options.groups);
          schemaBuilder.addLegacyTables();
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

exports.getPropertiesStructure = function(properties, entityType) {
  var mapStructure, structure;
  structure = null;
  switch (entityType) {
    case "water_point":
      structure = Schema.parseStructureFromText(fs.readFileSync(__dirname + '/structures/water_point.txt', 'utf-8'));
  }
  if (!structure) {
    return _.map(properties, function(p) {
      return {
        type: "property",
        property: p
      };
    });
  }
  mapStructure = function(str) {
    return _.compact(_.map(str, function(item) {
      var prop;
      if (item.type === "column") {
        prop = _.findWhere(properties, {
          code: item.column
        });
        if (prop) {
          return {
            type: "property",
            property: prop
          };
        }
      } else if (item.type === "section") {
        return {
          type: "section",
          name: item.name,
          contents: mapStructure(item.contents)
        };
      }
    }));
  };
  return mapStructure(structure);
};
