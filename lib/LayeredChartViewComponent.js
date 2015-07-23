var ExpressionBuilder, H, LayeredChartCompiler, LayeredChartViewComponent, React, titleFontSize, titleHeight,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ExpressionBuilder = require('./ExpressionBuilder');

LayeredChartCompiler = require('./LayeredChartCompiler');

titleFontSize = 14;

titleHeight = 20;

module.exports = LayeredChartViewComponent = (function(superClass) {
  extend(LayeredChartViewComponent, superClass);

  function LayeredChartViewComponent() {
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
    return this.createChart(this.props);
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
        xs: compiler.getXs(columns)
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
        height: props.height - titleHeight
      }
    };
    console.log(chartDesign);
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
    return this.chart = c3.generate(chartOptions);
  };

  LayeredChartViewComponent.prototype.componentWillReceiveProps = function(nextProps) {
    var newChartOptions, oldChartOptions;
    if (this.props.height !== nextProps.height || this.props.width !== nextProps.width) {
      this.createChart(nextProps);
      return;
    }
    oldChartOptions = this.createChartOptions(this.props);
    newChartOptions = this.createChartOptions(nextProps);
    if (!_.isEqual(oldChartOptions, newChartOptions)) {
      this.createChart(nextProps);
    }
  };

  LayeredChartViewComponent.prototype.componentWillUnmount = function() {
    return this.chart.destroy();
  };

  LayeredChartViewComponent.prototype.render = function() {
    var titleStyle;
    titleStyle = {
      position: "absolute",
      top: 0,
      width: this.props.width,
      textAlign: "center",
      fontWeight: "bold"
    };
    return H.div(null, H.div({
      style: titleStyle
    }, this.props.design.titleText), H.div({
      style: {
        marginTop: titleHeight
      },
      ref: "chart"
    }));
  };

  return LayeredChartViewComponent;

})(React.Component);
