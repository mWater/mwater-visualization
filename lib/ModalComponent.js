var H, ModalComponent, ModalComponentContent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

module.exports = ModalComponent = (function(superClass) {
  extend(ModalComponent, superClass);

  function ModalComponent() {
    return ModalComponent.__super__.constructor.apply(this, arguments);
  }

  ModalComponent.propTypes = {
    header: React.PropTypes.node,
    footer: React.PropTypes.node,
    size: React.PropTypes.string
  };

  ModalComponent.prototype.componentDidMount = function() {
    var elem;
    this.modalNode = $('<div></div>').get(0);
    $("body").append(this.modalNode);
    elem = React.createElement(ModalComponentContent, this.props);
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

  ModalComponent.prototype.componentDidUpdate = function(prevProps) {
    var elem;
    elem = React.createElement(ModalComponentContent, this.props);
    return React.render(elem, this.modalNode);
  };

  ModalComponent.prototype.componentWillUnmount = function() {
    $(this.modalNode).children().modal("hide");
    React.unmountComponentAtNode(this.modalNode);
    return $(this.modalNode).remove();
  };

  ModalComponent.prototype.render = function() {
    return H.div(null);
  };

  return ModalComponent;

})(React.Component);

ModalComponentContent = (function(superClass) {
  extend(ModalComponentContent, superClass);

  function ModalComponentContent() {
    return ModalComponentContent.__super__.constructor.apply(this, arguments);
  }

  ModalComponentContent.propTypes = {
    header: React.PropTypes.node,
    footer: React.PropTypes.node,
    size: React.PropTypes.string
  };

  ModalComponentContent.prototype.render = function() {
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
    }, this.props.header), H.div({
      className: "modal-body"
    }, this.props.children), H.div({
      className: "modal-footer"
    }, this.props.footer))));
  };

  return ModalComponentContent;

})(React.Component);
