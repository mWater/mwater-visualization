"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var DateExprComponent,
    DateQuickfilterComponent,
    EnumQuickfilterComponent,
    ExprCleaner,
    ExprUtils,
    IdArrayQuickfilterComponent,
    PropTypes,
    QuickfilterCompiler,
    QuickfiltersComponent,
    R,
    React,
    ReactSelect,
    TextArrayQuickfilterComponent,
    TextLiteralComponent,
    TextQuickfilterComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ReactSelect = require('react-select')["default"];
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCleaner = require('mwater-expressions').ExprCleaner;
TextLiteralComponent = require('./TextLiteralComponent');
DateExprComponent = require('./DateExprComponent');
QuickfilterCompiler = require('./QuickfilterCompiler');
IdArrayQuickfilterComponent = require('./IdArrayQuickfilterComponent'); // Displays quick filters and allows their value to be modified

module.exports = QuickfiltersComponent = function () {
  var QuickfiltersComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(QuickfiltersComponent, _React$Component);

    function QuickfiltersComponent() {
      (0, _classCallCheck2["default"])(this, QuickfiltersComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(QuickfiltersComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(QuickfiltersComponent, [{
      key: "renderQuickfilter",
      value: function renderQuickfilter(item, index) {
        var _this = this;

        var compiler, expr, filters, itemValue, lock, onValueChange, otherDesign, otherLocks, otherQuickFilterFilters, otherValues, type, values; // Skip if merged

        if (item.merged) {
          return null;
        }

        values = this.props.values || [];
        itemValue = values[index]; // Clean expression first

        expr = new ExprCleaner(this.props.schema).cleanExpr(item.expr); // Do not render if nothing

        if (!expr) {
          return null;
        } // Get type of expr


        type = new ExprUtils(this.props.schema).getExprType(expr); // Determine if locked

        lock = _.find(this.props.locks, function (lock) {
          return _.isEqual(lock.expr, expr);
        });

        if (lock) {
          // Overrides item value
          itemValue = lock.value;
          onValueChange = null;
        } else {
          // Can change value if not locked
          onValueChange = function onValueChange(v) {
            var i, j, ref, ref1;
            values = (_this.props.values || []).slice();
            values[index] = v; // Also set any subsequent merged ones

            for (i = j = ref = index + 1, ref1 = _this.props.design.length; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
              if (_this.props.design[i].merged) {
                values[i] = v;
              } else {
                break;
              }
            }

            return _this.props.onValuesChange(values);
          };
        } // Determine additional filters that come from other quickfilters. This is to make sure that each quickfilter is filtered
        // by any other active quickfilters (excluding self)


        compiler = new QuickfilterCompiler(this.props.schema);
        otherDesign = (this.props.design || []).slice();
        otherValues = (this.props.values || []).slice();
        otherLocks = (this.props.locks || []).slice();
        otherDesign.splice(index, 1);
        otherValues.splice(index, 1);
        otherLocks.splice(index, 1);
        otherQuickFilterFilters = compiler.compile(otherDesign, otherValues, otherLocks);
        filters = (this.props.filters || []).concat(otherQuickFilterFilters);

        if (type === "enum" || type === "enumset") {
          return R(EnumQuickfilterComponent, {
            key: JSON.stringify(item),
            label: item.label,
            expr: expr,
            schema: this.props.schema,
            options: new ExprUtils(this.props.schema).getExprEnumValues(expr),
            value: itemValue,
            onValueChange: onValueChange,
            multi: item.multi
          });
        }

        if (type === "text") {
          return R(TextQuickfilterComponent, {
            key: JSON.stringify(item),
            index: index,
            label: item.label,
            expr: expr,
            schema: this.props.schema,
            quickfiltersDataSource: this.props.quickfiltersDataSource,
            value: itemValue,
            onValueChange: onValueChange,
            filters: filters,
            multi: item.multi
          });
        }

        if (type === "date" || type === "datetime") {
          return R(DateQuickfilterComponent, {
            key: JSON.stringify(item),
            label: item.label,
            expr: expr,
            schema: this.props.schema,
            value: itemValue,
            onValueChange: onValueChange
          });
        }

        if (type === "id[]") {
          return R(IdArrayQuickfilterComponent, {
            key: JSON.stringify(item),
            index: index,
            label: item.label,
            expr: expr,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            value: itemValue,
            onValueChange: onValueChange,
            filters: filters,
            multi: item.multi
          });
        }

        if (type === "text[]") {
          return R(TextArrayQuickfilterComponent, {
            key: JSON.stringify(item),
            index: index,
            label: item.label,
            expr: expr,
            schema: this.props.schema,
            quickfiltersDataSource: this.props.quickfiltersDataSource,
            value: itemValue,
            onValueChange: onValueChange,
            filters: filters,
            multi: item.multi
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        if (!this.props.design || this.props.design.length === 0) {
          return null;
        }

        return R('div', {
          style: {
            borderTop: "solid 1px #E8E8E8",
            borderBottom: "solid 1px #E8E8E8",
            padding: 5
          }
        }, _.map(this.props.design, function (item, i) {
          return _this2.renderQuickfilter(item, i);
        }));
      }
    }]);
    return QuickfiltersComponent;
  }(React.Component);

  ;
  QuickfiltersComponent.propTypes = {
    design: PropTypes.arrayOf(PropTypes.shape({
      expr: PropTypes.object.isRequired,
      label: PropTypes.string // Design of quickfilters. See README.md

    })),
    values: PropTypes.array,
    // Current values of quickfilters (state of filters selected)
    onValuesChange: PropTypes.func.isRequired,
    // Called when value changes
    // Locked quickfilters. Locked ones cannot be changed and are shown with a lock
    locks: PropTypes.arrayOf(PropTypes.shape({
      expr: PropTypes.object.isRequired,
      value: PropTypes.any
    })),
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    // See QuickfiltersDataSource
    // Filters to add to restrict quick filter data to
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    }))
  };
  return QuickfiltersComponent;
}.call(void 0);

EnumQuickfilterComponent = function () {
  // Quickfilter for an enum
  var EnumQuickfilterComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(EnumQuickfilterComponent, _React$Component2);

    function EnumQuickfilterComponent() {
      var _this3;

      (0, _classCallCheck2["default"])(this, EnumQuickfilterComponent);
      _this3 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(EnumQuickfilterComponent).apply(this, arguments));
      _this3.handleSingleChange = _this3.handleSingleChange.bind((0, _assertThisInitialized2["default"])(_this3));
      _this3.handleMultiChange = _this3.handleMultiChange.bind((0, _assertThisInitialized2["default"])(_this3));
      return _this3;
    }

    (0, _createClass2["default"])(EnumQuickfilterComponent, [{
      key: "handleSingleChange",
      value: function handleSingleChange(val) {
        boundMethodCheck(this, EnumQuickfilterComponent);

        if (val) {
          return this.props.onValueChange(val);
        } else {
          return this.props.onValueChange(null);
        }
      }
    }, {
      key: "handleMultiChange",
      value: function handleMultiChange(val) {
        boundMethodCheck(this, EnumQuickfilterComponent);

        if ((val != null ? val.length : void 0) > 0) {
          return this.props.onValueChange(_.pluck(val, "value"));
        } else {
          return this.props.onValueChange(null);
        }
      }
    }, {
      key: "renderSingleSelect",
      value: function renderSingleSelect(options) {
        var _this4 = this;

        return R(ReactSelect, {
          placeholder: "All",
          value: _.findWhere(options, {
            value: this.props.value
          }) || null,
          options: options,
          isClearable: true,
          onChange: function onChange(value) {
            if (_this4.props.onValueChange) {
              return _this4.handleSingleChange(value != null ? value.value : void 0);
            }
          },
          isDisabled: this.props.onValueChange == null,
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
      key: "renderMultiSelect",
      value: function renderMultiSelect(options) {
        return R(ReactSelect, {
          placeholder: "All",
          value: _.map(this.props.value, function (v) {
            return _.find(options, function (o) {
              return o.value === v;
            });
          }),
          isClearable: true,
          isMulti: true,
          options: options,
          onChange: this.props.onValueChange ? this.handleMultiChange : void 0,
          isDisabled: this.props.onValueChange == null,
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
        var _this5 = this;

        var minWidth, options, ref, width;
        options = _.map(this.props.options, function (opt) {
          return {
            value: opt.id,
            label: ExprUtils.localizeString(opt.name, _this5.context.locale)
          };
        }); // Determine width, estimating about 8 px per letter with 120px padding

        width = (ref = _.max(options, function (o) {
          return o.label.length;
        })) != null ? ref.label.length : void 0;
        width = width ? width * 8 + 120 : 280;
        minWidth = width > 280 || this.props.multi ? "280px" : "".concat(width, "px");
        return R('div', {
          style: {
            display: "inline-block",
            paddingRight: 10
          }
        }, this.props.label ? R('span', {
          style: {
            color: "gray"
          }
        }, this.props.label + ":\xA0") : void 0, R('div', {
          style: {
            display: "inline-block",
            minWidth: minWidth,
            verticalAlign: "middle"
          }
        }, this.props.multi ? this.renderMultiSelect(options) : this.renderSingleSelect(options)), !this.props.onValueChange ? R('i', {
          className: "text-warning fa fa-fw fa-lock"
        }) : void 0);
      }
    }]);
    return EnumQuickfilterComponent;
  }(React.Component);

  ;
  EnumQuickfilterComponent.propTypes = {
    label: PropTypes.string,
    schema: PropTypes.object.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      // id of option
      name: PropTypes.object.isRequired // Localized name

    })).isRequired,
    multi: PropTypes.bool,
    // true to display multiple values
    value: PropTypes.any,
    // Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func // Called when value changes

  };
  EnumQuickfilterComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return EnumQuickfilterComponent;
}.call(void 0);

TextQuickfilterComponent = function () {
  // Quickfilter for a text value
  var TextQuickfilterComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2["default"])(TextQuickfilterComponent, _React$Component3);

    function TextQuickfilterComponent() {
      (0, _classCallCheck2["default"])(this, TextQuickfilterComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TextQuickfilterComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(TextQuickfilterComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            display: "inline-block",
            paddingRight: 10
          }
        }, this.props.label ? R('span', {
          style: {
            color: "gray"
          }
        }, this.props.label + ":\xA0") : void 0, R('div', {
          style: {
            display: "inline-block",
            minWidth: "280px",
            verticalAlign: "middle"
          }
        }, R(TextLiteralComponent, {
          value: this.props.value,
          onChange: this.props.onValueChange,
          schema: this.props.schema,
          expr: this.props.expr,
          index: this.props.index,
          multi: this.props.multi,
          quickfiltersDataSource: this.props.quickfiltersDataSource,
          filters: this.props.filters
        })), !this.props.onValueChange ? R('i', {
          className: "text-warning fa fa-fw fa-lock"
        }) : void 0);
      }
    }]);
    return TextQuickfilterComponent;
  }(React.Component);

  ;
  TextQuickfilterComponent.propTypes = {
    label: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    // See QuickfiltersDataSource
    expr: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    value: PropTypes.any,
    // Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func,
    // Called when value changes
    multi: PropTypes.bool,
    // true to display multiple values
    // Filters to add to the quickfilter to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    }))
  };
  return TextQuickfilterComponent;
}.call(void 0);

