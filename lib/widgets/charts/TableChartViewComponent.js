var AxisBuilder, H, R, React, TableChartViewComponent, TableContentsComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisBuilder = require('./../../axes/AxisBuilder');

module.exports = TableChartViewComponent = (function(superClass) {
  extend(TableChartViewComponent, superClass);

  function TableChartViewComponent() {
    return TableChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func
  };

  TableChartViewComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  TableChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  TableChartViewComponent.prototype.render = function() {
    var style;
    style = {
      width: this.props.standardWidth,
      height: this.props.height * (this.props.standardWidth / this.props.width),
      transform: "scale(" + (this.props.width / this.props.standardWidth) + ", " + (this.props.width / this.props.standardWidth) + ")",
      transformOrigin: "0 0"
    };
    return H.div({
      style: style,
      className: "overflow-auto-except-print"
    }, H.div({
      style: {
        fontWeight: "bold",
        textAlign: "center"
      },
      ref: "title"
    }, this.props.design.titleText), R(TableContentsComponent, {
      columns: this.props.design.columns,
      data: this.props.data,
      schema: this.props.schema
    }));
  };

  return TableChartViewComponent;

})(React.Component);

TableContentsComponent = (function(superClass) {
  extend(TableContentsComponent, superClass);

  function TableContentsComponent() {
    return TableContentsComponent.__super__.constructor.apply(this, arguments);
  }

  TableContentsComponent.propTypes = {
    columns: React.PropTypes.array.isRequired,
    data: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired
  };

  TableContentsComponent.prototype.shouldComponentUpdate = function(prevProps) {
    if (prevProps.columns !== this.props.columns && !_.isEqual(prevProps.columns, this.props.columns)) {
      return true;
    }
    if (prevProps.data !== this.props.data && !_.isEqual(prevProps.data, this.props.data)) {
      return true;
    }
    if (prevProps.schema !== this.props.schema) {
      return true;
    }
    return false;
  };

  TableContentsComponent.prototype.renderHeaderCell = function(index) {
    var axisBuilder, column, text;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    column = this.props.columns[index];
    text = column.headerText || axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
    return H.th({
      key: index
    }, text);
  };

  TableContentsComponent.prototype.renderHeader = function() {
    return H.thead({
      key: "head"
    }, H.tr({
      key: "head"
    }, _.map(this.props.columns, (function(_this) {
      return function(column, i) {
        return _this.renderHeaderCell(i);
      };
    })(this))));
  };

  TableContentsComponent.prototype.renderCell = function(rowIndex, columnIndex) {
    var axisBuilder, column, row, str, value;
    row = this.props.data.main[rowIndex];
    column = this.props.columns[columnIndex];
    value = row["c" + columnIndex];
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    str = axisBuilder.formatValue(column.textAxis, value, this.context.locale);
    return H.td({
      key: columnIndex
    }, str);
  };

  TableContentsComponent.prototype.renderRow = function(index) {
    return H.tr({
      key: index
    }, _.map(this.props.columns, (function(_this) {
      return function(column, i) {
        return _this.renderCell(index, i);
      };
    })(this)));
  };

  TableContentsComponent.prototype.renderBody = function() {
    return H.tbody({
      key: "body"
    }, _.map(this.props.data.main, (function(_this) {
      return function(row, i) {
        return _this.renderRow(i);
      };
    })(this)));
  };

  TableContentsComponent.prototype.render = function() {
    return H.table({
      className: "table table-condensed table-hover",
      style: {
        fontSize: "10pt",
        marginBottom: 0
      }
    }, this.renderHeader(), this.renderBody());
  };

  return TableContentsComponent;

})(React.Component);
