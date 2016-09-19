var AdminScopeAndDetailLevelComponent, DetailLevelSelectComponent, H, R, React, RegionSelectComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

RegionSelectComponent = require('./RegionSelectComponent');

DetailLevelSelectComponent = require('./DetailLevelSelectComponent');

module.exports = AdminScopeAndDetailLevelComponent = (function(superClass) {
  extend(AdminScopeAndDetailLevelComponent, superClass);

  function AdminScopeAndDetailLevelComponent() {
    this.handleDetailLevelChange = bind(this.handleDetailLevelChange, this);
    this.handleScopeChange = bind(this.handleScopeChange, this);
    return AdminScopeAndDetailLevelComponent.__super__.constructor.apply(this, arguments);
  }

  AdminScopeAndDetailLevelComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    scope: React.PropTypes.string,
    scopeLevel: React.PropTypes.number,
    detailLevel: React.PropTypes.number,
    onScopeAndDetailLevelChange: React.PropTypes.func.isRequired
  };

  AdminScopeAndDetailLevelComponent.prototype.handleScopeChange = function(scope, scopeLevel) {
    if (scope) {
      return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1);
    } else {
      return this.props.onScopeAndDetailLevelChange(null, null, 0);
    }
  };

  AdminScopeAndDetailLevelComponent.prototype.handleDetailLevelChange = function(detailLevel) {
    return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
  };

  AdminScopeAndDetailLevelComponent.prototype.render = function() {
    return H.div(null, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Region to Map"), R(RegionSelectComponent, {
      region: this.props.scope,
      onChange: this.handleScopeChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    })), (this.props.scope != null) && (this.props.detailLevel != null) ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Detail Level"), R(DetailLevelSelectComponent, {
      scope: this.props.scope,
      scopeLevel: this.props.scopeLevel,
      detailLevel: this.props.detailLevel,
      onChange: this.handleDetailLevelChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    })) : void 0);
  };

  return AdminScopeAndDetailLevelComponent;

})(React.Component);
