"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder, ClusterLayer, ExprCleaner, ExprCompiler, ExprUtils, Layer, LayerLegendComponent, LegendGroup, R, React, _, injectTableAlias;

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
/*
Layer which clusters markers, counting them

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  textColor: color of text. default #FFFFFF
  fillColor: color of markers that text is drawn on. default #337ab7
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

axes:
  geometry: locations to cluster

*/

module.exports = ClusterLayer =
/*#__PURE__*/
function (_Layer) {
  (0, _inherits2.default)(ClusterLayer, _Layer);

  function ClusterLayer() {
    (0, _classCallCheck2.default)(this, ClusterLayer);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ClusterLayer).apply(this, arguments));
  }

  (0, _createClass2.default)(ClusterLayer, [{
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
        css: this.createCss(design, schema, filters)
      }; // interactivity: {
      //   layer: "layer0"
      //   fields: ["id"]
      // }

      return layerDef;
    }
  }, {
    key: "createJsonQL",
    value: function createJsonQL(design, schema, filters) {
      var axisBuilder, centerExpr, clustExpr, cntExpr, exprCompiler, filter, geometryExpr, gridExpr, i, inner2Query, innerQuery, len, query, relevantFilters, sizeExpr, whereClauses;
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      exprCompiler = new ExprCompiler(schema);
      /*
      Query:
        Works by first snapping to grid and then clustering the clusters with slower DBSCAN method
         select 
          ST_Centroid(ST_Collect(center)) as the_geom_webmercator,
          sum(cnt) as cnt, 
          log(sum(cnt)) * 6 + 14 as size from 
            (
              select 
              ST_ClusterDBSCAN(center, (!pixel_width!*30 + !pixel_height!*30)/2, 1) over () as clust,
              sub1.center as center,
              cnt as cnt
              from
              (
                select 
                count(*) as cnt, 
                ST_Centroid(ST_Collect(<geometry axis>)) as center, 
                ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40) as grid
                from <table> as main
                where <geometry axis> && !bbox! 
                  and <geometry axis> is not null
                  and <other filters>
                group by 3
              ) as sub1
            ) as sub2 
          group by sub2.clust
       */
      // Compile geometry axis

      geometryExpr = axisBuilder.compileAxis({
        axis: design.axes.geometry,
        tableAlias: "main"
      }); // Convert to Web mercator (3857)

      geometryExpr = {
        type: "op",
        op: "ST_Transform",
        exprs: [geometryExpr, 3857]
      }; // ST_Centroid(ST_Collect(<geometry axis>))

      centerExpr = {
        type: "op",
        op: "ST_Centroid",
        exprs: [{
          type: "op",
          op: "ST_Collect",
          exprs: [geometryExpr]
        }]
      }; // ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40)

      gridExpr = {
        type: "op",
        op: "ST_Snaptogrid",
        exprs: [geometryExpr, {
          type: "op",
          op: "*",
          exprs: [{
            type: "token",
            token: "!pixel_width!"
          }, 40]
        }, {
          type: "op",
          op: "*",
          exprs: [{
            type: "token",
            token: "!pixel_width!"
          }, 40]
        }]
      }; // Create inner query

      innerQuery = {
        type: "query",
        selects: [{
          type: "select",
          expr: {
            type: "op",
            op: "count",
            exprs: []
          },
          alias: "cnt"
        }, {
          type: "select",
          expr: centerExpr,
          alias: "center"
        }, {
          type: "select",
          expr: gridExpr,
          alias: "grid"
        }],
        from: exprCompiler.compileTable(design.table, "main"),
        groupBy: [3]
      }; // Create filters. First ensure geometry and limit to bounding box

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
          tableAlias: "main"
        }));
      } // Then add extra filters passed in, if relevant
      // Get relevant filters


      relevantFilters = _.where(filters, {
        table: design.table
      });

      for (i = 0, len = relevantFilters.length; i < len; i++) {
        filter = relevantFilters[i];
        whereClauses.push(injectTableAlias(filter.jsonql, "main"));
      }

      whereClauses = _.compact(whereClauses); // Wrap if multiple

      if (whereClauses.length > 1) {
        innerQuery.where = {
          type: "op",
          op: "and",
          exprs: whereClauses
        };
      } else {
        innerQuery.where = whereClauses[0];
      } // Create next level
      // select 
      // ST_ClusterDBSCAN(center, (!pixel_width!*30 + !pixel_height!*30)/2, 1) over () as clust,
      // sub1.center as center,
      // cnt as cnt from () as innerquery


      clustExpr = {
        type: "op",
        op: "ST_ClusterDBSCAN",
        exprs: [{
          type: "field",
          tableAlias: "innerquery",
          column: "center"
        }, {
          type: "op",
          op: "/",
          exprs: [{
            type: "op",
            op: "+",
            exprs: [{
              type: "op",
              op: "*",
              exprs: [{
                type: "token",
                token: "!pixel_width!"
              }, 30]
            }, {
              type: "op",
              op: "*",
              exprs: [{
                type: "token",
                token: "!pixel_height!"
              }, 30]
            }]
          }, 2]
        }, 1]
      };
      inner2Query = {
        type: "query",
        selects: [{
          type: "select",
          expr: clustExpr,
          over: {},
          alias: "clust"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: "center"
          },
          alias: "center"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: "cnt"
          },
          alias: "cnt"
        }],
        from: {
          type: "subquery",
          query: innerQuery,
          alias: "innerquery"
        }
      }; // Create final level
      // ST_Centroid(ST_Collect(center)) as the_geom_webmercator,
      // sum(cnt) as cnt, 
      // log(sum(cnt)) * 6 + 14 as size from 
      // ST_Centroid(ST_Collect(center))

      centerExpr = {
        type: "op",
        op: "ST_Centroid",
        exprs: [{
          type: "op",
          op: "ST_Collect",
          exprs: [{
            type: "field",
            tableAlias: "inner2query",
            column: "center"
          }]
        }]
      };
      cntExpr = {
        type: "op",
        op: "sum",
        exprs: [{
          type: "field",
          tableAlias: "inner2query",
          column: "cnt"
        }]
      };
      sizeExpr = {
        type: "op",
        op: "+",
        exprs: [{
          type: "op",
          op: "*",
          exprs: [{
            type: "op",
            op: "log",
            exprs: [cntExpr]
          }, 6]
        }, 14]
      };
      query = {
        type: "query",
        selects: [{
          type: "select",
          expr: centerExpr,
          alias: "the_geom_webmercator"
        }, {
          type: "select",
          expr: cntExpr,
          alias: "cnt"
        }, {
          type: "select",
          expr: sizeExpr,
          alias: "size"
        }],
        from: {
          type: "subquery",
          query: inner2Query,
          alias: "inner2query"
        },
        groupBy: [{
          type: "field",
          tableAlias: "inner2query",
          column: "clust"
        }]
      };
      return query;
    }
  }, {
    key: "createCss",
    value: function createCss(design, schema) {
      var css;
      css = '#layer0 [cnt>1] {\n  marker-width: [size];\n  marker-line-color: white;\n  marker-line-width: 4;\n  marker-line-opacity: 0.6;\n  marker-placement: point;\n  marker-type: ellipse;\n  marker-allow-overlap: true;\n  marker-fill: ' + (design.fillColor || "#337ab7") + ';\n}\n\n#layer0::l1 [cnt>1] { \n  text-name: [cnt];\n  text-face-name: \'Arial Bold\';\n  text-allow-overlap: true;\n  text-fill: ' + (design.textColor || "white") + ';\n}\n\n#layer0 [cnt=1] {\n  marker-width: 10;\n  marker-line-color: white;\n  marker-line-width: 2;\n  marker-line-opacity: 0.6;\n  marker-placement: point;\n  marker-type: ellipse;\n  marker-allow-overlap: true;\n  marker-fill: ' + (design.fillColor || "#337ab7") + ';\n}';
      return css;
    } // # Called when the interactivity grid is clicked.
    // # arguments:
    // #   ev: { data: interactivty data e.g. `{ id: 123 }` }
    // #   options:
    // #     design: design of layer
    // #     schema: schema to use
    // #     dataSource: data source to use
    // #     layerDataSource: layer data source
    // #     scopeData: current scope data if layer is scoping
    // #     filters: compiled filters to apply to the popup
    // #
    // # Returns:
    // #   null/undefined
    // #   or
    // #   {
    // #     scope: scope to apply ({ name, filter, data })
    // #     row: { tableId:, primaryKey: }  # row that was selected
    // #     popup: React element to put into a popup
    // #   }
    // onGridClick: (ev, clickOptions) ->
    //   # TODO abstract most to base class
    //   if ev.data and ev.data.id
    //     table = clickOptions.design.table
    //     results = {}
    //     # Scope toggle item if ctrl-click
    //     if ev.event.originalEvent.shiftKey
    //       ids = clickOptions.scopeData or []
    //       if ev.data.id in ids
    //         ids = _.without(ids, ev.data.id)
    //       else
    //         ids = ids.concat([ev.data.id])
    //       # Create filter for rows
    //       filter = {
    //         table: table
    //         jsonql: { type: "op", op: "=", modifier: "any", exprs: [
    //           { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
    //           { type: "literal", value: ids }
    //         ]}
    //       }
    //       # Scope to item
    //       if ids.length > 0
    //         results.scope = {
    //           name: "Selected #{ids.length} Circle(s)"
    //           filter: filter
    //           data: ids
    //         }
    //       else
    //         results.scope = null
    //     # Popup
    //     if clickOptions.design.popup and not ev.event.originalEvent.shiftKey
    //       BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
    //       WidgetFactory = require '../widgets/WidgetFactory'
    //       results.popup = new BlocksLayoutManager().renderLayout({
    //         items: clickOptions.design.popup.items
    //         style: "popup"
    //         renderWidget: (options) =>
    //           widget = WidgetFactory.createWidget(options.type)
    //           # Create filters for single row
    //           filter = {
    //             table: table
    //             jsonql: { type: "op", op: "=", exprs: [
    //               { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
    //               { type: "literal", value: ev.data.id }
    //             ]}
    //           }
    //           filters = clickOptions.filters.concat([filter])
    //           # Get data source for widget
    //           widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id)
    //           return widget.createViewElement({
    //             schema: clickOptions.schema
    //             dataSource: clickOptions.dataSource
    //             widgetDataSource: widgetDataSource
    //             design: options.design
    //             scope: null
    //             filters: filters
    //             onScopeChange: null
    //             onDesignChange: null
    //             width: options.width
    //             height: options.height
    //             standardWidth: options.standardWidth
    //           })
    //         })
    //     else if not ev.event.originalEvent.shiftKey
    //       results.row = { tableId: table, primaryKey: ev.data.id }
    //     return results
    //   else
    //     return null
    // Gets the bounds of the layer as GeoJSON

  }, {
    key: "getBounds",
    value: function getBounds(design, schema, dataSource, filters, callback) {
      return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback);
    }
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
        defaultColor: design.fillColor || "#337ab7",
        symbol: 'font-awesome/circle',
        name: name,
        dataSource: dataSource,
        filters: _.compact(_filters)
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
    } // True if layer is incomplete (e.g. brand new) and should be editable immediately

  }, {
    key: "isIncomplete",
    value: function isIncomplete(design, schema) {
      return this.validateDesign(design, schema) != null;
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

      var ClusterLayerDesignerComponent; // Require here to prevent server require problems

      ClusterLayerDesignerComponent = require('./ClusterLayerDesignerComponent'); // Clean on way in and out

      return React.createElement(ClusterLayerDesignerComponent, {
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
      var axisBuilder, exprCleaner;
      exprCleaner = new ExprCleaner(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      }); // TODO clones entirely

      design = _.cloneDeep(design); // Default colors

      design.textColor = design.textColor || "white";
      design.fillColor = design.fillColor || "#337ab7";
      design.axes = design.axes || {};
      design.axes.geometry = axisBuilder.cleanAxis({
        axis: design.axes.geometry,
        table: design.table,
        types: ['geometry'],
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
  }]);
  return ClusterLayer;
}(Layer); // TODO NO KML SUPPORT