"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ExprCleaner,
    ExprUtils,
    FilterExprComponent,
    FiltersDesignerComponent,
    PropTypes,
    R,
    React,
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
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require('mwater-expressions').ExprUtils; // Designer for filters of multiple tables. Used for maps and dashboards
// Filters are in format mwater-expression filter expression indexed by table. e.g. { sometable: logical expression, etc. }

module.exports = FiltersDesignerComponent = function () {
  var FiltersDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(FiltersDesignerComponent, _React$Component);

    function FiltersDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, FiltersDesignerComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(FiltersDesignerComponent).apply(this, arguments));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderFilterableTable = _this.renderFilterableTable.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(FiltersDesignerComponent, [{
      key: "handleFilterChange",
      value: function handleFilterChange(table, expr) {
        var filters;
        boundMethodCheck(this, FiltersDesignerComponent); // Clean filter

        expr = new ExprCleaner(this.props.schema).cleanExpr(expr, {
          table: table
        });
        filters = _.clone(this.props.filters || {});
        filters[table] = expr;
        return this.props.onFiltersChange(filters);
      }
    }, {
      key: "renderFilterableTable",
      value: function renderFilterableTable(table) {
        var name, ref;
        boundMethodCheck(this, FiltersDesignerComponent);
        name = ExprUtils.localizeString(this.props.schema.getTable(table).name, this.context.locale);
        return R('div', {
          key: table
        }, R('label', null, name), React.createElement(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange.bind(null, table),
          table: table,
          value: (ref = this.props.filters) != null ? ref[table] : void 0
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, _.map(this.props.filterableTables, this.renderFilterableTable));
      }
    }]);
    return FiltersDesignerComponent;
  }(React.Component);

  ;
  FiltersDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use
    filterableTables: PropTypes.arrayOf(PropTypes.string),
    // Tables that can be filtered on. Should only include tables that actually exist
    filters: PropTypes.object,
    onFiltersChange: PropTypes.func.isRequired // Called with new filters

  };
  FiltersDesignerComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return FiltersDesignerComponent;
}.call(void 0);