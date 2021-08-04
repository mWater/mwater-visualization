"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var $, Child, Parent, R, React, ReactDOM, VerticalLayoutComponent;
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
$ = require('jquery'); // LargeListComponent = require './LargeListComponent'

VerticalLayoutComponent = require('./VerticalLayoutComponent');

Parent = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(Parent, _React$Component);

  var _super = _createSuper(Parent);

  function Parent() {
    (0, _classCallCheck2["default"])(this, Parent);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(Parent, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      return console.log(this.refs);
    }
  }, {
    key: "render",
    value: function render() {
      return R('div', null, R('div', {
        ref: "simple"
      }, R('div', {
        ref: "complex"
      })), React.createElement(Child, {}, R('div', {
        ref: "simple2"
      }, R('div', {
        ref: "complex2"
      }))));
    }
  }]);
  return Parent;
}(React.Component);

Child = /*#__PURE__*/function (_React$Component2) {
  (0, _inherits2["default"])(Child, _React$Component2);

  var _super2 = _createSuper(Child);

  function Child() {
    (0, _classCallCheck2["default"])(this, Child);
    return _super2.apply(this, arguments);
  }

  (0, _createClass2["default"])(Child, [{
    key: "render",
    value: function render() {
      return R('div', {
        style: {
          height: this.props.height,
          backgroundColor: this.props.backgroundColor
        }
      }, this.props.children);
    }
  }]);
  return Child;
}(React.Component);

$(function () {
  var sample;
  sample = React.createElement(VerticalLayoutComponent, {
    height: 200,
    relativeHeights: {
      a: 0.6,
      b: 0.4
    }
  }, React.createElement(Child, {
    key: "a",
    backgroundColor: "red"
  }), React.createElement(Child, {
    key: "b",
    backgroundColor: "green"
  }), React.createElement(Child, {
    key: "c",
    backgroundColor: "blue",
    height: 50
  })); // sample = React.createElement(LargeListComponent, {
  //   loadRows: (start, number, cb) => 
  //     # console.log start
  //     # console.log number
  //     setTimeout () =>
  //       cb(null, _.range(start, start + number))
  //     , 200
  //   renderRow: (row, index) -> R('div', style: { height: 25 }, key: index + "", "" + row)
  //   rowHeight: 25
  //   pageSize: 100
  //   height: 500
  //   rowCount: 10000
  //   bufferSize: 100
  //   })

  return ReactDOM.render(sample, document.body);
});