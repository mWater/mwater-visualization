var GridLayoutComponent, H, LegoLayoutEngine, R, React, WidgetContainerComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

WidgetContainerComponent = require('./WidgetContainerComponent');

LegoLayoutEngine = require('./LegoLayoutEngine');

module.exports = GridLayoutComponent = (function(superClass) {
  extend(GridLayoutComponent, superClass);

  function GridLayoutComponent() {
    return GridLayoutComponent.__super__.constructor.apply(this, arguments);
  }

  GridLayoutComponent.propTypes = {
    width: React.PropTypes.number.isRequired,
    standardWidth: React.PropTypes.number.isRequired,
    items: React.PropTypes.any,
    onItemsChange: React.PropTypes.func,
    renderWidget: React.PropTypes.func.isRequired
  };

  GridLayoutComponent.prototype.renderPageBreaks = function(layoutEngine, layouts) {
    var elems, height, i, j, number, pageHeight, ref;
    height = layoutEngine.calculateHeight(layouts);
    pageHeight = this.props.width / 7.5 * 10;
    number = Math.floor(height / pageHeight);
    elems = [];
    if (number > 0) {
      for (i = j = 1, ref = number; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        elems.push(H.div({
          className: "mwater-visualization-page-break",
          key: "page" + i,
          style: {
            position: "absolute",
            top: i * pageHeight
          }
        }));
      }
    }
    return elems;
  };

  GridLayoutComponent.prototype.render = function() {
    var layoutEngine, layouts, style;
    layoutEngine = new LegoLayoutEngine(this.props.width, 24);
    layouts = _.mapValues(this.props.items, "layout");
    style = {
      height: "100%",
      position: "relative"
    };
    return H.div({
      style: style
    }, R(WidgetContainerComponent, {
      layoutEngine: layoutEngine,
      items: this.props.items,
      onItemsChange: this.props.onItemsChange,
      renderWidget: this.props.renderWidget,
      width: this.props.width,
      standardWidth: this.props.standardWidth
    }), this.renderPageBreaks(layoutEngine, layouts));
  };

  return GridLayoutComponent;

})(React.Component);
