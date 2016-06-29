var ExprUtils, FormsListComponent, H, MWaterTableSelectComponent, R, React, TabbedComponent, querystring, siteTypes, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

React = require('react');

H = React.DOM;

R = React.createElement;

querystring = require('querystring');

TabbedComponent = require('react-library/lib/TabbedComponent');

ui = require('./UIComponents');

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
    this.handleExtraTableRemove = bind(this.handleExtraTableRemove, this);
    this.handleExtraTableAdd = bind(this.handleExtraTableAdd, this);
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

  MWaterTableSelectComponent.prototype.handleExtraTableAdd = function(tableId) {
    return this.props.onExtraTablesChange(_.union(this.props.extraTables, [tableId]));
  };

  MWaterTableSelectComponent.prototype.handleExtraTableRemove = function(tableId) {
    if (this.props.table === tableId) {
      this.props.onChange(null);
    }
    return this.props.onExtraTablesChange(_.without(this.props.extraTables, tableId));
  };

  MWaterTableSelectComponent.prototype.renderSites = function() {
    return R(ui.OptionListComponent, {
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
      extraTables: this.props.extraTables,
      onExtraTableAdd: this.handleExtraTableAdd,
      onExtraTableRemove: this.handleExtraTableRemove
    });
  };

  MWaterTableSelectComponent.prototype.renderIndicators = function() {
    var table, tables;
    tables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        return table.id.match(/^indicator_values:/) && !table.deprecated;
      };
    })(this));
    tables = _.sortBy(tables, function(t) {
      return t.name.en;
    });
    table = this.props.schema.getTable("response_indicators");
    if (table) {
      tables.unshift(table);
    }
    return R(ui.OptionListComponent, {
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
        return ((ref = table.id, indexOf.call(siteTypes, ref) < 0) && !table.id.match(/^responses:/) && !table.id.match(/^indicator_values:/) && table.id !== "response_indicators") && !table.deprecated;
      };
    })(this));
    otherTables = _.sortBy(otherTables, "name");
    return R(ui.OptionListComponent, {
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
    var editor, ref;
    editor = H.div(null, this.state.pendingExtraTable ? H.div({
      className: "alert alert-info",
      key: "pendingExtraTable"
    }, H.i({
      className: "fa fa-spinner fa-spin"
    }), "\u00a0Please wait...") : void 0, R(TabbedComponent, {
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
    }));
    return R(ui.ToggleEditComponent, {
      ref: "toggleEdit",
      forceOpen: !this.props.table,
      label: this.props.table ? ExprUtils.localizeString((ref = this.props.schema.getTable(this.props.table)) != null ? ref.name : void 0, this.context.locale) : "",
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
    extraTables: React.PropTypes.array.isRequired,
    onExtraTableAdd: React.PropTypes.func.isRequired,
    onExtraTableRemove: React.PropTypes.func.isRequired
  };

  FormsListComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function FormsListComponent() {
    this.searchRef = bind(this.searchRef, this);
    this.handleTableRemove = bind(this.handleTableRemove, this);
    this.handleTableAdd = bind(this.handleTableAdd, this);
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

  FormsListComponent.prototype.handleTableAdd = function(tableId) {
    return this.props.onExtraTableAdd(tableId);
  };

  FormsListComponent.prototype.handleTableRemove = function(table) {
    if (confirm("Remove " + (ExprUtils.localizeString(table.name, this.context.locale)) + "? Any widgets that depend on it will no longer work properly.")) {
      return this.props.onExtraTableRemove(table.id);
    }
  };

  FormsListComponent.prototype.searchRef = function(comp) {
    if (comp) {
      return comp.focus();
    }
  };

  FormsListComponent.prototype.render = function() {
    var escapeRegExp, forms, searchStringRegExp, tables;
    if (this.state.error) {
      return H.div({
        className: "alert alert-danger"
      }, this.state.error);
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
    forms = _.filter(forms, (function(_this) {
      return function(f) {
        var ref;
        return ref = "responses:" + f._id, indexOf.call(_this.props.extraTables, ref) < 0;
      };
    })(this));
    tables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        return (table.id.match(/^responses:/) || table.id.match(/^master_responses:/)) && !table.deprecated;
      };
    })(this));
    tables = _.sortBy(tables, function(t) {
      return t.name.en;
    });
    return H.div(null, H.label(null, "Included Forms:"), tables.length > 0 ? R(ui.OptionListComponent, {
      items: _.map(tables, (function(_this) {
        return function(table) {
          return {
            name: ExprUtils.localizeString(table.name, _this.context.locale),
            desc: ExprUtils.localizeString(table.desc, _this.context.locale),
            onClick: _this.props.onChange.bind(null, table.id),
            onRemove: _this.handleTableRemove.bind(null, table)
          };
        };
      })(this))
    }) : H.div(null, "None"), H.br(), H.label(null, "All Forms:"), !this.state.forms ? H.div({
      className: "alert alert-info"
    }, H.i({
      className: "fa fa-spinner fa-spin"
    }), "\u00A0Loading...") : [
      H.input({
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
      }), R(ui.OptionListComponent, {
        items: _.map(forms, (function(_this) {
          return function(form) {
            return {
              name: [
                H.span({
                  className: "glyphicon glyphicon-plus"
                }), " " + form.name
              ],
              desc: form.desc,
              onClick: _this.handleTableAdd.bind(null, "responses:" + form.id)
            };
          };
        })(this))
      })
    ]);
  };

  return FormsListComponent;

})(React.Component);
