var ImagePopupComponent, ModalWindowComponent, PropTypes, R, React, RotationAwareImageComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

RotationAwareImageComponent = require("mwater-forms/lib/RotationAwareImageComponent");

module.exports = ImagePopupComponent = (function(superClass) {
  extend(ImagePopupComponent, superClass);

  ImagePopupComponent.propTypes = {
    imageManager: PropTypes.object.isRequired
  };

  function ImagePopupComponent(props) {
    ImagePopupComponent.__super__.constructor.call(this, props);
    this.state = {
      image: null,
      url: null
    };
  }

  ImagePopupComponent.prototype.show = function(image) {
    return this.props.imageManager.getImageUrl(image.id, (function(_this) {
      return function(url) {
        return _this.setState({
          image: image,
          url: url
        });
      };
    })(this));
  };

  ImagePopupComponent.prototype.render = function() {
    if (!this.state.image || !this.state.url) {
      return null;
    }
    return R(ModalWindowComponent, {
      isOpen: true,
      onRequestClose: ((function(_this) {
        return function() {
          return _this.setState({
            image: null,
            url: null
          });
        };
      })(this))
    }, R(RotationAwareImageComponent, {
      imageManager: this.props.imageManager,
      image: this.state.image
    }));
  };

  return ImagePopupComponent;

})(React.Component);
