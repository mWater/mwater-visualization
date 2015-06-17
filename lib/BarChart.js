var BarChart, BarChartDesignerComponent, BarChartViewComponent, ExpressionBuilder, H, React, _;

_ = require('lodash');

ExpressionBuilder = require('./ExpressionBuilder');

BarChartDesignerComponent = require('./BarChartDesignerComponent');

BarChartViewComponent = require('./BarChartViewComponent');

React = require('react');

H = React.DOM;


/*
Design is:

table: base table of design

aesthetics:
  x:
    expr: expression
    scale: scale
  y: 
    expr: expression
    scale: scale
  color:
    expr: expression
    scale: scale

filter: expression that filters table

stacked: true/false
 */

module.exports = BarChart = (function() {
  function BarChart(schema) {
    this.schema = schema;
    this.exprBuilder = new ExpressionBuilder(this.schema);
  }

  BarChart.prototype.cleanDesign = function(design) {
    var aes, i, len, ref, value;
    design = _.cloneDeep(design);
    design.table = null;
    ref = ['y', 'x', 'color'];
    for (i = 0, len = ref.length; i < len; i++) {
      aes = ref[i];
      value = design.aesthetics[aes];
      if (!value || !value.expr) {
        continue;
      }
      value.expr = this.exprBuilder.cleanExpr(value.expr, design.table);
      if (value.expr) {
        design.table = value.expr.table;
      }
    }
    if (design.filter) {
      design.filter = this.exprBuilder.cleanExpr(design.filter, design.table);
    }
    return design;
  };

  BarChart.prototype.validateDesign = function(design) {
    var error;
    if (!design.aesthetics.x) {
      return "Missing X Axis";
    }
    if (!design.aesthetics.y) {
      return "Missing Y Axis";
    }
    error = null;
    error = error || this.exprBuilder.validateExpr(design.aesthetics.x.expr);
    error = error || this.exprBuilder.validateExpr(design.aesthetics.y.expr);
    error = error || this.exprBuilder.validateExpr(design.filter);
    return error;
  };

  BarChart.prototype.createDesignerElement = function(options) {
    var props;
    props = {
      schema: this.schema,
      design: options.design,
      onChange: options.onChange
    };
    return React.createElement(BarChartDesignerComponent, props);
  };

  BarChart.prototype.createViewElement = function(options) {
    var error, props;
    error = this.validateDesign(this.cleanDesign(options.design));
    if (error) {
      return H.div({
        className: "alert alert-warning"
      }, error);
    }
    props = {
      schema: this.schema,
      design: options.design,
      onChange: options.onChange,
      width: options.width,
      height: options.height
    };
    return React.createElement(BarChartViewComponent, props);
  };

  return BarChart;

})();
