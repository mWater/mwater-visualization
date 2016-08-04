var AsyncLoadComponent, H, ImageWidgetComponent, R, React, _, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

uuid = require('node-uuid');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = ImageWidgetComponent = (function(superClass) {
  extend(ImageWidgetComponent, superClass);

  ImageWidgetComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    filters: React.PropTypes.array,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  function ImageWidgetComponent(props) {
    ImageWidgetComponent.__super__.constructor.call(this, props);
    this.state = {
      data: {},
      error: null
    };
  }

  ImageWidgetComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return false;
  };

  ImageWidgetComponent.prototype.load = function(props, prevProps, callback) {
    callback(null);
    return;
    return props.widgetDataSource.getData(props.filters, (function(_this) {
      return function(error, data) {
        return callback({
          error: error,
          data: data
        });
      };
    })(this));
  };

  ImageWidgetComponent.prototype.render = function() {
    return H.div({
      style: {
        position: "relative",
        width: this.props.width,
        height: this.props.height,
        textAlign: "center"
      }
    }, H.img({
      style: {
        maxWidth: "100%",
        maxHeight: "100%"
      },
      src: "https://realfood.tesco.com/media/images/Orange-and-almond-srping-cake-hero-58d07750-0952-47eb-bc41-a1ef9b81c01a-0-472x310.jpg"
    }));
  };

  return ImageWidgetComponent;

})(AsyncLoadComponent);
