var IdLiteralComponent, MWaterGlobalFiltersComponent, PropTypes, R, React, _, querystring, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

querystring = require('querystring');

ui = require('react-library/lib/bootstrap');

IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent;

module.exports = MWaterGlobalFiltersComponent = (function(superClass) {
  extend(MWaterGlobalFiltersComponent, superClass);

  function MWaterGlobalFiltersComponent() {
    this.handleManagedByChange = bind(this.handleManagedByChange, this);
    this.handleRegionsChange = bind(this.handleRegionsChange, this);
    return MWaterGlobalFiltersComponent.__super__.constructor.apply(this, arguments);
  }

  MWaterGlobalFiltersComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    filterableTables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    globalFilters: PropTypes.array,
    onChange: PropTypes.func.isRequired
  };

  MWaterGlobalFiltersComponent.prototype.handleRegionsChange = function(regions) {
    var globalFilters;
    globalFilters = _.filter(this.props.globalFilters || [], function(gf) {
      return !(gf.op === "within any" && gf.columnId === "admin_region");
    });
    if (regions && regions.length > 0) {
      globalFilters.push({
        columnId: "admin_region",
        columnType: "id",
        op: "within any",
        exprs: [
          {
            type: "literal",
            valueType: "id[]",
            idTable: "admin_regions",
            value: regions
          }
        ]
      });
    }
    return this.props.onChange(globalFilters);
  };

  MWaterGlobalFiltersComponent.prototype.handleManagedByChange = function(managedBy) {
    var globalFilters;
    globalFilters = _.filter(this.props.globalFilters || [], function(gf) {
      return !(gf.op === "within" && gf.columnId === "_managed_by");
    });
    if (managedBy) {
      globalFilters.push({
        columnId: "_managed_by",
        columnType: "id",
        op: "within",
        exprs: [
          {
            type: "literal",
            valueType: "id",
            idTable: "subjects",
            value: "group:" + managedBy
          }
        ]
      });
    }
    return this.props.onChange(globalFilters);
  };

  MWaterGlobalFiltersComponent.prototype.render = function() {
    var adminRegionEntry, adminRegions, managedBy, managedByEntry;
    managedByEntry = _.find(this.props.globalFilters, function(gf) {
      return gf.op === "within" && gf.columnId === "_managed_by";
    });
    if (managedByEntry) {
      managedBy = managedByEntry.exprs[0].value.split(":")[1];
    } else {
      managedBy = null;
    }
    adminRegionEntry = _.find(this.props.globalFilters, function(gf) {
      return gf.op === "within any" && gf.columnId === "admin_region";
    });
    if (adminRegionEntry) {
      adminRegions = adminRegionEntry.exprs[0].value;
    } else {
      adminRegions = null;
    }
    return R('div', null, R(ui.FormGroup, {
      label: "Only sites managed by",
      labelMuted: true
    }, R(IdLiteralComponent, {
      value: managedBy,
      onChange: this.handleManagedByChange,
      idTable: "groups",
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      placeholder: "All Organizations",
      multi: false,
      filter: {
        type: "field",
        tableAlias: "main",
        column: "canManageEntities"
      }
    })), R(ui.FormGroup, {
      label: "Only sites located in",
      labelMuted: true
    }, R(IdLiteralComponent, {
      value: adminRegions,
      onChange: this.handleRegionsChange,
      idTable: "admin_regions",
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      placeholder: "All Regions",
      multi: true,
      orderBy: [
        {
          expr: {
            type: "field",
            tableAlias: "main",
            column: "level"
          },
          direction: "asc"
        }
      ]
    })));
  };

  return MWaterGlobalFiltersComponent;

})(React.Component);
