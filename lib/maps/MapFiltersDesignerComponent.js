var ExprCleaner, ExprUtils, FilterExprComponent, FiltersDesignerComponent, H, MapFiltersDesignerComponent, MapUtils, PopoverHelpComponent, PropTypes, R, React,
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

FiltersDesignerComponent = require('../FiltersDesignerComponent');

MapUtils = require('./MapUtils');

module.exports = MapFiltersDesignerComponent = (function(superClass) {
  extend(MapFiltersDesignerComponent, superClass);

  function MapFiltersDesignerComponent() {
    this.handleFiltersChange = bind(this.handleFiltersChange, this);
    return MapFiltersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapFiltersDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };

  MapFiltersDesignerComponent.prototype.handleFiltersChange = function(filters) {
    var design;
    design = _.extend({}, this.props.design, {
      filters: filters
    });
    return this.props.onDesignChange(design);
  };

  MapFiltersDesignerComponent.prototype.render = function() {
    var filterableTables;
    filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema);
    if (filterableTables.length === 0) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Filters ", R(PopoverHelpComponent, {
      placement: "left"
    }, 'Filters all layers in the map. Individual layers can be filtered by clicking on Customize...')), H.div({
      style: {
        margin: 5
      }
    }, R(FiltersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      filters: this.props.design.filters,
      onFiltersChange: this.handleFiltersChange,
      filterableTables: filterableTables
    })));
  };

  return MapFiltersDesignerComponent;

})(React.Component);
