var BarChartViewComponent, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = BarChartViewComponent = (function(superClass) {
  extend(BarChartViewComponent, superClass);

  function BarChartViewComponent() {
    this.updateChart = bind(this.updateChart, this);
    return BarChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  BarChartViewComponent.prototype.componentDidMount = function() {
    var el;
    el = React.findDOMNode(this.refs.chart);
    return nv.addGraph((function(_this) {
      return function() {
        _this.chart = nv.models.multiBarChart().showLegend(false).stacked(true).showControls(false).duration(250);
        _this.updateChart(_this.props);
        return _this.chart;
      };
    })(this));
  };

  BarChartViewComponent.prototype.componentWillReceiveProps = function(props) {
    return this.updateChart(props);
  };

  BarChartViewComponent.prototype.updateChart = function(props) {
    var el;
    el = React.findDOMNode(this.refs.chart);
    return d3.select(el).datum(props.datum).call(this.chart);
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
