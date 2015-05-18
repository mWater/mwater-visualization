var H;

H = React.DOM;

module.exports = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    initialValue: React.PropTypes.any,
    onClose: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onValidate: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      value: this.props.initialValue
    };
  },
  handleSave: function(e) {
    this.props.onChange(this.state.value);
    if (this.props.onClose) {
      return this.props.onClose();
    }
  },
  handleCancel: function(e) {
    if (this.props.onClose) {
      return this.props.onClose();
    }
  },
  handleChange: function(value) {
    return this.setState({
      value: value
    });
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
    var changed;
    changed = this.props.initialValue !== this.state.value;
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
    }, React.cloneElement(React.Children.only(this.props.children), {
      value: this.state.value,
      onChange: this.handleChange
    })), H.div({
      className: "modal-footer"
    }, H.button({
      ref: "cancel",
      type: "button",
      onClick: this.handleCancel,
      className: "btn btn-default"
    }, changed ? "Cancel" : "Close"), changed ? H.button({
      type: "button",
      ref: "save",
      onClick: this.handleSave,
      className: "btn btn-primary"
    }, "Save") : void 0))));
  }
});
