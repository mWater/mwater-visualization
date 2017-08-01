var BlankTabComponent, H, PropTypes, R, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

module.exports = BlankTabComponent = (function(superClass) {
  extend(BlankTabComponent, superClass);

  function BlankTabComponent() {
    return BlankTabComponent.__super__.constructor.apply(this, arguments);
  }

  BlankTabComponent.prototype.render = function() {
    return H.div(null, H.div({
      style: {
        padding: 10
      }
    }, H.a({
      onClick: ((function(_this) {
        return function() {
          return _this.props.onTabChange({
            id: _this.props.tab.id,
            name: "New Dashboard",
            type: "dashboard",
            design: {
              items: {
                id: "root",
                type: "root",
                blocks: []
              },
              layout: "blocks"
            }
          });
        };
      })(this))
    }, "New Dashboard")), H.div({
      style: {
        padding: 10
      }
    }, H.a({
      onClick: ((function(_this) {
        return function() {
          return _this.props.onTabChange({
            id: _this.props.tab.id,
            name: "New Map",
            type: "map",
            design: {
              baseLayer: "cartodb_positron",
              layerViews: [],
              filters: {},
              bounds: {
                w: -130.60546875,
                n: 65.87472467098549,
                e: 52.55859375,
                s: -56.26776108757582
              }
            }
          });
        };
      })(this))
    }, "New Map")), H.div({
      style: {
        padding: 10
      }
    }, H.a({
      onClick: ((function(_this) {
        return function() {
          return _this.props.onTabChange({
            id: _this.props.tab.id,
            name: "New Datagrid",
            type: "datagrid",
            design: {}
          });
        };
      })(this))
    }, "New Datagrid")));
  };

  return BlankTabComponent;

})(React.Component);
