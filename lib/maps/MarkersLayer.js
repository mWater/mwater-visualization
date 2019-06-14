"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder,
    ExprCleaner,
    ExprCompiler,
    ExprUtils,
    Layer,
    LayerLegendComponent,
    LegendGroup,
    MarkersLayer,
    PopupFilterJoinsUtils,
    R,
    React,
    _,
    injectTableAlias,
    indexOf = [].indexOf;

_ = require('lodash');
React = require('react');
R = React.createElement;
Layer = require('./Layer');
ExprCompiler = require('mwater-expressions').ExprCompiler;
injectTableAlias = require('mwater-expressions').injectTableAlias;
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('../axes/AxisBuilder');
LegendGroup = require('./LegendGroup');
LayerLegendComponent = require('./LayerLegendComponent');
PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');
/*
Layer that is composed of markers
Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  symbol: symbol to use for layer. e.g. "font-awesome/bell". Will be converted on server to proper uri.
  markerSize: size in pixels of the markers. Default 10.
  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the marker is clicked
  popupFilterJoins: customizable filtering for popup. See PopupFilterJoins.md
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

LEGACY: sublayers array that contains above design

axes:
  geometry: where to place markers
  color: color axis (to split into series based on a color)

*/

module.exports = MarkersLayer =
/*#__PURE__*/
function (_Layer) {
  (0, _inherits2.default)(MarkersLayer, _Layer);

  function MarkersLayer() {
    (0, _classCallCheck2.default)(this, MarkersLayer);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(MarkersLayer).apply(this, arguments));
  }

  (0, _createClass2.default)(MarkersLayer, [{
    key: "getJsonQLCss",
    // Gets the layer definition as JsonQL + CSS in format:
    //   {
    //     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
    //     css: carto css
    //     interactivity: (optional) { layer: id of layer, fields: array of field names }
    //   }
    // arguments:
    //   design: design of layer
    //   schema: schema to use
    //   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
    value: function getJsonQLCss(design, schema, filters) {
      var layerDef; // Create design

      layerDef = {
        layers: [{
          id: "layer0",
          jsonql: this.createJsonQL(design, schema, filters)
        }],
        css: this.createCss(design, schema),
        interactivity: {
          layer: "layer0",
          fields: ["id"]
        }
      };
      return layerDef;
    }
  }, {
    key: "createJsonQL",
    value: function createJsonQL(design, schema, filters) {
      var axisBuilder, cluster, colorExpr, exprCompiler, filter, geometryExpr, i, innerquery, len, outerquery, relevantFilters, whereClauses;
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      exprCompiler = new ExprCompiler(schema); // Compile geometry axis

      geometryExpr = axisBuilder.compileAxis({
        axis: design.axes.geometry,
        tableAlias: "innerquery"
      }); // Convert to Web mercator (3857)

      geometryExpr = {
        type: "op",
        op: "ST_Transform",
        exprs: [geometryExpr, 3857]
      }; // row_number() over (partition by st_snaptogrid(location, !pixel_width!*5, !pixel_height!*5)) AS r

      cluster = {
        type: "select",
        expr: {
          type: "op",
          op: "row_number",
          exprs: []
        },
        over: {
          partitionBy: [{
            type: "op",
            op: "ST_SnapToGrid",
            exprs: [geometryExpr, {
              type: "op",
              op: "*",
              exprs: [{
                type: "token",
                token: "!pixel_width!"
              }, 5]
            }, {
              type: "op",
              op: "*",
              exprs: [{
                type: "token",
                token: "!pixel_height!"
              }, 5]
            }]
          }]
        },
        alias: "r"
      }; // Select _id, location and clustered row number

      innerquery = {
        type: "query",
        selects: [{
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: schema.getTable(design.table).primaryKey
          },
          alias: "id" // main primary key as id

        }, {
          type: "select",
          expr: geometryExpr,
          alias: "the_geom_webmercator" // geometry as the_geom_webmercator

        }, cluster],
        from: exprCompiler.compileTable(design.table, "innerquery")
      }; // Add color select if color axis

      if (design.axes.color) {
        colorExpr = axisBuilder.compileAxis({
          axis: design.axes.color,
          tableAlias: "innerquery"
        });
        innerquery.selects.push({
          type: "select",
          expr: colorExpr,
          alias: "color"
        });
      } // Create filters. First limit to bounding box


      whereClauses = [{
        type: "op",
        op: "&&",
        exprs: [geometryExpr, {
          type: "token",
          token: "!bbox!"
        }]
      }]; // Then add filters baked into layer

      if (design.filter) {
        whereClauses.push(exprCompiler.compileExpr({
          expr: design.filter,
          tableAlias: "innerquery"
        }));
      } // Then add extra filters passed in, if relevant
      // Get relevant filters


      relevantFilters = _.where(filters, {
        table: design.table
      });

      for (i = 0, len = relevantFilters.length; i < len; i++) {
        filter = relevantFilters[i];
        whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
      }

      whereClauses = _.compact(whereClauses); // Wrap if multiple

      if (whereClauses.length > 1) {
        innerquery.where = {
          type: "op",
          op: "and",
          exprs: whereClauses
        };
      } else {
        innerquery.where = whereClauses[0];
      } // Create outer query which takes where r <= 3 to limit # of points in a cluster


      outerquery = {
        type: "query",
        selects: [{
          type: "select",
          expr: {
            type: "op",
            op: "::text",
            exprs: [{
              type: "field",
              tableAlias: "innerquery",
              column: "id"
            }]
          },
          alias: "id" // innerquery._id::text as id

        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: "the_geom_webmercator"
          },
          alias: "the_geom_webmercator" // innerquery.the_geom_webmercator as the_geom_webmercator

        }, {
          type: "select",
          expr: {
            type: "op",
            op: "ST_GeometryType",
            exprs: [{
              type: "field",
              tableAlias: "innerquery",
              column: "the_geom_webmercator"
            }]
          },
          alias: "geometry_type" // ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type

        }],
        from: {
          type: "subquery",
          query: innerquery,
          alias: "innerquery"
        },
        where: {
          type: "op",
          op: "<=",
          exprs: [{
            type: "field",
            tableAlias: "innerquery",
            column: "r"
          }, 3]
        }
      }; // Add color select if color axis

      if (design.axes.color) {
        outerquery.selects.push({
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: "color"
          },
          alias: "color" // innerquery.color as color

        });
      }

      return outerquery;
    } // Creates CartoCSS

  }, {
    key: "createCss",
    value: function createCss(design, schema) {
      var css, i, item, len, ref, stroke, symbol;
      css = "";

      if (design.symbol) {
        symbol = "marker-file: url(".concat(design.symbol, ");");
        stroke = "marker-line-width: 60;";
      } else {
        symbol = "marker-type: ellipse;";
        stroke = "marker-line-width: 1;";
      } // Should only display markers when it is a point geometry


      css += '#layer0[geometry_type=\'ST_Point\'] {\n  marker-fill: ' + (design.color || "#666666") + ';\nmarker-width: ' + (design.markerSize || 10) + ';\nmarker-line-color: white;' + stroke + 'marker-line-opacity: 0.6;\nmarker-placement: point;' + symbol + '  marker-allow-overlap: true;\n}\n#layer0 {\n  line-color: ' + (design.color || "#666666") + ';\n  line-width: 3;\n}\n#layer0[geometry_type=\'ST_Polygon\'],#layer0[geometry_type=\'ST_MultiPolygon\'] {\n  polygon-fill: ' + (design.color || "#666666") + ';\n  polygon-opacity: 0.25;\n}\n'; // If color axes, add color conditions

      if (design.axes.color && design.axes.color.colorMap) {
        ref = design.axes.color.colorMap;

        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i]; // If invisible

          if (_.includes(design.axes.color.excludedValues, item.value)) {
            css += '#layer0[color=' + JSON.stringify(item.value) + '] { line-color: 0; marker-line-opacity: 0; marker-fill-opacity: 0; polygon-opacity: 0; }';
          } else {
            css += '#layer0[color=' + JSON.stringify(item.value) + '] { line-color: ' + item.color + ' }\n#layer0[color=' + JSON.stringify(item.value) + '][geometry_type=\'ST_Point\'] { marker-fill: ' + item.color + ' }\n#layer0[color=' + JSON.stringify(item.value) + '][geometry_type=\'ST_Polygon\'],#layer0[color=' + JSON.stringify(item.value) + '][geometry_type=\'ST_MultiPolygon\'] { \npolygon-fill: ' + item.color + '}';
          }
        }
      }

      return css;
    } // Called when the interactivity grid is clicked.
    // arguments:
    //   ev: { data: interactivty data e.g. `{ id: 123 }` }
    //   clickOptions:
    //     design: design of layer
    //     schema: schema to use
    //     dataSource: data source to use
    //     layerDataSource: layer data source
    //     scopeData: current scope data if layer is scoping
    //     filters: compiled filters to apply to the popup
    // Returns:
    //   null/undefined
    //   or
    //   {
    //     scope: scope to apply ({ name, filter, data })
    //     row: { tableId:, primaryKey: }  # row that was selected
    //     popup: React element to put into a popup
    //   }

  }, {
    key: "onGridClick",
    value: function onGridClick(ev, clickOptions) {
      var BlocksLayoutManager, WidgetFactory, filter, ids, popupFilterJoins, popupFilters, ref, results, table; // TODO abstract most to base class

      if (ev.data && ev.data.id) {
        table = clickOptions.design.table;
        results = {}; // Scope toggle item if ctrl-click

        if (ev.event.originalEvent.shiftKey) {
          ids = clickOptions.scopeData || [];

          if (ref = ev.data.id, indexOf.call(ids, ref) >= 0) {
            ids = _.without(ids, ev.data.id);
          } else {
            ids = ids.concat([ev.data.id]);
          } // Create filter for rows


          filter = {
            table: table,
            jsonql: {
              type: "op",
              op: "=",
              modifier: "any",
              exprs: [{
                type: "field",
                tableAlias: "{alias}",
                column: clickOptions.schema.getTable(table).primaryKey
              }, {
                type: "literal",
                value: ids
              }]
            }
          }; // Scope to item

          if (ids.length > 0) {
            results.scope = {
              name: "Selected ".concat(ids.length, " Markers(s)"),
              filter: filter,
              data: ids
            };
          } else {
            results.scope = null;
          }
        } // Popup


        if (clickOptions.design.popup && !ev.event.originalEvent.shiftKey) {
          // Create filter using popupFilterJoins
          popupFilterJoins = clickOptions.design.popupFilterJoins || PopupFilterJoinsUtils.createDefaultPopupFilterJoins(table);
          popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id);
          BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
          WidgetFactory = require('../widgets/WidgetFactory');
          results.popup = new BlocksLayoutManager().renderLayout({
            items: clickOptions.design.popup.items,
            style: "popup",
            renderWidget: function renderWidget(options) {
              var filters, widget, widgetDataSource;
              widget = WidgetFactory.createWidget(options.type);
              filters = clickOptions.filters.concat(popupFilters); // Get data source for widget

              widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id);
              return widget.createViewElement({
                schema: clickOptions.schema,
                dataSource: clickOptions.dataSource,
                widgetDataSource: widgetDataSource,
                design: options.design,
                scope: null,
                filters: filters,
                onScopeChange: null,
                onDesignChange: null,
                width: options.width,
                height: options.height,
                standardWidth: options.standardWidth
              });
            }
          });
        } else if (!ev.event.originalEvent.shiftKey) {
          results.row = {
            tableId: table,
            primaryKey: ev.data.id
          };
        }

        return results;
      } else {
        return null;
      }
    } // Gets the bounds of the layer as GeoJSON

  }, {
    key: "getBounds",
    value: function getBounds(design, schema, dataSource, filters, callback) {
      return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback);
    } // Get min and max zoom levels

  }, {
    key: "getMinZoom",
    value: function getMinZoom(design) {
      return design.minZoom;
    }
  }, {
    key: "getMaxZoom",
    value: function getMaxZoom(design) {
      return design.maxZoom;
    } // Get the legend to be optionally displayed on the map. Returns
    // a React element

  }, {
    key: "getLegend",
    value: function getLegend(design, schema, name, dataSource) {
      var filters = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

      var _filters, axisBuilder, exprCompiler, jsonql;

      _filters = filters.slice();

      if (design.filter != null) {
        exprCompiler = new ExprCompiler(schema);
        jsonql = exprCompiler.compileExpr({
          expr: design.filter,
          tableAlias: "{alias}"
        });

        if (jsonql) {
          _filters.push({
            table: design.filter.table,
            jsonql: jsonql
          });
        }
      }

      axisBuilder = new AxisBuilder({
        schema: schema
      });
      return React.createElement(LayerLegendComponent, {
        schema: schema,
        defaultColor: design.color,
        symbol: design.symbol || 'font-awesome/circle',
        markerSize: design.markerSize,
        name: name,
        dataSource: dataSource,
        filters: _.compact(_filters),
        axis: axisBuilder.cleanAxis({
          axis: design.axes.color,
          table: design.table,
          types: ['enum', 'text', 'boolean', 'date'],
          aggrNeed: "none"
        })
      });
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      if (design.table) {
        return [design.table];
      } else {
        return [];
      }
    } // True if layer can be edited

  }, {
    key: "isEditable",
    value: function isEditable() {
      return true;
    } // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters

  }, {
    key: "createDesignerElement",
    value: function createDesignerElement(options) {
      var _this = this;

      var MarkersLayerDesignerComponent; // Require here to prevent server require problems

      MarkersLayerDesignerComponent = require('./MarkersLayerDesignerComponent'); // Clean on way in and out

      return React.createElement(MarkersLayerDesignerComponent, {
        schema: options.schema,
        dataSource: options.dataSource,
        design: this.cleanDesign(options.design, options.schema),
        filters: options.filters,
        onDesignChange: function onDesignChange(design) {
          return options.onDesignChange(_this.cleanDesign(design, options.schema));
        }
      });
    } // Returns a cleaned design

  }, {
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      var axisBuilder, exprCleaner, ref;
      exprCleaner = new ExprCleaner(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // TODO clones entirely

      design = _.cloneDeep(design); // Migrate legacy sublayers

      if ((ref = design.sublayers) != null ? ref[0] : void 0) {
        design = _.extend({}, design, design.sublayers[0]);
      }

      delete design.sublayers;
      design.axes = design.axes || {};
      design.color = design.color || "#0088FF";
      design.axes.geometry = axisBuilder.cleanAxis({
        axis: design.axes.geometry,
        table: design.table,
        types: ['geometry'],
        aggrNeed: "none"
      });
      design.axes.color = axisBuilder.cleanAxis({
        axis: design.axes.color,
        table: design.table,
        types: ['enum', 'text', 'boolean', 'date'],
        aggrNeed: "none"
      });
      design.filter = exprCleaner.cleanExpr(design.filter, {
        table: design.table
      });
      return design;
    } // Validates design. Null if ok, message otherwise

  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      var axisBuilder, error;
      axisBuilder = new AxisBuilder({
        schema: schema
      });

      if (!design.table) {
        return "Missing table";
      }

      if (!design.axes || !design.axes.geometry) {
        return "Missing axes";
      }

      error = axisBuilder.validateAxis({
        axis: design.axes.geometry
      });

      if (error) {
        return error;
      }

      return null;
    }
  }, {
    key: "createKMLExportJsonQL",
    value: function createKMLExportJsonQL(design, schema, filters) {
      var axisBuilder, colorExpr, column, exprCompiler, extraFields, field, filter, geometryExpr, i, innerquery, j, len, len1, relevantFilters, valueExpr, whereClauses;
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      exprCompiler = new ExprCompiler(schema); // Compile geometry axis

      geometryExpr = axisBuilder.compileAxis({
        axis: design.axes.geometry,
        tableAlias: "innerquery"
      }); // Convert to Web mercator (3857)

      geometryExpr = {
        type: "op",
        op: "ST_Transform",
        exprs: [geometryExpr, 4326]
      }; // Select _id, location and clustered row number

      innerquery = {
        type: "query",
        selects: [{
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: schema.getTable(design.table).primaryKey
          },
          alias: "id" // main primary key as id

        }, {
          type: "select",
          expr: {
            type: "op",
            op: "ST_XMIN",
            exprs: [geometryExpr]
          },
          alias: "longitude" // innerquery.the_geom_webmercator as the_geom_webmercator

        }, {
          type: "select",
          expr: {
            type: "op",
            op: "ST_YMIN",
            exprs: [geometryExpr]
          },
          alias: "latitude" // innerquery.the_geom_webmercator as the_geom_webmercator

        }],
        from: exprCompiler.compileTable(design.table, "innerquery")
      };
      extraFields = ["code", "name", "desc", "type", "photos"];

      for (i = 0, len = extraFields.length; i < len; i++) {
        field = extraFields[i];
        column = schema.getColumn(design.table, field);

        if (column) {
          innerquery.selects.push({
            type: "select",
            expr: {
              type: "field",
              tableAlias: "innerquery",
              column: field
            },
            alias: field
          });
        }
      } // Add color select if color axis


      if (design.axes.color) {
        colorExpr = axisBuilder.compileAxis({
          axis: design.axes.color,
          tableAlias: "innerquery"
        });
        valueExpr = exprCompiler.compileExpr({
          expr: design.axes.color.expr,
          tableAlias: "innerquery"
        });
        innerquery.selects.push({
          type: "select",
          expr: colorExpr,
          alias: "color"
        });
        innerquery.selects.push({
          type: "select",
          expr: valueExpr,
          alias: "value"
        });
      } // Create filters. First limit to bounding box


      whereClauses = []; // Then add filters baked into layer

      if (design.filter) {
        whereClauses.push(exprCompiler.compileExpr({
          expr: design.filter,
          tableAlias: "innerquery"
        }));
      } // Then add extra filters passed in, if relevant
      // Get relevant filters


      relevantFilters = _.where(filters, {
        table: design.table
      });

      for (j = 0, len1 = relevantFilters.length; j < len1; j++) {
        filter = relevantFilters[j];
        whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
      }

      whereClauses = _.compact(whereClauses); // Wrap if multiple

      if (whereClauses.length > 1) {
        innerquery.where = {
          type: "op",
          op: "and",
          exprs: whereClauses
        };
      } else {
        innerquery.where = whereClauses[0];
      }

      return innerquery;
    }
  }, {
    key: "createKMLExportStyleInfo",
    value: function createKMLExportStyleInfo(design, schema, filters) {
      var style, symbol;

      if (design.symbol) {
        symbol = design.symbol;
      } else {
        symbol = "font-awesome/circle";
      }

      style = {
        color: design.color,
        symbol: symbol
      };

      if (design.axes.color && design.axes.color.colorMap) {
        style.colorMap = design.axes.color.colorMap;
      }

      return style;
    }
  }, {
    key: "getKMLExportJsonQL",
    value: function getKMLExportJsonQL(design, schema, filters) {
      var layerDef;
      layerDef = {
        layers: [{
          id: "layer0",
          jsonql: this.createKMLExportJsonQL(design, schema, filters),
          style: this.createKMLExportStyleInfo(design, schema, filters)
        }]
      };
      return layerDef;
    }
  }, {
    key: "acceptKmlVisitorForRow",
    value: function acceptKmlVisitorForRow(visitor, row) {
      return visitor.addPoint(row.latitude, row.longitude, row.name, visitor.buildDescription(row), row.color);
    }
  }]);
  return MarkersLayer;
}(Layer);