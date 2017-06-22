var AxisBuilder, AxisComponent, CalendarChartDesignerComponent, ExprUtils, FilterExprComponent, H, PropTypes, R, React, TableSelectComponent, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ui = require('../../../UIComponents');

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../../../axes/AxisBuilder');

AxisComponent = require('../../../axes/AxisComponent');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

TableSelectComponent = require('../../../TableSelectComponent');

module.exports = CalendarChartDesignerComponent = (function(superClass) {
  extend(CalendarChartDesignerComponent, superClass);

  function CalendarChartDesignerComponent() {
    this.handleValueAxisChange = bind(this.handleValueAxisChange, this);
    this.handleDateAxisChange = bind(this.handleDateAxisChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleTitleTextChange = bind(this.handleTitleTextChange, this);
    return CalendarChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  CalendarChartDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  CalendarChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  CalendarChartDesignerComponent.prototype.handleTitleTextChange = function(ev) {
    return this.updateDesign({
      titleText: ev.target.value
    });
  };

  CalendarChartDesignerComponent.prototype.handleTableChange = function(table) {
    return this.updateDesign({
      table: table
    });
  };

  CalendarChartDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.updateDesign({
      filter: filter
    });
  };

  CalendarChartDesignerComponent.prototype.handleDateAxisChange = function(dateAxis) {
    var valueAxis;
    if (!this.props.design.valueAxis && dateAxis) {
      valueAxis = {
        expr: {
          type: "op",
          op: "count",
          table: this.props.design.table,
          exprs: []
        },
        xform: null
      };
      return this.updateDesign({
        dateAxis: dateAxis,
        valueAxis: valueAxis
      });
    } else {
      return this.updateDesign({
        dateAxis: dateAxis
      });
    }
  };

  CalendarChartDesignerComponent.prototype.handleValueAxisChange = function(valueAxis) {
    return this.updateDesign({
      valueAxis: valueAxis
    });
  };

  CalendarChartDesignerComponent.prototype.renderTable = function() {
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

  CalendarChartDesignerComponent.prototype.renderTitle = function() {
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

  CalendarChartDesignerComponent.prototype.renderFilter = function() {
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

  CalendarChartDesignerComponent.prototype.renderDateAxis = function() {
    if (!this.props.design.table) {
      return;
    }
    return R(ui.SectionComponent, {
      label: "Date Axis"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["date"],
      aggrNeed: "none",
      required: true,
      value: this.props.design.dateAxis,
      onChange: this.handleDateAxisChange,
      filters: this.props.filter
    }));
  };

  CalendarChartDesignerComponent.prototype.renderValueAxis = function() {
    if (!this.props.design.table || !this.props.design.dateAxis) {
      return;
    }
    return R(ui.SectionComponent, {
      label: "Value Axis"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["number"],
      aggrNeed: "required",
      required: true,
      value: this.props.design.valueAxis,
      onChange: this.handleValueAxisChange,
      filters: this.props.filter
    }));
  };

  CalendarChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderDateAxis(), this.renderValueAxis(), this.renderFilter(), H.hr(), this.renderTitle());
  };

  return CalendarChartDesignerComponent;

})(React.Component);