DateQuickfilterComponent = function () {
  // Quickfilter for a date value
  var DateQuickfilterComponent =
  /*#__PURE__*/
  function (_React$Component4) {
    (0, _inherits2["default"])(DateQuickfilterComponent, _React$Component4);

    function DateQuickfilterComponent() {
      (0, _classCallCheck2["default"])(this, DateQuickfilterComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(DateQuickfilterComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(DateQuickfilterComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            display: "inline-block",
            paddingRight: 10
          }
        }, this.props.label ? R('span', {
          style: {
            color: "gray"
          }
        }, this.props.label + ":\xA0") : void 0, R('div', {
          style: {
            display: "inline-block",
            minWidth: "280px",
            verticalAlign: "middle"
          }
        }, R(DateExprComponent, {
          datetime: new ExprUtils(this.props.schema).getExprType(this.props.expr) === "datetime",
          value: this.props.value,
          onChange: this.props.onValueChange
        })), !this.props.onValueChange ? R('i', {
          className: "text-warning fa fa-fw fa-lock"
        }) : void 0);
      }
    }]);
    return DateQuickfilterComponent;
  }(React.Component);

  ;
  DateQuickfilterComponent.propTypes = {
    label: PropTypes.string,
    schema: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    value: PropTypes.any,
    // Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func.isRequired // Called when value changes

  };
  return DateQuickfilterComponent;
}.call(void 0);

