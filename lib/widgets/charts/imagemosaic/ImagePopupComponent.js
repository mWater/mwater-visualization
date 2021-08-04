"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ImagePopupComponent, ModalWindowComponent, PropTypes, R, React, RotationAwareImageComponent;
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ModalWindowComponent = require('react-library/lib/ModalWindowComponent');
RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent"); // Displays an image in a popup

module.exports = ImagePopupComponent = function () {
  var ImagePopupComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ImagePopupComponent, _React$Component);

    var _super = _createSuper(ImagePopupComponent);

    function ImagePopupComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, ImagePopupComponent);
      _this = _super.call(this, props);
      _this.state = {
        image: null,
        // Set to display
        url: null
      };
      return _this;
    } // Shows image object


    (0, _createClass2["default"])(ImagePopupComponent, [{
      key: "show",
      value: function show(image) {
        var _this2 = this;

        return this.props.imageManager.getImageUrl(image.id, function (url) {
          return _this2.setState({
            image: image,
            url: url
          });
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        if (!this.state.image || !this.state.url) {
          return null;
        }

        return R(ModalWindowComponent, {
          isOpen: true,
          onRequestClose: function onRequestClose() {
            return _this3.setState({
              image: null,
              url: null
            });
          }
        }, R(RotationAwareImageComponent, {
          imageManager: this.props.imageManager,
          image: this.state.image
        }));
      }
    }]);
    return ImagePopupComponent;
  }(React.Component);

  ;
  ImagePopupComponent.propTypes = {
    imageManager: PropTypes.object.isRequired
  };
  return ImagePopupComponent;
}.call(void 0);