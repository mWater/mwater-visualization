var AxisBuilder, ExprComponent, ExprUtils, FilterExprComponent, H, LinkComponent, OrderingsComponent, React, TableChartColumnDesignerComponent, TableChartDesignerComponent, TableSelectComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('./../../axes/AxisBuilder');

LinkComponent = require('mwater-expressions-ui').LinkComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

OrderingsComponent = require('./OrderingsComponent');

TableSelectComponent = require('../../TableSelectComponent');

module.exports = TableChartDesignerComponent = (function(superClass) {
  extend(TableChartDesignerComponent, superClass);

  function TableChartDesignerComponent() {
    this.handleAddColumn = bind(this.handleAddColumn, this);
    this.handleRemoveColumn = bind(this.handleRemoveColumn, this);
    this.handleColumnChange = bind(this.handleColumnChange, this);
    this.handleOrderingsChange = bind(this.handleOrderingsChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleTitleTextChange = bind(this.handleTitleTextChange, this);
    return TableChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  TableChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  TableChartDesignerComponent.prototype.handleTitleTextChange = function(ev) {
    return this.updateDesign({
      titleText: ev.target.value
    });
  };

  TableChartDesignerComponent.prototype.handleTableChange = function(table) {
    return this.updateDesign({
      table: table
    });
  };

  TableChartDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.updateDesign({
      filter: filter
    });
  };

  TableChartDesignerComponent.prototype.handleOrderingsChange = function(orderings) {
    return this.updateDesign({
      orderings: orderings
    });
  };

  TableChartDesignerComponent.prototype.handleColumnChange = function(index, column) {
    var columns;
    columns = this.props.design.columns.slice();
    columns[index] = column;
    return this.updateDesign({
      columns: columns
    });
  };

  TableChartDesignerComponent.prototype.handleRemoveColumn = function(index) {
    var columns;
    columns = this.props.design.columns.slice();
    columns.splice(index, 1);
    return this.updateDesign({
      columns: columns
    });
  };

  TableChartDesignerComponent.prototype.handleAddColumn = function() {
    var columns;
    columns = this.props.design.columns.slice();
    columns.push({});
    return this.updateDesign({
      columns: columns
    });
  };

  TableChartDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", React.createElement(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }));
  };

  TableChartDesignerComponent.prototype.renderTitle = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Title"), H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.design.titleText,
      onChange: this.handleTitleTextChange,
      placeholder: "Untitled"
    }));
  };

  TableChartDesignerComponent.prototype.renderColumn = function(index) {
    var style;
    style = {
      borderTop: "solid 1px #EEE",
      paddingTop: 10,
      paddingBottom: 10
    };
    return H.div({
      key: index,
      style: style
    }, React.createElement(TableChartColumnDesignerComponent, {
      design: this.props.design,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      index: index,
      onChange: this.handleColumnChange.bind(null, index),
      onRemove: this.handleRemoveColumn.bind(null, index)
    }));
  };

  TableChartDesignerComponent.prototype.renderColumns = function() {
    if (!this.props.design.table) {
      return;
    }
    return H.div({
      className: "form-group"
    }, _.map(this.props.design.columns, (function(_this) {
      return function(column, i) {
        return _this.renderColumn(i);
      };
    })(this)), H.button({
      className: "btn btn-default btn-sm",
      type: "button",
      onClick: this.handleAddColumn
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Column"));
  };

  TableChartDesignerComponent.prototype.renderOrderings = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-sort-by-attributes"
    }), " ", "Ordering"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(OrderingsComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      orderings: this.props.design.orderings,
      onOrderingsChange: this.handleOrderingsChange,
      table: this.props.design.table
    })));
  };

  TableChartDesignerComponent.prototype.renderFilter = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " ", "Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  TableChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderColumns(), this.props.design.table ? H.hr() : void 0, this.renderOrderings(), this.renderFilter(), H.hr(), this.renderTitle());
  };

  return TableChartDesignerComponent;

})(React.Component);

