var AxisBuilder, H, ImageMosaicChartViewComponent, ImagePopupComponent, LazyLoad, PropTypes, R, React, RotationAwareImageComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisBuilder = require('../../../axes/AxisBuilder');

LazyLoad = require('react-lazy-load')["default"];

RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent");

ImagePopupComponent = require('./ImagePopupComponent');

module.exports = ImageMosaicChartViewComponent = (function(superClass) {
  extend(ImageMosaicChartViewComponent, superClass);

  function ImageMosaicChartViewComponent() {
    return ImageMosaicChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  ImageMosaicChartViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    dataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    scope: PropTypes.any,
    onScopeChange: PropTypes.func
  };

  ImageMosaicChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  ImageMosaicChartViewComponent.prototype.renderImage = function(image, imageManager) {
    return R(LazyLoad, {
      key: image.id
    }, R(RotationAwareImageComponent, {
      imageManager: imageManager,
      image: image,
      thumbnail: true,
      height: 120,
      width: 80,
      onClick: (function(_this) {
        return function() {
          var ref;
          return (ref = _this.imagePopup) != null ? ref.show(image) : void 0;
        };
      })(this)
    }));
  };

  ImageMosaicChartViewComponent.prototype.renderImages = function(imageManager) {
    var i, image, imageElems, imageObj, len, ref, results, row;
    imageElems = [];
    ref = this.props.data;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      row = ref[i];
      imageObj = row.image;
      if (!imageObj) {
        continue;
      }
      if (_.isString(imageObj)) {
        imageObj = JSON.parse(imageObj);
      }
      if (_.isArray(imageObj)) {
        results.push((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = imageObj.length; j < len1; j++) {
            image = imageObj[j];
            results1.push(this.renderImage(image, imageManager));
          }
          return results1;
        }).call(this));
      } else {
        results.push(this.renderImage(imageObj, imageManager));
      }
    }
    return results;
  };

  ImageMosaicChartViewComponent.prototype.render = function() {
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
      getImageThumbnailUrl: (function(_this) {
        return function(id, success, error) {
          return success(_this.props.dataSource.getImageUrl(id, 100));
        };
      })(this),
      getImageUrl: (function(_this) {
        return function(id, success, error) {
          return success(_this.props.dataSource.getImageUrl(id));
        };
      })(this)
    };
    return H.div({
      style: style,
      className: 'image-mosaic'
    }, title ? H.p({
      style: titleStyle
    }, title) : void 0, R(ImagePopupComponent, {
      ref: (function(_this) {
        return function(c) {
          return _this.imagePopup = c;
        };
      })(this),
      imageManager: imageManager
    }), H.div(null, this.renderImages(imageManager)));
  };

  return ImageMosaicChartViewComponent;

})(React.Component);
