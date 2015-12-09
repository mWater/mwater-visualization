var LayerFactory, MWaterDataSource, Schema, SchemaBuilder, WidgetFactory, async, fs;

Schema = require('../../Schema');

SchemaBuilder = require('./SchemaBuilder');

LayerFactory = require('../../maps/LayerFactory');

MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource');

WidgetFactory = require('../../widgets/WidgetFactory');

fs = require('fs');

async = require('async');

exports.SchemaBuilder = SchemaBuilder;

exports.setup = function(options, cb) {
  var clientUrl;
  if (options.client) {
    clientUrl = "?client=" + options.client;
  } else {
    clientUrl = "";
  }
  return $.getJSON(options.apiUrl + ("entity_types" + clientUrl), (function(_this) {
    return function(entityTypes) {
      return $.getJSON(options.apiUrl + ("properties" + clientUrl), function(properties) {
        return $.getJSON(options.apiUrl + ("units" + clientUrl), function(units) {
          var dataSource, layerFactory, loadExtraTable, loadExtraTables, schema, schemaBuilder, widgetFactory;
          schema = new Schema();
          schemaBuilder = new SchemaBuilder(schema);
          schemaBuilder.addEntities({
            entityTypes: entityTypes,
            properties: properties,
            units: units,
            user: options.user,
            groups: options.groups
          });
          schemaBuilder.addLegacyTables();
          dataSource = new MWaterDataSource(options.apiUrl, options.client, options.caching != null ? options.caching : true);
          loadExtraTable = function(tableId, cb) {
            var formId, url;
            if (!tableId.match(/^responses:/)) {
              return cb();
            }
            if (schema.getTable(tableId)) {
              return cb();
            }
            formId = tableId.split(":")[1];
            url = options.apiUrl;
            url += "forms?selector=" + encodeURIComponent(JSON.stringify({
              _id: formId
            }));
            if (options.client) {
              url += "&client=" + options.client;
            }
            return $.getJSON(url, (function(_this) {
              return function(forms) {
                var form;
                if (forms[0]) {
                  form = forms[0];
                  schemaBuilder.addForm(form);
                  return cb();
                } else {
                  return cb(new Error("Form " + formId + " not found or access denied"));
                }
              };
            })(this)).fail((function(_this) {
              return function(xhr) {
                return cb(new Error(xhr.responseText));
              };
            })(this));
          };
          loadExtraTables = function(tableIds, callback) {
            return async.eachSeries(tableIds || [], loadExtraTable, callback);
          };
          layerFactory = new LayerFactory({
            schema: schema,
            dataSource: dataSource,
            apiUrl: options.apiUrl,
            client: options.client,
            newLayers: options.newLayers || [
              {
                name: "Custom Layer",
                type: "Markers",
                design: {}
              }
            ],
            onMarkerClick: options.onMarkerClick
          });
          widgetFactory = new WidgetFactory({
            schema: schema,
            dataSource: dataSource,
            layerFactory: layerFactory
          });
          return cb(null, {
            schema: schema,
            dataSource: dataSource,
            layerFactory: layerFactory,
            widgetFactory: widgetFactory,
            entityTypes: entityTypes,
            properties: properties,
            units: units,
            loadExtraTables: loadExtraTables
          });
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
