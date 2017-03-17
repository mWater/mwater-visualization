var C3ChartComponent, ExprUtils, H, LayeredChartCompiler, LayeredChartViewComponent, R, React, ReactDOM, TextComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

H = React.DOM;

ExprUtils = require('mwater-expressions').ExprUtils;

LayeredChartCompiler = require('./LayeredChartCompiler');

TextComponent = require('../../text/TextComponent');

module.exports = LayeredChartViewComponent = (function(superClass) {
  extend(LayeredChartViewComponent, superClass);

  LayeredChartViewComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    standardWidth: React.PropTypes.number.isRequired,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func
  };

  LayeredChartViewComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function LayeredChartViewComponent() {
    this.handleFooterChange = bind(this.handleFooterChange, this);
    this.handleHeaderChange = bind(this.handleHeaderChange, this);
    LayeredChartViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      headerHeight: null,
      footerHeight: null
    };
  }

  LayeredChartViewComponent.prototype.componentDidMount = function() {
    return this.updateHeights();
  };

  LayeredChartViewComponent.prototype.componentDidUpdate = function() {
    return this.updateHeights();
  };

  LayeredChartViewComponent.prototype.updateHeights = function() {
    if (this.refs.header && this.state.headerHeight !== this.refs.header.offsetHeight) {
      this.setState({
        headerHeight: this.refs.header.offsetHeight
      });
    }
    if (this.refs.footer && this.state.footerHeight !== this.refs.footer.offsetHeight) {
      return this.setState({
        footerHeight: this.refs.footer.offsetHeight
      });
    }
  };

  LayeredChartViewComponent.prototype.handleHeaderChange = function(header) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      header: header
    }));
  };

  LayeredChartViewComponent.prototype.handleFooterChange = function(footer) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      footer: footer
    }));
  };

  LayeredChartViewComponent.prototype.renderHeader = function() {
    return H.div({
      ref: "header"
    }, R(TextComponent, {
      design: this.props.design.header,
      onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : void 0,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      exprValues: this.props.data.header || {},
      width: this.props.width,
      standardWidth: this.props.standardWidth
    }));
  };

  LayeredChartViewComponent.prototype.renderFooter = function() {
    return H.div({
      ref: "footer"
    }, R(TextComponent, {
      design: this.props.design.footer,
      onDesignChange: this.props.onDesignChange ? this.handleFooterChange : void 0,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      exprValues: this.props.data.footer || {},
      width: this.props.width,
      standardWidth: this.props.standardWidth
    }));
  };

  LayeredChartViewComponent.prototype.render = function() {
    return H.div({
      style: {
        width: this.props.width,
        height: this.props.height
      }
    }, this.renderHeader(), (this.state.headerHeight != null) && (this.state.footerHeight != null) ? R(C3ChartComponent, {
      schema: this.props.schema,
      design: this.props.design,
      data: this.props.data,
      onDesignChange: this.props.onDesignChange,
      width: this.props.width,
      height: this.props.height - this.state.headerHeight - this.state.footerHeight,
      standardWidth: this.props.standardWidth,
      scope: this.props.scope,
      onScopeChange: this.props.onScopeChange
    }) : void 0, this.renderFooter());
  };

  return LayeredChartViewComponent;

})(React.Component);

