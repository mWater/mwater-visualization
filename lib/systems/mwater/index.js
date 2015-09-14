var LayerFactory, MWaterDataSource, MWaterTableSelectElement, ReactSelect, Schema, SchemaBuilder, WidgetFactory, async, fs, querystring,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Schema = require('../../Schema');

SchemaBuilder = require('./SchemaBuilder');

LayerFactory = require('../../maps/LayerFactory');

MWaterDataSource = require('./MWaterDataSource');

WidgetFactory = require('../../widgets/WidgetFactory');

ReactSelect = require('react-select');

fs = require('fs');

async = require('async');

querystring = require('querystring');

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
          var addFormToSchema, createTableSelectElement, dataSource, formIds, schema, schemaBuilder;
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
          dataSource = new MWaterDataSource(options.apiUrl, options.client);
          addFormToSchema = function(formId, cb) {
            var url;
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
                }
                return cb();
              };
            })(this)).fail((function(_this) {
              return function(xhr) {
                return cb(new Error(xhr.responseText));
              };
            })(this));
          };
          formIds = options.formIds;
          createTableSelectElement = function(table, onChange) {
            return React.createElement(MWaterTableSelectElement, {
              apiUrl: options.apiUrl,
              client: options.client,
              schema: schema,
              table: table,
              onChange: function(newTable) {
                var formId;
                if (!newTable) {
                  return onChange(newTable);
                }
                if (schema.getTable(newTable)) {
                  return onChange(newTable);
                }
                formId = newTable.split(":")[1];
                return addFormToSchema(formId, function(err) {
                  if (err) {
                    throw err;
                  }
                  formIds = _.union(formIds, [formId]);
                  options.onFormIdsChange(formIds);
                  return onChange(newTable);
                });
              }
            });
          };
          schema.setCreateTableSelectElement(createTableSelectElement);
          return async.eachSeries(options.formIds || [], function(formId, callback) {
            return addFormToSchema(formId, callback);
          }, function(err) {
            var layerFactory, widgetFactory;
            if (err) {
              return cb(err);
            }
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
              units: units
            });
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

MWaterTableSelectElement = (function(superClass) {
  extend(MWaterTableSelectElement, superClass);

  function MWaterTableSelectElement() {
    this.getAsyncOptions = bind(this.getAsyncOptions, this);
    this.getFormOptions = bind(this.getFormOptions, this);
    return MWaterTableSelectElement.__super__.constructor.apply(this, arguments);
  }

  MWaterTableSelectElement.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  };

  MWaterTableSelectElement.prototype.getFormOptions = function(cb) {
    var query;
    query = {};
    if (this.props.client) {
      query.client = this.props.client;
    }
    query.fields = JSON.stringify({
      "design.name": 1,
      roles: 1,
      created: 1,
      modified: 1,
      state: 1
    });
    query.selector = JSON.stringify({
      design: {
        $exists: true
      },
      state: {
        $ne: "deleted"
      }
    });
    return $.getJSON(this.props.apiUrl + "forms?" + querystring.stringify(query), (function(_this) {
      return function(forms) {
        return cb(null, _.map(forms, function(form) {
          return {
            label: form.design.name.en,
            value: "responses:" + form._id
          };
        }));
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        return cb(new Error(xhr.responseText));
      };
    })(this));
  };

  MWaterTableSelectElement.prototype.getAsyncOptions = function(input, cb) {
    var options;
    options = _.map(this.props.schema.getTables(), function(t) {
      return {
        value: t.id,
        label: t.name
      };
    });
    return this.getFormOptions((function(_this) {
      return function(err, formOptions) {
        var i, len, opt;
        for (i = 0, len = formOptions.length; i < len; i++) {
          opt = formOptions[i];
          if (!_this.props.schema.getTable(opt.value)) {
            options.push(opt);
          }
        }
        return cb(null, {
          options: options,
          complete: true
        });
      };
    })(this));
  };

  MWaterTableSelectElement.prototype.render = function() {
    return React.createElement(ReactSelect, {
      value: this.props.table,
      onChange: this.props.onChange,
      options: _.map(this.props.schema.getTables(), function(t) {
        return {
          value: t.id,
          label: t.name
        };
      }),
      asyncOptions: this.getAsyncOptions
    });
  };

  return MWaterTableSelectElement;

})(React.Component);

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
