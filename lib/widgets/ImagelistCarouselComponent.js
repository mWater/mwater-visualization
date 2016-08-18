var H, ImagelistCarouselComponent, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

module.exports = ImagelistCarouselComponent = (function(superClass) {
  extend(ImagelistCarouselComponent, superClass);

  ImagelistCarouselComponent.propTypes = {
    imagelist: React.PropTypes.array,
    apiUrl: React.PropTypes.string.isRequired,
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

  ImagelistCarouselComponent.prototype.renderImage = function(img, i) {
    return H.div({
      className: "item " + (i === this.state.activeImage ? "active" : ""),
      style: {
        height: this.props.height
      }
    }, H.img({
      style: {
        margin: '0 auto',
        height: this.props.height
      },
      src: this.props.apiUrl + 'images/' + img.id + "?h=640"
    }));
  };

  ImagelistCarouselComponent.prototype.renderImages = function() {
    var counter, i, image, imageObj, j, len, ref, results, row;
    counter = 0;
    ref = this.props.imagelist;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      row = ref[i];
      imageObj = row.value;
      if (!imageObj) {
        continue;
      }
      if (_.isString(imageObj)) {
        imageObj = JSON.parse(imageObj);
      }
      if (_.isArray(imageObj)) {
        results.push((function() {
          var k, len1, results1;
          results1 = [];
          for (k = 0, len1 = imageObj.length; k < len1; k++) {
            image = imageObj[k];
            results1.push(this.renderImage(image, counter++));
          }
          return results1;
        }).call(this));
      } else {
        results.push(this.renderImage(imageObj, counter++));
      }
    }
    return results;
  };

  ImagelistCarouselComponent.prototype.render = function() {
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
    }, this.renderImages()), H.a({
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
