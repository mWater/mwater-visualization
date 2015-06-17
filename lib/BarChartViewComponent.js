var BarChartViewComponent, H, React, data,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = BarChartViewComponent = (function(superClass) {
  extend(BarChartViewComponent, superClass);

  function BarChartViewComponent() {
    return BarChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  BarChartViewComponent.prototype.componentDidMount = function() {
    var el;
    el = React.findDOMNode(this.refs.chart);
    return nv.addGraph((function(_this) {
      return function() {
        var chart;
        chart = nv.models.multiBarChart().stacked(true).showControls(false).duration(250);
        return d3.select(el).datum(data).call(chart);
      };
    })(this));
  };

  BarChartViewComponent.prototype.render = function() {
    return H.div({
      style: {
        width: this.props.width,
        height: this.props.height
      }
    }, H.svg({
      ref: "chart"
    }));
  };

  return BarChartViewComponent;

})(React.Component);

data = [
  {
    key: "Asadfsdfa",
    values: [
      {
        x: "apple",
        y: 10
      }, {
        x: "banana",
        y: 20
      }
    ]
  }, {
    key: "sdfsdf",
    values: [
      {
        x: "apple",
        y: 14
      }, {
        x: "banana",
        y: 25
      }
    ]
  }
];
