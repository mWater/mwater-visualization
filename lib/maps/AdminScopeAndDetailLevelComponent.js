var AdminScopeAndDetailLevelComponent, DetailLevelSelectComponent, PropTypes, R, React, ReactSelect, RegionSelectComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

RegionSelectComponent = require('./RegionSelectComponent');

DetailLevelSelectComponent = require('./DetailLevelSelectComponent');

ReactSelect = require('react-select')["default"];

module.exports = AdminScopeAndDetailLevelComponent = (function(superClass) {
  extend(AdminScopeAndDetailLevelComponent, superClass);

  function AdminScopeAndDetailLevelComponent() {
    this.handleDetailLevelChange = bind(this.handleDetailLevelChange, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    return AdminScopeAndDetailLevelComponent.__super__.constructor.apply(this, arguments);
  }

  AdminScopeAndDetailLevelComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    scope: PropTypes.string,
    scopeLevel: PropTypes.number,
    detailLevel: PropTypes.number,
    onScopeAndDetailLevelChange: PropTypes.func.isRequired
  };

  AdminScopeAndDetailLevelComponent.prototype.handleScopeChange = function(scope, scopeLevel) {
    if (scope) {
      return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, null);
    } else {
      return this.props.onScopeAndDetailLevelChange(null, null, 0);
    }
  };

  AdminScopeAndDetailLevelComponent.prototype.handleDetailLevelChange = function(detailLevel) {
    return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
  };

  AdminScopeAndDetailLevelComponent.prototype.render = function() {
    var basicDetailLevelOptions;
    basicDetailLevelOptions = [
      {
        value: 0,
        label: "Countries"
      }, {
        value: 1,
        label: "Level 1 (State/Province/District)"
      }
    ];
    return R('div', null, R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Region to Map"), R(RegionSelectComponent, {
      region: this.props.scope,
      onChange: this.handleScopeChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    })), (this.props.scope != null) && (this.props.detailLevel != null) ? R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Detail Level"), R(DetailLevelSelectComponent, {
      scope: this.props.scope,
      scopeLevel: this.props.scopeLevel,
      detailLevel: this.props.detailLevel,
      onChange: this.handleDetailLevelChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    })) : (this.props.scope == null) && (this.props.detailLevel != null) ? R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Detail Level"), R(ReactSelect, {
      value: _.findWhere(basicDetailLevelOptions, {
        value: this.props.detailLevel
      }),
      options: basicDetailLevelOptions,
      onChange: (function(_this) {
        return function(opt) {
          return _this.handleDetailLevelChange(opt.value);
        };
      })(this)
    })) : void 0);
  };

  return AdminScopeAndDetailLevelComponent;

})(React.Component);
