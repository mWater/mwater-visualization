var ActionCancelModalComponent, H, ModalPopupComponent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

ModalPopupComponent = require('./ModalPopupComponent');

module.exports = ActionCancelModalComponent = (function(superClass) {
  extend(ActionCancelModalComponent, superClass);

  function ActionCancelModalComponent() {
    return ActionCancelModalComponent.__super__.constructor.apply(this, arguments);
  }

  ActionCancelModalComponent.propTypes = {
    title: React.PropTypes.node,
    actionLabel: React.PropTypes.node,
    onAction: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    deleteLabel: React.PropTypes.node,
    size: React.PropTypes.string
  };

  ActionCancelModalComponent.prototype.render = function() {
    return React.createElement(ModalPopupComponent, {
      size: this.props.size,
      header: this.props.title ? H.h4({
        className: "modal-title"
      }, this.props.title) : void 0,
      footer: [
        H.button({
          key: "cancel",
          type: "button",
          onClick: this.props.onCancel,
          className: "btn btn-default"
        }, this.props.onAction ? "Cancel" : "Close"), this.props.onAction ? H.button({
          key: "action",
          type: "button",
          onClick: this.props.onAction,
          className: "btn btn-primary"
        }, this.props.actionLabel || "Save") : void 0, this.props.onDelete ? H.button({
          key: "delete",
          type: "button",
          style: {
            float: "left"
          },
          onClick: this.props.onDelete,
          className: "btn btn-danger"
        }, this.props.deleteLabel || "Delete") : void 0
      ]
    }, this.props.children);
  };

  return ActionCancelModalComponent;

})(React.Component);
