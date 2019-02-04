"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var AxisBuilder,
    ImageMosaicChartViewComponent,
    ImagePopupComponent,
    LazyLoad,
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

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
AxisBuilder = require('../../../axes/AxisBuilder');
LazyLoad = require('react-lazy-load').default;
RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent");
ImagePopupComponent = require('./ImagePopupComponent'); // creates a d3 calendar visualization

module.exports = ImageMosaicChartViewComponent = function () {
  var ImageMosaicChartViewComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ImageMosaicChartViewComponent, _React$Component);

    function ImageMosaicChartViewComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, ImageMosaicChartViewComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ImageMosaicChartViewComponent).apply(this, arguments));
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Render a single image

      _this.renderImage = _this.renderImage.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(ImageMosaicChartViewComponent, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(prevProps) {
        return !_.isEqual(prevProps, this.props);
      }
    }, {
      key: "handleClick",
      value: function handleClick(primaryKey, image) {
        var ref;
        boundMethodCheck(this, ImageMosaicChartViewComponent);

        if (this.props.onRowClick) {
          return this.props.onRowClick(this.props.design.table, primaryKey);
        } else {
          return (ref = this.imagePopup) != null ? ref.show(image) : void 0;
        }
      }
    }, {
      key: "renderImage",
      value: function renderImage(primaryKey, image, imageManager) {
        var _this2 = this;

        boundMethodCheck(this, ImageMosaicChartViewComponent);
        return R(LazyLoad, {
          key: image.id
        }, R(RotationAwareImageComponent, {
          imageManager: imageManager,
          image: image,
          thumbnail: true,
          height: 120,
          width: 80,
          onClick: function onClick() {
            return _this2.handleClick(primaryKey, image);
          }
        }));
      } // Render images

    }, {
      key: "renderImages",
      value: function renderImages(imageManager) {
        var i, image, imageElems, imageObj, len, ref, results, row;
        imageElems = [];
        ref = this.props.data; // For each image

        results = [];

        for (i = 0, len = ref.length; i < len; i++) {
          row = ref[i];
          imageObj = row.image; // Ignore nulls (https://github.com/mWater/mwater-server/issues/202)

          if (!imageObj) {
            continue;
          }

          if (_.isString(imageObj)) {
            imageObj = JSON.parse(imageObj);
          }

          if (_.isArray(imageObj)) {
            results.push(function () {
              var j, len1, results1;
              results1 = [];

              for (j = 0, len1 = imageObj.length; j < len1; j++) {
                image = imageObj[j];
                results1.push(this.renderImage(row.id, image, imageManager));
              }

              return results1;
            }.call(this));
          } else {
            results.push(this.renderImage(row.id, imageObj, imageManager));
          }
        }

        return results;
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var imageManager, style, title, titleStyle;
        titleStyle = {
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "bold"
        };
        style = {
          width: this.props.width,
          height: this.props.height,
          overflowY: "auto"
        };
        title = this.props.design.titleText;
        imageManager = {
          getImageThumbnailUrl: function getImageThumbnailUrl(id, success, error) {
            return success(_this3.props.dataSource.getImageUrl(id, 100));
          },
          getImageUrl: function getImageUrl(id, success, error) {
            return success(_this3.props.dataSource.getImageUrl(id));
          }
        };
        return R('div', {
          style: style,
          className: 'image-mosaic'
        }, title ? R('p', {
          style: titleStyle
        }, title) : void 0, R(ImagePopupComponent, {
          ref: function ref(c) {
            return _this3.imagePopup = c;
          },
          imageManager: imageManager
        }), R('div', null, this.renderImages(imageManager)));
      }
    }]);
    return ImageMosaicChartViewComponent;
  }(React.Component);

  ;
  ImageMosaicChartViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Design of chart
    data: PropTypes.array.isRequired,
    // Data that the chart has requested. In format  [image: {image data or imagelist data}]
    dataSource: PropTypes.object.isRequired,
    // Data source to use
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    onRowClick: PropTypes.func // Called with (tableId, rowId) when item is clicked

  };
  return ImageMosaicChartViewComponent;
}.call(void 0);