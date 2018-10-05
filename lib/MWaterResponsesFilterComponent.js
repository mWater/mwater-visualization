var ExprUtils, MWaterResponsesFilterComponent, PropTypes, R, React, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

ExprUtils = require('mwater-expressions').ExprUtils;

ui = require('react-library/lib/bootstrap');

module.exports = MWaterResponsesFilterComponent = (function(superClass) {
  extend(MWaterResponsesFilterComponent, superClass);

  function MWaterResponsesFilterComponent() {
    this.handleChange = bind(this.handleChange, this);
    this.handleFinalChange = bind(this.handleFinalChange, this);
    this.handleSiteChange = bind(this.handleSiteChange, this);
    return MWaterResponsesFilterComponent.__super__.constructor.apply(this, arguments);
  }

  MWaterResponsesFilterComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    filter: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired
  };

  MWaterResponsesFilterComponent.prototype.getFilters = function() {
    if (!this.props.filter) {
      return [];
    }
    if (this.props.filter.type === "op" && this.props.filter.op === "and") {
      return this.props.filter.exprs;
    }
    return [this.props.filter];
  };

  MWaterResponsesFilterComponent.prototype.setFilters = function(filters) {
    if (filters.length === 0) {
      return this.props.onFilterChange(null);
    } else if (filters.length === 1) {
      return this.props.onFilterChange(filters[0]);
    } else {
      return this.props.onFilterChange({
        type: "op",
        op: "and",
        table: this.props.table,
        exprs: filters
      });
    }
  };

  MWaterResponsesFilterComponent.prototype.getFinalFilter = function() {
    return {
      type: "op",
      op: "= any",
      table: this.props.table,
      exprs: [
        {
          type: "field",
          table: this.props.table,
          column: "status"
        }, {
          type: "literal",
          valueType: "enumset",
          value: ["final"]
        }
      ]
    };
  };

  MWaterResponsesFilterComponent.prototype.isFinal = function() {
    return _.any(this.getFilters(), (function(_this) {
      return function(f) {
        return _.isEqual(f, _this.getFinalFilter()) || (f != null ? f.op : void 0) === "is latest" && _.isEqual(f.exprs[1], _this.getFinalFilter());
      };
    })(this));
  };

  MWaterResponsesFilterComponent.prototype.getSiteValue = function() {
    var column, filters, i, len, ref;
    filters = this.getFilters();
    ref = this.props.schema.getColumns(this.props.table);
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      if (column.type === "join" && column.join.type === "n-1" && column.join.toTable.startsWith("entities.") && column.id.match(/^data:/)) {
        if (_.any(filters, (function(_this) {
          return function(f) {
            return (f != null ? f.op : void 0) === "is latest" && _.isEqual(f.exprs[0], {
              type: "field",
              table: _this.props.table,
              column: column.id
            });
          };
        })(this))) {
          return column.id;
        }
      }
    }
    return null;
  };

  MWaterResponsesFilterComponent.prototype.handleSiteChange = function(site) {
    return this.handleChange(this.isFinal(), site);
  };

  MWaterResponsesFilterComponent.prototype.handleFinalChange = function(final) {
    return this.handleChange(final, this.getSiteValue());
  };

  MWaterResponsesFilterComponent.prototype.handleChange = function(final, site) {
    var filter, filters;
    filters = this.getFilters();
    filters = _.filter(filters, (function(_this) {
      return function(f) {
        return !_.isEqual(f, _this.getFinalFilter());
      };
    })(this));
    filters = _.filter(filters, (function(_this) {
      return function(f) {
        return (f != null ? f.op : void 0) !== "is latest";
      };
    })(this));
    if (site) {
      filter = {
        type: "op",
        op: "is latest",
        table: this.props.table,
        exprs: [
          {
            type: "field",
            table: this.props.table,
            column: site
          }
        ]
      };
      if (final) {
        filter.exprs.push(this.getFinalFilter());
      }
      filters.push(filter);
    } else if (final) {
      filters.push(this.getFinalFilter());
    }
    return this.setFilters(filters);
  };

  MWaterResponsesFilterComponent.prototype.render = function() {
    var siteColumnId, siteColumns;
    siteColumns = _.filter(this.props.schema.getColumns(this.props.table), function(col) {
      return col.type === "join" && col.join.type === "n-1" && col.join.toTable.startsWith("entities.") && col.id.match(/^data:/);
    });
    siteColumnId = this.getSiteValue();
    return R('div', {
      style: {
        paddingLeft: 5,
        paddingTop: 5
      }
    }, R('div', {
      style: {
        paddingBottom: 5
      }
    }, "Data Source Options:"), R('div', {
      style: {
        paddingLeft: 5
      }
    }, siteColumns.length > 0 ? R('div', null, R('i', null, "This data source contains links to monitoring sites. Would you like to:"), R('div', {
      style: {
        paddingLeft: 8
      }
    }, R(ui.Radio, {
      key: "all",
      value: siteColumnId,
      radioValue: null,
      onChange: this.handleSiteChange
    }, "Show all survey responses (even if there are more than one per site)"), _.map(siteColumns, (function(_this) {
      return function(column) {
        var ref;
        return R(ui.Radio, {
          key: column.id,
          value: siteColumnId,
          radioValue: column.id,
          onChange: _this.handleSiteChange
        }, "Show only the latest response for each ", R('i', null, "" + (ExprUtils.localizeString((ref = _this.props.schema.getTable(column.join.toTable)) != null ? ref.name : void 0))), " in the question ", R('i', null, "'" + (ExprUtils.localizeString(column.name)) + "'"));
      };
    })(this)))) : void 0, R(ui.Checkbox, {
      value: this.isFinal(),
      onChange: this.handleFinalChange
    }, "Only include final responses (recommended)")));
  };

  return MWaterResponsesFilterComponent;

})(React.Component);
