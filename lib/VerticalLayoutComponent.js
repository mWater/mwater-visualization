var $, PropTypes, R, React, ReactDOM, VerticalLayoutComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

PropTypes = require('prop-types');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

_ = require('lodash');

module.exports = VerticalLayoutComponent = (function(superClass) {
  extend(VerticalLayoutComponent, superClass);

  VerticalLayoutComponent.propTypes = {
    height: PropTypes.number.isRequired,
    relativeHeights: PropTypes.object.isRequired
  };

  function VerticalLayoutComponent(props) {
    VerticalLayoutComponent.__super__.constructor.call(this, props);
    this.state = {
      availableHeight: 0
    };
    this.childRefs = {};
  }

  VerticalLayoutComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.height !== this.props.height || !_.isEqual(nextProps.relativeHeights, this.props.relativeHeights)) {
      return this.recalculateSize(nextProps);
    }
  };

  VerticalLayoutComponent.prototype.componentDidMount = function() {
    return this.recalculateSize(this.props);
  };

  VerticalLayoutComponent.prototype.recalculateSize = function(props) {
    var availableHeight, child, i, len, node, ref;
    availableHeight = props.height;
    ref = props.children;
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      if (!child) {
        continue;
      }
      if (props.relativeHeights[child.key]) {
        continue;
      }
      node = ReactDOM.findDOMNode(this.childRefs[child.key]);
      availableHeight -= $(node).outerHeight();
    }
    return this.setState({
      availableHeight: availableHeight
    });
  };

  VerticalLayoutComponent.prototype.getComponent = function(key) {
    return this.childRefs[key];
  };

  VerticalLayoutComponent.prototype.render = function() {
    return R('div', {
      style: {
        height: this.props.height
      }
    }, React.Children.map(this.props.children, (function(_this) {
      return function(child) {
        var height;
        if (!child) {
          return;
        }
        if (child.key && _this.props.relativeHeights[child.key]) {
          if (_this.state.availableHeight) {
            height = _this.state.availableHeight * _this.props.relativeHeights[child.key];
            return R('div', {
              style: {
                height: height,
                position: "relative"
              }
            }, R('div', {
              style: {
                height: height
              },
              ref: (function(c) {
                return _this.childRefs[child.key] = c;
              })
            }, React.cloneElement(child, {
              height: height
            })));
          }
          return null;
        }
        return R('div', {
          ref: (function(c) {
            return _this.childRefs[child.key] = c;
          })
        }, child);
      };
    })(this)));
  };

  return VerticalLayoutComponent;

})(React.Component);
