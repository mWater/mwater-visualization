var BarChartViewComponent, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = BarChartViewComponent = (function(superClass) {
  extend(BarChartViewComponent, superClass);

  function BarChartViewComponent() {
    this.handleDataClick = bind(this.handleDataClick, this);
    this.updateSelected = bind(this.updateSelected, this);
    BarChartViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      selected: null
    };
  }

  BarChartViewComponent.prototype.componentDidMount = function() {
    return this.createChart(this.props);
  };

  BarChartViewComponent.prototype.createChart = function(props) {
    var el;
    if (this.chart) {
      this.chart.destroy();
    }
    el = React.findDOMNode(this.refs.chart);
    this.chart = c3.generate({
      bindto: el,
      data: {
        type: "bar",
        json: props.data,
        keys: {
          x: "x",
          value: ["y"]
        },
        names: {
          y: 'Value'
        },
        onclick: this.handleDataClick
      },
      legend: {
        hide: true
      },
      grid: {
        focus: {
          show: false
        }
      },
      axis: {
        x: {
          type: 'category'
        }
      },
      size: {
        width: props.width,
        height: props.height
      }
    });
    return this.updateSelected();
  };

  BarChartViewComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
      this.createChart(nextProps);
      return;
    }
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.chart.load({
        json: nextProps.data,
        keys: {
          x: "x",
          value: ["y"]
        },
        names: {
          y: 'Value'
        }
      });
      return this.setState({
        selected: null
      });
    }
  };

  BarChartViewComponent.prototype.updateSelected = function() {
    return d3.select(React.findDOMNode(this.refs.chart)).select(".c3-bars-y").selectAll(".c3-bar").style("opacity", (function(_this) {
      return function(d, i) {
        if ((_this.state.selected == null) || i === _this.state.selected) {
          return 1;
        } else {
          return 0.3;
        }
      };
    })(this));
  };

  BarChartViewComponent.prototype.handleDataClick = function(d) {
    var selected;
    selected = this.state.selected === d.index ? null : d.index;
    return this.setState({
      selected: selected
    });
  };

  BarChartViewComponent.prototype.componentDidUpdate = function() {
    return this.updateSelected();
  };

  BarChartViewComponent.prototype.componentWillUnmount = function() {
    return this.chart.destroy();
  };

  BarChartViewComponent.prototype.render = function() {
    return H.div({
      style: {
        width: this.props.width,
        height: this.props.height
      },
      ref: "chart"
    });
  };

  return BarChartViewComponent;

})(React.Component);
