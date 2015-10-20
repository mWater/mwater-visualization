var HoverComponent, React, ReactDOM,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

module.exports = HoverComponent = (function(superClass) {
  extend(HoverComponent, superClass);

  function HoverComponent() {
    this.onOut = bind(this.onOut, this);
    this.onOver = bind(this.onOver, this);
    HoverComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      hovered: false
    };
  }

  HoverComponent.prototype.componentDidMount = function() {
    ReactDOM.findDOMNode(this.refs.main).addEventListener("mouseover", this.onOver);
    return ReactDOM.findDOMNode(this.refs.main).addEventListener("mouseout", this.onOut);
  };

  HoverComponent.prototype.componentWillUnmount = function() {
    ReactDOM.findDOMNode(this.refs.main).removeEventListener("mouseover", this.onOver);
    return ReactDOM.findDOMNode(this.refs.main).removeEventListener("mouseout", this.onOut);
  };

  HoverComponent.prototype.onOver = function() {
    return this.setState({
      hovered: true
    });
  };

  HoverComponent.prototype.onOut = function() {
    return this.setState({
      hovered: false
    });
  };

  HoverComponent.prototype.render = function() {
    return React.cloneElement(React.Children.only(this.props.children), {
      ref: "main",
      hovered: this.state.hovered
    });
  };

  return HoverComponent;

})(React.Component);
