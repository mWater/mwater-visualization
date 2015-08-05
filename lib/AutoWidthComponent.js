var AutoWidthComponent, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

React = require('react');

H = React.DOM;

module.exports = AutoWidthComponent = (function(superClass) {
  extend(AutoWidthComponent, superClass);

  function AutoWidthComponent() {
    this.callChild = bind(this.callChild, this);
    this.updateWidth = bind(this.updateWidth, this);
    this.state = {
      width: null
    };
  }

  AutoWidthComponent.prototype.componentDidMount = function() {
    $(window).on('resize', this.updateWidth);
    return this.updateWidth();
  };

  AutoWidthComponent.prototype.componentWillUnmount = function() {
    return $(window).off('resize', this.updateWidth);
  };

  AutoWidthComponent.prototype.updateWidth = function() {
    return this.setState({
      width: $(React.findDOMNode(this)).innerWidth()
    });
  };

  AutoWidthComponent.prototype.callChild = function() {
    var method, params;
    method = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return this.refs.child[method].apply(this.refs.child, params);
  };

  AutoWidthComponent.prototype.render = function() {
    if (!this.state.width) {
      return H.div(null);
    } else {
      return React.cloneElement(React.Children.only(this.props.children), {
        width: this.state.width,
        ref: "child"
      });
    }
  };

  return AutoWidthComponent;

})(React.Component);
