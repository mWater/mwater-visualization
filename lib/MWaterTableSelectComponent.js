var ExprUtils, FormsListComponent, H, MWaterTableSelectComponent, OptionListComponent, R, React, TabbedComponent, ToggleEditComponent, querystring, siteTypes,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

React = require('react');

H = React.DOM;

R = React.createElement;

querystring = require('querystring');

TabbedComponent = require('react-library/lib/TabbedComponent');

ToggleEditComponent = require('mwater-visualization').ToggleEditComponent;

OptionListComponent = require('mwater-visualization').OptionListComponent;

ExprUtils = require("mwater-expressions").ExprUtils;

siteTypes = ["entities.water_point", "entities.household", "entities.sanitation_facility", "entities.community", "entities.school", "entities.health_facility", "entities.surface_water"];

module.exports = MWaterTableSelectComponent = (function(superClass) {
  extend(MWaterTableSelectComponent, superClass);

  MWaterTableSelectComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    user: React.PropTypes.string,
    table: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    extraTables: React.PropTypes.array.isRequired,
    onExtraTablesChange: React.PropTypes.func.isRequired
  };

  MWaterTableSelectComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function MWaterTableSelectComponent() {
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleChange = bind(this.handleChange, this);
    MWaterTableSelectComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      pendingExtraTable: null
    };
  }

  MWaterTableSelectComponent.prototype.componentWillReceiveProps = function(nextProps) {
    var table;
    if (this.state.pendingExtraTable) {
      table = this.state.pendingExtraTable;
      if (nextProps.schema.getTable(table)) {
        this.setState({
          pendingExtraTable: null
        });
        this.refs.toggleEdit.close();
        return nextProps.onChange(table);
      }
    }
  };

  MWaterTableSelectComponent.prototype.handleChange = function(tableId) {
    this.refs.toggleEdit.close();
    return this.props.onChange(tableId);
  };

  MWaterTableSelectComponent.prototype.handleTableChange = function(tableId) {
    if (!this.props.schema.getTable(tableId)) {
      return this.setState({
        pendingExtraTable: tableId
      }, (function(_this) {
        return function() {
          return _this.props.onExtraTablesChange(_.union(_this.props.extraTables, [tableId]));
        };
      })(this));
    } else {
      return this.handleChange(tableId);
    }
  };

  MWaterTableSelectComponent.prototype.renderSites = function() {
    return R(OptionListComponent, {
      items: _.compact(_.map(siteTypes, (function(_this) {
        return function(tableId) {
          var table;
          table = _this.props.schema.getTable(tableId);
          if (!table) {
            return null;
          }
          return {
            name: ExprUtils.localizeString(table.name, _this.context.locale),
            desc: ExprUtils.localizeString(table.desc, _this.context.locale),
            onClick: _this.handleChange.bind(null, table.id)
          };
        };
      })(this)))
    });
  };

  MWaterTableSelectComponent.prototype.renderForms = function() {
    return R(FormsListComponent, {
      schema: this.props.schema,
      client: this.props.client,
      apiUrl: this.props.apiUrl,
      user: this.props.user,
      onChange: this.handleTableChange,
      extraTables: this.props.extraTables
    });
  };

  MWaterTableSelectComponent.prototype.renderIndicators = function() {
    var table, tables;
    tables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        return table.id.match(/^indicator_values:/);
      };
    })(this));
    tables = _.sortBy(tables, "name");
    table = this.props.schema.getTable("response_indicators");
    if (table) {
      tables.unshift(table);
    }
    return R(OptionListComponent, {
      items: _.map(tables, (function(_this) {
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

  MWaterTableSelectComponent.prototype.renderOther = function() {
    var otherTables;
    otherTables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        var ref;
        return (ref = table.id, indexOf.call(siteTypes, ref) < 0) && !table.id.match(/^responses:/) && !table.id.match(/^indicator_values:/) && table.id !== "response_indicators";
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
          id: "indicators",
          label: "Indicators",
          elem: this.renderIndicators()
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
    onChange: React.PropTypes.func.isRequired,
    extraTables: React.PropTypes.array.isRequired
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
      state: 1,
      isMaster: 1
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
            var ref;
            if (ref = "responses:" + form._id, indexOf.call(_this.props.extraTables, ref) >= 0) {
              return 1;
            } else {
              return 0;
            }
          }, function(form) {
            if (form.created.by === _this.props.user) {
              return 1;
            } else {
              return 0;
            }
          }, function(form) {
            return form.modified.on;
          }
        ], ['desc', 'desc', 'desc']);
        return _this.setState({
          forms: _.map(forms, function(form) {
            return {
              id: form._id,
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
            onClick: _this.props.onChange.bind(null, "responses:" + form.id)
          };
        };
      })(this))
    }));
  };

  return FormsListComponent;

})(React.Component);
