var FilterExprComponent, H, PivotChartDesignerComponent, R, React, TableSelectComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

TableSelectComponent = require('../../../TableSelectComponent');

module.exports = PivotChartDesignerComponent = (function(superClass) {
  extend(PivotChartDesignerComponent, superClass);

  function PivotChartDesignerComponent() {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return PivotChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  PivotChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  PivotChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  PivotChartDesignerComponent.prototype.handleTableChange = function(table) {
    return this.updateDesign({
      table: table
    });
  };

  PivotChartDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.updateDesign({
      filter: filter
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

  PivotChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderFilter(), this.props.design.table && ((this.props.design.rows[0].label == null) && (this.props.design.rows[0].valueAxis == null) || (this.props.design.columns[0].label == null) && (this.props.design.columns[0].valueAxis == null)) ? H.div({
      className: "alert alert-success"
    }, H.i({
      className: "fa fa-check"
    }), ' Your pivot table is ready to configure! Click on the Save button below and\nthen click on the rows, columns or the data areas to set up the table. ', H.br(), H.br(), 'For advanced options, click on the pencil menu that appears when you hover over a section. ') : void 0);
  };

  return PivotChartDesignerComponent;

})(React.Component);
