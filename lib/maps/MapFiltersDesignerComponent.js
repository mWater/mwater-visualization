var ExprCleaner, ExprUtils, FilterExprComponent, FiltersDesignerComponent, MapFiltersDesignerComponent, MapUtils, PopoverHelpComponent, PropTypes, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

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
    this.handleGlobalFiltersChange = bind(this.handleGlobalFiltersChange, this);
    this.handleFiltersChange = bind(this.handleFiltersChange, this);
    return MapFiltersDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapFiltersDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };

  MapFiltersDesignerComponent.contextTypes = {
    globalFiltersElementFactory: PropTypes.func
  };

  MapFiltersDesignerComponent.prototype.handleFiltersChange = function(filters) {
    var design;
    design = _.extend({}, this.props.design, {
      filters: filters
    });
    return this.props.onDesignChange(design);
  };

  MapFiltersDesignerComponent.prototype.handleGlobalFiltersChange = function(globalFilters) {
    var design;
    design = _.extend({}, this.props.design, {
      globalFilters: globalFilters
    });
    return this.props.onDesignChange(design);
  };

  MapFiltersDesignerComponent.prototype.render = function() {
    var filterableTables;
    filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema);
    if (filterableTables.length === 0) {
      return null;
    }
    return R('div', null, R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Filters ", R(PopoverHelpComponent, {
      placement: "left"
    }, 'Filters all layers in the map. Individual layers can be filtered by clicking on Customize...')), R('div', {
      style: {
        margin: 5
      }
    }, R(FiltersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      filters: this.props.design.filters,
      onFiltersChange: this.handleFiltersChange,
      filterableTables: filterableTables
    }))), this.context.globalFiltersElementFactory ? R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Global Filters "), R('div', {
      style: {
        margin: 5
      }
    }, this.context.globalFiltersElementFactory({
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      filterableTables: filterableTables,
      globalFilters: this.props.design.globalFilters || [],
      onChange: this.handleGlobalFiltersChange
    }))) : void 0);
  };

  return MapFiltersDesignerComponent;

})(React.Component);
