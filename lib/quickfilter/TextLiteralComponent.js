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

var AsyncReactSelect,
    ExprCompiler,
    ExprUtils,
    PropTypes,
    R,
    React,
    TextLiteralComponent,
    _,
    escapeRegex,
    injectTableAlias,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
AsyncReactSelect = require('react-select/lib/Async')["default"];
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprUtils = require('mwater-expressions').ExprUtils;
injectTableAlias = require('mwater-expressions').injectTableAlias; // Displays a combo box that allows selecting single or multiple text values from an expression
// The expression can be type `text` or `text[]`

module.exports = TextLiteralComponent = function () {
  var TextLiteralComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(TextLiteralComponent, _React$Component);

    var _super = _createSuper(TextLiteralComponent);

    function TextLiteralComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, TextLiteralComponent);
      _this = _super.apply(this, arguments);
      _this.handleSingleChange = _this.handleSingleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleMultipleChange = _this.handleMultipleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.getOptions = _this.getOptions.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(TextLiteralComponent, [{
      key: "handleSingleChange",
      value: function handleSingleChange(val) {
        var value;
        boundMethodCheck(this, TextLiteralComponent);
        value = val ? val.value || null : null; // Blank is null

        return this.props.onChange(value);
      }
    }, {
      key: "handleMultipleChange",
      value: function handleMultipleChange(val) {
        var value;
        boundMethodCheck(this, TextLiteralComponent);
        value = val ? _.pluck(val, "value") : [];

        if (value.length > 0) {
          return this.props.onChange(value);
        } else {
          return this.props.onChange(null);
        }
      }
    }, {
      key: "getOptions",
      value: function getOptions(input, cb) {
        var exprCompiler, exprType, exprUtils, filters;
        boundMethodCheck(this, TextLiteralComponent); // Determine type of expression

        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType(this.props.expr); // Create query to get matches

        exprCompiler = new ExprCompiler(this.props.schema); // Add filter for input (simple if just text)

        if (exprType === "text") {
          filters = this.props.filters || [];

          if (input) {
            filters.push({
              table: this.props.expr.table,
              jsonql: {
                type: "op",
                op: "~*",
                exprs: [exprCompiler.compileExpr({
                  expr: this.props.expr,
                  tableAlias: "{alias}"
                }), escapeRegex(input) // Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
                ]
              }
            });
          }
        } else if (exprType === "text[]") {
          // Special filter for text[]
          filters = this.props.filters || [];

          if (input) {
            filters.push({
              table: "_values_",
              jsonql: {
                type: "op",
                op: "~*",
                exprs: [{
                  type: "field",
                  tableAlias: "{alias}",
                  column: "value"
                }, "^" + escapeRegex(input) // Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
                ]
              }
            });
          }
        } else {
          return;
        } // Execute query


        this.props.quickfiltersDataSource.getValues(this.props.index, this.props.expr, filters, null, 250, function (err, values) {
          if (err) {
            return;
          } // Filter null and blank


          values = _.filter(values, function (value) {
            return value;
          });
          return cb(_.map(values, function (value) {
            return {
              value: value,
              label: value
            };
          }));
        });
      }
    }, {
      key: "renderSingle",
      value: function renderSingle() {
        var currentValue;
        currentValue = this.props.value ? {
          value: this.props.value,
          label: this.props.value
        } : null;
        return R(AsyncReactSelect, {
          key: JSON.stringify(this.props.filters),
          // Include to force a change when filters change
          placeholder: "All",
          value: currentValue,
          loadOptions: this.getOptions,
          onChange: this.props.onChange ? this.handleSingleChange : void 0,
          isClearable: true,
          defaultOptions: true,
          isDisabled: this.props.onChange == null,
          noOptionsMessage: function noOptionsMessage() {
            return "Type to search";
          },
          styles: {
            // Keep menu above fixed data table headers
            menu: function menu(style) {
              return _.extend({}, style, {
                zIndex: 2000
              });
            }
          }
        });
      }
    }, {
      key: "renderMultiple",
      value: function renderMultiple() {
        var currentValue;
        currentValue = this.props.value ? _.map(this.props.value, function (v) {
          return {
            value: v,
            label: v
          };
        }) : null;
        return R(AsyncReactSelect, {
          placeholder: "All",
          value: currentValue,
          key: JSON.stringify(this.props.filters),
          // Include to force a change when filters change
          isMulti: true,
          loadOptions: this.getOptions,
          defaultOptions: true,
          onChange: this.props.onChange ? this.handleMultipleChange : void 0,
          isClearable: true,
          isDisabled: this.props.onChange == null,
          noOptionsMessage: function noOptionsMessage() {
            return "Type to search";
          },
          styles: {
            // Keep menu above fixed data table headers
            menu: function menu(style) {
              return _.extend({}, style, {
                zIndex: 2000
              });
            }
          }
        });
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            width: "100%"
          }
        }, this.props.multi ? this.renderMultiple() : this.renderSingle());
      }
    }]);
    return TextLiteralComponent;
  }(React.Component);

  ;
  TextLiteralComponent.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
    schema: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    // See QuickfiltersDataSource
    expr: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    multi: PropTypes.bool,
    // true to display multiple values
    // Filters to add to the component to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    }))
  };
  return TextLiteralComponent;
}.call(void 0);

escapeRegex = function escapeRegex(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};