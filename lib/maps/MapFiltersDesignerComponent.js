var ExpressionBuilder, H, LogicalExprComponent, MapFiltersDesignerComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

LogicalExprComponent = require('../expressions/LogicalExprComponent');

ExpressionBuilder = require('../expressions/ExpressionBuilder');

module.exports = MapFiltersDesignerComponent = (function(superClass) {
  extend(MapFiltersDesignerComponent, superClass);

  function MapFiltersDesignerComponent() {
    this.renderFilterableTable = bind(this.renderFilterableTable, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    return MapFiltersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapFiltersDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    layerFactory: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapFiltersDesignerComponent.prototype.handleFilterChange = function(table, expr) {
    var design, filters, update;
    expr = new ExpressionBuilder(this.props.schema).cleanExpr(expr, table);
    update = {};
    update[table] = expr;
    filters = _.extend({}, this.props.design.filters, update);
    design = _.extend({}, this.props.design, {
      filters: filters
    });
    return this.props.onDesignChange(design);
  };

  MapFiltersDesignerComponent.prototype.renderFilterableTable = function(table) {
    var name;
    name = this.props.schema.getTable(table).name;
    return H.div({
      key: table
    }, H.h4(null, name), React.createElement(LogicalExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange.bind(null, table),
      table: table,
      value: this.props.design.filters[table]
    }));
  };

  MapFiltersDesignerComponent.prototype.render = function() {
    var filterableTables, i, layer, layerView, len, ref;
    filterableTables = [];
    ref = this.props.design.layerViews;
    for (i = 0, len = ref.length; i < len; i++) {
      layerView = ref[i];
      layer = this.props.layerFactory.createLayer(layerView.type, layerView.design);
      filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables()));
    }
    return H.div({
      style: {
        margin: 5
      }
    }, _.map(filterableTables, this.renderFilterableTable));
  };

  return MapFiltersDesignerComponent;

})(React.Component);
