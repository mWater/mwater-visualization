var ExprUtils, FormsListComponent, H, MWaterTableSelectComponent, OptionListComponent, R, React, ReactSelect, TabbedComponent, ToggleEditComponent, querystring, siteTypes,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

React = require('react');

H = React.DOM;

R = React.createElement;

ReactSelect = require('react-select');

querystring = require('querystring');

TabbedComponent = require('mwater-visualization').TabbedComponent;

ToggleEditComponent = require('mwater-visualization').ToggleEditComponent;

OptionListComponent = require('mwater-visualization').OptionListComponent;

ExprUtils = require("mwater-expressions").ExprUtils;

siteTypes = ["entities.water_point", "entities.household", "entities.sanitation_facility", "entities.community", "entities.school", "entities.health_facility", "entities.surface_water"];

module.exports = MWaterTableSelectComponent = (function(superClass) {
  extend(MWaterTableSelectComponent, superClass);

  function MWaterTableSelectComponent() {
    this.handleChange = bind(this.handleChange, this);
    return MWaterTableSelectComponent.__super__.constructor.apply(this, arguments);
  }

  MWaterTableSelectComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    user: React.PropTypes.string,
    table: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  };

  MWaterTableSelectComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  MWaterTableSelectComponent.prototype.handleChange = function(tableId) {
    this.refs.toggleEdit.close();
    return this.props.onChange(tableId);
  };

  MWaterTableSelectComponent.prototype.renderSites = function() {
    return R(OptionListComponent, {
      items: _.map(siteTypes, (function(_this) {
        return function(tableId) {
          var table;
          table = _this.props.schema.getTable(tableId);
          return {
            name: ExprUtils.localizeString(table.name, _this.context.locale),
            desc: ExprUtils.localizeString(table.desc, _this.context.locale),
            onClick: _this.handleChange.bind(null, table.id)
          };
        };
      })(this))
    });
  };

  MWaterTableSelectComponent.prototype.renderForms = function() {
    return R(FormsListComponent, {
      schema: this.props.schema,
      client: this.props.client,
      apiUrl: this.props.apiUrl,
      user: this.props.user,
      onChange: this.handleChange
    });
  };

  MWaterTableSelectComponent.prototype.renderOther = function() {
    var otherTables;
    otherTables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        var ref;
        return (ref = table.id, indexOf.call(siteTypes, ref) < 0) && !table.id.match(/^responses:/);
      };
    })(this));
    otherTables = _.sortBy(otherTables, "name");
    return R(OptionListComponent, {
      items: _.map(otherTables, (function(_this) {
        return function(table) {
          return {
            name: ExprUtils.localizeString(table.name, _this.context.locale),
            desc: ExprUtils.localizeString(table.desc, _this.context.locale),
            onClick: _this.handleChange.bind(null, table.id)
          };
        };
      })(this))
    });
  };

  MWaterTableSelectComponent.prototype.render = function() {
    var editor;
    editor = R(TabbedComponent, {
      tabs: [
        {
          id: "sites",
          label: "Sites",
          elem: this.renderSites()
        }, {
          id: "forms",
          label: "Forms",
          elem: this.renderForms()
        }, {
          id: "other",
          label: "Other",
          elem: this.renderOther()
        }
      ],
      initialTabId: "sites"
    });
    return R(ToggleEditComponent, {
      ref: "toggleEdit",
      forceOpen: !this.props.table,
      label: this.props.table ? ExprUtils.localizeString(this.props.schema.getTable(this.props.table).name, this.context.locale) : void 0,
      editor: editor
    });
  };

  return MWaterTableSelectComponent;

})(React.Component);

FormsListComponent = (function(superClass) {
  extend(FormsListComponent, superClass);

  FormsListComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    user: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  };

  FormsListComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function FormsListComponent() {
    this.searchRef = bind(this.searchRef, this);
    FormsListComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      forms: null,
      search: ""
    };
  }

  FormsListComponent.prototype.componentDidMount = function() {
    var query;
    query = {};
    query.fields = JSON.stringify({
      "design.name": 1,
      roles: 1,
      created: 1,
      modified: 1,
      state: 1
    });
    query.selector = JSON.stringify({
      design: {
        $exists: true
      },
      state: {
        $ne: "deleted"
      }
    });
    query.client = this.props.client;
    return $.getJSON(this.props.apiUrl + "forms?" + querystring.stringify(query), (function(_this) {
      return function(forms) {
        forms = _.sortByOrder(forms, [
          function(form) {
            if (form.created.by === _this.props.user) {
              return 1;
            } else {
              return 0;
            }
          }, function(form) {
            return form.modified.on;
          }
        ], ['desc', 'desc']);
        return _this.setState({
          forms: _.map(forms, function(form) {
            return {
              id: "responses:" + form._id,
              name: ExprUtils.localizeString(form.design.name, _this.context.locale),
              desc: "Created by " + form.created.by
            };
          })
        });
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        return _this.setState({
          error: xhr.responseText
        });
      };
    })(this));
  };

  FormsListComponent.prototype.searchRef = function(comp) {
    if (comp) {
      return comp.focus();
    }
  };

  FormsListComponent.prototype.render = function() {
    var escapeRegExp, forms, searchStringRegExp;
    if (this.state.error) {
      return H.div({
        className: "alert alert-danger"
      }, this.state.error);
    }
    if (!this.state.forms) {
      return H.div({
        className: "alert alert-info"
      }, "Loading...");
    }
    if (this.state.search) {
      escapeRegExp = function(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      };
      searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i");
      forms = _.filter(this.state.forms, (function(_this) {
        return function(form) {
          return form.name.match(searchStringRegExp);
        };
      })(this));
    } else {
      forms = this.state.forms;
    }
    return H.div(null, H.input({
      type: "text",
      className: "form-control input-sm",
      placeholder: "Search...",
      key: "search",
      ref: this.searchRef,
      style: {
        maxWidth: "20em",
        marginBottom: 10
      },
      value: this.state.search,
      onChange: (function(_this) {
        return function(ev) {
          return _this.setState({
            search: ev.target.value
          });
        };
      })(this)
    }), R(OptionListComponent, {
      items: _.map(forms, (function(_this) {
        return function(form) {
          return {
            name: form.name,
            desc: form.desc,
            onClick: _this.props.onChange.bind(null, form.id)
          };
        };
      })(this))
    }));
  };

  return FormsListComponent;

})(React.Component);
