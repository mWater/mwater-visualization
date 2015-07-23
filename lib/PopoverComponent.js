var PopoverComponent, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

module.exports = PopoverComponent = (function(superClass) {
  extend(PopoverComponent, superClass);

  function PopoverComponent() {
    return PopoverComponent.__super__.constructor.apply(this, arguments);
  }

  PopoverComponent.propTypes = {
    html: React.PropTypes.string,
    placement: React.PropTypes.string
  };

  PopoverComponent.prototype.componentDidMount = function() {
    return this.updatePopover(this.props, null);
  };

  PopoverComponent.prototype.componentWillUnmount = function() {
    return this.updatePopover(null, this.props);
  };

  PopoverComponent.prototype.componentDidUpdate = function(prevProps) {
    return this.updatePopover(this.props, prevProps);
  };

  PopoverComponent.prototype.updatePopover = function(props, oldProps) {
    if (props && oldProps && props.html === oldProps.html) {
      return;
    }
    if (oldProps && oldProps.html) {
      $(React.findDOMNode(this.refs.child)).popover("destroy");
    }
    if (props && props.html) {
      $(React.findDOMNode(this.refs.child)).popover({
        content: props.html,
        html: true,
        trigger: "manual",
        placement: this.props.placement
      });
      return $(React.findDOMNode(this.refs.child)).popover("show");
    }
  };

  PopoverComponent.prototype.render = function() {
    return React.cloneElement(React.Children.only(this.props.children), {
      ref: "child"
    });
  };

  return PopoverComponent;

})(React.Component);
