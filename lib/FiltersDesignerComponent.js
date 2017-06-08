var ExprCleaner, ExprUtils, FilterExprComponent, FiltersDesignerComponent, H, PopoverHelpComponent, PropTypes, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

PopoverHelpComponent = require('react-library/lib/PopoverHelpComponent');

module.exports = FiltersDesignerComponent = (function(superClass) {
  extend(FiltersDesignerComponent, superClass);

  function FiltersDesignerComponent() {
    this.renderFilterableTable = bind(this.renderFilterableTable, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    return FiltersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  FiltersDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    filterableTables: PropTypes.arrayOf(PropTypes.string),
    filters: PropTypes.object,
    onFiltersChange: PropTypes.func.isRequired
  };

  FiltersDesignerComponent.contextTypes = {
    locale: PropTypes.string
  };

  FiltersDesignerComponent.prototype.handleFilterChange = function(table, expr) {
    var filters;
    expr = new ExprCleaner(this.props.schema).cleanExpr(expr, {
      table: table
    });
    filters = _.clone(this.props.filters || {});
    filters[table] = expr;
    return this.props.onFiltersChange(filters);
  };

  FiltersDesignerComponent.prototype.renderFilterableTable = function(table) {
    var name, ref;
    name = ExprUtils.localizeString(this.props.schema.getTable(table).name, this.context.locale);
    return H.div({
      key: table
    }, H.label(null, name), React.createElement(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange.bind(null, table),
      table: table,
      value: (ref = this.props.filters) != null ? ref[table] : void 0
    }));
  };

  FiltersDesignerComponent.prototype.render = function() {
    return H.div(null, _.map(this.props.filterableTables, this.renderFilterableTable));
  };

  return FiltersDesignerComponent;

})(React.Component);
