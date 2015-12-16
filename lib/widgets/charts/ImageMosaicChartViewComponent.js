var AxisBuilder, H, ImageMosaicChartViewComponent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

AxisBuilder = require('../../axes/AxisBuilder');

module.exports = ImageMosaicChartViewComponent = (function(superClass) {
  extend(ImageMosaicChartViewComponent, superClass);

  function ImageMosaicChartViewComponent() {
    return ImageMosaicChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  ImageMosaicChartViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func
  };

  ImageMosaicChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  ImageMosaicChartViewComponent.prototype.renderImage = function(image) {
    return H.img({
      src: this.props.dataSource.getImageUrl(image.id, 100),
      alt: image.caption,
      className: "img-thumbnail",
      style: {
        height: 100,
        minWidth: 50
      }
    });
  };

  ImageMosaicChartViewComponent.prototype.renderImages = function() {
    var i, image, imageElems, imageObj, len, ref, results, row;
    imageElems = [];
    ref = this.props.data.main;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      row = ref[i];
      imageObj = row.image;
      if (_.isString(imageObj)) {
        imageObj = JSON.parse(imageObj);
      }
      if (_.isArray(imageObj)) {
        results.push((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = imageObj.length; j < len1; j++) {
            image = imageObj[j];
            results1.push(this.renderImage(image));
          }
          return results1;
        }).call(this));
      } else {
        results.push(this.renderImage(imageObj));
      }
    }
    return results;
  };

  ImageMosaicChartViewComponent.prototype.render = function() {
    var style, title, titleStyle;
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
    return H.div({
      style: style
    }, title ? H.p({
      style: titleStyle
    }, title) : void 0, H.div(null, this.renderImages()));
  };

  return ImageMosaicChartViewComponent;

})(React.Component);
