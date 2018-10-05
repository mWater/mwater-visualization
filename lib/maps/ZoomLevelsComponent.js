var NumberInputComponent, PropTypes, R, React, ZoomLevelsComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

NumberInputComponent = require('react-library/lib/NumberInputComponent');

module.exports = ZoomLevelsComponent = (function(superClass) {
  extend(ZoomLevelsComponent, superClass);

  ZoomLevelsComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };

  function ZoomLevelsComponent(props) {
    ZoomLevelsComponent.__super__.constructor.call(this, props);
    this.state = {
      expanded: false
    };
  }

  ZoomLevelsComponent.prototype.render = function() {
    if (!this.state.expanded) {
      return R('div', null, R('a', {
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
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Advanced"), R('div', {
      key: "min"
    }, R('span', {
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
    })), R('div', {
      key: "max"
    }, R('span', {
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
