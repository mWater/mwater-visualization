module.exports = {
  componentWillMount: function() {
    this.state = this.state || {};
    return this.state.hovered = false;
  },
  componentDidMount: function() {
    this.getDOMNode().addEventListener("mouseover", this.onOver);
    return this.getDOMNode().addEventListener("mouseout", this.onOut);
  },
  componentWillUnmount: function() {
    this.getDOMNode().removeEventListener("mouseover", this.onOver);
    return this.getDOMNode().removeEventListener("mouseout", this.onOut);
  },
  onOver: function() {
    return this.setState({
      hovered: true
    });
  },
  onOut: function() {
    return this.setState({
      hovered: false
    });
  }
};
