var DragSourceComponent, H, PaletteItemComponent, R, React,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

DragSourceComponent = require('../DragSourceComponent')("block-move");

module.exports = PaletteItemComponent = (function(superClass) {
  extend(PaletteItemComponent, superClass);

  function PaletteItemComponent() {
    return PaletteItemComponent.__super__.constructor.apply(this, arguments);
  }

  PaletteItemComponent.propTypes = {
    createItem: React.PropTypes.func.isRequired,
    title: React.PropTypes.any,
    subtitle: React.PropTypes.any
  };

  PaletteItemComponent.prototype.render = function() {
    return R(DragSourceComponent, {
      createDragItem: this.props.createItem
    }, H.div({
      className: "mwater-visualization-palette-item"
    }, H.div({
      className: "title",
      key: "title"
    }, this.props.title), H.div({
      className: "subtitle",
      key: "subtitle"
    }, this.props.subtitle)));
  };

  return PaletteItemComponent;

})(React.Component);
