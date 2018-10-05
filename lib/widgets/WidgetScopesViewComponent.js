var PropTypes, R, React, WidgetScopesViewComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

module.exports = WidgetScopesViewComponent = (function(superClass) {
  extend(WidgetScopesViewComponent, superClass);

  function WidgetScopesViewComponent() {
    this.renderScope = bind(this.renderScope, this);
    return WidgetScopesViewComponent.__super__.constructor.apply(this, arguments);
  }

  WidgetScopesViewComponent.propTypes = {
    scopes: PropTypes.object.isRequired,
    onRemoveScope: PropTypes.func.isRequired
  };

  WidgetScopesViewComponent.prototype.renderScope = function(id, scope) {
    var style;
    style = {
      cursor: "pointer",
      borderRadius: 4,
      border: "solid 1px #BBB",
      padding: "1px 5px 1px 5px",
      color: "#666",
      backgroundColor: "#EEE",
      display: "inline-block",
      marginLeft: 4,
      marginRight: 4
    };
    if (!scope) {
      return null;
    }
    return R('div', {
      key: id,
      style: style,
      onClick: this.props.onRemoveScope.bind(null, id)
    }, scope.name, " ", R('span', {
      className: "glyphicon glyphicon-remove"
    }));
  };

  WidgetScopesViewComponent.prototype.render = function() {
    var scopes;
    scopes = this.props.scopes;
    if (_.compact(_.values(scopes)).length === 0) {
      return null;
    }
    return R('div', {
      className: "alert alert-info"
    }, R('span', {
      className: "glyphicon glyphicon-filter"
    }), " Filters: ", _.map(_.keys(scopes), (function(_this) {
      return function(id) {
        return _this.renderScope(id, scopes[id]);
      };
    })(this)));
  };

  return WidgetScopesViewComponent;

})(React.Component);
