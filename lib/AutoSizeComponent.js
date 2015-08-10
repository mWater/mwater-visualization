var AutoSizeComponent, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

React = require('react');

H = React.DOM;

module.exports = AutoSizeComponent = (function(superClass) {
  extend(AutoSizeComponent, superClass);

  AutoSizeComponent.propTypes = {
    injectWidth: React.PropTypes.bool,
    injectHeight: React.PropTypes.bool
  };

  function AutoSizeComponent() {
    this.callChild = bind(this.callChild, this);
    this.updateSize = bind(this.updateSize, this);
    this.state = {
      width: null,
      height: null
    };
  }

  AutoSizeComponent.prototype.componentDidMount = function() {
    $(window).on('resize', this.updateSize);
    return this.updateSize();
  };

  AutoSizeComponent.prototype.componentWillUnmount = function() {
    return $(window).off('resize', this.updateSize);
  };

  AutoSizeComponent.prototype.updateSize = function() {
    var node;
    node = React.findDOMNode(this);
    return this.setState({
      width: node.clientWidth,
      height: node.clientHeight
    });
  };

  AutoSizeComponent.prototype.callChild = function() {
    var method, params;
    method = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return this.refs.child[method].apply(this.refs.child, params);
  };

  AutoSizeComponent.prototype.render = function() {
    var overrides, style;
    if ((this.state.width == null) || (this.state.height == null)) {
      style = {};
      if (this.props.injectWidth) {
        style.width = "100%";
      }
      if (this.props.injectHeight) {
        style.height = "100%";
      }
      return H.div({
        style: style
      });
    } else {
      overrides = {
        ref: "child"
      };
      if (this.props.injectWidth) {
        overrides.width = this.state.width;
      }
      if (this.props.injectHeight) {
        overrides.height = this.state.height;
      }
      return React.cloneElement(React.Children.only(this.props.children), overrides);
    }
  };

  return AutoSizeComponent;

})(React.Component);
