"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var BaseLayerDesignerComponent, MapControlComponent, MapLayersDesignerComponent, PropTypes, R, React;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
MapLayersDesignerComponent = require('./MapLayersDesignerComponent');
BaseLayerDesignerComponent = require('./BaseLayerDesignerComponent'); // Allows controlling readonly map

module.exports = MapControlComponent = function () {
  var MapControlComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MapControlComponent, _React$Component);

    var _super = _createSuper(MapControlComponent);

    function MapControlComponent() {
      (0, _classCallCheck2["default"])(this, MapControlComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(MapControlComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            padding: 5
          }
        }, R(MapLayersDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.props.design,
          onDesignChange: this.props.onDesignChange,
          allowEditingLayers: false
        }), R('br'), R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Map Style"), R(BaseLayerDesignerComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        })));
      }
    }]);
    return MapControlComponent;
  }(React.Component);

  ;
  MapControlComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func.isRequired // Called with new design

  };
  return MapControlComponent;
}.call(void 0);