var AxisBuilder, ExprUtils, H, R, React, TableChartViewComponent, TableContentsComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisBuilder = require('../../../axes/AxisBuilder');

ExprUtils = require('mwater-expressions').ExprUtils;

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
    onScopeChange: React.PropTypes.func,
    onRowClick: React.PropTypes.func
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
      table: this.props.design.table,
      data: this.props.data,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onRowClick: this.props.onRowClick
    }));
  };

  return TableChartViewComponent;

})(React.Component);

TableContentsComponent = (function(superClass) {
  extend(TableContentsComponent, superClass);

  function TableContentsComponent() {
    this.handleRowClick = bind(this.handleRowClick, this);
    return TableContentsComponent.__super__.constructor.apply(this, arguments);
  }

  TableContentsComponent.propTypes = {
    columns: React.PropTypes.array.isRequired,
    data: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    onRowClick: React.PropTypes.func
  };

  TableContentsComponent.contextTypes = {
    locale: React.PropTypes.string
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

  TableContentsComponent.prototype.handleRowClick = function(rowIndex) {
    var row;
    row = this.props.data.main[rowIndex];
    if (row && row.id && row.num_ids === 1 && this.props.onRowClick) {
      return this.props.onRowClick(this.props.table, row.id);
    }
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

  TableContentsComponent.prototype.renderImage = function(id) {
    var url;
    url = this.props.dataSource.getImageUrl(id);
    return H.a({
      href: url,
      key: id,
      target: "_blank",
      style: {
        paddingLeft: 5,
        paddingRight: 5
      }
    }, "Image");
  };

  TableContentsComponent.prototype.renderCell = function(rowIndex, columnIndex) {
    var column, exprType, exprUtils, node, ref, ref1, row, value;
    row = this.props.data.main[rowIndex];
    column = this.props.columns[columnIndex];
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType((ref = column.textAxis) != null ? ref.expr : void 0);
    value = row["c" + columnIndex];
    if (value == null) {
      node = null;
    } else {
      if ((exprType === 'image' || exprType === 'imagelist' || exprType === 'geometry' || exprType === 'text[]') && _.isString(value)) {
        value = JSON.parse(value);
      }
      switch (exprType) {
        case "text":
        case "number":
          node = value;
          break;
        case "boolean":
        case "enum":
        case "enumset":
        case "text[]":
          node = exprUtils.stringifyExprLiteral((ref1 = column.textAxis) != null ? ref1.expr : void 0, value, this.context.locale);
          break;
        case "date":
          node = moment(value, "YYYY-MM-DD").format("ll");
          break;
        case "datetime":
          node = moment(value, moment.ISO_8601).format("lll");
          break;
        case "image":
          node = this.renderImage(value.id);
          break;
        case "imagelist":
          node = _.map(value, (function(_this) {
            return function(v) {
              return _this.renderImage(v.id);
            };
          })(this));
          break;
        case "geometry":
          if (value.type === "Point") {
            node = (value.coordinates[1].toFixed(6)) + " " + (value.coordinates[0].toFixed(6));
          } else {
            node = value.type;
          }
          break;
        default:
          node = "" + value;
      }
    }
    return H.td({
      key: columnIndex
    }, node);
  };

  TableContentsComponent.prototype.renderRow = function(index) {
    return H.tr({
      key: index,
      onClick: this.handleRowClick.bind(null, index)
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
