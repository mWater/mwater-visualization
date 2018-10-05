var DragSourceComponent, PaletteItemComponent, PropTypes, R, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

DragSourceComponent = require('../DragSourceComponent')("block");

module.exports = PaletteItemComponent = (function(superClass) {
  extend(PaletteItemComponent, superClass);

  function PaletteItemComponent() {
    return PaletteItemComponent.__super__.constructor.apply(this, arguments);
  }

  PaletteItemComponent.propTypes = {
    createItem: PropTypes.func.isRequired,
    title: PropTypes.any,
    subtitle: PropTypes.any
  };

  PaletteItemComponent.prototype.render = function() {
    return R(DragSourceComponent, {
      createDragItem: this.props.createItem
    }, R('div', {
      className: "mwater-visualization-palette-item"
    }, R('div', {
      className: "title",
      key: "title"
    }, this.props.title), R('div', {
      className: "subtitle",
      key: "subtitle"
    }, this.props.subtitle)));
  };

  return PaletteItemComponent;

})(React.Component);
