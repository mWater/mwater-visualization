var H, ImagelistCarouselComponent, R, React, RotationAwareImageComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent");

module.exports = ImagelistCarouselComponent = (function(superClass) {
  extend(ImagelistCarouselComponent, superClass);

  ImagelistCarouselComponent.propTypes = {
    imagelist: React.PropTypes.array,
    widgetDataSource: React.PropTypes.object.isRequired,
    height: React.PropTypes.number
  };

  function ImagelistCarouselComponent() {
    this.handleRight = bind(this.handleRight, this);
    this.handleLeft = bind(this.handleLeft, this);
    ImagelistCarouselComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      activeImage: _.findIndex(this.props.imagelist, {
        cover: true
      })
    };
    if (this.state.activeImage < 0) {
      this.state.activeImage = 0;
    }
  }

  ImagelistCarouselComponent.prototype.handleLeft = function() {
    var activeImage;
    if (this.props.imagelist && this.props.imagelist.length > 0) {
      activeImage = (this.state.activeImage - 1 + this.props.imagelist.length) % this.props.imagelist.length;
      return this.setState({
        activeImage: activeImage
      });
    }
  };

  ImagelistCarouselComponent.prototype.handleRight = function() {
    var activeImage;
    if (this.props.imagelist && this.props.imagelist.length > 0) {
      activeImage = (this.state.activeImage + 1 + this.props.imagelist.length) % this.props.imagelist.length;
      return this.setState({
        activeImage: activeImage
      });
    }
  };

  ImagelistCarouselComponent.prototype.renderImage = function(img, i, imageManager) {
    return H.div({
      className: "item " + (i === this.state.activeImage ? "active" : ""),
      style: {
        height: this.props.height
      }
    }, R(RotationAwareImageComponent, {
      imageManager: imageManager,
      image: img
    }));
  };

  ImagelistCarouselComponent.prototype.renderImages = function(imageManager) {
    var i, imageObj, j, len, ref, results;
    ref = this.props.imagelist;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      imageObj = ref[i];
      results.push(this.renderImage(imageObj, i, imageManager));
    }
    return results;
  };

  ImagelistCarouselComponent.prototype.render = function() {
    var imageManager;
    imageManager = {
      getImageThumbnailUrl: (function(_this) {
        return function(id, success, error) {
          return success(_this.props.widgetDataSource.getImageUrl(id, 100));
        };
      })(this),
      getImageUrl: (function(_this) {
        return function(id, success, error) {
          return success(_this.props.widgetDataSource.getImageUrl(id, 640));
        };
      })(this)
    };
    if (this.props.imagelist.length === 1) {
      return this.renderImage(this.props.imagelist[0], 0, imageManager);
    }
    if (this.props.imagelist.length === 0) {
      return null;
    }
    return H.div({
      className: "image-carousel-component carousel slide",
      style: {
        height: this.props.height,
        overflow: 'hidden'
      }
    }, this.props.imagelist.length < 10 ? H.ol({
      className: "carousel-indicators"
    }, _.map(this.props.imagelist, (function(_this) {
      return function(img, i) {
        return H.li({
          className: i === _this.state.activeImage ? "active" : void 0
        });
      };
    })(this))) : void 0, H.div({
      className: "carousel-inner"
    }, this.renderImages(imageManager)), H.a({
      className: "left carousel-control"
    }, H.span({
      className: "glyphicon glyphicon-chevron-left",
      onClick: this.handleLeft
    })), H.a({
      className: "right carousel-control"
    }, H.span({
      className: "glyphicon glyphicon-chevron-right",
      onClick: this.handleRight
    })));
  };

  return ImagelistCarouselComponent;

})(React.Component);
