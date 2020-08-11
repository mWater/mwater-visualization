"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var AsyncLoadComponent,
    AxisBuilder,
    AxisColorEditorComponent,
    AxisComponent,
    BinsComponent,
    CategoryMapComponent,
    ExprCompiler,
    ExprComponent,
    ExprUtils,
    LinkComponent,
    PropTypes,
    R,
    RangesComponent,
    React,
    _,
    getDefaultFormat,
    getFormatOptions,
    injectTableAlias,
    ui,
    update,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
uuid = require('uuid');
AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');
ExprComponent = require("mwater-expressions-ui").ExprComponent;
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
LinkComponent = require('mwater-expressions-ui').LinkComponent;
AxisBuilder = require('./AxisBuilder');
update = require('update-object');
ui = require('../UIComponents');
BinsComponent = require('./BinsComponent');
RangesComponent = require('./RangesComponent');
AxisColorEditorComponent = require('./AxisColorEditorComponent');
CategoryMapComponent = require('./CategoryMapComponent');
injectTableAlias = require('mwater-expressions').injectTableAlias;
getFormatOptions = require('../valueFormatter').getFormatOptions;
getDefaultFormat = require('../valueFormatter').getDefaultFormat; // Axis component that allows designing of an axis

module.exports = AxisComponent = function () {
  var AxisComponent = /*#__PURE__*/function (_AsyncLoadComponent) {
    (0, _inherits2["default"])(AxisComponent, _AsyncLoadComponent);

    var _super = _createSuper(AxisComponent);

    function AxisComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, AxisComponent);
      _this = _super.call(this, props);
      _this.handleExprChange = _this.handleExprChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFormatChange = _this.handleFormatChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleXformTypeChange = _this.handleXformTypeChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleXformChange = _this.handleXformChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        categories: null // Categories of the axis. Loaded whenever axis is changed

      };
      return _this;
    }

    (0, _createClass2["default"])(AxisComponent, [{
      key: "isLoadNeeded",
      value: function isLoadNeeded(newProps, oldProps) {
        var filtersChanged, hasColorChanged;
        hasColorChanged = !_.isEqual(_.omit(newProps.value, ["colorMap", "drawOrder"]), _.omit(oldProps.value, ["colorMap", "drawOrder"]));
        filtersChanged = !_.isEqual(newProps.filters, oldProps.filters);
        return hasColorChanged || filtersChanged;
      } // Asynchronously get the categories of the axis, which requires a query when the field is a text field or other non-enum type

    }, {
      key: "load",
      value: function load(props, prevProps, callback) {
        var axis, axisBuilder, categories, filters, ref, values, valuesQuery, whereClauses;
        axisBuilder = new AxisBuilder({
          schema: props.schema
        }); // Clean axis first

        axis = axisBuilder.cleanAxis({
          axis: props.value,
          table: props.table,
          types: props.types,
          aggrNeed: props.aggrNeed
        }); // Ignore if error

        if (!axis || axisBuilder.validateAxis({
          axis: axis
        })) {
          return;
        } // Handle literal expression


        values = [];

        if (((ref = axis.expr) != null ? ref.type : void 0) === "literal") {
          values.push(axis.expr.value);
        } // Get categories (value + label)


        categories = axisBuilder.getCategories(axis, values); // Just "None" and so doesn't count

        if (_.any(categories, function (category) {
          return category.value != null;
        })) {
          callback({
            categories: categories
          });
          return;
        } // Can't get values of aggregate axis


        if (axisBuilder.isAxisAggr(axis)) {
          callback({
            categories: []
          });
          return;
        } // If no table, cannot query


        if (!axis.expr.table) {
          callback({
            categories: []
          });
          return;
        } // If no categories, we need values as input


        valuesQuery = {
          type: "query",
          selects: [{
            type: "select",
            expr: axisBuilder.compileAxis({
              axis: axis,
              tableAlias: "main"
            }),
            alias: "val"
          }],
          from: {
            type: "table",
            table: axis.expr.table,
            alias: "main"
          },
          groupBy: [1],
          limit: 50
        };
        filters = _.where(this.props.filters || [], {
          table: axis.expr.table
        });
        whereClauses = _.map(filters, function (f) {
          return injectTableAlias(f.jsonql, "main");
        });
        whereClauses = _.compact(whereClauses); // Wrap if multiple

        if (whereClauses.length > 1) {
          valuesQuery.where = {
            type: "op",
            op: "and",
            exprs: whereClauses
          };
        } else {
          valuesQuery.where = whereClauses[0];
        }

        return props.dataSource.performQuery(valuesQuery, function (error, rows) {
          if (error) {
            // Ignore errors
            return;
          } // Get categories (value + label)


          categories = axisBuilder.getCategories(axis, _.pluck(rows, "val"));
          return callback({
            categories: categories
          });
        });
      }
    }, {
      key: "handleExprChange",
      value: function handleExprChange(expr) {
        boundMethodCheck(this, AxisComponent); // If no expression, reset

        if (!expr) {
          this.props.onChange(null);
          return;
        } // Set expression and clear xform


        return this.props.onChange(this.cleanAxis(_.extend({}, _.omit(this.props.value, ["drawOrder"]), {
          expr: expr
        })));
      }
    }, {
      key: "handleFormatChange",
      value: function handleFormatChange(ev) {
        boundMethodCheck(this, AxisComponent);
        return this.props.onChange(_.extend({}, this.props.value, {
          format: ev.target.value
        }));
      }
    }, {
      key: "handleXformTypeChange",
      value: function handleXformTypeChange(type) {
        var end, i, j, max, min, numBins, ranges, ref, ref1, start, xform;
        boundMethodCheck(this, AxisComponent); // Remove

        if (!type) {
          this.props.onChange(_.omit(this.props.value, ["xform", "colorMap", "drawOrder"]));
        } // Save bins if going from bins to custom ranges and has ranges


        if (type === "ranges" && ((ref = this.props.value.xform) != null ? ref.type : void 0) === "bin" && this.props.value.xform.min != null && this.props.value.xform.max != null && this.props.value.xform.min !== this.props.value.xform.max && this.props.value.xform.numBins) {
          min = this.props.value.xform.min;
          max = this.props.value.xform.max;
          numBins = this.props.value.xform.numBins;
          ranges = [{
            id: uuid(),
            maxValue: min,
            minOpen: false,
            maxOpen: true
          }];

          for (i = j = 1, ref1 = numBins; 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
            start = (i - 1) / numBins * (max - min) + min;
            end = i / numBins * (max - min) + min;
            ranges.push({
              id: uuid(),
              minValue: start,
              minOpen: false,
              maxValue: end,
              maxOpen: true
            });
          }

          ranges.push({
            id: uuid(),
            minValue: max,
            minOpen: true,
            maxOpen: true
          });
          xform = {
            type: "ranges",
            ranges: ranges
          };
        } else {
          xform = {
            type: type
          };
        }

        return this.props.onChange(update(_.omit(this.props.value, ["colorMap", "drawOrder"]), {
          xform: {
            $set: xform
          }
        }));
      }
    }, {
      key: "handleXformChange",
      value: function handleXformChange(xform) {
        boundMethodCheck(this, AxisComponent);
        return this.props.onChange(this.cleanAxis(update(_.omit(this.props.value, ["drawOrder"]), {
          xform: {
            $set: xform
          }
        })));
      }
    }, {
      key: "cleanAxis",
      value: function cleanAxis(axis) {
        var axisBuilder;
        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        });
        return axisBuilder.cleanAxis({
          axis: axis,
          table: this.props.table,
          aggrNeed: this.props.aggrNeed,
          types: this.props.types
        });
      }
    }, {
      key: "renderXform",
      value: function renderXform(axis) {
        var comp, exprType, exprUtils, ref;

        if (!axis) {
          return;
        }

        if (axis.xform && ((ref = axis.xform.type) === "bin" || ref === "ranges" || ref === "floor")) {
          if (axis.xform.type === "ranges") {
            comp = R(RangesComponent, {
              schema: this.props.schema,
              expr: axis.expr,
              xform: axis.xform,
              onChange: this.handleXformChange
            });
          } else if (axis.xform.type === "bin") {
            comp = R(BinsComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              expr: axis.expr,
              xform: axis.xform,
              onChange: this.handleXformChange
            });
          } else {
            comp = null;
          }

          return R('div', null, R(ui.ButtonToggleComponent, {
            value: axis.xform ? axis.xform.type : null,
            options: [{
              value: "bin",
              label: "Equal Bins"
            }, {
              value: "ranges",
              label: "Custom Ranges"
            }, {
              value: "floor",
              label: "Whole Numbers"
            }],
            onChange: this.handleXformTypeChange
          }), comp);
        }

        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType(axis.expr);

        switch (exprType) {
          case "date":
            return R(ui.ButtonToggleComponent, {
              value: axis.xform ? axis.xform.type : null,
              options: [{
                value: null,
                label: "Exact Date"
              }, {
                value: "year",
                label: "Year"
              }, {
                value: "yearmonth",
                label: "Year/Month"
              }, {
                value: "month",
                label: "Month"
              }, {
                value: "week",
                label: "Week"
              }, {
                value: "yearweek",
                label: "Year/Week"
              }, {
                value: "yearquarter",
                label: "Year/Quarter"
              }],
              onChange: this.handleXformTypeChange
            });

          case "datetime":
            return R(ui.ButtonToggleComponent, {
              value: axis.xform ? axis.xform.type : null,
              options: [{
                value: "date",
                label: "Date"
              }, {
                value: "year",
                label: "Year"
              }, {
                value: "yearmonth",
                label: "Year/Month"
              }, {
                value: "month",
                label: "Month"
              }, {
                value: "week",
                label: "Week"
              }, {
                value: "yearweek",
                label: "Year/Week"
              }, {
                value: "yearquarter",
                label: "Year/Quarter"
              }],
              onChange: this.handleXformTypeChange
            });
        }
      }
    }, {
      key: "renderColorMap",
      value: function renderColorMap(axis) {
        if (!this.props.showColorMap || !axis || !axis.expr) {
          return null;
        }

        return [R('br'), R(AxisColorEditorComponent, {
          schema: this.props.schema,
          axis: axis,
          categories: this.state.categories,
          onChange: this.props.onChange,
          reorderable: this.props.reorderable,
          defaultColor: this.props.defaultColor,
          allowExcludedValues: this.props.allowExcludedValues,
          autosetColors: this.props.autosetColors,
          initiallyExpanded: true
        })];
      }
    }, {
      key: "renderExcludedValues",
      value: function renderExcludedValues(axis) {
        // Only if no color map and allows excluded values
        if (this.props.showColorMap || !axis || !axis.expr || !this.props.allowExcludedValues) {
          return null;
        } // Use categories


        if (!this.state.categories || this.state.categories.length < 1) {
          return null;
        }

        return [R('br'), R(CategoryMapComponent, {
          schema: this.props.schema,
          axis: axis,
          onChange: this.props.onChange,
          categories: this.state.categories,
          reorderable: false,
          showColorMap: false,
          allowExcludedValues: true,
          initiallyExpanded: true
        })];
      }
    }, {
      key: "renderFormat",
      value: function renderFormat(axis) {
        var axisBuilder, formats, valueType;
        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        });
        valueType = axisBuilder.getAxisType(axis);
        formats = getFormatOptions(valueType);

        if (!formats) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Format"), ": ", R('select', {
          value: axis.format != null ? axis.format : getDefaultFormat(valueType),
          className: "form-control",
          style: {
            width: "auto",
            display: "inline-block"
          },
          onChange: this.handleFormatChange
        }, _.map(formats, function (format) {
          return R('option', {
            key: format.value,
            value: format.value
          }, format.label);
        })));
      }
    }, {
      key: "render",
      value: function render() {
        var aggrStatuses, axis, axisBuilder;
        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        }); // Clean before render

        axis = this.cleanAxis(this.props.value); // Determine aggrStatuses that are possible

        switch (this.props.aggrNeed) {
          case "none":
            aggrStatuses = ["literal", "individual"];
            break;

          case "optional":
            aggrStatuses = ["literal", "individual", "aggregate"];
            break;

          case "required":
            aggrStatuses = ["literal", "aggregate"];
        }

        return R('div', null, R('div', null, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: axisBuilder.getExprTypes(this.props.types),
          // preventRemove: @props.required
          onChange: this.handleExprChange,
          value: this.props.value ? this.props.value.expr : void 0,
          aggrStatuses: aggrStatuses
        })), this.renderXform(axis), this.props.showFormat ? this.renderFormat(axis) : void 0, this.renderColorMap(axis), this.renderExcludedValues(axis));
      }
    }]);
    return AxisComponent;
  }(AsyncLoadComponent);

  ;
  AxisComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    // Table to use
    types: PropTypes.array,
    // Optional types to limit to
    aggrNeed: PropTypes.oneOf(['none', 'optional', 'required']).isRequired,
    value: PropTypes.object,
    // See Axis Design.md
    onChange: PropTypes.func.isRequired,
    // Called when changes
    required: PropTypes.bool,
    // Makes this a required value
    showColorMap: PropTypes.bool,
    // Shows the color map
    reorderable: PropTypes.bool,
    // Is the draw order reorderable
    autosetColors: PropTypes.bool,
    // Should a color map be automatically created from a default palette
    allowExcludedValues: PropTypes.bool,
    // True to allow excluding of values via checkboxes
    defaultColor: PropTypes.string,
    showFormat: PropTypes.bool,
    // Show format control for numeric values
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  AxisComponent.defaultProps = {
    reorderable: false,
    allowExcludedValues: false,
    autosetColors: true
  };
  AxisComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return AxisComponent;
}.call(void 0);