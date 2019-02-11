"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ExprComponent,
    ExprUtils,
    OrderByDesignerComponent,
    OrderBysDesignerComponent,
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
ExprUtils = require("mwater-expressions").ExprUtils;
ExprComponent = require('mwater-expressions-ui').ExprComponent; // Edits an orderBys which is a list of expressions and directions. See README.md

module.exports = OrderBysDesignerComponent = function () {
  var OrderBysDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(OrderBysDesignerComponent, _React$Component);

    function OrderBysDesignerComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, OrderBysDesignerComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(OrderBysDesignerComponent).apply(this, arguments));
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleRemove = _this.handleRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleAdd = _this.handleAdd.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(OrderBysDesignerComponent, [{
      key: "handleChange",
      value: function handleChange(index, orderBy) {
        var orderBys;
        boundMethodCheck(this, OrderBysDesignerComponent);
        orderBys = this.props.orderBys.slice();
        orderBys[index] = orderBy;
        return this.props.onChange(orderBys);
      }
    }, {
      key: "handleRemove",
      value: function handleRemove(index) {
        var orderBys;
        boundMethodCheck(this, OrderBysDesignerComponent);
        orderBys = this.props.orderBys.slice();
        orderBys.splice(index, 1);
        return this.props.onChange(orderBys);
      }
    }, {
      key: "handleAdd",
      value: function handleAdd() {
        var orderBys;
        boundMethodCheck(this, OrderBysDesignerComponent);
        orderBys = this.props.orderBys.slice();
        orderBys.push({
          expr: null,
          direction: "asc"
        });
        return this.props.onChange(orderBys);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        return R('div', null, _.map(this.props.orderBys, function (orderBy, index) {
          return R(OrderByDesignerComponent, {
            key: index,
            schema: _this2.props.schema,
            table: _this2.props.table,
            dataSource: _this2.props.dataSource,
            orderBy: orderBy,
            onChange: _this2.handleChange.bind(null, index),
            onRemove: _this2.handleRemove.bind(null, index)
          });
        }), R('button', {
          key: "add",
          type: "button",
          className: "btn btn-link",
          onClick: this.handleAdd
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Ordering"));
      }
    }]);
    return OrderBysDesignerComponent;
  }(React.Component);

  ;
  OrderBysDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    table: PropTypes.string.isRequired,
    orderBys: PropTypes.array.isRequired,
    // Columns list See README.md of this folder
    onChange: PropTypes.func.isRequired // Called when columns changes

  };
  OrderBysDesignerComponent.defaultProps = {
    orderBys: []
  };
  return OrderBysDesignerComponent;
}.call(void 0);

OrderByDesignerComponent = function () {
  var OrderByDesignerComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(OrderByDesignerComponent, _React$Component2);

    function OrderByDesignerComponent() {
      var _this3;

      (0, _classCallCheck2.default)(this, OrderByDesignerComponent);
      _this3 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(OrderByDesignerComponent).apply(this, arguments));
      _this3.handleExprChange = _this3.handleExprChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this3)));
      _this3.handleDirectionChange = _this3.handleDirectionChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this3)));
      return _this3;
    }

    (0, _createClass2.default)(OrderByDesignerComponent, [{
      key: "handleExprChange",
      value: function handleExprChange(expr) {
        boundMethodCheck(this, OrderByDesignerComponent);
        return this.props.onChange(_.extend({}, this.props.orderBy, {
          expr: expr
        }));
      }
    }, {
      key: "handleDirectionChange",
      value: function handleDirectionChange(ev) {
        boundMethodCheck(this, OrderByDesignerComponent);
        return this.props.onChange(_.extend({}, this.props.orderBy, {
          direction: ev.target.checked ? "desc" : "asc"
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          className: "row"
        }, R('div', {
          className: "col-xs-7"
        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ['text', 'number', 'boolean', 'date', 'datetime'],
          aggrStatuses: ["individual", "literal", "aggregate"],
          value: this.props.orderBy.expr,
          onChange: this.handleExprChange
        })), R('div', {
          className: "col-xs-3"
        }, R('div', {
          className: "checkbox-inline"
        }, R('label', null, R('input', {
          type: "checkbox",
          checked: this.props.orderBy.direction === "desc",
          onChange: this.handleDirectionChange
        }), "Reverse"))), R('div', {
          className: "col-xs-1"
        }, R('button', {
          className: "btn btn-xs btn-link",
          type: "button",
          onClick: this.props.onRemove
        }, R('span', {
          className: "glyphicon glyphicon-remove"
        }))));
      }
    }]);
    return OrderByDesignerComponent;
  }(React.Component);

  ;
  OrderByDesignerComponent.propTypes = {
    orderBy: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string // Current table

  };
  return OrderByDesignerComponent;
}.call(void 0);