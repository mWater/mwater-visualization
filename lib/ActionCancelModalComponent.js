var H, React;

React = require('react');

H = React.DOM;

module.exports = React.createClass({
  propTypes: {
    title: React.PropTypes.any,
    actionLabel: React.PropTypes.string,
    onAction: React.PropTypes.func,
    onCancel: React.PropTypes.func
  },
  componentDidMount: function() {
    return $(React.findDOMNode(this.refs.modal)).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  },
  componentWillUnmount: function() {
    return $(React.findDOMNode(this.refs.modal)).modal("hide");
  },
  render: function() {
    return H.div({
      ref: "modal",
      className: "modal"
    }, H.div({
      className: "modal-dialog"
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
  }
});
