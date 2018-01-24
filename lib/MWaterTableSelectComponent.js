var ExprUtils, FormsListComponent, H, IndicatorsListComponent, IssuesListComponent, MWaterResponsesFilterComponent, MWaterTableSelectComponent, PropTypes, R, React, TabbedComponent, moment, querystring, siteTypes, ui, uiComponents,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

querystring = require('querystring');

TabbedComponent = require('react-library/lib/TabbedComponent');

ui = require('react-library/lib/bootstrap');

uiComponents = require('./UIComponents');

ExprUtils = require("mwater-expressions").ExprUtils;

moment = require('moment');

MWaterResponsesFilterComponent = require('./MWaterResponsesFilterComponent');

siteTypes = ["entities.water_point", "entities.household", "entities.sanitation_facility", "entities.community", "entities.school", "entities.health_facility", "entities.surface_water", "entities.place_of_worship", "entities.water_system", "entities.waste_disposal_site", "entities.wastewater_treatment_system", "entities.handwashing_facility"];

module.exports = MWaterTableSelectComponent = (function(superClass) {
  extend(MWaterTableSelectComponent, superClass);

  MWaterTableSelectComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    table: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    extraTables: PropTypes.array.isRequired,
    onExtraTablesChange: PropTypes.func.isRequired,
    filter: PropTypes.object,
    onFilterChange: PropTypes.func
  };

  MWaterTableSelectComponent.contextTypes = {
    locale: PropTypes.string
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
        nextProps.onChange(table);
      }
    }
    if (nextProps.table && nextProps.table.match(/responses:/) && nextProps.table !== this.props.table && !nextProps.filter && nextProps.onFilterChange) {
      return nextProps.onFilterChange({
        type: "op",
        op: "= any",
        table: nextProps.table,
        exprs: [
          {
            type: "field",
            table: nextProps.table,
            column: "status"
          }, {
            type: "literal",
            valueType: "enumset",
            value: ["final"]
          }
        ]
      });
    }
  };

  MWaterTableSelectComponent.prototype.handleChange = function(tableId) {
    this.refs.toggleEdit.close();
    if (tableId !== this.props.table) {
      return this.props.onChange(tableId);
    }
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
    return R(uiComponents.OptionListComponent, {
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
    return R(IndicatorsListComponent, {
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

  MWaterTableSelectComponent.prototype.renderIssues = function() {
    return R(IssuesListComponent, {
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

  MWaterTableSelectComponent.prototype.renderOther = function() {
    var otherTables;
    otherTables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        var ref;
        if (table.deprecated) {
          return false;
        }
        if (ref = table.id, indexOf.call(siteTypes, ref) >= 0) {
          return false;
        }
        if (table.id.match(/^responses:/)) {
          return false;
        }
        if (table.id.match(/^indicator_values:/)) {
          return false;
        }
        if (table.id.match(/^(issues|issue_events):/)) {
          return false;
        }
        return true;
      };
    })(this));
    otherTables = _.sortBy(otherTables, function(table) {
      return table.name.en;
    });
    return R(uiComponents.OptionListComponent, {
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
    }), "\u00a0Please wait...") : void 0, H.div({
      className: "text-muted"
    }, "Select data from sites, surveys or an advanced category below. Indicators can be found within their associated site types."), R(TabbedComponent, {
      tabs: [
        {
          id: "sites",
          label: [
            H.i({
              className: "fa fa-map-marker"
            }), " Sites"
          ],
          elem: this.renderSites()
        }, {
          id: "forms",
          label: [
            H.i({
              className: "fa fa-th-list"
            }), " Surveys"
          ],
          elem: this.renderForms()
        }, {
          id: "indicators",
          label: [
            H.i({
              className: "fa fa-check-circle"
            }), " Indicators"
          ],
          elem: this.renderIndicators()
        }, {
          id: "issues",
          label: [
            H.i({
              className: "fa fa-exclamation-circle"
            }), " Issues"
          ],
          elem: this.renderIssues()
        }, {
          id: "other",
          label: "Advanced",
          elem: this.renderOther()
        }
      ],
      initialTabId: "sites"
    }));
    return H.div(null, R(uiComponents.ToggleEditComponent, {
      ref: "toggleEdit",
      forceOpen: !this.props.table,
      label: this.props.table ? ExprUtils.localizeString((ref = this.props.schema.getTable(this.props.table)) != null ? ref.name : void 0, this.context.locale) : "",
      editor: editor
    }), this.props.table && this.props.onFilterChange && this.props.table.match(/^responses:/) ? R(MWaterResponsesFilterComponent, {
      schema: this.props.schema,
      table: this.props.table,
      filter: this.props.filter,
      onFilterChange: this.props.onFilterChange
    }) : void 0);
  };

  return MWaterTableSelectComponent;

})(React.Component);

