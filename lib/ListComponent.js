var ListControl, ListItem, PropTypes, R, React;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

module.exports = ListControl = React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    selected: PropTypes.string
  },
  render: function() {
    return R('div', null, _.map(this.props.items, (function(_this) {
      return function(item) {
        return React.createElement(ListItem, {
          key: item.id,
          onSelect: _this.props.onSelect.bind(null, item.id),
          selected: _this.props.selected === item.id
        }, item.display);
      };
    })(this)));
  }
});

ListItem = React.createClass({
  getInitialState: function() {
    return {
      hover: false
    };
  },
  mouseOver: function() {
    return this.setState({
      hover: true
    });
  },
  mouseOut: function() {
    return this.setState({
      hover: false
    });
  },
  render: function() {
    var style;
    style = {
      border: "solid 1px #DDD",
      marginBottom: -1,
      padding: 3,
      cursor: "pointer"
    };
    if (this.props.selected) {
      style.color = "#EEE";
      style.backgroundColor = this.state.hover ? "#286090" : "#337AB7";
    } else if (this.state.hover) {
      style.backgroundColor = "#EEE";
    }
    return R('div', {
      style: style,
      onMouseOver: this.mouseOver,
      onMouseOut: this.mouseOut,
      onClick: this.props.onSelect
    }, this.props.children);
  }
});
