"use strict";

var ListControl, ListItem, PropTypes, R, React, _;

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
module.exports = ListControl = React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired,
    // List of items as { id: <comparable>, display: <element> }
    onSelect: PropTypes.func.isRequired,
    // Called with id
    selected: PropTypes.string // Currently selected item

  },
  render: function render() {
    var _this = this;

    return R('div', null, _.map(this.props.items, function (item) {
      return React.createElement(ListItem, {
        key: item.id,
        onSelect: _this.props.onSelect.bind(null, item.id),
        selected: _this.props.selected === item.id
      }, item.display);
    }));
  }
});
ListItem = React.createClass({
  getInitialState: function getInitialState() {
    return {
      hover: false
    };
  },
  mouseOver: function mouseOver() {
    return this.setState({
      hover: true
    });
  },
  mouseOut: function mouseOut() {
    return this.setState({
      hover: false
    });
  },
  render: function render() {
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