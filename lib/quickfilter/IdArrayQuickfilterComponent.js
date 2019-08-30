"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AsyncReactSelect, ExprUtils, IdArrayQuickfilterComponent, IdLiteralComponent, PropTypes, R, React, _;

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
AsyncReactSelect = require('react-select/lib/Async')["default"];
ExprUtils = require('mwater-expressions').ExprUtils;
IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent; // Quickfilter for an id[]

module.exports = IdArrayQuickfilterComponent = function () {
  var IdArrayQuickfilterComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(IdArrayQuickfilterComponent, _React$Component);

    function IdArrayQuickfilterComponent() {
      (0, _classCallCheck2["default"])(this, IdArrayQuickfilterComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(IdArrayQuickfilterComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(IdArrayQuickfilterComponent, [{
      key: "render",
      value: function render() {
        var exprUtils, idTable; // Determine table

        exprUtils = new ExprUtils(this.props.schema);
        idTable = exprUtils.getExprIdTable(this.props.expr);
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
            verticalAlign: "middle" // TODO should use quickfilter data source, but is complicated

          }
        }, R(IdLiteralComponent, {
          value: this.props.value,
          onChange: this.props.onValueChange,
          idTable: idTable,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          placeholder: "All",
          multi: this.props.multi // TODO Does not use filters that are passed in

        })), !this.props.onValueChange ? R('i', {
          className: "text-warning fa fa-fw fa-lock"
        }) : void 0);
      }
    }]);
    return IdArrayQuickfilterComponent;
  }(React.Component);

  ;
  IdArrayQuickfilterComponent.propTypes = {
    label: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
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
  return IdArrayQuickfilterComponent;
}.call(void 0);