C3ChartComponent = (function(superClass) {
  extend(C3ChartComponent, superClass);

  C3ChartComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    standardWidth: React.PropTypes.number.isRequired,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func
  };

  C3ChartComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function C3ChartComponent() {
    this.handleDataClick = bind(this.handleDataClick, this);
    this.updateScope = bind(this.updateScope, this);
    this.createChart = bind(this.createChart, this);
    C3ChartComponent.__super__.constructor.apply(this, arguments);
    this.throttledCreateChart = _.throttle(this.createChart, 1000);
  }

  C3ChartComponent.prototype.componentDidMount = function() {
    this.createChart(this.props);
    return this.updateScope();
  };

  C3ChartComponent.prototype.createChart = function(props) {
    var chartOptions, compiler, el;
    if (this.chart) {
      this.chart.destroy();
    }
    compiler = new LayeredChartCompiler({
      schema: props.schema
    });
    el = ReactDOM.findDOMNode(this.refs.chart);
    chartOptions = compiler.createChartOptions({
      design: this.props.design,
      data: this.props.data,
      width: this.props.width,
      height: this.props.height,
      locale: this.context.locale
    });
    chartOptions.bindto = el;
    chartOptions.data.onclick = this.handleDataClick;
    chartOptions.onrendered = (function(_this) {
      return function() {
        return _.defer(_this.updateScope);
      };
    })(this);
    return this.chart = c3.generate(chartOptions);
  };

  C3ChartComponent.prototype.componentDidUpdate = function(prevProps, prevState, prevContext) {
    var newChartOptions, newCompiler, oldChartOptions, oldCompiler;
    oldCompiler = new LayeredChartCompiler({
      schema: prevProps.schema
    });
    newCompiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    oldChartOptions = oldCompiler.createChartOptions({
      design: prevProps.design,
      data: prevProps.data,
      width: prevProps.width,
      height: prevProps.height,
      locale: prevContext.locale
    });
    newChartOptions = newCompiler.createChartOptions({
      design: this.props.design,
      data: this.props.data,
      width: this.props.width,
      height: this.props.height,
      locale: this.context.locale
    });
    if (!_.isEqual(oldChartOptions, newChartOptions) || this.context.locale !== prevContext.locale) {
      if (_.isEqual(_.omit(oldChartOptions, "size"), _.omit(newChartOptions, "size")) && this.context.locale === prevContext.locale) {
        this.chart.resize({
          width: this.props.width,
          height: this.props.height
        });
        this.updateScope();
        return;
      }
      return this.throttledCreateChart(this.props);
    } else {
      if (!_.isEqual(this.props.scope, prevProps.scope)) {
        return this.updateScope();
      }
    }
  };

  C3ChartComponent.prototype.updateScope = function() {
    var compiler, dataMap, el;
    dataMap = this.getDataMap();
    compiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    el = ReactDOM.findDOMNode(this.refs.chart);
    d3.select(el).selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle").style("opacity", (function(_this) {
      return function(d, i) {
        var dataPoint, scope;
        dataPoint = _this.lookupDataPoint(dataMap, d);
        if (dataPoint) {
          scope = compiler.createScope(_this.props.design, dataPoint.layerIndex, dataPoint.row, _this.context.locale);
        }
        if (scope && _this.props.scope) {
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
        if (dataPoint) {
          scope = compiler.createScope(_this.props.design, dataPoint.layerIndex, dataPoint.row, _this.context.locale);
        }
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

  C3ChartComponent.prototype.lookupDataPoint = function(dataMap, d) {
    var dataPoint, isPolarChart, ref;
    if (d.data) {
      d = d.data;
    }
    isPolarChart = (ref = this.props.design.type) === 'pie' || ref === 'donut';
    if (isPolarChart) {
      dataPoint = dataMap["" + d.id];
    } else {
      dataPoint = dataMap[d.id + ":" + d.index];
    }
    return dataPoint;
  };

  C3ChartComponent.prototype.getDataMap = function() {
    var compiler;
    compiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    return compiler.createDataMap(this.props.design, this.props.data);
  };

  C3ChartComponent.prototype.handleDataClick = function(d) {
    var base, base1, compiler, dataMap, dataPoint, scope;
    dataMap = this.getDataMap();
    dataPoint = this.lookupDataPoint(dataMap, d);
    if (!dataPoint) {
      return;
    }
    compiler = new LayeredChartCompiler({
      schema: this.props.schema
    });
    scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.context.locale);
    if (this.props.scope && _.isEqual(scope.data, this.props.scope.data)) {
      if (typeof (base = this.props).onScopeChange === "function") {
        base.onScopeChange(null);
      }
      return;
    }
    return typeof (base1 = this.props).onScopeChange === "function" ? base1.onScopeChange(scope) : void 0;
  };

  C3ChartComponent.prototype.componentWillUnmount = function() {
    return this.chart.destroy();
  };

  C3ChartComponent.prototype.render = function() {
    var css, scale;
    scale = this.props.width / this.props.standardWidth;
    scale = Math.min(scale, 1);
    css = ".c3 svg { font-size: " + (scale * 10) + "px; }\n";
    css += ".c3-legend-item { font-size: " + (scale * 12) + "px; }\n";
    css += ".c3-chart-arc text { font-size: " + (scale * 13) + "px; }\n";
    css += ".c3-title { font-size: " + (scale * 14) + "px; }\n";
    return H.div(null, H.style(null, css), H.div({
      ref: "chart"
    }));
  };

  return C3ChartComponent;

})(React.Component);
