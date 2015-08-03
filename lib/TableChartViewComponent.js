var ExpressionBuilder, H, React, TableChartViewComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = TableChartViewComponent = (function(superClass) {
  extend(TableChartViewComponent, superClass);

  function TableChartViewComponent() {
    return TableChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartViewComponent.prototype.renderHeaderCell = function(index) {
    var column, exprBuilder, text;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    column = this.props.design.columns[index];
    text = column.headerText || exprBuilder.summarizeAggrExpr(column.expr, column.aggr);
    return H.th(null, text);
  };

  TableChartViewComponent.prototype.renderHeader = function() {
    return H.thead(null, H.tr(null, _.map(this.props.design.columns, (function(_this) {
      return function(column, i) {
        return _this.renderHeaderCell(i);
      };
    })(this))));
  };

  TableChartViewComponent.prototype.renderCell = function(rowIndex, columnIndex) {
    var column, exprBuilder, row, str, value;
    row = this.props.data.main[rowIndex];
    column = this.props.design.columns[columnIndex];
    value = row["c" + columnIndex];
    exprBuilder = new ExpressionBuilder(this.props.schema);
    str = exprBuilder.stringifyExprLiteral(column.expr, value);
    return H.td(null, str);
  };

  TableChartViewComponent.prototype.renderRow = function(index) {
    return H.tr(null, _.map(this.props.design.columns, (function(_this) {
      return function(column, i) {
        return _this.renderCell(index, i);
      };
    })(this)));
  };

  TableChartViewComponent.prototype.renderBody = function() {
    return H.tbody(null, _.map(this.props.data.main, (function(_this) {
      return function(row, i) {
        return _this.renderRow(i);
      };
    })(this)));
  };

  TableChartViewComponent.prototype.render = function() {
    var style;
    style = {
      height: this.props.height,
      overflow: "auto",
      width: this.props.width
    };
    return H.div({
      style: style
    }, H.div({
      style: {
        fontWeight: "bold",
        textAlign: "center"
      }
    }, this.props.design.titleText), H.table({
      className: "table table-condensed table-hover",
      style: {
        fontSize: "10pt"
      }
    }, this.renderHeader(), this.renderBody()));
  };

  return TableChartViewComponent;

})(React.Component);
