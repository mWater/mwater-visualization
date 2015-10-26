var AxisBuilder, H, React, TableChartViewComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

AxisBuilder = require('./../../axes/AxisBuilder');

module.exports = TableChartViewComponent = (function(superClass) {
  extend(TableChartViewComponent, superClass);

  function TableChartViewComponent() {
    return TableChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartViewComponent.prototype.renderHeaderCell = function(index) {
    var axisBuilder, column, text;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    column = this.props.design.columns[index];
    text = column.headerText || axisBuilder.summarizeAxis(column.textAxis);
    return H.th({
      key: index
    }, text);
  };

  TableChartViewComponent.prototype.renderHeader = function() {
    return H.thead(null, H.tr(null, _.map(this.props.design.columns, (function(_this) {
      return function(column, i) {
        return _this.renderHeaderCell(i);
      };
    })(this))));
  };

  TableChartViewComponent.prototype.renderCell = function(rowIndex, columnIndex) {
    var axisBuilder, column, row, str, value;
    row = this.props.data.main[rowIndex];
    column = this.props.design.columns[columnIndex];
    value = row["c" + columnIndex];
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    str = axisBuilder.formatValue(column.textAxis, value);
    return H.td({
      key: columnIndex
    }, str);
  };

  TableChartViewComponent.prototype.renderRow = function(index) {
    return H.tr({
      key: index
    }, _.map(this.props.design.columns, (function(_this) {
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

  TableChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  TableChartViewComponent.prototype.render = function() {
    var style;
    style = {
      height: this.props.height,
      width: this.props.width
    };
    return H.div({
      style: style,
      className: "overflow-auto-except-print"
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
