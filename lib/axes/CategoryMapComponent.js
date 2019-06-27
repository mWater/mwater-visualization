"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder,
    CategoryMapComponent,
    ColorComponent,
    ExprCompiler,
    ExprUtils,
    PropTypes,
    R,
    React,
    ReorderableListComponent,
    _,
    update,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ExprCompiler = require('mwater-expressions').ExprCompiler;
AxisBuilder = require('./AxisBuilder');
update = require('update-object');
ColorComponent = require('../ColorComponent');
ExprUtils = require('mwater-expressions').ExprUtils;
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent"); // Category map for an axis. Controls the colorMap values and excludedValues
// Can be collapsed

module.exports = CategoryMapComponent = function () {
  var CategoryMapComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(CategoryMapComponent, _React$Component);

    function CategoryMapComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, CategoryMapComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(CategoryMapComponent).call(this, props));
      _this.handleReorder = _this.handleReorder.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleColorChange = _this.handleColorChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleExcludeChange = _this.handleExcludeChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleNullLabelChange = _this.handleNullLabelChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleToggle = _this.handleToggle.bind((0, _assertThisInitialized2["default"])(_this)); // Category is { value: category value, label: category label }

      _this.renderCategory = _this.renderCategory.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        collapsed: !props.initiallyExpanded // Start collapsed

      };
      return _this;
    }

    (0, _createClass2["default"])(CategoryMapComponent, [{
      key: "handleReorder",
      value: function handleReorder(map) {
        var order;
        boundMethodCheck(this, CategoryMapComponent);
        order = _.pluck(map, "value");
        return this.props.onChange(update(this.props.axis, {
          drawOrder: {
            $set: order
          }
        }));
      }
    }, {
      key: "handleColorChange",
      value: function handleColorChange(value, color) {
        var colorMap;
        boundMethodCheck(this, CategoryMapComponent); // Delete if present for value

        colorMap = _.filter(this.props.axis.colorMap, function (item) {
          return item.value !== value;
        }); // Add if color present

        if (color) {
          colorMap.push({
            value: value,
            color: color
          });
        }

        return this.props.onChange(update(this.props.axis, {
          colorMap: {
            $set: colorMap
          }
        }));
      }
    }, {
      key: "handleExcludeChange",
      value: function handleExcludeChange(value, ev) {
        var excludedValues;
        boundMethodCheck(this, CategoryMapComponent);

        if (ev.target.checked) {
          excludedValues = _.difference(this.props.axis.excludedValues, [value]);
        } else {
          excludedValues = _.union(this.props.axis.excludedValues, [value]);
        }

        return this.props.onChange(update(this.props.axis, {
          excludedValues: {
            $set: excludedValues
          }
        }));
      } // Gets the current color value if known

    }, {
      key: "lookupColor",
      value: function lookupColor(value) {
        var item;
        item = _.find(this.props.axis.colorMap, function (item) {
          return item.value === value;
        });

        if (item) {
          return item.color;
        }

        return null;
      }
    }, {
      key: "handleNullLabelChange",
      value: function handleNullLabelChange(e) {
        var name;
        boundMethodCheck(this, CategoryMapComponent);
        name = prompt("Enter label for none value", this.props.axis.nullLabel || ExprUtils.localizeString("None"));

        if (name) {
          return this.props.onChange(update(this.props.axis, {
            nullLabel: {
              $set: name
            }
          }));
        }
      }
    }, {
      key: "handleToggle",
      value: function handleToggle() {
        boundMethodCheck(this, CategoryMapComponent);
        return this.setState({
          collapsed: !this.state.collapsed
        });
      }
    }, {
      key: "renderLabel",
      value: function renderLabel(category) {
        var label;
        label = ExprUtils.localizeString(category.label);

        if (category.value != null) {
          return label;
        } else {
          return R('a', {
            onClick: this.handleNullLabelChange,
            style: {
              cursor: 'pointer'
            }
          }, label, R('span', {
            style: {
              fontSize: 12,
              marginLeft: 4
            }
          }, "(click to change label for none value)"));
        }
      }
    }, {
      key: "renderCategory",
      value: function renderCategory(category, index, connectDragSource, connectDragPreview, connectDropTarget) {
        var _this2 = this;

        var colorPickerStyle, elem, iconStyle, labelStyle;
        boundMethodCheck(this, CategoryMapComponent);
        labelStyle = {
          verticalAlign: 'middle',
          marginLeft: 5
        };
        iconStyle = {
          cursor: "move",
          marginRight: 8,
          opacity: 0.5,
          fontSize: 12,
          height: 20
        };
        colorPickerStyle = {
          verticalAlign: 'middle',
          lineHeight: 1,
          display: 'inline-block',
          marginLeft: 5
        };
        elem = R('div', {
          key: category.value
        }, connectDragSource ? connectDragSource(R('i', {
          className: "fa fa-bars",
          style: iconStyle
        })) : void 0, this.props.allowExcludedValues ? R('input', {
          type: "checkbox",
          style: {
            marginLeft: 5,
            marginBottom: 5,
            verticalAlign: "middle"
          },
          checked: !_.includes(this.props.axis.excludedValues, category.value),
          onChange: this.handleExcludeChange.bind(null, category.value)
        }) : void 0, this.props.showColorMap ? R('div', {
          style: colorPickerStyle
        }, R(ColorComponent, {
          key: 'color',
          color: this.lookupColor(category.value),
          onChange: function onChange(color) {
            return _this2.handleColorChange(category.value, color);
          }
        })) : void 0, R('span', {
          style: labelStyle
        }, this.renderLabel(category)));

        if (connectDropTarget) {
          elem = connectDropTarget(elem);
        }

        if (connectDragPreview) {
          elem = connectDragPreview(elem);
        }

        return elem;
      }
    }, {
      key: "renderReorderable",
      value: function renderReorderable() {
        var drawOrder, orderedCategories;
        drawOrder = this.props.axis.drawOrder || _.pluck(this.props.axis.colorMap, "value");
        orderedCategories = _.sortBy(this.props.categories, function (category) {
          return _.indexOf(drawOrder, category.value);
        });
        return R('div', null, this.renderToggle(), R(ReorderableListComponent, {
          items: orderedCategories,
          onReorder: this.handleReorder,
          renderItem: this.renderCategory,
          getItemId: function getItemId(item) {
            return item.value;
          }
        }));
      }
    }, {
      key: "renderNonReorderable",
      value: function renderNonReorderable() {
        var _this3 = this;

        return R('div', null, this.renderToggle(), _.map(this.props.categories, function (category) {
          return _this3.renderCategory(category);
        }));
      }
    }, {
      key: "renderToggle",
      value: function renderToggle() {
        if (this.state.collapsed) {
          return R('div', null, R('a', {
            onClick: this.handleToggle
          }, "Show Values ", R('i', {
            className: "fa fa-caret-down"
          })));
        } else {
          return R('div', null, R('a', {
            onClick: this.handleToggle
          }, "Hide Values ", R('i', {
            className: "fa fa-caret-up"
          })));
        }
      }
    }, {
      key: "render",
      value: function render() {
        if (this.state.collapsed) {
          return this.renderToggle();
        }

        if (this.props.reorderable) {
          return this.renderReorderable();
        } else {
          return this.renderNonReorderable();
        }
      }
    }]);
    return CategoryMapComponent;
  }(React.Component);

  ;
  CategoryMapComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    axis: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    categories: PropTypes.array,
    reorderable: PropTypes.bool,
    showColorMap: PropTypes.bool,
    // True to allow editing the color map
    allowExcludedValues: PropTypes.bool,
    // True to allow excluding of values via checkboxes
    initiallyExpanded: PropTypes.bool // True to start expanded

  };
  return CategoryMapComponent;
}.call(void 0);