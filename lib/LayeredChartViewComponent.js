var ExpressionBuilder, H, LayeredChartCompiler, LayeredChartViewComponent, React, titleFontSize, titlePadding,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ExpressionBuilder = require('./ExpressionBuilder');

LayeredChartCompiler = require('./LayeredChartCompiler');

titleFontSize = 14;

titlePadding = {
  top: 0,
  right: 0,
  bottom: 15,
  left: 0
};

module.exports = LayeredChartViewComponent = (function(superClass) {
  extend(LayeredChartViewComponent, superClass);

  function LayeredChartViewComponent() {
    this.handleDataClick = bind(this.handleDataClick, this);
    this.updateScope = bind(this.updateScope, this);
    return LayeredChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  LayeredChartViewComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func
  };

  LayeredChartViewComponent.prototype.componentDidMount = function() {
    this.createChart(this.props);
    return this.updateScope();
  };

  LayeredChartViewComponent.prototype.createChartOptions = function(props) {
    var chartDesign, columns, compiler;
    compiler = new LayeredChartCompiler({
      schema: props.schema
    });
    columns = compiler.getColumns(props.design, props.data);
    chartDesign = {
      data: {
        types: compiler.getTypes(props.design, columns),
        columns: columns,
        names: compiler.getNames(props.design, props.data),
        types: compiler.getTypes(props.design, columns),
        groups: compiler.getGroups(props.design, columns),
        xs: compiler.getXs(columns),
        onclick: this.handleDataClick
      },
      legend: {
        hide: props.design.layers.length === 1 && !props.design.layers[0].colorExpr
      },
      grid: {
        focus: {
          show: false
        }
      },
      axis: {
        x: {
          type: compiler.getXAxisType(props.design)
        },
        rotated: props.design.transpose
      },
      size: {
        width: props.width,
        height: props.height
      },
      pie: {
        expand: false
      },
      title: {
        text: props.design.titleText,
        padding: titlePadding
      },
      subchart: {
        axis: {
          x: {
            show: false
          }
        }
      },
      transition: {
        duration: 0
      }
    };
    return chartDesign;
  };

  LayeredChartViewComponent.prototype.createChart = function(props) {
    var chartOptions, el;
    if (this.chart) {
      this.chart.destroy();
    }
    el = React.findDOMNode(this.refs.chart);
    chartOptions = this.createChartOptions(props);
    chartOptions.bindto = el;
    chartOptions.onrendered = (function(_this) {
      return function() {
        return _.defer(_this.updateScope);
      };
    })(this);
    return this.chart = c3.generate(chartOptions);
  };

  LayeredChartViewComponent.prototype.componentDidUpdate = function(prevProps) {
    var newChartOptions, oldChartOptions;
    oldChartOptions = this.createChartOptions(prevProps);
    newChartOptions = this.createChartOptions(this.props);
    if (!_.isEqual(oldChartOptions, newChartOptions)) {
      if (_.isEqual(_.omit(oldChartOptions, "size"), _.omit(newChartOptions, "size"))) {
        this.chart.resize({
          width: this.props.width,
          height: this.props.height
        });
        this.updateScope();
        return;
      }
      return this.createChart(this.props);
    } else {
      if (!_.isEqual(this.props.scope, prevProps.scope)) {
        return this.updateScope();
      }
    }
  };

  LayeredChartViewComponent.prototype.updateScope = function() {
    var dataMap;
    dataMap = this.getDataMap();
    d3.select(React.findDOMNode(this.refs.chart)).selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle").style("opacity", (function(_this) {
      return function(d, i) {
        var dataPoint;
        dataPoint = _this.lookupDataPoint(dataMap, d);
        if (_this.props.scope) {
          if (_.isEqual(_this.props.scope.data, dataPoint)) {
            return 1;
          } else {
            return 0.3;
          }
        } else {
          return 1;
        }
      };
    })(this));
    return d3.select(React.findDOMNode(this.refs.chart)).selectAll(".c3-chart-arcs .c3-chart-arc").style("opacity", (function(_this) {
      return function(d, i) {
        var dataPoint;
        dataPoint = _this.lookupDataPoint(dataMap, d);
        if (_this.props.scope) {
          if (_.isEqual(_this.props.scope.data, dataPoint)) {
            return 1;
          } else {
            return 0.3;
          }
        } else {
          return 1;
        }
      };
    })(this));
  };

  LayeredChartViewComponent.prototype.lookupDataPoint = function(dataMap, d) {
    var dataPoint, isPolarChart, ref;
    if (d.data) {
      d = d.data;
    }
    isPolarChart = (ref = this.props.design.type) === 'pie' || ref === 'donut';
    if (isPolarChart) {
      dataPoint = dataMap[d.id + "-0"];
    } else {
      dataPoint = dataMap[d.id + "-" + d.index];
    }
    return dataPoint;
  };

  LayeredChartViewComponent.prototype.getDataMap = function() {
    var compiler, dataMap;
    compiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    dataMap = {};
    compiler.getColumns(this.props.design, this.props.data, dataMap);
    return dataMap;
  };

  LayeredChartViewComponent.prototype.handleDataClick = function(d) {
    var compiler, dataMap, dataPoint, scope;
    dataMap = this.getDataMap();
    dataPoint = this.lookupDataPoint(dataMap, d);
    if (!dataPoint) {
      return;
    }
    compiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row);
    if (this.props.scope && _.isEqual(scope.data, this.props.scope.data)) {
      this.props.onScopeChange(null);
      return;
    }
    return this.props.onScopeChange(scope);
  };

  LayeredChartViewComponent.prototype.componentWillUnmount = function() {
    return this.chart.destroy();
  };

  LayeredChartViewComponent.prototype.render = function() {
    return H.div(null, H.div({
      ref: "chart"
    }));
  };

  return LayeredChartViewComponent;

})(React.Component);
