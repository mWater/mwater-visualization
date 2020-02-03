"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder,
    BufferLayer,
    ExprCleaner,
    ExprCompiler,
    ExprUtils,
    Layer,
    LayerLegendComponent,
    LegendGroup,
    PopupFilterJoinsUtils,
    R,
    React,
    _,
    injectTableAlias,
    original,
    produce,
    indexOf = [].indexOf;

_ = require('lodash');
React = require('react');
R = React.createElement;
produce = require('immer')["default"];
original = require('immer').original;
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
Layer which draws a buffer around geometries (i.e. a radius circle around points)

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  fillOpacity: Opacity to fill the circles (0-1)
  radius: radius to draw in meters
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the circle is clicked
  popupFilterJoins: customizable filtering for popup. See PopupFilterJoins.md

axes:
  geometry: where to draw buffers around
  color: color axis

*/

module.exports = BufferLayer =
/*#__PURE__*/
function (_Layer) {
  (0, _inherits2["default"])(BufferLayer, _Layer);

  function BufferLayer() {
    (0, _classCallCheck2["default"])(this, BufferLayer);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(BufferLayer).apply(this, arguments));
  }

  (0, _createClass2["default"])(BufferLayer, [{
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
        css: this.createCss(design, schema, filters),
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
      var axisBuilder, boundingBox, cases, categories, colorExpr, exprCompiler, filter, geometryExpr, j, len, order, query, radiusDeg, relevantFilters, selects, whereClauses, widthExpr;
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      exprCompiler = new ExprCompiler(schema);
      /*
      Query:
        select
        <primary key> as id,
        [<color axis> as color,
        st_transform(<geometry axis>, 3857) as the_geom_webmercator,
        radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) as width
        from <table> as main
        where
          <geometry axis> is not null
       * Bounding box filter for speed
        and <geometry axis> &&
        ST_Transform(ST_Expand(
       * Prevent 3857 overflow (i.e. > 85 degrees lat)
          ST_Intersection(
            ST_Transform(!bbox!, 4326),
            ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
          , <radius in degrees>})
        , 3857)
        and <other filters>
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
      }; // radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) + 1 # add one to make always visible

      widthExpr = {
        type: "op",
        op: "+",
        exprs: [{
          type: "op",
          op: "/",
          exprs: [{
            type: "op",
            op: "*",
            exprs: [design.radius, 2]
          }, {
            type: "op",
            op: "*",
            exprs: [{
              type: "token",
              token: "!pixel_height!"
            }, {
              type: "op",
              op: "cos",
              exprs: [{
                type: "op",
                op: "*",
                exprs: [{
                  type: "op",
                  op: "ST_YMIN",
                  exprs: [{
                    type: "op",
                    op: "ST_Transform",
                    exprs: [geometryExpr, 4326]
                  }]
                }, 0.017453293]
              }]
            }]
          }]
        }, 2]
      };
      selects = [{
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: schema.getTable(design.table).primaryKey
        },
        alias: "id" // main primary key as id

      }, {
        type: "select",
        expr: geometryExpr,
        alias: "the_geom_webmercator"
      }, {
        type: "select",
        expr: widthExpr,
        alias: "width" // Width of circles

      }]; // Add color select if color axis

      if (design.axes.color) {
        colorExpr = axisBuilder.compileAxis({
          axis: design.axes.color,
          tableAlias: "main"
        });
        selects.push({
          type: "select",
          expr: colorExpr,
          alias: "color"
        });
      } // Select _id, location and clustered row number


      query = {
        type: "query",
        selects: selects,
        from: exprCompiler.compileTable(design.table, "main")
      }; // ST_Transform(ST_Expand(
      //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
      //     ST_Intersection(
      //       ST_Transform(!bbox!, 4326),
      //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
      //     , <radius in degrees>})
      //   , 3857)
      // TODO document how we compute this

      radiusDeg = design.radius / 100000;
      boundingBox = {
        type: "op",
        op: "ST_Transform",
        exprs: [{
          type: "op",
          op: "ST_Expand",
          exprs: [{
            type: "op",
            op: "ST_Intersection",
            exprs: [{
              type: "op",
              op: "ST_Transform",
              exprs: [{
                type: "token",
                token: "!bbox!"
              }, 4326]
            }, {
              type: "op",
              op: "ST_Expand",
              exprs: [{
                type: "op",
                op: "ST_MakeEnvelope",
                exprs: [-180, -85, 180, 85, 4326]
              }, -radiusDeg]
            }]
          }, radiusDeg]
        }, 3857]
      }; // Create filters. First ensure geometry and limit to bounding box

      whereClauses = [{
        type: "op",
        op: "is not null",
        exprs: [geometryExpr]
      }, {
        type: "op",
        op: "&&",
        exprs: [geometryExpr, boundingBox]
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

      for (j = 0, len = relevantFilters.length; j < len; j++) {
        filter = relevantFilters[j];
        whereClauses.push(injectTableAlias(filter.jsonql, "main"));
      }

      whereClauses = _.compact(whereClauses); // Wrap if multiple

      if (whereClauses.length > 1) {
        query.where = {
          type: "op",
          op: "and",
          exprs: whereClauses
        };
      } else {
        query.where = whereClauses[0];
      } // Sort order


      if (design.axes.color && design.axes.color.colorMap) {
        // TODO should use categories, not colormap order
        order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value");
        categories = axisBuilder.getCategories(design.axes.color, order);
        cases = _.map(categories, function (category, i) {
          return {
            when: category.value != null ? {
              type: "op",
              op: "=",
              exprs: [colorExpr, category.value]
            } : {
              type: "op",
              op: "is null",
              exprs: [colorExpr]
            },
            then: order.indexOf(category.value) || -1
          };
        });

        if (cases.length > 0) {
          query.orderBy = [{
            expr: {
              type: "case",
              cases: cases
            },
            direction: "desc" // Reverse color map order

          }];
        }
      }

      return query;
    }
  }, {
    key: "createCss",
    value: function createCss(design, schema) {
      var css, item, j, len, ref, ref1;
      css = '#layer0 {\n  marker-fill-opacity: ' + design.fillOpacity + ';\nmarker-type: ellipse;\nmarker-width: [width];\nmarker-line-width: 0;\nmarker-allow-overlap: true;\nmarker-ignore-placement: true;\nmarker-fill: ' + (design.color || "transparent") + ';\n}'; // If color axes, add color conditions

      if ((ref = design.axes.color) != null ? ref.colorMap : void 0) {
        ref1 = design.axes.color.colorMap;

        for (j = 0, len = ref1.length; j < len; j++) {
          item = ref1[j]; // If invisible

          if (_.includes(design.axes.color.excludedValues, item.value)) {
            css += "#layer0 [color=".concat(JSON.stringify(item.value), "] { marker-fill-opacity: 0; }\n");
          } else {
            css += "#layer0 [color=".concat(JSON.stringify(item.value), "] { marker-fill: ").concat(item.color, "; }\n");
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
              name: "Selected ".concat(ids.length, " Circle(s)"),
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
      // TODO technically should pad for the radius, but we always pad by 20% anyway so it should be fine
      return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback);
    }
  }, {
    key: "getMinZoom",
    value: function getMinZoom(design) {
      return design.minZoom;
    } // Removed as was making deceptively not present
    // # Get min and max zoom levels
    // getMinZoom: (design) ->
    //   # Earth is 40000km around, is 256 pixels. So zoom z radius map of r takes up 2*r*256*2^z/40000000 meters.
    //   # So zoom with 5 pixels across = log2(4000000*5/(2*r*256))
    //   if design.radius
    //     zoom = Math.ceil(Math.log(40000000*5/(2*design.radius*256))/Math.log(2))
    //     if design.minZoom?
    //       return Math.max(zoom, design.minZoom)
    //     return zoom
    //   else
    //     return design.minZoom

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
        name: name,
        dataSource: dataSource,
        filters: _.compact(_filters),
        axis: axisBuilder.cleanAxis({
          axis: design.axes.color,
          table: design.table,
          types: ['enum', 'text', 'boolean', 'date'],
          aggrNeed: "none"
        }),
        radiusLayer: true,
        defaultColor: design.color
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

      var BufferLayerDesignerComponent; // Require here to prevent server require problems

      BufferLayerDesignerComponent = require('./BufferLayerDesignerComponent'); // Clean on way in and out

      return React.createElement(BufferLayerDesignerComponent, {
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
      });
      design = produce(design, function (draft) {
        // Default color
        draft.color = design.color || "#0088FF";
        draft.axes = design.axes || {};
        draft.radius = design.radius || 1000;
        draft.fillOpacity = design.fillOpacity != null ? design.fillOpacity : 0.5;
        draft.axes.geometry = axisBuilder.cleanAxis({
          axis: original(draft.axes.geometry),
          table: design.table,
          types: ['geometry'],
          aggrNeed: "none"
        });
        draft.axes.color = axisBuilder.cleanAxis({
          axis: original(draft.axes.color),
          table: design.table,
          types: ['enum', 'text', 'boolean', 'date'],
          aggrNeed: "none"
        });
        draft.filter = exprCleaner.cleanExpr(design.filter, {
          table: design.table
        });
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

      if (design.radius == null) {
        return "Missing radius";
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

      error = axisBuilder.validateAxis({
        axis: design.axes.color
      });

      if (error) {
        return error;
      }

      return null;
    }
  }, {
    key: "createKMLExportJsonQL",
    value: function createKMLExportJsonQL(design, schema, filters) {
      var axisBuilder, bufferedGeometry, cases, categories, colorExpr, column, exprCompiler, extraFields, field, filter, geometryExpr, j, k, len, len1, order, query, radiusDeg, relevantFilters, selects, valueExpr, whereClauses;
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      exprCompiler = new ExprCompiler(schema); // Compile geometry axis

      geometryExpr = axisBuilder.compileAxis({
        axis: design.axes.geometry,
        tableAlias: "main"
      }); // st_transform(st_buffer(st_transform(<geometry axis>, 4326)::geography, <radius>)::geometry, 3857) as the_geom_webmercator

      bufferedGeometry = {
        type: "op",
        op: "ST_AsGeoJson",
        exprs: [{
          type: "op",
          op: "::geometry",
          exprs: [{
            type: "op",
            op: "ST_Buffer",
            exprs: [{
              type: "op",
              op: "::geography",
              exprs: [{
                type: "op",
                op: "ST_Transform",
                exprs: [geometryExpr, 4326]
              }]
            }, design.radius]
          }]
        }]
      };
      selects = [{
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: schema.getTable(design.table).primaryKey
        },
        alias: "id" // main primary key as id

      }, {
        type: "select",
        expr: bufferedGeometry,
        alias: "the_geom_webmercator"
      }];
      extraFields = ["code", "name", "desc", "type", "photos"];

      for (j = 0, len = extraFields.length; j < len; j++) {
        field = extraFields[j];
        column = schema.getColumn(design.table, field);

        if (column) {
          selects.push({
            type: "select",
            expr: {
              type: "field",
              tableAlias: "main",
              column: field
            },
            alias: field
          });
        }
      } // Add color select if color axis


      if (design.axes.color) {
        valueExpr = exprCompiler.compileExpr({
          expr: design.axes.color.expr,
          tableAlias: "main"
        });
        colorExpr = axisBuilder.compileAxis({
          axis: design.axes.color,
          tableAlias: "main"
        });
        selects.push({
          type: "select",
          expr: valueExpr,
          alias: "value"
        });
        selects.push({
          type: "select",
          expr: colorExpr,
          alias: "color"
        });
      } // Select _id, location and clustered row number


      query = {
        type: "query",
        selects: selects,
        from: exprCompiler.compileTable(design.table, "main")
      }; // ST_Transform(ST_Expand(
      //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
      //     ST_Intersection(
      //       ST_Transform(!bbox!, 4326),
      //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
      //     , <radius in degrees>})
      //   , 3857)
      // TODO document how we compute this

      radiusDeg = design.radius / 100000; // Create filters. First ensure geometry and limit to bounding box

      whereClauses = [{
        type: "op",
        op: "is not null",
        exprs: [geometryExpr]
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

      for (k = 0, len1 = relevantFilters.length; k < len1; k++) {
        filter = relevantFilters[k];
        whereClauses.push(injectTableAlias(filter.jsonql, "main"));
      }

      whereClauses = _.compact(whereClauses); // Wrap if multiple

      if (whereClauses.length > 1) {
        query.where = {
          type: "op",
          op: "and",
          exprs: whereClauses
        };
      } else {
        query.where = whereClauses[0];
      }

      if (design.axes.color && design.axes.color.colorMap) {
        order = design.axes.color.drawOrder || _.pluck(design.axes.color.colorMap, "value");
        categories = axisBuilder.getCategories(design.axes.color, _.pluck(design.axes.color.colorMap, "value"));
        cases = _.map(categories, function (category, i) {
          return {
            when: category.value != null ? {
              type: "op",
              op: "=",
              exprs: [colorExpr, category.value]
            } : {
              type: "op",
              op: "is null",
              exprs: [colorExpr]
            },
            then: order.indexOf(category.value) || -1
          };
        });

        if (cases.length > 0) {
          query.orderBy = [{
            expr: {
              type: "case",
              cases: cases
            },
            direction: "desc" // Reverse color map order

          }];
        }
      }

      return query;
    }
  }, {
    key: "getKMLExportJsonQL",
    value: function getKMLExportJsonQL(design, schema, filters) {
      var layerDef, style;
      style = {
        color: design.color,
        opacity: design.fillOpacity
      };

      if (design.axes.color && design.axes.color.colorMap) {
        style.colorMap = design.axes.color.colorMap;
      }

      layerDef = {
        layers: [{
          id: "layer0",
          jsonql: this.createKMLExportJsonQL(design, schema, filters),
          style: style
        }]
      };
      return layerDef;
    }
  }, {
    key: "acceptKmlVisitorForRow",
    value: function acceptKmlVisitorForRow(visitor, row) {
      var data, inner, list, outer;
      data = JSON.parse(row.the_geom_webmercator);
      outer = data.coordinates[0];
      inner = data.coordinates.slice(1);
      list = _.map(outer, function (coordinates) {
        return coordinates.join(",");
      });
      return visitor.addPolygon(list.join(" "), row.color, false, row.name, visitor.buildDescription(row));
    }
  }]);
  return BufferLayer;
}(Layer);