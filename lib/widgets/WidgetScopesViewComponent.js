var H, React, WidgetScopesViewComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = WidgetScopesViewComponent = (function(superClass) {
  extend(WidgetScopesViewComponent, superClass);

  function WidgetScopesViewComponent() {
    this.renderScope = bind(this.renderScope, this);
    return WidgetScopesViewComponent.__super__.constructor.apply(this, arguments);
  }

  WidgetScopesViewComponent.propTypes = {
    scopes: React.PropTypes.object.isRequired,
    onRemoveScope: React.PropTypes.func.isRequired
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
    return H.div({
      key: id,
      style: style,
      onClick: this.props.onRemoveScope.bind(null, id)
    }, scope.name, " ", H.span({
      className: "glyphicon glyphicon-remove"
    }));
  };

  WidgetScopesViewComponent.prototype.render = function() {
    var scopes;
    scopes = this.props.scopes;
    if (_.compact(_.values(scopes)).length === 0) {
      return null;
    }
    return H.div({
      className: "alert alert-info"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " Filters: ", _.map(_.keys(scopes), (function(_this) {
      return function(id) {
        return _this.renderScope(id, scopes[id]);
      };
    })(this)));
  };

  return WidgetScopesViewComponent;

})(React.Component);
