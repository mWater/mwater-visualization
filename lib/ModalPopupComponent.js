var H, ModalComponentContent, ModalPopupComponent, React, ReactDOM, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

_ = require('lodash');

module.exports = ModalPopupComponent = (function(superClass) {
  extend(ModalPopupComponent, superClass);

  function ModalPopupComponent() {
    return ModalPopupComponent.__super__.constructor.apply(this, arguments);
  }

  ModalPopupComponent.propTypes = {
    header: React.PropTypes.node,
    footer: React.PropTypes.node,
    size: React.PropTypes.string
  };

  ModalPopupComponent.prototype.componentDidMount = function() {
    var elem;
    this.modalNode = $('<div></div>').get(0);
    $("body").append(this.modalNode);
    elem = React.createElement(ModalComponentContent, this.props);
    ReactDOM.render(elem, this.modalNode);
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

  ModalPopupComponent.prototype.componentDidUpdate = function(prevProps) {
    var elem;
    elem = React.createElement(ModalComponentContent, this.props);
    return ReactDOM.render(elem, this.modalNode);
  };

  ModalPopupComponent.prototype.componentWillUnmount = function() {
    $(this.modalNode).children().modal("hide");
    ReactDOM.unmountComponentAtNode(this.modalNode);
    return $(this.modalNode).remove();
  };

  ModalPopupComponent.prototype.render = function() {
    return null;
  };

  return ModalPopupComponent;

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
    }, this.props.header ? H.div({
      className: "modal-header"
    }, this.props.header) : void 0, H.div({
      className: "modal-body"
    }, this.props.children), this.props.footer ? H.div({
      className: "modal-footer"
    }, this.props.footer) : void 0)));
  };

  return ModalComponentContent;

})(React.Component);
