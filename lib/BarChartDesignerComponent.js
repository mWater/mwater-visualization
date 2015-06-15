var BarChartDesignerComponent, ExpressionBuilder, H, LogicalExprComponent, ScalarExprComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

ScalarExprComponent = require('./ScalarExprComponent');

LogicalExprComponent = require('./LogicalExprComponent');

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = BarChartDesignerComponent = (function(superClass) {
  extend(BarChartDesignerComponent, superClass);

  function BarChartDesignerComponent() {
    this.handleWhereChange = bind(this.handleWhereChange, this);
    this.handleXAxisChange = bind(this.handleXAxisChange, this);
    this.handleYAxisChange = bind(this.handleYAxisChange, this);
    return BarChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  BarChartDesignerComponent.prototype.cleanDesign = function(design) {
    var exprBuilder;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    design.yAxis = exprBuilder.cleanExpr(design.yAxis);
    if (design.yAxis) {
      design.xAxis = exprBuilder.cleanExpr(design.xAxis, design.yAxis.table);
    } else {
      design.xAxis = null;
    }
    if (design.yAxis) {
      design.where = exprBuilder.cleanExpr(design.where, design.yAxis.table);
    } else {
      design.where = null;
    }
    return this.props.onChange(design);
  };

  BarChartDesignerComponent.prototype.validateDesign = function(design) {
    var exprBuilder;
    if (!design.yAxis) {
      return "Missing Y Axis";
    }
    if (!design.xAxis) {
      return "Missing X axis";
    }
    exprBuilder = new ExpressionBuilder(this.props.schema);
    return exprBuilder.validateExpr(design.yAxis) || exprBuilder.validateExpr(design.xAxis) || exprBuilder.validateExpr(design.where);
  };

  BarChartDesignerComponent.prototype.handleYAxisChange = function(val) {
    return this.cleanDesign(_.extend({}, this.props.value, {
      yAxis: val
    }));
  };

  BarChartDesignerComponent.prototype.handleXAxisChange = function(val) {
    return this.cleanDesign(_.extend({}, this.props.value, {
      xAxis: val
    }));
  };

  BarChartDesignerComponent.prototype.handleWhereChange = function(val) {
    return this.cleanDesign(_.extend({}, this.props.value, {
      where: val
    }));
  };

  BarChartDesignerComponent.prototype.renderYAxis = function() {
    return H.div({
      className: "form-group"
    }, H.label(null, "Bar size"), H.div(null, React.createElement(ScalarExprComponent, {
      editorTitle: "Bar size",
      schema: this.props.schema,
      onChange: this.handleYAxisChange,
      value: this.props.value.yAxis
    })), H.p({
      className: "help-block"
    }, "Field to use for the size of the bars"));
  };

  BarChartDesignerComponent.prototype.renderXAxis = function() {
    if (!this.props.value.yAxis) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label(null, "Group By"), H.div(null, React.createElement(ScalarExprComponent, {
      editorTitle: "Group By",
      schema: this.props.schema,
      table: this.props.value.yAxis.table,
      onChange: this.handleXAxisChange,
      value: this.props.value.xAxis
    })), H.p({
      className: "help-block"
    }, "Field to group by"));
  };

  BarChartDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.value.yAxis) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label(null, "Filter"), React.createElement(LogicalExprComponent, {
      schema: this.props.schema,
      onChange: this.handleWhereChange,
      table: this.props.value.yAxis.table,
      value: this.props.value.where
    }));
  };

  BarChartDesignerComponent.prototype.render = function() {
    var error, expr;
    expr = null;
    error = this.validateDesign(this.props.value);
    return H.div(null, error ? H.div({
      className: "text-warning"
    }, H.span({
      className: "glyphicon glyphicon-info-sign"
    }), " ", error) : void 0, this.renderYAxis(), this.renderXAxis(), this.renderFilter());
  };

  return BarChartDesignerComponent;

})(React.Component);
