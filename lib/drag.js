var BarChartViewComponent, H, LegoLayoutEngine, React, Root, Widget, WidgetContainerComponent, data,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

LegoLayoutEngine = require('./LegoLayoutEngine');

WidgetContainerComponent = require('./WidgetContainerComponent');

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
    var myData, resizeHandleStyle, style;
    style = {
      width: this.props.width,
      height: this.props.height,
      padding: 5,
      position: "absolute"
    };
    resizeHandleStyle = {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')",
      width: 10,
      height: 10,
      cursor: "nwse-resize"
    };
    myData = _.cloneDeep(data);
    myData[0].y = this.props.data;
    return this.props.connectMoveHandle(H.div({
      style: style,
      className: "widget",
      onClick: ((function(_this) {
        return function() {
          return console.log("clicked");
        };
      })(this))
    }, React.createElement(BarChartViewComponent, {
      width: this.props.width - 10,
      height: this.props.height - 10,
      data: myData
    }), this.props.connectResizeHandle(H.div({
      style: resizeHandleStyle,
      className: "widget-resize-handle"
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
      widgets: [
        {
          id: "a",
          contents: 40000,
          layout: {
            x: 0,
            y: 0,
            w: 4,
            h: 3
          }
        }, {
          id: "b",
          contents: 80000,
          layout: {
            x: 4,
            y: 0,
            w: 4,
            h: 3
          }
        }, {
          id: "c",
          contents: 120000,
          layout: {
            x: 8,
            y: 0,
            w: 4,
            h: 3
          }
        }, {
          id: "d",
          contents: 40000,
          layout: {
            x: 0,
            y: 1,
            w: 4,
            h: 3
          }
        }, {
          id: "e",
          contents: 80000,
          layout: {
            x: 4,
            y: 1,
            w: 4,
            h: 3
          }
        }, {
          id: "f",
          contents: 120000,
          layout: {
            x: 8,
            y: 1,
            w: 4,
            h: 3
          }
        }
      ]
    };
  }

  Root.prototype.handleLayoutUpdate = function(layouts) {
    var widgets;
    widgets = _.map(this.state.widgets, (function(_this) {
      return function(widget) {
        return _.extend({}, widget, {
          layout: layouts[widget.id]
        });
      };
    })(this));
    return this.setState({
      widgets: widgets
    });
  };

  Root.prototype.render = function() {
    var elems, i, layoutEngine, layouts, len, ref, widget;
    layoutEngine = new LegoLayoutEngine(800, 12);
    elems = {};
    ref = this.state.widgets;
    for (i = 0, len = ref.length; i < len; i++) {
      widget = ref[i];
      elems[widget.id] = React.createElement(Widget, {
        data: widget.contents
      });
    }
    layouts = _.object(_.pluck(this.state.widgets, "id"), _.pluck(this.state.widgets, "layout"));
    return H.div({
      style: {
        border: "solid 1px #CCC",
        width: 800
      }
    }, React.createElement(WidgetContainerComponent, {
      layoutEngine: layoutEngine,
      layouts: layouts,
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
