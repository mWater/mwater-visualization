var H, HoverEditComponent, HoverMixin;

H = React.DOM;

HoverMixin = require('./HoverMixin');

module.exports = HoverEditComponent = React.createClass({
  mixins: [HoverMixin],
  getInitialState: function() {
    return {
      editing: false
    };
  },
  handleEditorClose: function() {
    return this.setState({
      editing: false,
      hovered: false
    });
  },
  render: function() {
    var editor, highlighted;
    if (this.state.editing) {
      editor = React.cloneElement(this.props.editor, {
        onClose: this.handleEditorClose
      });
    }
    highlighted = this.state.hovered || this.state.editing;
    return H.div({
      style: {
        display: "inline-block"
      }
    }, editor, H.div({
      onClick: (function(_this) {
        return function() {
          return _this.setState({
            editing: true
          });
        };
      })(this),
      style: {
        display: "inline-block",
        padding: 3,
        cursor: "pointer",
        borderRadius: 4,
        backgroundColor: highlighted ? "rgba(0, 0, 0, 0.1)" : void 0
      }
    }, this.props.children));
  }
});