TableChartColumnDesignerComponent = (function(superClass) {
  extend(TableChartColumnDesignerComponent, superClass);

  function TableChartColumnDesignerComponent() {
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleHeaderTextChange = bind(this.handleHeaderTextChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return TableChartColumnDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  TableChartColumnDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  };

  TableChartColumnDesignerComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  TableChartColumnDesignerComponent.prototype.updateColumn = function(changes) {
    var column;
    column = _.extend({}, this.props.design.columns[this.props.index], changes);
    return this.props.onChange(column);
  };

  TableChartColumnDesignerComponent.prototype.updateTextAxis = function(changes) {
    var textAxis;
    textAxis = _.extend({}, this.props.design.columns[this.props.index].textAxis, changes);
    return this.updateColumn({
      textAxis: textAxis
    });
  };

  TableChartColumnDesignerComponent.prototype.handleExprChange = function(expr) {
    return this.updateTextAxis({
      expr: expr
    });
  };

  TableChartColumnDesignerComponent.prototype.handleHeaderTextChange = function(ev) {
    return this.updateColumn({
      headerText: ev.target.value
    });
  };

  TableChartColumnDesignerComponent.prototype.handleAggrChange = function(aggr) {
    return this.updateTextAxis({
      aggr: aggr
    });
  };

  TableChartColumnDesignerComponent.prototype.renderRemove = function() {
    if (this.props.design.columns.length > 1) {
      return H.button({
        className: "btn btn-xs btn-link pull-right",
        type: "button",
        onClick: this.props.onRemove
      }, H.span({
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  TableChartColumnDesignerComponent.prototype.renderExpr = function() {
    var column, title;
    column = this.props.design.columns[this.props.index];
    title = "Value";
    return H.div(null, H.label({
      className: "text-muted"
    }, title), ": ", React.createElement(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      value: column.textAxis ? column.textAxis.expr : void 0,
      onChange: this.handleExprChange,
      aggrStatuses: ["literal", "individual", "aggregate"]
    }));
  };

  TableChartColumnDesignerComponent.prototype.renderHeader = function() {
    var axisBuilder, column, placeholder;
    column = this.props.design.columns[this.props.index];
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    placeholder = axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
    return H.div(null, H.label({
      className: "text-muted"
    }, "Header"), ": ", H.input({
      type: "text",
      className: "form-control input-sm",
      style: {
        display: "inline-block",
        width: "15em"
      },
      value: column.headerText,
      onChange: this.handleHeaderTextChange,
      placeholder: placeholder
    }));
  };

  TableChartColumnDesignerComponent.prototype.renderAggr = function() {
    var aggrs, column, currentAggr, exprUtils;
    column = this.props.design.columns[this.props.index];
    exprUtils = new ExprUtils(this.props.schema);
    if (!column.textAxis || exprUtils.getExprType(column.textAxis.expr) === "count") {
      return;
    }
    aggrs = exprUtils.getAggrs(column.textAxis.expr);
    aggrs = _.filter(aggrs, function(aggr) {
      return aggr.id !== "last";
    });
    aggrs = [
      {
        id: null,
        name: "None"
      }
    ].concat(aggrs);
    currentAggr = _.findWhere(aggrs, {
      id: column.textAxis.aggr
    });
    return H.div(null, H.label({
      className: "text-muted"
    }, "Summarize"), ": ", React.createElement(LinkComponent, {
      dropdownItems: aggrs,
      onDropdownItemClicked: this.handleAggrChange
    }, currentAggr ? currentAggr.name : "None"));
  };

  TableChartColumnDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderRemove(), H.label(null, "Column " + (this.props.index + 1)), H.div({
      style: {
        marginLeft: 5
      }
    }, this.renderExpr(), this.renderHeader(), this.renderAggr()));
  };

  return TableChartColumnDesignerComponent;

})(React.Component);
