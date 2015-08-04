var ExpressionBuilder, H, LayeredChartCompiler, LayeredChartViewComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ExpressionBuilder = require('./ExpressionBuilder');

LayeredChartCompiler = require('./LayeredChartCompiler');

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

  LayeredChartViewComponent.prototype.createChart = function(props) {
    var chartOptions, compiler, el;
    if (this.chart) {
      this.chart.destroy();
    }
    compiler = new LayeredChartCompiler({
      schema: props.schema
    });
    el = React.findDOMNode(this.refs.chart);
    chartOptions = compiler.createChartOptions(this.props);
    chartOptions.bindto = el;
    chartOptions.data.onclick = this.handleDataClick;
    chartOptions.onrendered = (function(_this) {
      return function() {
        return _.defer(_this.updateScope);
      };
    })(this);
    return this.chart = c3.generate(chartOptions);
  };

  LayeredChartViewComponent.prototype.componentDidUpdate = function(prevProps) {
    var newChartOptions, newCompiler, oldChartOptions, oldCompiler;
    oldCompiler = new LayeredChartCompiler({
      schema: prevProps.schema
    });
    oldChartOptions = oldCompiler.createChartOptions(prevProps);
    newCompiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    newChartOptions = newCompiler.createChartOptions(this.props);
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
    var compiler, dataMap, el;
    dataMap = this.getDataMap();
    compiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    el = React.findDOMNode(this.refs.chart);
    d3.select(el).selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle").style("opacity", (function(_this) {
      return function(d, i) {
        var dataPoint, scope;
        dataPoint = _this.lookupDataPoint(dataMap, d);
        scope = compiler.createScope(_this.props.design, dataPoint.layerIndex, dataPoint.row);
        if (_this.props.scope) {
          if (_.isEqual(_this.props.scope.data, scope.data)) {
            return 1;
          } else {
            return 0.3;
          }
        } else {
          return 1;
        }
      };
    })(this));
    return d3.select(el).selectAll(".c3-chart-arcs .c3-chart-arc").style("opacity", (function(_this) {
      return function(d, i) {
        var dataPoint, scope;
        dataPoint = _this.lookupDataPoint(dataMap, d);
        scope = compiler.createScope(_this.props.design, dataPoint.layerIndex, dataPoint.row);
        if (_this.props.scope) {
          if (_.isEqual(_this.props.scope.data, scope.data)) {
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
