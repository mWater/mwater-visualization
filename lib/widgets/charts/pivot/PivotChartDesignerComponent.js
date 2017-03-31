var AxisComponent, FilterExprComponent, H, PivotChartDesignerComponent, R, React, TableSelectComponent, ui, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('uuid');

ui = require('react-library/lib/bootstrap');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

TableSelectComponent = require('../../../TableSelectComponent');

AxisComponent = require('../../../axes/AxisComponent');

module.exports = PivotChartDesignerComponent = (function(superClass) {
  extend(PivotChartDesignerComponent, superClass);

  PivotChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  function PivotChartDesignerComponent(props) {
    this.handleIntersectionValueAxisChange = bind(this.handleIntersectionValueAxisChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleRowChange = bind(this.handleRowChange, this);
    this.handleColumnChange = bind(this.handleColumnChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    PivotChartDesignerComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      isNew: !props.design.table
    };
  }

  PivotChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  PivotChartDesignerComponent.prototype.handleTableChange = function(table) {
    var column, intersections, row;
    row = {
      id: uuid(),
      label: ""
    };
    column = {
      id: uuid(),
      label: ""
    };
    intersections = {};
    intersections[row.id + ":" + column.id] = {
      valueAxis: {
        expr: {
          type: "op",
          op: "count",
          table: table,
          exprs: []
        }
      }
    };
    return this.updateDesign({
      table: table,
      rows: [row],
      columns: [column],
      intersections: intersections
    });
  };

  PivotChartDesignerComponent.prototype.handleColumnChange = function(axis) {
    return this.updateDesign({
      columns: [
        _.extend({}, this.props.design.columns[0], {
          valueAxis: axis
        })
      ]
    });
  };

  PivotChartDesignerComponent.prototype.handleRowChange = function(axis) {
    return this.updateDesign({
      rows: [
        _.extend({}, this.props.design.rows[0], {
          valueAxis: axis
        })
      ]
    });
  };

  PivotChartDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.updateDesign({
      filter: filter
    });
  };

  PivotChartDesignerComponent.prototype.handleIntersectionValueAxisChange = function(valueAxis) {
    var intersectionId, intersections;
    intersectionId = this.props.design.rows[0].id + ":" + this.props.design.columns[0].id;
    intersections = {};
    intersections[intersectionId] = {
      valueAxis: valueAxis
    };
    return this.updateDesign({
      intersections: intersections
    });
  };

  PivotChartDesignerComponent.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }));
  };

  PivotChartDesignerComponent.prototype.renderFilter = function() {
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
    }, R(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  PivotChartDesignerComponent.prototype.renderStriping = function() {
    if (!this.props.design.table) {
      return null;
    }
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Striping"
    }, H.label({
      key: "none",
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: !this.props.design.striping,
      onClick: (function(_this) {
        return function() {
          return _this.updateDesign({
            striping: null
          });
        };
      })(this)
    }), "None"), H.label({
      key: "columns",
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: this.props.design.striping === "columns",
      onClick: (function(_this) {
        return function() {
          return _this.updateDesign({
            striping: "columns"
          });
        };
      })(this)
    }), "Columns"), H.label({
      key: "rows",
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: this.props.design.striping === "rows",
      onClick: (function(_this) {
        return function() {
          return _this.updateDesign({
            striping: "rows"
          });
        };
      })(this)
    }), "Rows"));
  };

  PivotChartDesignerComponent.prototype.renderSetup = function() {
    var intersectionId;
    intersectionId = this.props.design.rows[0].id + ":" + this.props.design.columns[0].id;
    return H.div(null, R(ui.FormGroup, {
      labelMuted: true,
      label: "Columns",
      help: "Field to optionally make columns out of"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["enum", "text", "boolean", "date"],
      aggrNeed: "none",
      value: this.props.design.columns[0].valueAxis,
      onChange: this.handleColumnChange
    })), R(ui.FormGroup, {
      labelMuted: true,
      label: "Rows",
      help: "Field to optionally make rows out of"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["enum", "text", "boolean", "date"],
      aggrNeed: "none",
      value: this.props.design.rows[0].valueAxis,
      onChange: this.handleRowChange
    })), R(ui.FormGroup, {
      labelMuted: true,
      label: "Value",
      help: "Field show in cells"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["enum", "text", "boolean", "date", "number"],
      aggrNeed: "required",
      value: this.props.design.intersections[intersectionId].valueAxis,
      onChange: (function(_this) {
        return function(axis) {
          return _this.handleIntersectionAxisUpdate;
        };
      })(this),
      showFormat: true
    })));
  };

  PivotChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.state.isNew && this.props.design.table ? this.renderSetup() : void 0, this.renderFilter(), this.renderStriping());
  };

  return PivotChartDesignerComponent;

})(React.Component);
