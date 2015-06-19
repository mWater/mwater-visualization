var BarChartViewComponent, DragDropContainer, H, LegoLayoutEngine, React, Root, Widget, data,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

LegoLayoutEngine = require('./LegoLayoutEngine');

DragDropContainer = require('./DragDropContainer');

BarChartViewComponent = require('./BarChartViewComponent');

data = [
  {
    "x": "broken",
    "y": "48520"
  }, {
    "x": null,
    "y": "2976"
  }, {
    "x": "ok",
    "y": "173396"
  }, {
    "x": "maint",
    "y": "12103"
  }, {
    "x": "missing",
    "y": "3364"
  }
];

Widget = (function(superClass) {
  extend(Widget, superClass);

  function Widget() {
    return Widget.__super__.constructor.apply(this, arguments);
  }

  Widget.prototype.render = function() {
    var resizeHandleStyle, style;
    style = {
      width: this.props.width,
      height: this.props.height,
      border: "solid 2px #35A",
      backgroundColor: "white",
      borderRadius: 3,
      padding: 5,
      position: "absolute"
    };
    resizeHandleStyle = {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundColor: "green",
      width: 20,
      height: 20
    };
    return this.props.connectMoveHandle(H.div({
      style: style
    }, React.createElement(BarChartViewComponent, {
      width: this.props.width - 10,
      height: this.props.height - 10,
      data: data
    }), this.props.connectResizeHandle(H.div({
      style: resizeHandleStyle
    }))));
  };

  return Widget;

})(React.Component);

Root = (function(superClass) {
  extend(Root, superClass);

  function Root() {
    this.handleLayoutUpdate = bind(this.handleLayoutUpdate, this);
    Root.__super__.constructor.apply(this, arguments);
    this.state = {
      blocks: [
        {
          contents: "Widget 1",
          layout: {
            x: 0,
            y: 0,
            w: 4,
            h: 3
          }
        }, {
          contents: "Widget 2",
          layout: {
            x: 4,
            y: 0,
            w: 4,
            h: 3
          }
        }, {
          contents: "Widget 3",
          layout: {
            x: 8,
            y: 0,
            w: 4,
            h: 3
          }
        }
      ]
    };
  }

  Root.prototype.handleLayoutUpdate = function(blocks) {
    return this.setState({
      blocks: blocks
    });
  };

  Root.prototype.render = function() {
    var elems, layoutEngine;
    layoutEngine = new LegoLayoutEngine(800, 12);
    elems = _.map(this.state.blocks, (function(_this) {
      return function(block) {
        return React.createElement(Widget, {
          text: block.contents
        });
      };
    })(this));
    return H.div({
      style: {
        backgroundColor: "#CCC",
        width: 800
      }
    }, React.createElement(DragDropContainer, {
      layoutEngine: layoutEngine,
      blocks: this.state.blocks,
      elems: elems,
      onLayoutUpdate: this.handleLayoutUpdate,
      width: 800,
      height: 600
    }));
  };

  return Root;

})(React.Component);

$(function() {
  var sample;
  sample = React.createElement(Root);
  return React.render(sample, document.getElementById('root'));
});
