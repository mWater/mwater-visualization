var PopoverComponent, React, ReactDOM,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

module.exports = PopoverComponent = (function(superClass) {
  extend(PopoverComponent, superClass);

  function PopoverComponent() {
    return PopoverComponent.__super__.constructor.apply(this, arguments);
  }

  PopoverComponent.propTypes = {
    content: React.PropTypes.node.isRequired,
    placement: React.PropTypes.string,
    visible: React.PropTypes.bool.isRequired
  };

  PopoverComponent.prototype.componentDidMount = function() {
    return this.updatePopover(this.props, null);
  };

  PopoverComponent.prototype.componentWillUnmount = function() {
    return this.updatePopover(null, this.props);
  };

  PopoverComponent.prototype.componentDidUpdate = function(prevProps) {
    if (!_.isEqual(prevProps.content, this.props.content) || prevProps.visible !== this.props.visible || prevProps.placement !== this.props.placement) {
      return this.updatePopover(this.props, prevProps);
    }
  };

  PopoverComponent.prototype.updatePopover = function(props, oldProps) {
    var div;
    if (oldProps && oldProps.visible) {
      $(ReactDOM.findDOMNode(this)).popover("destroy");
    }
    if (props && props.visible) {
      div = document.createElement("div");
      return ReactDOM.render(this.props.content, div, (function(_this) {
        return function() {
          $(ReactDOM.findDOMNode(_this)).popover({
            content: function() {
              return $(div);
            },
            html: true,
            trigger: "manual",
            placement: _this.props.placement
          });
          return $(ReactDOM.findDOMNode(_this)).popover("show");
        };
      })(this));
    }
  };

  PopoverComponent.prototype.render = function() {
    return React.Children.only(this.props.children);
  };

  return PopoverComponent;

})(React.Component);
