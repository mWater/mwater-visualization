var AxisBuilder, ImageMosaicChartViewComponent, ImagePopupComponent, LazyLoad, PropTypes, R, React, RotationAwareImageComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

AxisBuilder = require('../../../axes/AxisBuilder');

LazyLoad = require('react-lazy-load')["default"];

RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent");

ImagePopupComponent = require('./ImagePopupComponent');

module.exports = ImageMosaicChartViewComponent = (function(superClass) {
  extend(ImageMosaicChartViewComponent, superClass);

  function ImageMosaicChartViewComponent() {
    this.renderImage = bind(this.renderImage, this);
    this.handleClick = bind(this.handleClick, this);
    return ImageMosaicChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  ImageMosaicChartViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    dataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    onRowClick: PropTypes.func
  };

  ImageMosaicChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  ImageMosaicChartViewComponent.prototype.handleClick = function(primaryKey, image) {
    var ref;
    if (this.props.onRowClick) {
      return this.props.onRowClick(this.props.design.table, primaryKey);
    } else {
      return (ref = this.imagePopup) != null ? ref.show(image) : void 0;
    }
  };

  ImageMosaicChartViewComponent.prototype.renderImage = function(primaryKey, image, imageManager) {
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
          return _this.handleClick(primaryKey, image);
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
            results1.push(this.renderImage(row.id, image, imageManager));
          }
          return results1;
        }).call(this));
      } else {
        results.push(this.renderImage(row.id, imageObj, imageManager));
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
    return R('div', {
      style: style,
      className: 'image-mosaic'
    }, title ? R('p', {
      style: titleStyle
    }, title) : void 0, R(ImagePopupComponent, {
      ref: (function(_this) {
        return function(c) {
          return _this.imagePopup = c;
        };
      })(this),
      imageManager: imageManager
    }), R('div', null, this.renderImages(imageManager)));
  };

  return ImageMosaicChartViewComponent;

})(React.Component);
