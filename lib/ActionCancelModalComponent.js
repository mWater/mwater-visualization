var ActionCancelModalComponent, ActionCancelModalComponentContent, H, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

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

  ActionCancelModalComponent.prototype.componentDidMount = function() {
    var elem;
    this.modalNode = $('<div></div>').get(0);
    $("body").append(this.modalNode);
    elem = React.createElement(ActionCancelModalComponentContent, this.props);
    React.render(elem, this.modalNode);
    return _.defer((function(_this) {
      return function() {
        return $(_this.modalNode).children().modal({
          show: true,
          backdrop: "static",
          keyboard: false
        });
      };
    })(this));
  };

  ActionCancelModalComponent.prototype.componentDidUpdate = function(prevProps) {
    var elem;
    elem = React.createElement(ActionCancelModalComponentContent, this.props);
    return React.render(elem, this.modalNode);
  };

  ActionCancelModalComponent.prototype.componentWillUnmount = function() {
    $(this.modalNode).children().modal("hide");
    React.unmountComponentAtNode(this.modalNode);
    return $(this.modalNode).remove();
  };

  ActionCancelModalComponent.prototype.render = function() {
    return H.div(null);
  };

  return ActionCancelModalComponent;

})(React.Component);

ActionCancelModalComponentContent = (function(superClass) {
  extend(ActionCancelModalComponentContent, superClass);

  function ActionCancelModalComponentContent() {
    return ActionCancelModalComponentContent.__super__.constructor.apply(this, arguments);
  }

  ActionCancelModalComponentContent.propTypes = {
    title: React.PropTypes.node,
    actionLabel: React.PropTypes.string,
    onAction: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    size: React.PropTypes.string
  };

  ActionCancelModalComponentContent.prototype.render = function() {
    var dialogExtraClass;
    dialogExtraClass = "";
    if (this.props.size === "large") {
      dialogExtraClass = " modal-lg";
    }
    return H.div({
      ref: "modal",
      className: "modal"
    }, H.div({
      className: "modal-dialog" + dialogExtraClass
    }, H.div({
      className: "modal-content"
    }, H.div({
      className: "modal-header"
    }, H.h4({
      className: "modal-title"
    }, this.props.title)), H.div({
      className: "modal-body"
    }, this.props.children), H.div({
      className: "modal-footer"
    }, H.button({
      key: "cancel",
      type: "button",
      onClick: this.props.onCancel,
      className: "btn btn-default"
    }, "Cancel"), H.button({
      key: "action",
      type: "button",
      onClick: this.props.onAction,
      className: "btn btn-primary"
    }, this.props.actionLabel || "Save")))));
  };

  return ActionCancelModalComponentContent;

})(React.Component);
