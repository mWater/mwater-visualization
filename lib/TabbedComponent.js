var H, React, TabbedComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = TabbedComponent = (function(superClass) {
  extend(TabbedComponent, superClass);

  TabbedComponent.propTypes = {
    tabs: React.PropTypes.array.isRequired,
    initialTabId: React.PropTypes.string,
    onAddTab: React.PropTypes.func
  };

  function TabbedComponent() {
    this.renderTab = bind(this.renderTab, this);
    this.handleClick = bind(this.handleClick, this);
    TabbedComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      tabId: this.props.initialTabId
    };
  }

  TabbedComponent.prototype.handleClick = function(tabId) {
    return this.setState({
      tabId: tabId
    });
  };

  TabbedComponent.prototype.renderTab = function(tab) {
    return H.li({
      key: tab.id,
      className: (this.state.tabId === tab.id ? "active" : void 0)
    }, H.a({
      onClick: this.handleClick.bind(null, tab.id)
    }, tab.label));
  };

  TabbedComponent.prototype.render = function() {
    var currentTab;
    currentTab = _.findWhere(this.props.tabs, {
      id: this.state.tabId
    });
    return H.div(null, H.ul({
      key: "tabs",
      className: "nav nav-tabs",
      style: {
        marginBottom: 10
      }
    }, _.map(this.props.tabs, this.renderTab), this.props.onAddTab ? H.li({
      key: "_add"
    }, H.a({
      onClick: this.props.onAddTab
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }))) : void 0), H.div({
      key: "currentTab"
    }, currentTab ? currentTab.elem : void 0));
  };

  return TabbedComponent;

})(React.Component);
