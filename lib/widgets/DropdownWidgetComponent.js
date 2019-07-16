"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var $,
    DropdownWidgetComponent,
    PropTypes,
    R,
    React,
    ReactDOM,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
$ = require('jquery');
PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement; // Widget wrapper that adds a dropdown menu in a gear floating

module.exports = DropdownWidgetComponent = function () {
  var DropdownWidgetComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(DropdownWidgetComponent, _React$Component);

    function DropdownWidgetComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, DropdownWidgetComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(DropdownWidgetComponent).apply(this, arguments));
      _this.renderDropdownItem = _this.renderDropdownItem.bind((0, _assertThisInitialized2["default"])(_this));
      _this.closeMenu = _this.closeMenu.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(DropdownWidgetComponent, [{
      key: "renderDropdownItem",
      value: function renderDropdownItem(item, i) {
        boundMethodCheck(this, DropdownWidgetComponent);
        return R('li', {
          key: "".concat(i)
        }, R('a', {
          onClick: item.onClick
        }, item.icon ? R('span', {
          className: "glyphicon glyphicon-".concat(item.icon, " text-muted")
        }) : void 0, item.icon ? " " : void 0, item.label));
      }
    }, {
      key: "renderDropdown",
      value: function renderDropdown() {
        var dropdownStyle, elem;

        if (this.props.dropdownItems.length === 0) {
          return null;
        }

        dropdownStyle = {
          position: "absolute",
          right: 3,
          top: 3,
          cursor: "pointer",
          zIndex: 1029
        };
        elem = R('div', {
          style: dropdownStyle,
          "data-toggle": "dropdown"
        }, R('div', {
          className: "mwater-visualization-simple-widget-gear-button"
        }, R('span', {
          className: "glyphicon glyphicon-cog"
        })));
        return R('div', {
          style: dropdownStyle
        }, elem, R('ul', {
          className: "dropdown-menu dropdown-menu-right",
          style: {
            top: 25
          }
        }, _.map(this.props.dropdownItems, this.renderDropdownItem)));
      }
    }, {
      key: "closeMenu",
      value: function closeMenu() {
        boundMethodCheck(this, DropdownWidgetComponent);
        return $(ReactDOM.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open');
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          className: "mwater-visualization-simple-widget",
          onMouseLeave: this.closeMenu,
          style: {
            width: this.props.width,
            height: this.props.height
          }
        }, this.props.children, this.renderDropdown());
      }
    }]);
    return DropdownWidgetComponent;
  }(React.Component);

  ;
  DropdownWidgetComponent.propTypes = {
    width: PropTypes.any,
    // Width specification
    height: PropTypes.any,
    // Height specification
    dropdownItems: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      icon: PropTypes.string,
      // Glyphicon string. e.g. "remove"
      onClick: PropTypes.func.isRequired
    })).isRequired // A list of {label, icon, onClick} actions for the dropdown

  };
  return DropdownWidgetComponent;
}.call(void 0);