FormsListComponent = (function(superClass) {
  extend(FormsListComponent, superClass);

  FormsListComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    extraTables: PropTypes.array.isRequired,
    onExtraTableAdd: PropTypes.func.isRequired,
    onExtraTableRemove: PropTypes.func.isRequired
  };

  FormsListComponent.contextTypes = {
    locale: PropTypes.string
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
            if (ref = "responses:" + form._id, indexOf.call(_this.props.extraTables || [], ref) >= 0) {
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
              desc: "Modified " + (moment(form.modified.on, moment.ISO_8601).format("ll"))
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
        return ref = "responses:" + f.id, indexOf.call(_this.props.extraTables || [], ref) < 0;
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
    return H.div(null, H.label(null, "Included Surveys:"), tables.length > 0 ? R(uiComponents.OptionListComponent, {
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
    }) : H.div(null, "None"), H.br(), H.label(null, "All Surveys:"), !this.state.forms || this.state.forms.length === 0 ? H.div({
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
      }), R(uiComponents.OptionListComponent, {
        items: _.map(forms, (function(_this) {
          return function(form) {
            return {
              name: form.name,
              desc: form.desc,
              onClick: _this.props.onChange.bind(null, "responses:" + form.id)
            };
          };
        })(this))
      })
    ]);
  };

  return FormsListComponent;

})(React.Component);

