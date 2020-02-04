"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder, Chart, ExprCleaner, LayeredChart, LayeredChartCompiler, LayeredChartSvgFileSaver, LayeredChartUtils, R, React, TextWidget, _, async, original, produce;

_ = require('lodash');
React = require('react');
R = React.createElement;
async = require('async');
produce = require('immer')["default"];
original = require('immer').original;
Chart = require('../Chart');
LayeredChartCompiler = require('./LayeredChartCompiler');
ExprCleaner = require('mwater-expressions').ExprCleaner;
AxisBuilder = require('../../../axes/AxisBuilder');
LayeredChartSvgFileSaver = require('./LayeredChartSvgFileSaver');
LayeredChartUtils = require('./LayeredChartUtils');
TextWidget = require('../../text/TextWidget'); // See LayeredChart Design.md for the design

module.exports = LayeredChart =
/*#__PURE__*/
function (_Chart) {
  (0, _inherits2["default"])(LayeredChart, _Chart);

  function LayeredChart() {
    (0, _classCallCheck2["default"])(this, LayeredChart);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(LayeredChart).apply(this, arguments));
  }

  (0, _createClass2["default"])(LayeredChart, [{
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      var axisBuilder, compiler, exprCleaner, layers;
      exprCleaner = new ExprCleaner(schema);
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      compiler = new LayeredChartCompiler({
        schema: schema
      });
      layers = design.layers || [{}];
      return produce(design, function (draft) {
        var aggrNeed, axis, axisKey, i, layer, layerId, ref, ref1, ref2; // Fill in defaults

        draft.version = design.version || 2;
        draft.layers = layers; // Default to titleText (legacy)

        draft.header = design.header || {
          style: "header",
          items: _.compact([design.titleText || null])
        };
        draft.footer = design.footer || {
          style: "footer",
          items: []
        }; // Default value is now ""

        if (draft.version < 2) {
          if (design.xAxisLabelText == null) {
            draft.xAxisLabelText = "";
          }

          if (design.yAxisLabelText == null) {
            draft.yAxisLabelText = "";
          }

          draft.version = 2;
        } // Clean each layer


        for (layerId = i = 0, ref = layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
          layer = draft.layers[layerId];
          layer.axes = layer.axes || {};
          ref1 = layer.axes;

          for (axisKey in ref1) {
            axis = ref1[axisKey]; // Determine what aggregation axis requires

            if (axisKey === "y" && compiler.doesLayerNeedGrouping(design, layerId)) {
              aggrNeed = "required";
            } else {
              aggrNeed = "none";
            }

            layer.axes[axisKey] = axisBuilder.cleanAxis({
              axis: original(axis),
              table: layer.table,
              aggrNeed: aggrNeed,
              types: LayeredChartUtils.getAxisTypes(design, original(axis), axisKey)
            });
          } // Remove x axis if not required


          if (!compiler.canLayerUseXExpr(draft, layerId) && layer.axes.x) {
            delete layer.axes.x;
          } // Remove cumulative if x is not date or number


          if (!layer.axes.x || (ref2 = axisBuilder.getAxisType(layer.axes.x)) !== 'date' && ref2 !== 'number') {
            delete layer.cumulative;
          }

          layer.filter = exprCleaner.cleanExpr(original(layer.filter), {
            table: layer.table,
            types: ['boolean']
          });
        }
      });
    }
  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      var axisBuilder, compiler, error, i, layer, layerId, ref, xAxisTypes;
      axisBuilder = new AxisBuilder({
        schema: schema
      });
      compiler = new LayeredChartCompiler({
        schema: schema
      }); // Check that layers have same x axis type

      xAxisTypes = _.uniq(_.map(design.layers, function (l) {
        axisBuilder = new AxisBuilder({
          schema: schema
        });
        return axisBuilder.getAxisType(l.axes.x);
      }));

      if (xAxisTypes.length > 1) {
        return "All x axes must be of same type";
      }

      for (layerId = i = 0, ref = design.layers.length; 0 <= ref ? i < ref : i > ref; layerId = 0 <= ref ? ++i : --i) {
        layer = design.layers[layerId]; // Check that has table

        if (!layer.table) {
          return "Missing data source";
        } // Check that has y axis


        if (!layer.axes.y) {
          return "Missing Y Axis";
        }

        if (!layer.axes.x && compiler.isXAxisRequired(design, layerId)) {
          return "Missing X Axis";
        }

        if (!layer.axes.color && compiler.isColorAxisRequired(design, layerId)) {
          return "Missing Color Axis";
        }

        error = null; // Validate axes

        error = error || axisBuilder.validateAxis({
          axis: layer.axes.x
        });
        error = error || axisBuilder.validateAxis({
          axis: layer.axes.y
        });
        error = error || axisBuilder.validateAxis({
          axis: layer.axes.color
        });
      }

      return error;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty(design) {
      return !design.layers || !design.layers[0] || !design.layers[0].table;
    } // Creates a design element with specified options
    // options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design 
    //   onDesignChange: function
    //   filters: array of filters

  }, {
    key: "createDesignerElement",
    value: function createDesignerElement(options) {
      var _this = this;

      var LayeredChartDesignerComponent, props; // Require here to prevent server require problems

      LayeredChartDesignerComponent = require('./LayeredChartDesignerComponent');
      props = {
        schema: options.schema,
        dataSource: options.dataSource,
        design: this.cleanDesign(options.design, options.schema),
        filters: options.filters,
        onDesignChange: function onDesignChange(design) {
          // Clean design
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        }
      };
      return React.createElement(LayeredChartDesignerComponent, props);
    } // Get data for the chart asynchronously 
    // design: design of the chart
    // schema: schema to use
    // dataSource: data source to get data from
    // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    // callback: (error, data)

  }, {
    key: "getData",
    value: function getData(design, schema, dataSource, filters, callback) {
      var compiler, queries;
      compiler = new LayeredChartCompiler({
        schema: schema
      });
      queries = compiler.createQueries(design, filters); // Run queries in parallel

      return async.map(_.pairs(queries), function (item, cb) {
        return dataSource.performQuery(item[1], function (err, rows) {
          return cb(err, [item[0], rows]);
        });
      }, function (err, items) {
        var data, textWidget;

        if (err) {
          return callback(err);
        }

        data = _.object(items); // Add header and footer data

        textWidget = new TextWidget();
        return textWidget.getData(design.header, schema, dataSource, filters, function (error, headerData) {
          if (error) {
            return callback(error);
          }

          data.header = headerData;
          return textWidget.getData(design.footer, schema, dataSource, filters, function (error, footerData) {
            if (error) {
              return callback(error);
            }

            data.footer = footerData;
            return callback(null, data);
          });
        });
      });
    } // Create a view element for the chart
    // Options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design of the chart
    //   onDesignChange: when design changes
    //   data: results from queries
    //   width, height, standardWidth: size of the chart view
    //   scope: current scope of the view element
    //   onScopeChange: called when scope changes with new scope

  }, {
    key: "createViewElement",
    value: function createViewElement(options) {
      var LayeredChartViewComponent, props;
      LayeredChartViewComponent = require('./LayeredChartViewComponent'); // Create chart

      props = {
        schema: options.schema,
        dataSource: options.dataSource,
        design: this.cleanDesign(options.design, options.schema),
        onDesignChange: options.onDesignChange,
        data: options.data,
        width: options.width,
        height: options.height,
        standardWidth: options.standardWidth,
        scope: options.scope,
        onScopeChange: options.onScopeChange
      };
      return React.createElement(LayeredChartViewComponent, props);
    }
  }, {
    key: "createDropdownItems",
    value: function createDropdownItems(design, schema, widgetDataSource, filters) {
      var _this2 = this;

      var save; // TODO validate design before allowing save

      save = function save(format) {
        design = _this2.cleanDesign(design, schema);
        return widgetDataSource.getData(design, filters, function (err, data) {
          if (err) {
            return alert("Unable to load data");
          } else {
            return LayeredChartSvgFileSaver.save(design, data, schema, format);
          }
        });
      }; // Don't save image of invalid design


      if (this.validateDesign(this.cleanDesign(design, schema), schema)) {
        return [];
      }

      return [{
        label: "Save as SVG",
        icon: "picture",
        onClick: save.bind(null, "svg")
      }, {
        label: "Save as PNG",
        icon: "camera",
        onClick: save.bind(null, "png")
      }];
    }
  }, {
    key: "createDataTable",
    value: function createDataTable(design, schema, dataSource, data, locale) {
      var _row, axisBuilder, headers, i, j, k, layer, len, len1, m, n, r, ref, ref1, ref2, row, table, xAdded;

      axisBuilder = new AxisBuilder({
        schema: schema
      }); // Export only first layer

      headers = []; // for layer, data of 

      xAdded = false;
      ref = design.layers;

      for (i = 0, len = ref.length; i < len; i++) {
        layer = ref[i];

        if (layer.axes.x && !xAdded) {
          headers.push(axisBuilder.summarizeAxis(layer.axes.x, locale));
          xAdded = true;
        }

        if (layer.axes.color) {
          headers.push(axisBuilder.summarizeAxis(layer.axes.color, locale));
        }

        if (layer.axes.y) {
          headers.push(axisBuilder.summarizeAxis(layer.axes.y, locale));
        }

        table = [headers];
      }

      k = 0;
      ref1 = data.layer0;

      for (m = 0, len1 = ref1.length; m < len1; m++) {
        row = ref1[m];
        r = [];
        xAdded = false;

        for (j = n = 0, ref2 = design.layers.length - 1; 0 <= ref2 ? n <= ref2 : n >= ref2; j = 0 <= ref2 ? ++n : --n) {
          _row = data["layer".concat(j)][k];

          if (design.layers[j].axes.x && !xAdded) {
            r.push(axisBuilder.formatValue(design.layers[j].axes.x, _row.x, locale));
            xAdded = true;
          }

          if (design.layers[j].axes.color) {
            r.push(axisBuilder.formatValue(design.layers[j].axes.color, _row.color, locale));
          }

          if (design.layers[j].axes.y) {
            r.push(axisBuilder.formatValue(design.layers[j].axes.y, _row.y, locale));
          }
        }

        k++;
        table.push(r);
      } // k = 0
      // for layer, layerData of data
      //   xAdded = false
      //   r = []
      //   for row in layerData
      //     if design.layers[k].axes.x and not xAdded
      //       r.push(axisBuilder.formatValue(design.layers[k].axes.x, row.x, locale))
      //       xAdded = true
      //     if design.layers[k].axes.color
      //       r.push(axisBuilder.formatValue(design.layers[k].axes.color, row.color, locale))
      //     if design.layers[k].axes.y
      //       r.push(axisBuilder.formatValue(design.layers[k].axes.y, row.y, locale))
      //   table.push(r)
      //   k++


      return table;
    } //   if data.length > 0
    //   fields = Object.getOwnPropertyNames(data[0])
    //   table = [fields] # header
    //   renderRow = (record) ->
    //      _.map(fields, (field) -> record[field])
    //   table.concat(_.map(data, renderRow))
    // else []
    // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      var filterableTables, textWidget;
      filterableTables = _.uniq(_.compact(_.map(design.layers, function (layer) {
        return layer.table;
      }))); // Get filterable tables from header and footer

      textWidget = new TextWidget();
      filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.header, schema));
      filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.footer, schema));
      return filterableTables;
    } // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ

  }, {
    key: "getPlaceholderIcon",
    value: function getPlaceholderIcon() {
      return "fa-bar-chart";
    }
  }]);
  return LayeredChart;
}(Chart);