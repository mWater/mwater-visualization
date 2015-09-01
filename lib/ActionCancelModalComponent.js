var ActionCancelModalComponent, H, ModalComponent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

ModalComponent = require('./ModalComponent');

module.exports = ActionCancelModalComponent = (function(superClass) {
  extend(ActionCancelModalComponent, superClass);

  function ActionCancelModalComponent() {
    return ActionCancelModalComponent.__super__.constructor.apply(this, arguments);
  }

  ActionCancelModalComponent.propTypes = {
    title: React.PropTypes.node,
    actionLabel: React.PropTypes.string,
    onAction: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    size: React.PropTypes.string
  };

  ActionCancelModalComponent.prototype.render = function() {
    return React.createElement(ModalComponent, {
      header: H.h4({
        className: "modal-title"
      }, this.props.title),
      footer: [
        H.button({
          key: "cancel",
          type: "button",
          onClick: this.props.onCancel,
          className: "btn btn-default"
        }, "Cancel"), H.button({
          key: "action",
          type: "button",
          onClick: this.props.onAction,
          className: "btn btn-primary"
        }, this.props.actionLabel || "Save")
      ]
    }, this.props.children);
  };

  return ActionCancelModalComponent;

})(React.Component);
