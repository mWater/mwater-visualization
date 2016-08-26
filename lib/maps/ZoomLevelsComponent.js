var H, NumberInputComponent, R, React, ZoomLevelsComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

NumberInputComponent = require('react-library/lib/NumberInputComponent');

module.exports = ZoomLevelsComponent = (function(superClass) {
  extend(ZoomLevelsComponent, superClass);

  ZoomLevelsComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  function ZoomLevelsComponent(props) {
    ZoomLevelsComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      expanded: false
    };
  }

  ZoomLevelsComponent.prototype.render = function() {
    if (!this.state.expanded) {
      return H.div(null, H.a({
        className: "btn btn-link btn-xs",
        onClick: ((function(_this) {
          return function() {
            return _this.setState({
              expanded: true
            });
          };
        })(this))
      }, "Advanced options..."));
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Advanced"), H.div(null, H.span({
      className: "text-muted"
    }, "Minimum Zoom Level:"), " ", R(NumberInputComponent, {
      small: true,
      style: {
        display: "inline-block"
      },
      placeholder: "None",
      value: this.props.design.minZoom,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onDesignChange(_.extend({}, _this.props.design, {
            minZoom: v
          }));
        };
      })(this)
    })), H.div(null, H.span({
      className: "text-muted"
    }, "Maximum Zoom Level: "), " ", R(NumberInputComponent, {
      small: true,
      style: {
        display: "inline-block"
      },
      placeholder: "None",
      value: this.props.design.maxZoom,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onDesignChange(_.extend({}, _this.props.design, {
            maxZoom: v
          }));
        };
      })(this)
    })));
  };

  return ZoomLevelsComponent;

})(React.Component);
