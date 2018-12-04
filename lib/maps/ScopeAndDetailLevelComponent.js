var DetailLevelSelectComponent, ExprUtils, H, PropTypes, R, React, ReactSelect, RegionSelectComponent, ScopeAndDetailLevelComponent, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprUtils = require('mwater-expressions').ExprUtils;

RegionSelectComponent = require('./RegionSelectComponent');

DetailLevelSelectComponent = require('./DetailLevelSelectComponent');

ReactSelect = require('react-select');

ui = require('react-library/lib/bootstrap');

module.exports = ScopeAndDetailLevelComponent = (function(superClass) {
  extend(ScopeAndDetailLevelComponent, superClass);

  function ScopeAndDetailLevelComponent() {
    this.handleDetailLevelChange = bind(this.handleDetailLevelChange, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    return ScopeAndDetailLevelComponent.__super__.constructor.apply(this, arguments);
  }

  ScopeAndDetailLevelComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    scope: PropTypes.string,
    scopeLevel: PropTypes.number,
    detailLevel: PropTypes.number,
    onScopeAndDetailLevelChange: PropTypes.func.isRequired,
    regionsTable: PropTypes.string.isRequired
  };

  ScopeAndDetailLevelComponent.prototype.handleScopeChange = function(scope, scopeLevel) {
    if (scope) {
      return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1);
    } else {
      return this.props.onScopeAndDetailLevelChange(null, null, 0);
    }
  };

  ScopeAndDetailLevelComponent.prototype.handleDetailLevelChange = function(detailLevel) {
    return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
  };

  ScopeAndDetailLevelComponent.prototype.render = function() {
    var detailLevelOptions, i, level, levelColumn, maxLevel;
    maxLevel = 0;
    detailLevelOptions = [];
    for (level = i = 0; i <= 9; level = ++i) {
      levelColumn = this.props.schema.getColumn(this.props.regionsTable, "level" + level);
      if (levelColumn) {
        maxLevel = level;
        if (level > (this.props.scopeLevel != null ? this.props.scopeLevel : -1)) {
          detailLevelOptions.push({
            value: level,
            label: ExprUtils.localizeString(levelColumn.name)
          });
        }
      }
    }
    return R('div', null, R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Region to Map"), R(RegionSelectComponent, {
      region: this.props.scope,
      onChange: this.handleScopeChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      regionsTable: this.props.regionsTable,
      maxLevel: maxLevel - 1,
      placeholder: "All Regions"
    })), R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Detail Level"), R(ui.Select, {
      value: this.props.detailLevel,
      options: detailLevelOptions,
      onChange: this.handleDetailLevelChange
    })));
  };

  return ScopeAndDetailLevelComponent;

})(React.Component);
