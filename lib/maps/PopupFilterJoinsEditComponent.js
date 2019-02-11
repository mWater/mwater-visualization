"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var DashboardUtils,
    ExprCompiler,
    ExprComponent,
    ExprUtils,
    PopupFilterJoinsEditComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ExprComponent = require("mwater-expressions-ui").ExprComponent;
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
DashboardUtils = require('../dashboards/DashboardUtils'); // Designer for popup filter joins (see PopupFilterJoins.md)

module.exports = PopupFilterJoinsEditComponent = function () {
  var PopupFilterJoinsEditComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(PopupFilterJoinsEditComponent, _React$Component);

    function PopupFilterJoinsEditComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, PopupFilterJoinsEditComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(PopupFilterJoinsEditComponent).call(this, props));
      _this.handleExprChange = _this.handleExprChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        expanded: false
      };
      return _this;
    }

    (0, _createClass2.default)(PopupFilterJoinsEditComponent, [{
      key: "handleExprChange",
      value: function handleExprChange(table, expr) {
        var design;
        boundMethodCheck(this, PopupFilterJoinsEditComponent);
        design = this.props.design || this.props.defaultPopupFilterJoins;
        design = _.clone(design);
        design[table] = expr;
        return this.props.onDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var filterableTables, popupDashboard, popupFilterJoins;

        if (!this.state.expanded) {
          return R('a', {
            className: "btn btn-link",
            onClick: function onClick() {
              return _this2.setState({
                expanded: true
              });
            }
          }, "Advanced Popup Options");
        } // Get filterable tables of popup


        popupDashboard = {
          items: this.props.popup.items,
          layout: "blocks"
        };
        filterableTables = DashboardUtils.getFilterableTables(popupDashboard, this.props.schema); // Always include self as first

        filterableTables = [this.props.table].concat(_.without(filterableTables, this.props.table)); // Get popupFilterJoins

        popupFilterJoins = this.props.design || this.props.defaultPopupFilterJoins;
        return R('div', null, R('div', {
          className: "text-muted"
        }, "Optional connections for other tables to filtering the popup"), R('table', {
          className: "table table-condensed table-bordered"
        }, R('thead', null, R('tr', null, R('th', null, "Data Source"), R('th', null, "Connection"))), R('tbody', null, _.map(filterableTables, function (filterableTable) {
          var ref;
          return R('tr', {
            key: filterableTable
          }, R('td', {
            style: {
              verticalAlign: "middle"
            }
          }, ExprUtils.localizeString((ref = _this2.props.schema.getTable(filterableTable)) != null ? ref.name : void 0)), R('td', null, R(ExprComponent, {
            schema: _this2.props.schema,
            dataSource: _this2.props.dataSource,
            table: filterableTable,
            value: popupFilterJoins[filterableTable],
            onChange: _this2.handleExprChange.bind(null, filterableTable),
            types: _this2.props.table === _this2.props.idTable ? ["id", "id[]"] : ["id"],
            // TODO support id[] some day for admin choropleth maps too
            idTable: _this2.props.idTable,
            preferLiteral: false,
            placeholder: "None"
          })));
        }))));
      }
    }]);
    return PopupFilterJoinsEditComponent;
  }(React.Component);

  ;
  PopupFilterJoinsEditComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    // table of the row that the popup will be for
    idTable: PropTypes.string.isRequired,
    // table of the row that join is to. Usually same as table except for choropleth maps
    defaultPopupFilterJoins: PropTypes.object.isRequired,
    // Default popup filter joins
    popup: PropTypes.object.isRequired,
    // Design of the popup this is for
    design: PropTypes.object,
    // popup filter joins object
    onDesignChange: PropTypes.func.isRequired // Called with new design

  };
  return PopupFilterJoinsEditComponent;
}.call(void 0);