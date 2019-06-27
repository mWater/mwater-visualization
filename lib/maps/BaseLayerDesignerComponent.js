"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var BaseLayerDesignerComponent,
    PopoverHelpComponent,
    PropTypes,
    R,
    Rcslider,
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
Rcslider = require('rc-slider')["default"];
PopoverHelpComponent = require('react-library/lib/PopoverHelpComponent'); // Designer for config

module.exports = BaseLayerDesignerComponent = function () {
  var BaseLayerDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(BaseLayerDesignerComponent, _React$Component);

    function BaseLayerDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, BaseLayerDesignerComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(BaseLayerDesignerComponent).apply(this, arguments));
      _this.handleBaseLayerChange = _this.handleBaseLayerChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOpacityChange = _this.handleOpacityChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    } // Updates design with the specified changes


    (0, _createClass2["default"])(BaseLayerDesignerComponent, [{
      key: "updateDesign",
      value: function updateDesign(changes) {
        var design;
        design = _.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleBaseLayerChange",
      value: function handleBaseLayerChange(baseLayer) {
        boundMethodCheck(this, BaseLayerDesignerComponent);
        return this.updateDesign({
          baseLayer: baseLayer
        });
      }
    }, {
      key: "renderBaseLayer",
      value: function renderBaseLayer(id, name) {
        var className;
        className = "mwater-visualization-layer";

        if (id === this.props.design.baseLayer) {
          className += " checked";
        }

        return R('div', {
          key: id,
          className: className,
          style: {
            display: "inline-block"
          },
          onClick: this.handleBaseLayerChange.bind(null, id)
        }, name);
      }
    }, {
      key: "handleOpacityChange",
      value: function handleOpacityChange(newValue) {
        boundMethodCheck(this, BaseLayerDesignerComponent);
        return this.updateDesign({
          baseLayerOpacity: newValue / 100
        });
      }
    }, {
      key: "renderOpacityControl",
      value: function renderOpacityControl() {
        var opacity;

        if (this.props.design.baseLayerOpacity != null) {
          opacity = this.props.design.baseLayerOpacity;
        } else {
          opacity = 1;
        }

        return R('div', {
          className: 'form-group',
          style: {
            paddingTop: 10
          }
        }, R('label', {
          className: 'text-muted'
        }, R('span', null, "Opacity: ".concat(Math.round(opacity * 100), "%"))), R('div', {
          style: {
            padding: '10px'
          }
        }, React.createElement(Rcslider, {
          min: 0,
          max: 100,
          step: 1,
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: opacity * 100,
          onChange: this.handleOpacityChange
        })));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Background Map"), R('div', {
          style: {
            marginLeft: 10
          }
        }, R('div', null, this.renderBaseLayer("cartodb_positron", "Light"), this.renderBaseLayer("cartodb_dark_matter", "Dark"), this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite"), this.renderBaseLayer("blank", "Blank"), " ", R(PopoverHelpComponent, {
          placement: "bottom"
        }, 'Blank map backgrounds work best with chloropleth map layers')), this.renderOpacityControl()));
      }
    }]);
    return BaseLayerDesignerComponent;
  }(React.Component);

  ;
  BaseLayerDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func.isRequired // Called with new design

  };
  return BaseLayerDesignerComponent;
}.call(void 0);