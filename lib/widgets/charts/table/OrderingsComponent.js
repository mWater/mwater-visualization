"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ExprComponent,
    OrderingComponent,
    OrderingsComponent,
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
ExprComponent = require("mwater-expressions-ui").ExprComponent; // Edits the orderings of a chart
// Orderings are an array of { axis: axis to order by, direction: "asc"/"desc" }
// NOTE: no longer uses complete axis, just the expr

module.exports = OrderingsComponent = function () {
  var OrderingsComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(OrderingsComponent, _React$Component);

    var _super = _createSuper(OrderingsComponent);

    function OrderingsComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, OrderingsComponent);
      _this = _super.apply(this, arguments);
      _this.handleAdd = _this.handleAdd.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOrderingRemove = _this.handleOrderingRemove.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOrderingChange = _this.handleOrderingChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(OrderingsComponent, [{
      key: "handleAdd",
      value: function handleAdd() {
        var orderings;
        boundMethodCheck(this, OrderingsComponent);
        orderings = this.props.orderings.slice();
        orderings.push({
          axis: null,
          direction: "asc"
        });
        return this.props.onOrderingsChange(orderings);
      }
    }, {
      key: "handleOrderingRemove",
      value: function handleOrderingRemove(index) {
        var orderings;
        boundMethodCheck(this, OrderingsComponent);
        orderings = this.props.orderings.slice();
        orderings.splice(index, 1);
        return this.props.onOrderingsChange(orderings);
      }
    }, {
      key: "handleOrderingChange",
      value: function handleOrderingChange(index, ordering) {
        var orderings;
        boundMethodCheck(this, OrderingsComponent);
        orderings = this.props.orderings.slice();
        orderings[index] = ordering;
        return this.props.onOrderingsChange(orderings);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        return R('div', null, _.map(this.props.orderings, function (ordering, i) {
          return R(OrderingComponent, {
            schema: _this2.props.schema,
            dataSource: _this2.props.dataSource,
            ordering: ordering,
            table: _this2.props.table,
            onOrderingChange: _this2.handleOrderingChange.bind(null, i),
            onOrderingRemove: _this2.handleOrderingRemove.bind(null, i)
          });
        }), R('button', {
          type: "button",
          className: "btn btn-sm btn-default",
          onClick: this.handleAdd,
          key: "add"
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Ordering"));
      }
    }]);
    return OrderingsComponent;
  }(React.Component);

  ;
  OrderingsComponent.propTypes = {
    orderings: PropTypes.array.isRequired,
    onOrderingsChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string // Current table

  };
  return OrderingsComponent;
}.call(void 0);

OrderingComponent = function () {
  var OrderingComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(OrderingComponent, _React$Component2);

    var _super2 = _createSuper(OrderingComponent);

    function OrderingComponent() {
      var _this3;

      (0, _classCallCheck2["default"])(this, OrderingComponent);
      _this3 = _super2.apply(this, arguments);
      _this3.handleAxisChange = _this3.handleAxisChange.bind((0, _assertThisInitialized2["default"])(_this3));
      _this3.handleExprChange = _this3.handleExprChange.bind((0, _assertThisInitialized2["default"])(_this3));
      _this3.handleDirectionChange = _this3.handleDirectionChange.bind((0, _assertThisInitialized2["default"])(_this3));
      return _this3;
    }

    (0, _createClass2["default"])(OrderingComponent, [{
      key: "handleAxisChange",
      value: function handleAxisChange(axis) {
        boundMethodCheck(this, OrderingComponent);
        return this.props.onOrderingChange(_.extend({}, this.props.ordering, {
          axis: axis
        }));
      }
    }, {
      key: "handleExprChange",
      value: function handleExprChange(expr) {
        var axis;
        boundMethodCheck(this, OrderingComponent);
        axis = _.extend({}, this.props.ordering.axis || {}, {
          expr: expr
        });
        return this.handleAxisChange(axis);
      }
    }, {
      key: "handleDirectionChange",
      value: function handleDirectionChange(ev) {
        boundMethodCheck(this, OrderingComponent);
        return this.props.onOrderingChange(_.extend({}, this.props.ordering, {
          direction: ev.target.checked ? "desc" : "asc"
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var ref;
        return R('div', {
          style: {
            marginLeft: 5
          }
        }, R('div', {
          style: {
            textAlign: "right"
          }
        }, R('button', {
          className: "btn btn-xs btn-link",
          type: "button",
          onClick: this.props.onOrderingRemove
        }, R('span', {
          className: "glyphicon glyphicon-remove"
        }))), R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ['text', 'number', 'boolean', 'date', 'datetime'],
          aggrStatuses: ['individual', 'aggregate'],
          value: (ref = this.props.ordering.axis) != null ? ref.expr : void 0,
          onChange: this.handleExprChange
        }), R('div', null, R('div', {
          className: "checkbox-inline"
        }, R('label', null, R('input', {
          type: "checkbox",
          checked: this.props.ordering.direction === "desc",
          onChange: this.handleDirectionChange
        }), "Reverse"))));
      }
    }]);
    return OrderingComponent;
  }(React.Component);

  ;
  OrderingComponent.propTypes = {
    ordering: PropTypes.object.isRequired,
    onOrderingChange: PropTypes.func.isRequired,
    onOrderingRemove: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string // Current table

  };
  return OrderingComponent;
}.call(void 0);