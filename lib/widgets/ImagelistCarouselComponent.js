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

var ImagelistCarouselComponent,
    PropTypes,
    R,
    React,
    RotationAwareImageComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types'); // Carousel component for images. Starts with cover photo

React = require('react');
R = React.createElement;
RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent"); // Bootstrap carousel for an image list

module.exports = ImagelistCarouselComponent = function () {
  var ImagelistCarouselComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ImagelistCarouselComponent, _React$Component);

    var _super = _createSuper(ImagelistCarouselComponent);

    function ImagelistCarouselComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, ImagelistCarouselComponent);
      _this = _super.call(this, props);
      _this.handleLeft = _this.handleLeft.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRight = _this.handleRight.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        activeImage: _.findIndex(_this.props.imagelist, {
          cover: true
        })
      };

      if (_this.state.activeImage < 0) {
        _this.state.activeImage = 0;
      }

      return _this;
    }

    (0, _createClass2["default"])(ImagelistCarouselComponent, [{
      key: "handleLeft",
      value: function handleLeft() {
        var activeImage;
        boundMethodCheck(this, ImagelistCarouselComponent);

        if (this.props.imagelist && this.props.imagelist.length > 0) {
          activeImage = (this.state.activeImage - 1 + this.props.imagelist.length) % this.props.imagelist.length;
          return this.setState({
            activeImage: activeImage
          });
        }
      }
    }, {
      key: "handleRight",
      value: function handleRight() {
        var activeImage;
        boundMethodCheck(this, ImagelistCarouselComponent);

        if (this.props.imagelist && this.props.imagelist.length > 0) {
          activeImage = (this.state.activeImage + 1 + this.props.imagelist.length) % this.props.imagelist.length;
          return this.setState({
            activeImage: activeImage
          });
        }
      }
    }, {
      key: "renderImage",
      value: function renderImage(img, i, imageManager) {
        return R('div', {
          className: "item ".concat(i === this.state.activeImage ? "active" : ""),
          style: {
            height: this.props.height
          }
        }, R(RotationAwareImageComponent, {
          imageManager: imageManager,
          image: img
        }));
      }
    }, {
      key: "renderImages",
      value: function renderImages(imageManager) {
        var i, imageObj, j, len, ref, results;
        ref = this.props.imagelist;
        results = [];

        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          imageObj = ref[i];
          results.push(this.renderImage(imageObj, i, imageManager));
        }

        return results;
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var imageManager;
        imageManager = {
          getImageThumbnailUrl: function getImageThumbnailUrl(id, success, error) {
            return success(_this2.props.widgetDataSource.getImageUrl(id, 100));
          },
          getImageUrl: function getImageUrl(id, success, error) {
            return success(_this2.props.widgetDataSource.getImageUrl(id, 640));
          }
        };

        if (this.props.imagelist.length === 1) {
          return this.renderImage(this.props.imagelist[0], 0, imageManager);
        }

        if (this.props.imagelist.length === 0) {
          return null;
        }

        return R('div', {
          className: "image-carousel-component carousel slide",
          style: {
            height: this.props.height,
            overflow: 'hidden'
          }
        }, this.props.imagelist.length < 10 ? R('ol', {
          className: "carousel-indicators"
        }, _.map(this.props.imagelist, function (img, i) {
          return R('li', {
            className: i === _this2.state.activeImage ? "active" : void 0
          }); // Wrapper for slides
        })) : void 0, R('div', {
          className: "carousel-inner"
        }, this.renderImages(imageManager)), R('a', {
          className: "left carousel-control"
        }, R('span', {
          className: "glyphicon glyphicon-chevron-left",
          onClick: this.handleLeft
        })), R('a', {
          className: "right carousel-control"
        }, R('span', {
          className: "glyphicon glyphicon-chevron-right",
          onClick: this.handleRight
        })));
      }
    }]);
    return ImagelistCarouselComponent;
  }(React.Component);

  ;
  ImagelistCarouselComponent.propTypes = {
    imagelist: PropTypes.array,
    // Array of { id, cover: true/false }
    widgetDataSource: PropTypes.object.isRequired,
    height: PropTypes.number
  };
  return ImagelistCarouselComponent;
}.call(void 0);