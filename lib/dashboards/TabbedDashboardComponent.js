var DashboardComponent, H, R, React, TabbedComponent, TabbedDashboard, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

DashboardComponent = require('./DashboardComponent');

TabbedComponent = require('react-library/lib/TabbedComponent');

module.exports = TabbedDashboard = (function(superClass) {
  extend(TabbedDashboard, superClass);

  function TabbedDashboard() {
    this.createTab = bind(this.createTab, this);
    this.handleRenameTab = bind(this.handleRenameTab, this);
    this.handleRemoveTab = bind(this.handleRemoveTab, this);
    this.handleAddTab = bind(this.handleAddTab, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    return TabbedDashboard.__super__.constructor.apply(this, arguments);
  }

  TabbedDashboard.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  TabbedDashboard.prototype.handleDesignChange = function(index, design) {
    var tabs;
    tabs = this.props.design.tabs.slice();
    tabs[index] = _.extend({}, tabs[index], {
      design: design
    });
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
  };

  TabbedDashboard.prototype.handleAddTab = function() {
    var tabs;
    tabs = this.props.design.tabs.slice();
    tabs.push({
      name: "Untitled",
      design: {
        items: {}
      }
    });
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
  };

  TabbedDashboard.prototype.handleRemoveTab = function(index) {
    var tabs;
    if (!confirm("Permanently remove this tab? This cannot be undone!")) {
      return;
    }
    tabs = this.props.design.tabs.slice();
    tabs.splice(index, 1);
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
  };

  TabbedDashboard.prototype.handleRenameTab = function(index) {
    var name, tabs;
    name = this.props.design.tabs[index].name;
    name = prompt("Name of tab", name);
    if (name) {
      tabs = this.props.design.tabs.slice();
      tabs[index] = _.extend({}, tabs[index], {
        name: name
      });
      return this.props.onDesignChange(_.extend({}, this.props.design, {
        tabs: tabs
      }));
    }
  };

  TabbedDashboard.prototype.createTab = function(tab, index) {
    return {
      id: "" + index,
      label: tab.name,
      elem: R(DashboardComponent, {
        design: tab.design,
        onDesignChange: this.props.onDesignChange ? this.handleDesignChange.bind(null, index) : void 0,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        dashboardDataSource: new DirectDashboardDataSource({
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: tab.design,
          apiUrl: this.props.apiUrl,
          client: this.props.client
        }),
        extraTitleButtonsElem: this.props.onDesignChange ? [
          H.a({
            key: "renametab",
            className: "btn btn-link btn-sm",
            onClick: this.handleRenameTab.bind(null, index)
          }, H.span({
            className: "glyphicon glyphicon-pencil"
          }), " Rename Tab"), " ", H.a({
            key: "removetab",
            className: "btn btn-link btn-sm",
            onClick: this.handleRemoveTab.bind(null, index)
          }, H.span({
            className: "glyphicon glyphicon-remove"
          }), " Remove Tab")
        ] : void 0
      })
    };
  };

  TabbedDashboard.prototype.createTabs = function() {
    return _.map(this.props.design.tabs, this.createTab);
  };

  TabbedDashboard.prototype.render = function() {
    return R(TabbedComponent, {
      tabs: this.createTabs(),
      initialTabId: "0",
      onAddTab: this.props.onDesignChange ? this.handleAddTab : void 0
    });
  };

  return TabbedDashboard;

})(React.Component);
