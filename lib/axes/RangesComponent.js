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

var AxisBuilder,
    LinkComponent,
    NumberInputComponent,
    PropTypes,
    R,
    RangeComponent,
    RangesComponent,
    React,
    ReorderableListComponent,
    _,
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
update = require('update-object');
LinkComponent = require('mwater-expressions-ui').LinkComponent;
AxisBuilder = require('./AxisBuilder');
NumberInputComponent = require('react-library/lib/NumberInputComponent');
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent"); // Allows setting of ranges 

module.exports = RangesComponent = function () {
  var RangesComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(RangesComponent, _React$Component);

    var _super = _createSuper(RangesComponent);

    function RangesComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, RangesComponent);
      _this = _super.apply(this, arguments);
      _this.handleRangeChange = _this.handleRangeChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAddRange = _this.handleAddRange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemoveRange = _this.handleRemoveRange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderRange = _this.renderRange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleReorder = _this.handleReorder.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(RangesComponent, [{
      key: "handleRangeChange",
      value: function handleRangeChange(index, range) {
        var ranges;
        boundMethodCheck(this, RangesComponent);
        ranges = this.props.xform.ranges.slice();
        ranges[index] = range;
        return this.props.onChange(update(this.props.xform, {
          ranges: {
            $set: ranges
          }
        }));
      }
    }, {
      key: "handleAddRange",
      value: function handleAddRange() {
        var ranges;
        boundMethodCheck(this, RangesComponent);
        ranges = this.props.xform.ranges.slice();
        ranges.push({
          id: uuid(),
          minOpen: false,
          maxOpen: true
        });
        return this.props.onChange(update(this.props.xform, {
          ranges: {
            $set: ranges
          }
        }));
      }
    }, {
      key: "handleRemoveRange",
      value: function handleRemoveRange(index) {
        var ranges;
        boundMethodCheck(this, RangesComponent);
        ranges = this.props.xform.ranges.slice();
        ranges.splice(index, 1);
        return this.props.onChange(update(this.props.xform, {
          ranges: {
            $set: ranges
          }
        }));
      }
    }, {
      key: "renderRange",
      value: function renderRange(range, index, connectDragSource, connectDragPreview, connectDropTarget) {
        boundMethodCheck(this, RangesComponent);
        return R(RangeComponent, {
          key: range.id,
          range: range,
          onChange: this.handleRangeChange.bind(null, index),
          onRemove: this.handleRemoveRange.bind(null, index),
          connectDragSource: connectDragSource,
          connectDragPreview: connectDragPreview,
          connectDropTarget: connectDropTarget
        });
      }
    }, {
      key: "handleReorder",
      value: function handleReorder(ranges) {
        boundMethodCheck(this, RangesComponent);
        return this.props.onChange(update(this.props.xform, {
          ranges: {
            $set: ranges
          }
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, R('table', null, this.props.xform.ranges.length > 0 ? R('thead', null, R('tr', null, R('th', null, " "), R('th', {
          key: "min",
          colSpan: 2,
          style: {
            textAlign: "center"
          }
        }, "From"), R('th', {
          key: "and"
        }, ""), R('th', {
          key: "max",
          colSpan: 2,
          style: {
            textAlign: "center"
          }
        }, "To"), R('th', {
          key: "label",
          colSpan: 1,
          style: {
            textAlign: "center"
          }
        }, "Label"), R('th', {
          key: "remove"
        }))) : void 0, React.createElement(ReorderableListComponent, {
          items: this.props.xform.ranges,
          onReorder: this.handleReorder,
          renderItem: this.renderRange,
          getItemId: function getItemId(range) {
            return range.id;
          },
          element: R('tbody', null) //          _.map @props.xform.ranges, (range, i) =>
          //            R RangeComponent, key: range.id, range: range, onChange: @handleRangeChange.bind(null, i), onRemove: @handleRemoveRange.bind(null, i)

        })), R('button', {
          className: "btn btn-link btn-sm",
          type: "button",
          onClick: this.handleAddRange
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Range"));
      }
    }]);
    return RangesComponent;
  }(React.Component);

  ;
  RangesComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    // Expression for computing min/max
    xform: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  return RangesComponent;
}.call(void 0);

RangeComponent = function () {
  // Single range (row)
  var RangeComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(RangeComponent, _React$Component2);

    var _super2 = _createSuper(RangeComponent);

    function RangeComponent() {
      var _this2;

      (0, _classCallCheck2["default"])(this, RangeComponent);
      _this2 = _super2.apply(this, arguments);
      _this2.handleMinOpenChange = _this2.handleMinOpenChange.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleMaxOpenChange = _this2.handleMaxOpenChange.bind((0, _assertThisInitialized2["default"])(_this2));
      return _this2;
    }

    (0, _createClass2["default"])(RangeComponent, [{
      key: "handleMinOpenChange",
      value: function handleMinOpenChange(minOpen) {
        boundMethodCheck(this, RangeComponent);
        return this.props.onChange(update(this.props.range, {
          minOpen: {
            $set: minOpen
          }
        }));
      }
    }, {
      key: "handleMaxOpenChange",
      value: function handleMaxOpenChange(maxOpen) {
        boundMethodCheck(this, RangeComponent);
        return this.props.onChange(update(this.props.range, {
          maxOpen: {
            $set: maxOpen
          }
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var placeholder;
        placeholder = "";

        if (this.props.range.minValue != null) {
          if (this.props.range.minOpen) {
            placeholder = "> ".concat(this.props.range.minValue);
          } else {
            placeholder = ">= ".concat(this.props.range.minValue);
          }
        }

        if (this.props.range.maxValue != null) {
          if (placeholder) {
            placeholder += " and ";
          }

          if (this.props.range.maxOpen) {
            placeholder += "< ".concat(this.props.range.maxValue);
          } else {
            placeholder += "<= ".concat(this.props.range.maxValue);
          }
        }

        return this.props.connectDragPreview(this.props.connectDropTarget(R('tr', null, R('td', null, this.props.connectDragSource(R('span', {
          className: "fa fa-bars"
        }))), R('td', {
          key: "minOpen"
        }, R(LinkComponent, {
          dropdownItems: [{
            id: true,
            name: "greater than"
          }, {
            id: false,
            name: "greater than or equal to"
          }],
          onDropdownItemClicked: this.handleMinOpenChange
        }, this.props.range.minOpen ? "greater than" : "greater than or equal to")), R('td', {
          key: "minValue"
        }, R(NumberInputComponent, {
          value: this.props.range.minValue,
          placeholder: "None",
          small: true,
          onChange: function onChange(v) {
            return _this3.props.onChange(update(_this3.props.range, {
              minValue: {
                $set: v
              }
            }));
          }
        })), R('td', {
          key: "and"
        }, "\xA0and\xA0"), R('td', {
          key: "maxOpen"
        }, R(LinkComponent, {
          dropdownItems: [{
            id: true,
            name: "less than"
          }, {
            id: false,
            name: "less than or equal to"
          }],
          onDropdownItemClicked: this.handleMaxOpenChange
        }, this.props.range.maxOpen ? "less than" : "less than or equal to")), R('td', {
          key: "maxValue"
        }, R(NumberInputComponent, {
          value: this.props.range.maxValue,
          placeholder: "None",
          small: true,
          onChange: function onChange(v) {
            return _this3.props.onChange(update(_this3.props.range, {
              maxValue: {
                $set: v
              }
            }));
          }
        })), R('td', {
          key: "label"
        }, R('input', {
          type: "text",
          className: "form-control input-sm",
          value: this.props.range.label || "",
          placeholder: placeholder,
          onChange: function onChange(ev) {
            return _this3.props.onChange(update(_this3.props.range, {
              label: {
                $set: ev.target.value || null
              }
            }));
          }
        })), R('td', {
          key: "remove"
        }, R('button', {
          className: "btn btn-xs btn-link",
          type: "button",
          onClick: this.props.onRemove
        }, R('span', {
          className: "glyphicon glyphicon-remove"
        }))))));
      }
    }]);
    return RangeComponent;
  }(React.Component);

  ;
  RangeComponent.propTypes = {
    range: PropTypes.object.isRequired,
    // Range to edit
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    //reorderable connector
    connectDragPreview: PropTypes.func.isRequired,
    //reorderable connector
    connectDropTarget: PropTypes.func.isRequired //reorderable connector

  };
  return RangeComponent;
}.call(void 0);