IndicatorsListComponent = (function(superClass) {
  extend(IndicatorsListComponent, superClass);

  IndicatorsListComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    extraTables: PropTypes.array.isRequired,
    onExtraTableAdd: PropTypes.func.isRequired,
    onExtraTableRemove: PropTypes.func.isRequired
  };

  IndicatorsListComponent.contextTypes = {
    locale: PropTypes.string
  };

  function IndicatorsListComponent() {
    this.searchRef = bind(this.searchRef, this);
    this.handleTableRemove = bind(this.handleTableRemove, this);
    this.handleTableAdd = bind(this.handleTableAdd, this);
    IndicatorsListComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      indicators: null,
      search: ""
    };
  }

  IndicatorsListComponent.prototype.componentDidMount = function() {
    var query;
    query = {};
    query.fields = JSON.stringify({
      "design.name": 1,
      "design.desc": 1,
      "design.recommended": 1,
      deprecated: 1
    });
    query.client = this.props.client;
    return $.getJSON(this.props.apiUrl + "indicators?" + querystring.stringify(query), (function(_this) {
      return function(indicators) {
        indicators = _.filter(indicators, function(indicator) {
          return !indicator.deprecated;
        });
        indicators = _.sortByOrder(indicators, [
          function(indicator) {
            var ref;
            if (ref = "indicator_values:" + indicator._id, indexOf.call(_this.props.extraTables || [], ref) >= 0) {
              return 0;
            } else {
              return 1;
            }
          }, function(indicator) {
            if (indicator.design.recommended) {
              return 0;
            } else {
              return 1;
            }
          }, function(indicator) {
            return ExprUtils.localizeString(indicator.design.name, _this.context.locale);
          }
        ], ['asc', 'asc', 'asc']);
        return _this.setState({
          indicators: _.map(indicators, function(indicator) {
            return {
              id: indicator._id,
              name: ExprUtils.localizeString(indicator.design.name, _this.context.locale),
              desc: ExprUtils.localizeString(indicator.design.desc, _this.context.locale)
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

  IndicatorsListComponent.prototype.handleTableAdd = function(tableId) {
    return this.props.onExtraTableAdd(tableId);
  };

  IndicatorsListComponent.prototype.handleTableRemove = function(table) {
    if (confirm("Remove " + (ExprUtils.localizeString(table.name, this.context.locale)) + "? Any widgets that depend on it will no longer work properly.")) {
      return this.props.onExtraTableRemove(table.id);
    }
  };

  IndicatorsListComponent.prototype.searchRef = function(comp) {
    if (comp) {
      return comp.focus();
    }
  };

  IndicatorsListComponent.prototype.render = function() {
    var escapeRegExp, indicators, searchStringRegExp, tables;
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
      indicators = _.filter(this.state.indicators, (function(_this) {
        return function(indicator) {
          return indicator.name.match(searchStringRegExp);
        };
      })(this));
    } else {
      indicators = this.state.indicators;
    }
    indicators = _.filter(indicators, (function(_this) {
      return function(f) {
        var ref;
        return ref = "indicator_values:" + f.id, indexOf.call(_this.props.extraTables || [], ref) < 0;
      };
    })(this));
    tables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        return table.id.match(/^indicator_values:/) && !table.deprecated;
      };
    })(this));
    tables = _.sortBy(tables, function(t) {
      return t.name.en;
    });
    return H.div(null, H.label(null, "Included Indicators:"), tables.length > 0 ? R(uiComponents.OptionListComponent, {
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
    }) : H.div(null, "None"), H.br(), H.label(null, "All Indicators:"), !this.state.indicators || this.state.indicators.length === 0 ? H.div({
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
      }), R(uiComponents.OptionListComponent, {
        items: _.map(indicators, (function(_this) {
          return function(indicator) {
            return {
              name: indicator.name,
              desc: indicator.desc,
              onClick: _this.props.onChange.bind(null, "indicator_values:" + indicator.id)
            };
          };
        })(this))
      })
    ]);
  };

  return IndicatorsListComponent;

})(React.Component);

IssuesListComponent = (function(superClass) {
  extend(IssuesListComponent, superClass);

  IssuesListComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    extraTables: PropTypes.array.isRequired,
    onExtraTableAdd: PropTypes.func.isRequired,
    onExtraTableRemove: PropTypes.func.isRequired
  };

  IssuesListComponent.contextTypes = {
    locale: PropTypes.string
  };

  function IssuesListComponent() {
    this.searchRef = bind(this.searchRef, this);
    this.handleTableRemove = bind(this.handleTableRemove, this);
    this.handleTableAdd = bind(this.handleTableAdd, this);
    IssuesListComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      issueTypes: null,
      search: ""
    };
  }

  IssuesListComponent.prototype.componentDidMount = function() {
    var query;
    query = {};
    query.fields = JSON.stringify({
      name: 1,
      desc: 1,
      roles: 1,
      created: 1,
      modified: 1
    });
    query.client = this.props.client;
    return $.getJSON(this.props.apiUrl + "issue_types?" + querystring.stringify(query), (function(_this) {
      return function(issueTypes) {
        issueTypes = _.sortByOrder(issueTypes, [
          function(issueType) {
            var ref;
            if (ref = "issues:" + issueType._id, indexOf.call(_this.props.extraTables || [], ref) >= 0) {
              return 0;
            } else {
              return 1;
            }
          }, function(issueType) {
            if (issueType.created.by === _this.props.user) {
              return 0;
            } else {
              return 1;
            }
          }, function(issueType) {
            return ExprUtils.localizeString(issueType.name, _this.context.locale);
          }
        ], ['asc', 'asc', 'asc']);
        return _this.setState({
          issueTypes: _.map(issueTypes, function(issueType) {
            return {
              id: issueType._id,
              name: ExprUtils.localizeString(issueType.name, _this.context.locale),
              desc: ExprUtils.localizeString(issueType.desc, _this.context.locale)
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

  IssuesListComponent.prototype.handleTableAdd = function(tableId) {
    return this.props.onExtraTableAdd(tableId);
  };

  IssuesListComponent.prototype.handleTableRemove = function(table) {
    if (confirm("Remove " + (ExprUtils.localizeString(table.name, this.context.locale)) + "? Any widgets that depend on it will no longer work properly.")) {
      return this.props.onExtraTableRemove(table.id);
    }
  };

  IssuesListComponent.prototype.searchRef = function(comp) {
    if (comp) {
      return comp.focus();
    }
  };

  IssuesListComponent.prototype.render = function() {
    var escapeRegExp, issueTypes, searchStringRegExp, tables;
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
      issueTypes = _.filter(this.state.issueTypes, (function(_this) {
        return function(issueType) {
          return issueType.name.match(searchStringRegExp);
        };
      })(this));
    } else {
      issueTypes = this.state.issueTypes;
    }
    issueTypes = _.filter(issueTypes, (function(_this) {
      return function(f) {
        var ref;
        return ref = "issues:" + f.id, indexOf.call(_this.props.extraTables || [], ref) < 0;
      };
    })(this));
    tables = _.filter(this.props.schema.getTables(), (function(_this) {
      return function(table) {
        return (table.id.match(/^issues:/) || table.id.match(/^issue_events:/)) && !table.deprecated;
      };
    })(this));
    tables = _.sortBy(tables, function(t) {
      return t.name.en;
    });
    return H.div(null, H.label(null, "Included Issues:"), tables.length > 0 ? R(uiComponents.OptionListComponent, {
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
    }) : H.div(null, "None"), H.br(), H.label(null, "All Issues:"), !this.state.issueTypes || this.state.issueTypes.length === 0 ? H.div({
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
      }), R(uiComponents.OptionListComponent, {
        items: _.map(issueTypes, (function(_this) {
          return function(issueType) {
            return {
              name: issueType.name,
              desc: issueType.desc,
              onClick: _this.props.onChange.bind(null, "issues:" + issueType.id)
            };
          };
        })(this))
      })
    ]);
  };

  return IssuesListComponent;

})(React.Component);
