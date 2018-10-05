var PropTypes, R, React, TabbedComponent, TabbedDashboard, _, jsyaml, visualization,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

visualization = require('./index');

jsyaml = require('js-yaml');

TabbedComponent = require('react-library/lib/TabbedComponent');

React = require('react');

R = React.createElement;

exports.loadDashboard = function(options) {
  return $.get(options.schemaUrl, function(schemaYaml) {
    var dataSource, schema, schemaJson, widgetFactory;
    schema = new visualization.Schema();
    schemaJson = jsyaml.safeLoad(schemaYaml);
    schema.loadFromJSON(schemaJson);
    dataSource = new visualization.CachingDataSource({
      perform: function(query, cb) {
        var url;
        url = options.queryUrl.replace(/\{query\}/, encodeURIComponent(JSON.stringify(query)));
        return $.getJSON(url, function(rows) {
          return cb(null, rows);
        }).fail(function(xhr) {
          console.error(xhr.responseText);
          return cb(new Error(xhr.responseText));
        });
      }
    });
    widgetFactory = new visualization.WidgetFactory({
      schema: schema,
      dataSource: dataSource
    });
    return $.get(options.loadDesignUrl, function(designString) {
      var design, render, updateDesign;
      if (designString) {
        design = JSON.parse(designString);
      } else {
        design = options.design;
      }
      if (!design.tabs) {
        design = {
          tabs: [
            {
              name: "Main",
              design: design
            }
          ]
        };
      }
      updateDesign = function(newDesign) {
        design = newDesign;
        $.post(options.saveDesignUrl, {
          userdata: JSON.stringify(design)
        });
        return render();
      };
      render = function() {
        var elem;
        elem = R(TabbedDashboard, {
          design: design,
          widgetFactory: widgetFactory,
          onDesignChange: updateDesign
        });
        return ReactDOM.render(elem, document.getElementById(options.elemId));
      };
      return render();
    });
  });
};

TabbedDashboard = (function(superClass) {
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
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    widgetFactory: PropTypes.object.isRequired
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
      elem: R(visualization.DashboardComponent, {
        design: tab.design,
        widgetFactory: this.props.widgetFactory,
        onDesignChange: this.handleDesignChange.bind(null, index),
        extraTitleButtonsElem: [
          R('a', {
            key: "renametab",
            className: "btn btn-link btn-sm",
            onClick: this.handleRenameTab.bind(null, index)
          }, R('span', {
            className: "glyphicon glyphicon-pencil"
          }), " Rename Tab"), " ", R('a', {
            key: "removetab",
            className: "btn btn-link btn-sm",
            onClick: this.handleRemoveTab.bind(null, index)
          }, R('span', {
            className: "glyphicon glyphicon-remove"
          }), " Remove Tab")
        ]
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
      onAddTab: this.handleAddTab
    });
  };

  return TabbedDashboard;

})(React.Component);