TextArrayQuickfilterComponent = function () {
  // Quickfilter for a text value
  var TextArrayQuickfilterComponent =
  /*#__PURE__*/
  function (_React$Component5) {
    (0, _inherits2["default"])(TextArrayQuickfilterComponent, _React$Component5);

    function TextArrayQuickfilterComponent() {
      (0, _classCallCheck2["default"])(this, TextArrayQuickfilterComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TextArrayQuickfilterComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(TextArrayQuickfilterComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            display: "inline-block",
            paddingRight: 10
          }
        }, this.props.label ? R('span', {
          style: {
            color: "gray"
          }
        }, this.props.label + ":\xA0") : void 0, R('div', {
          style: {
            display: "inline-block",
            minWidth: "280px",
            verticalAlign: "middle"
          }
        }, R(TextLiteralComponent, {
          value: this.props.value,
          onChange: this.props.onValueChange,
          schema: this.props.schema,
          expr: this.props.expr,
          index: this.props.index,
          multi: this.props.multi,
          quickfiltersDataSource: this.props.quickfiltersDataSource,
          filters: this.props.filters
        })), !this.props.onValueChange ? R('i', {
          className: "text-warning fa fa-fw fa-lock"
        }) : void 0);
      }
    }]);
    return TextArrayQuickfilterComponent;
  }(React.Component);

  ;
  TextArrayQuickfilterComponent.propTypes = {
    label: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    quickfiltersDataSource: PropTypes.object.isRequired,
    // See QuickfiltersDataSource
    expr: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    value: PropTypes.any,
    // Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func,
    // Called when value changes
    multi: PropTypes.bool,
    // true to display multiple values
    // Filters to add to the quickfilter to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    }))
  };
  return TextArrayQuickfilterComponent;
}.call(void 0);