"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var $,
    AddIndicatorConfirmPopupComponent,
    CompleteTableSelectComponent,
    EditModeTableSelectComponent,
    ExprUtils,
    FormsListComponent,
    IndicatorsListComponent,
    IssuesListComponent,
    MWaterResponsesFilterComponent,
    MWaterTableSelectComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    TabbedComponent,
    _,
    moment,
    querystring,
    sitesOrder,
    ui,
    uiComponents,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
},
    indexOf = [].indexOf;

_ = require('lodash');
$ = require('jquery');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
querystring = require('querystring');
TabbedComponent = require('react-library/lib/TabbedComponent');
ui = require('react-library/lib/bootstrap');
uiComponents = require('./UIComponents');
ExprUtils = require("mwater-expressions").ExprUtils;
moment = require('moment');
MWaterResponsesFilterComponent = require('./MWaterResponsesFilterComponent');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent');
sitesOrder = {
  "entities.water_point": 1,
  "entities.sanitation_facility": 2,
  "entities.household": 3,
  "entities.community": 4,
  "entities.school": 5,
  "entities.health_facility": 6,
  "entities.place_of_worship": 7,
  "entities.water_system": 8,
  "entities.water_system_component": 9,
  "entities.wastewater_treatment_system": 10,
  "entities.waste_disposal_site": 11
}; // Allows selection of a mwater-visualization table. Loads forms as well and calls event if modified

module.exports = MWaterTableSelectComponent = function () {
  var MWaterTableSelectComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(MWaterTableSelectComponent, _React$Component);

    function MWaterTableSelectComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, MWaterTableSelectComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(MWaterTableSelectComponent).call(this, props));
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        pendingExtraTable: null // Set when waiting for a table to load

      };
      return _this;
    }

    (0, _createClass2.default)(MWaterTableSelectComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        var table; // If received new schema with pending extra table, select it

        if (this.state.pendingExtraTable) {
          table = this.state.pendingExtraTable;

          if (nextProps.schema.getTable(table)) {
            // No longer waiting
            this.setState({
              pendingExtraTable: null
            }); // Close toggle edit

            this.toggleEdit.close(); // Fire change

            nextProps.onChange(table);
          }
        } // If table is newly selected and is a responses table and no filters, set filters to final only


        if (nextProps.table && nextProps.table.match(/responses:/) && nextProps.table !== this.props.table && !nextProps.filter && nextProps.onFilterChange) {
          return nextProps.onFilterChange({
            type: "op",
            op: "= any",
            table: nextProps.table,
            exprs: [{
              type: "field",
              table: nextProps.table,
              column: "status"
            }, {
              type: "literal",
              valueType: "enumset",
              value: ["final"]
            }]
          });
        }
      }
    }, {
      key: "handleChange",
      value: function handleChange(tableId) {
        boundMethodCheck(this, MWaterTableSelectComponent); // Close toggle edit

        this.toggleEdit.close(); // Call onChange if different

        if (tableId !== this.props.table) {
          return this.props.onChange(tableId);
        }
      }
    }, {
      key: "handleTableChange",
      value: function handleTableChange(tableId) {
        var _this2 = this;

        boundMethodCheck(this, MWaterTableSelectComponent); // If not part of formIds, add it and wait for new schema

        if (!this.props.schema.getTable(tableId)) {
          return this.setState({
            pendingExtraTable: tableId
          }, function () {
            return _this2.props.onExtraTablesChange(_.union(_this2.props.extraTables, [tableId]));
          });
        } else {
          return this.handleChange(tableId);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var editor, ref;
        editor = R(EditModeTableSelectComponent, {
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          schema: this.props.schema,
          user: this.props.user,
          table: this.props.table,
          onChange: this.handleTableChange,
          extraTables: this.props.extraTables,
          onExtraTablesChange: this.props.onExtraTablesChange
        }); // Show message if loading

        return R('div', null, this.state.pendingExtraTable ? R('div', {
          className: "alert alert-info",
          key: "pendingExtraTable"
        }, R('i', {
          className: "fa fa-spinner fa-spin"
        }), "\xA0Please wait...") : void 0, R(uiComponents.ToggleEditComponent, {
          ref: function ref(c) {
            return _this3.toggleEdit = c;
          },
          forceOpen: !this.props.table,
          // Must have table
          label: this.props.table ? ExprUtils.localizeString((ref = this.props.schema.getTable(this.props.table)) != null ? ref.name : void 0, this.context.locale) : "",
          editor: editor
        }), this.props.table && this.props.onFilterChange && this.props.table.match(/^responses:/) ? R(MWaterResponsesFilterComponent, {
          schema: this.props.schema,
          table: this.props.table,
          filter: this.props.filter,
          onFilterChange: this.props.onFilterChange
        }) : void 0);
      }
    }]);
    return MWaterTableSelectComponent;
  }(React.Component);

  ;
  MWaterTableSelectComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    // Url to hit api
    client: PropTypes.string,
    // Optional client
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    // User id
    table: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    // Called with table selected
    extraTables: PropTypes.array.isRequired,
    onExtraTablesChange: PropTypes.func.isRequired,
    // Can also perform filtering for some types. Include these props to enable this
    filter: PropTypes.object,
    onFilterChange: PropTypes.func
  };
  MWaterTableSelectComponent.contextTypes = {
    locale: PropTypes.string,
    // e.g. "en"
    // Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  };
  return MWaterTableSelectComponent;
}.call(void 0);

EditModeTableSelectComponent = function () {
  // Is the table select component when in edit mode. Toggles between complete list and simplified list
  var EditModeTableSelectComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(EditModeTableSelectComponent, _React$Component2);

    function EditModeTableSelectComponent(props) {
      var _this4;

      (0, _classCallCheck2.default)(this, EditModeTableSelectComponent);
      _this4 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(EditModeTableSelectComponent).call(this, props));
      _this4.handleShowMore = _this4.handleShowMore.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this4)));
      _this4.state = {
        // True when in expanded mode that shows all tables
        completeMode: false
      };
      return _this4;
    }

    (0, _createClass2.default)(EditModeTableSelectComponent, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        // True when in expanded mode that shows all tables. Default complete if none present
        if (this.getTableShortlist().length === 0) {
          return this.setState({
            completeMode: true
          });
        }
      }
    }, {
      key: "handleShowMore",
      value: function handleShowMore() {
        boundMethodCheck(this, EditModeTableSelectComponent);
        return this.setState({
          completeMode: true
        });
      } // Get list of tables that should be included in shortlist
      // This is all active tables and all responses tables in schema (so as to include rosters)
      // Also includes current table

    }, {
      key: "getTableShortlist",
      value: function getTableShortlist() {
        var tables;
        tables = this.context.activeTables || [];
        tables = _.union(tables, _.filter(_.pluck(this.props.schema.getTables(), "id"), function (t) {
          return t.match(/^responses:/);
        }));

        if (this.props.table) {
          tables = _.union(tables, [this.props.table]);
        }

        return tables;
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        if (this.state.completeMode) {
          return R(CompleteTableSelectComponent, {
            apiUrl: this.props.apiUrl,
            client: this.props.client,
            schema: this.props.schema,
            user: this.props.user,
            table: this.props.table,
            onChange: this.props.onChange,
            extraTables: this.props.extraTables,
            onExtraTablesChange: this.props.onExtraTablesChange
          });
        } else {
          return R('div', null, R('div', {
            className: "text-muted"
          }, "Select Data Source:"), R(uiComponents.OptionListComponent, {
            items: _.map(this.getTableShortlist(), function (tableId) {
              var table;
              table = _this5.props.schema.getTable(tableId);
              return {
                name: ExprUtils.localizeString(table.name, _this5.context.locale),
                desc: ExprUtils.localizeString(table.desc, _this5.context.locale),
                onClick: _this5.props.onChange.bind(null, table.id)
              };
            })
          }), R('div', null, R('button', {
            type: "button",
            className: "btn btn-link btn-sm",
            onClick: this.handleShowMore
          }, "Show All Available Data Sources...")));
        }
      }
    }]);
    return EditModeTableSelectComponent;
  }(React.Component);

  ;
  EditModeTableSelectComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    // Url to hit api
    client: PropTypes.string,
    // Optional client
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    // User id
    table: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    // Called with table selected
    extraTables: PropTypes.array.isRequired,
    onExtraTablesChange: PropTypes.func.isRequired
  };
  EditModeTableSelectComponent.contextTypes = {
    locale: PropTypes.string,
    // e.g. "en"
    // Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  };
  return EditModeTableSelectComponent;
}.call(void 0);

CompleteTableSelectComponent = function () {
  // Allows selection of a table. Is the complete list mode of the above control
  var CompleteTableSelectComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2.default)(CompleteTableSelectComponent, _React$Component3);

    function CompleteTableSelectComponent() {
      var _this6;

      (0, _classCallCheck2.default)(this, CompleteTableSelectComponent);
      _this6 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(CompleteTableSelectComponent).apply(this, arguments));
      _this6.handleExtraTableAdd = _this6.handleExtraTableAdd.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this6)));
      _this6.handleExtraTableRemove = _this6.handleExtraTableRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this6)));
      return _this6;
    }

    (0, _createClass2.default)(CompleteTableSelectComponent, [{
      key: "handleExtraTableAdd",
      value: function handleExtraTableAdd(tableId) {
        boundMethodCheck(this, CompleteTableSelectComponent);
        return this.props.onExtraTablesChange(_.union(this.props.extraTables, [tableId]));
      }
    }, {
      key: "handleExtraTableRemove",
      value: function handleExtraTableRemove(tableId) {
        boundMethodCheck(this, CompleteTableSelectComponent); // Set to null if current table

        if (this.props.table === tableId) {
          this.props.onChange(null);
        }

        return this.props.onExtraTablesChange(_.without(this.props.extraTables, tableId));
      }
    }, {
      key: "renderSites",
      value: function renderSites() {
        var _this7 = this;

        var i, len, ref, table, types;
        types = [];
        ref = this.props.schema.getTables();

        for (i = 0, len = ref.length; i < len; i++) {
          table = ref[i];

          if (table.deprecated) {
            continue;
          }

          if (!table.id.match(/^entities\./)) {
            continue;
          }

          types.push(table.id);
        } // Sort by order if present


        types = _.sortBy(types, function (type) {
          return sitesOrder[type] || 999;
        });
        return R(uiComponents.OptionListComponent, {
          items: _.compact(_.map(types, function (tableId) {
            table = _this7.props.schema.getTable(tableId);
            return {
              name: ExprUtils.localizeString(table.name, _this7.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this7.context.locale),
              onClick: _this7.props.onChange.bind(null, table.id)
            };
          }))
        });
      }
    }, {
      key: "renderForms",
      value: function renderForms() {
        return R(FormsListComponent, {
          schema: this.props.schema,
          client: this.props.client,
          apiUrl: this.props.apiUrl,
          user: this.props.user,
          onChange: this.props.onChange,
          extraTables: this.props.extraTables,
          onExtraTableAdd: this.handleExtraTableAdd,
          onExtraTableRemove: this.handleExtraTableRemove
        });
      }
    }, {
      key: "renderIndicators",
      value: function renderIndicators() {
        return R(IndicatorsListComponent, {
          schema: this.props.schema,
          client: this.props.client,
          apiUrl: this.props.apiUrl,
          user: this.props.user,
          onChange: this.props.onChange,
          extraTables: this.props.extraTables,
          onExtraTableAdd: this.handleExtraTableAdd,
          onExtraTableRemove: this.handleExtraTableRemove
        });
      }
    }, {
      key: "renderIssues",
      value: function renderIssues() {
        return R(IssuesListComponent, {
          schema: this.props.schema,
          client: this.props.client,
          apiUrl: this.props.apiUrl,
          user: this.props.user,
          onChange: this.props.onChange,
          extraTables: this.props.extraTables,
          onExtraTableAdd: this.handleExtraTableAdd,
          onExtraTableRemove: this.handleExtraTableRemove
        });
      }
    }, {
      key: "renderSweetSense",
      value: function renderSweetSense() {
        var _this8 = this;

        var sweetSenseTables;
        sweetSenseTables = this.getSweetSenseTables();
        sweetSenseTables = _.sortBy(sweetSenseTables, function (table) {
          return table.name.en;
        });
        return R(uiComponents.OptionListComponent, {
          items: _.map(sweetSenseTables, function (table) {
            return {
              name: ExprUtils.localizeString(table.name, _this8.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this8.context.locale),
              onClick: _this8.props.onChange.bind(null, table.id)
            };
          })
        });
      }
    }, {
      key: "renderOther",
      value: function renderOther() {
        var _this9 = this;

        var otherTables;
        otherTables = _.filter(this.props.schema.getTables(), function (table) {
          // Remove deprecated
          if (table.deprecated) {
            return false;
          } // Remove sites


          if (table.id.match(/^entities\./)) {
            return false;
          } // sweetsense tables


          if (table.id.match(/^sweetsense/)) {
            return false;
          } // Remove responses


          if (table.id.match(/^responses:/)) {
            return false;
          } // Remove indicators


          if (table.id.match(/^indicator_values:/)) {
            return false;
          } // Remove issues


          if (table.id.match(/^(issues|issue_events):/)) {
            return false;
          }

          return true;
        });
        otherTables = _.sortBy(otherTables, function (table) {
          return table.name.en;
        });
        return R(uiComponents.OptionListComponent, {
          items: _.map(otherTables, function (table) {
            return {
              name: ExprUtils.localizeString(table.name, _this9.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this9.context.locale),
              onClick: _this9.props.onChange.bind(null, table.id)
            };
          })
        });
      }
    }, {
      key: "getSweetSenseTables",
      value: function getSweetSenseTables() {
        return _.filter(this.props.schema.getTables(), function (table) {
          if (table.deprecated) {
            return false;
          }

          if (table.id.match(/^sweetsense/)) {
            return true;
          }

          return false;
        });
      }
    }, {
      key: "render",
      value: function render() {
        var sweetSenseTables, tabs;
        sweetSenseTables = this.getSweetSenseTables();
        tabs = [{
          id: "sites",
          label: [R('i', {
            className: "fa fa-map-marker"
          }), " Sites"],
          elem: this.renderSites()
        }, {
          id: "forms",
          label: [R('i', {
            className: "fa fa-th-list"
          }), " Surveys"],
          elem: this.renderForms()
        }, {
          id: "indicators",
          label: [R('i', {
            className: "fa fa-check-circle"
          }), " Indicators"],
          elem: this.renderIndicators()
        }, {
          id: "issues",
          label: [R('i', {
            className: "fa fa-exclamation-circle"
          }), " Issues"],
          elem: this.renderIssues()
        }];

        if (sweetSenseTables.length > 0) {
          tabs.push({
            id: "sensors",
            label: " Sensors",
            elem: this.renderSweetSense()
          });
        }

        tabs.push({
          id: "other",
          label: "Advanced",
          elem: this.renderOther()
        });
        return R('div', null, R('div', {
          className: "text-muted"
        }, "Select data from sites, surveys or an advanced category below. Indicators can be found within their associated site types."), R(TabbedComponent, {
          tabs: tabs,
          initialTabId: "sites"
        }));
      }
    }]);
    return CompleteTableSelectComponent;
  }(React.Component);

  ;
  CompleteTableSelectComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    // Url to hit api
    client: PropTypes.string,
    // Optional client
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    // User id
    table: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    // Called with table selected
    extraTables: PropTypes.array.isRequired,
    onExtraTablesChange: PropTypes.func.isRequired
  };
  CompleteTableSelectComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return CompleteTableSelectComponent;
}.call(void 0);

FormsListComponent = function () {
  // Searchable list of forms
  var FormsListComponent =
  /*#__PURE__*/
  function (_React$Component4) {
    (0, _inherits2.default)(FormsListComponent, _React$Component4);

    function FormsListComponent(props) {
      var _this10;

      (0, _classCallCheck2.default)(this, FormsListComponent);
      _this10 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(FormsListComponent).call(this, props));
      _this10.handleTableAdd = _this10.handleTableAdd.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this10)));
      _this10.handleTableRemove = _this10.handleTableRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this10)));
      _this10.searchRef = _this10.searchRef.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this10)));
      _this10.state = {
        forms: null,
        search: ""
      };
      return _this10;
    }

    (0, _createClass2.default)(FormsListComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this11 = this;

        var query; // Get names and basic of forms

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
        query.client = this.props.client; // Get list of all form names

        return $.getJSON(this.props.apiUrl + "forms?" + querystring.stringify(query), function (forms) {
          // Sort by modified.on desc but first by user
          forms = _.sortByOrder(forms, [function (form) {
            var ref;

            if (ref = "responses:" + form._id, indexOf.call(_this11.props.extraTables || [], ref) >= 0) {
              return 1;
            } else {
              return 0;
            }
          }, function (form) {
            if (form.created.by === _this11.props.user) {
              return 1;
            } else {
              return 0;
            }
          }, function (form) {
            return form.modified.on;
          }], ['desc', 'desc', 'desc']); // TODO use name instead of design.name

          return _this11.setState({
            forms: _.map(forms, function (form) {
              return {
                id: form._id,
                name: ExprUtils.localizeString(form.design.name, _this11.context.locale),
                // desc: "Created by #{form.created.by}" 
                desc: "Modified ".concat(moment(form.modified.on, moment.ISO_8601).format("ll"))
              };
            })
          });
        }).fail(function (xhr) {
          return _this11.setState({
            error: xhr.responseText
          });
        });
      }
    }, {
      key: "handleTableAdd",
      value: function handleTableAdd(tableId) {
        boundMethodCheck(this, FormsListComponent);
        return this.props.onExtraTableAdd(tableId);
      }
    }, {
      key: "handleTableRemove",
      value: function handleTableRemove(table) {
        boundMethodCheck(this, FormsListComponent);

        if (confirm("Remove ".concat(ExprUtils.localizeString(table.name, this.context.locale), "? Any widgets that depend on it will no longer work properly."))) {
          return this.props.onExtraTableRemove(table.id);
        }
      }
    }, {
      key: "searchRef",
      value: function searchRef(comp) {
        boundMethodCheck(this, FormsListComponent); // Focus

        if (comp) {
          return comp.focus();
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this12 = this;

        var escapeRegExp, forms, searchStringRegExp, tables;

        if (this.state.error) {
          return R('div', {
            className: "alert alert-danger"
          }, this.state.error);
        } // Filter forms


        if (this.state.search) {
          escapeRegExp = function escapeRegExp(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          };

          searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i");
          forms = _.filter(this.state.forms, function (form) {
            return form.name.match(searchStringRegExp);
          });
        } else {
          forms = this.state.forms;
        } // Remove if already included


        forms = _.filter(forms, function (f) {
          var ref;
          return ref = "responses:".concat(f.id), indexOf.call(_this12.props.extraTables || [], ref) < 0;
        });
        tables = _.filter(this.props.schema.getTables(), function (table) {
          return (table.id.match(/^responses:/) || table.id.match(/^master_responses:/)) && !table.deprecated;
        });
        tables = _.sortBy(tables, function (t) {
          return t.name.en;
        });
        return R('div', null, R('label', null, "Included Surveys:"), tables.length > 0 ? R(uiComponents.OptionListComponent, {
          items: _.map(tables, function (table) {
            return {
              name: ExprUtils.localizeString(table.name, _this12.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this12.context.locale),
              onClick: _this12.props.onChange.bind(null, table.id),
              onRemove: _this12.handleTableRemove.bind(null, table)
            };
          })
        }) : R('div', null, "None"), R('br'), R('label', null, "All Surveys:"), !this.state.forms || this.state.forms.length === 0 ? R('div', {
          className: "alert alert-info"
        }, R('i', {
          className: "fa fa-spinner fa-spin"
        }), "\xA0Loading...") : [R('input', {
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
          onChange: function onChange(ev) {
            return _this12.setState({
              search: ev.target.value
            });
          }
        }), R(uiComponents.OptionListComponent, {
          items: _.map(forms, function (form) {
            return {
              name: form.name,
              desc: form.desc,
              onClick: _this12.props.onChange.bind(null, "responses:" + form.id)
            };
          })
        })]);
      }
    }]);
    return FormsListComponent;
  }(React.Component);

  ;
  FormsListComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    // Url to hit api
    client: PropTypes.string,
    // Optional client
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    // User id
    onChange: PropTypes.func.isRequired,
    // Called with table selected
    extraTables: PropTypes.array.isRequired,
    onExtraTableAdd: PropTypes.func.isRequired,
    onExtraTableRemove: PropTypes.func.isRequired
  };
  FormsListComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return FormsListComponent;
}.call(void 0);

IndicatorsListComponent = function () {
  // Searchable list of indicators
  var IndicatorsListComponent =
  /*#__PURE__*/
  function (_React$Component5) {
    (0, _inherits2.default)(IndicatorsListComponent, _React$Component5);

    function IndicatorsListComponent(props) {
      var _this13;

      (0, _classCallCheck2.default)(this, IndicatorsListComponent);
      _this13 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(IndicatorsListComponent).call(this, props));
      _this13.handleTableAdd = _this13.handleTableAdd.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this13)));
      _this13.handleTableRemove = _this13.handleTableRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this13)));
      _this13.searchRef = _this13.searchRef.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this13)));
      _this13.handleSelect = _this13.handleSelect.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this13)));
      _this13.state = {
        indicators: null,
        search: ""
      };
      return _this13;
    }

    (0, _createClass2.default)(IndicatorsListComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this14 = this;

        var query; // Get names and basic of forms

        query = {};
        query.fields = JSON.stringify({
          "design.name": 1,
          "design.desc": 1,
          "design.recommended": 1,
          deprecated: 1
        });
        query.client = this.props.client; // Get list of all indicator names

        return $.getJSON(this.props.apiUrl + "indicators?" + querystring.stringify(query), function (indicators) {
          // Remove deprecated
          indicators = _.filter(indicators, function (indicator) {
            return !indicator.deprecated;
          }); // Sort by name

          indicators = _.sortByOrder(indicators, [function (indicator) {
            var ref;

            if (ref = "indicator_values:" + indicator._id, indexOf.call(_this14.props.extraTables || [], ref) >= 0) {
              return 0;
            } else {
              return 1;
            }
          }, function (indicator) {
            if (indicator.design.recommended) {
              return 0;
            } else {
              return 1;
            }
          }, function (indicator) {
            return ExprUtils.localizeString(indicator.design.name, _this14.context.locale);
          }], ['asc', 'asc', 'asc']);
          return _this14.setState({
            indicators: _.map(indicators, function (indicator) {
              return {
                id: indicator._id,
                name: ExprUtils.localizeString(indicator.design.name, _this14.context.locale),
                desc: ExprUtils.localizeString(indicator.design.desc, _this14.context.locale)
              };
            })
          });
        }).fail(function (xhr) {
          return _this14.setState({
            error: xhr.responseText
          });
        });
      }
    }, {
      key: "handleTableAdd",
      value: function handleTableAdd(tableId) {
        boundMethodCheck(this, IndicatorsListComponent);
        return this.props.onExtraTableAdd(tableId);
      }
    }, {
      key: "handleTableRemove",
      value: function handleTableRemove(table) {
        boundMethodCheck(this, IndicatorsListComponent);

        if (confirm("Remove ".concat(ExprUtils.localizeString(table.name, this.context.locale), "? Any widgets that depend on it will no longer work properly."))) {
          return this.props.onExtraTableRemove(table.id);
        }
      }
    }, {
      key: "searchRef",
      value: function searchRef(comp) {
        boundMethodCheck(this, IndicatorsListComponent); // Focus

        if (comp) {
          return comp.focus();
        }
      }
    }, {
      key: "handleSelect",
      value: function handleSelect(tableId) {
        boundMethodCheck(this, IndicatorsListComponent); // Add table if not present

        if (!this.props.schema.getTable(tableId)) {
          this.props.onExtraTableAdd(tableId);
        }

        return this.addIndicatorConfirmPopup.show(tableId);
      }
    }, {
      key: "render",
      value: function render() {
        var _this15 = this;

        var escapeRegExp, indicators, searchStringRegExp, tables;

        if (this.state.error) {
          return R('div', {
            className: "alert alert-danger"
          }, this.state.error);
        } // Filter indicators


        if (this.state.search) {
          escapeRegExp = function escapeRegExp(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          };

          searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i");
          indicators = _.filter(this.state.indicators, function (indicator) {
            return indicator.name.match(searchStringRegExp);
          });
        } else {
          indicators = this.state.indicators;
        } // Remove if already included


        indicators = _.filter(indicators, function (f) {
          var ref;
          return ref = "indicator_values:".concat(f.id), indexOf.call(_this15.props.extraTables || [], ref) < 0;
        });
        tables = _.filter(this.props.schema.getTables(), function (table) {
          return table.id.match(/^indicator_values:/) && !table.deprecated;
        });
        tables = _.sortBy(tables, function (t) {
          return t.name.en;
        });
        return R('div', null, R(AddIndicatorConfirmPopupComponent, {
          schema: this.props.schema,
          onChange: this.props.onChange,
          onExtraTableAdd: this.props.onExtraTableAdd,
          ref: function ref(c) {
            return _this15.addIndicatorConfirmPopup = c;
          }
        }), R('label', null, "Included Indicators:"), tables.length > 0 ? R(uiComponents.OptionListComponent, {
          items: _.map(tables, function (table) {
            return {
              name: ExprUtils.localizeString(table.name, _this15.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this15.context.locale),
              onClick: _this15.handleSelect.bind(null, table.id),
              onRemove: _this15.handleTableRemove.bind(null, table)
            };
          })
        }) : R('div', null, "None"), R('br'), R('label', null, "All Indicators:"), !this.state.indicators || this.state.indicators.length === 0 ? R('div', {
          className: "alert alert-info"
        }, R('i', {
          className: "fa fa-spinner fa-spin"
        }), "\xA0Loading...") : [R('input', {
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
          onChange: function onChange(ev) {
            return _this15.setState({
              search: ev.target.value
            });
          }
        }), R(uiComponents.OptionListComponent, {
          items: _.map(indicators, function (indicator) {
            return {
              name: indicator.name,
              desc: indicator.desc,
              onClick: _this15.handleSelect.bind(null, "indicator_values:" + indicator.id)
            };
          })
        })]);
      }
    }]);
    return IndicatorsListComponent;
  }(React.Component);

  ;
  IndicatorsListComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    // Url to hit api
    client: PropTypes.string,
    // Optional client
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    // User id
    onChange: PropTypes.func.isRequired,
    // Called with table selected
    extraTables: PropTypes.array.isRequired,
    onExtraTableAdd: PropTypes.func.isRequired,
    onExtraTableRemove: PropTypes.func.isRequired
  };
  IndicatorsListComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return IndicatorsListComponent;
}.call(void 0);

AddIndicatorConfirmPopupComponent = function () {
  var AddIndicatorConfirmPopupComponent =
  /*#__PURE__*/
  function (_React$Component6) {
    (0, _inherits2.default)(AddIndicatorConfirmPopupComponent, _React$Component6);

    function AddIndicatorConfirmPopupComponent(props) {
      var _this16;

      (0, _classCallCheck2.default)(this, AddIndicatorConfirmPopupComponent);
      _this16 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AddIndicatorConfirmPopupComponent).call(this, props));
      _this16.state = {
        visible: false,
        indicatorTable: null
      };
      return _this16;
    }

    (0, _createClass2.default)(AddIndicatorConfirmPopupComponent, [{
      key: "show",
      value: function show(indicatorTable) {
        return this.setState({
          visible: true,
          indicatorTable: indicatorTable
        });
      }
    }, {
      key: "renderContents",
      value: function renderContents() {
        var _this17 = this;

        var entityColumns; // Show loading if table not loaded

        if (!this.props.schema.getTable(this.state.indicatorTable)) {
          return R('div', {
            className: "alert alert-info"
          }, R('i', {
            className: "fa fa-spinner fa-spin"
          }), "\xA0Loading...");
        } // Find entity links


        entityColumns = _.filter(this.props.schema.getColumns(this.state.indicatorTable), function (col) {
          var ref, ref1;
          return (ref = col.join) != null ? (ref1 = ref.toTable) != null ? ref1.match(/^entities\./) : void 0 : void 0;
        });
        return R('div', null, R('p', null, 'In general, it is better to get indicator values from the related site. Please select the site \nbelow, then find the indicator values in the \'Related Indicators\' section. Or click on \'Use Raw Indicator\' if you \nare certain that you want to use the raw indicator table'), R(uiComponents.OptionListComponent, {
          items: _.map(entityColumns, function (entityColumn) {
            return {
              name: ExprUtils.localizeString(entityColumn.name, _this17.context.locale),
              desc: ExprUtils.localizeString(entityColumn.desc, _this17.context.locale),
              onClick: function onClick() {
                // Select table
                _this17.props.onChange(entityColumn.join.toTable);

                return _this17.setState({
                  visible: false
                });
              }
            };
          })
        }), R('br'), R('div', null, R('a', {
          onClick: this.props.onChange.bind(null, this.state.indicatorTable)
        }, "Use Raw Indicator")));
      }
    }, {
      key: "render",
      value: function render() {
        var _this18 = this;

        if (!this.state.visible) {
          return null;
        }

        return R(ModalPopupComponent, {
          showCloseX: true,
          onClose: function onClose() {
            return _this18.setState({
              visible: false
            });
          },
          header: "Add Indicator"
        }, this.renderContents());
      }
    }]);
    return AddIndicatorConfirmPopupComponent;
  }(React.Component);

  ;
  AddIndicatorConfirmPopupComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    // Called with table selected
    onExtraTableAdd: PropTypes.func.isRequired
  };
  AddIndicatorConfirmPopupComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return AddIndicatorConfirmPopupComponent;
}.call(void 0);

IssuesListComponent = function () {
  // Searchable list of issue types
  var IssuesListComponent =
  /*#__PURE__*/
  function (_React$Component7) {
    (0, _inherits2.default)(IssuesListComponent, _React$Component7);

    function IssuesListComponent(props) {
      var _this19;

      (0, _classCallCheck2.default)(this, IssuesListComponent);
      _this19 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(IssuesListComponent).call(this, props));
      _this19.handleTableAdd = _this19.handleTableAdd.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this19)));
      _this19.handleTableRemove = _this19.handleTableRemove.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this19)));
      _this19.searchRef = _this19.searchRef.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this19)));
      _this19.state = {
        issueTypes: null,
        search: ""
      };
      return _this19;
    }

    (0, _createClass2.default)(IssuesListComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this20 = this;

        var query; // Get names and basic of issueTypes

        query = {};
        query.fields = JSON.stringify({
          name: 1,
          desc: 1,
          roles: 1,
          created: 1,
          modified: 1
        });
        query.client = this.props.client; // Get list of all issueType names

        return $.getJSON(this.props.apiUrl + "issue_types?" + querystring.stringify(query), function (issueTypes) {
          // Sort by modified.on desc but first by user
          issueTypes = _.sortByOrder(issueTypes, [function (issueType) {
            var ref;

            if (ref = "issues:" + issueType._id, indexOf.call(_this20.props.extraTables || [], ref) >= 0) {
              return 0;
            } else {
              return 1;
            }
          }, function (issueType) {
            if (issueType.created.by === _this20.props.user) {
              return 0;
            } else {
              return 1;
            }
          }, function (issueType) {
            return ExprUtils.localizeString(issueType.name, _this20.context.locale);
          }], ['asc', 'asc', 'asc']);
          return _this20.setState({
            issueTypes: _.map(issueTypes, function (issueType) {
              return {
                id: issueType._id,
                name: ExprUtils.localizeString(issueType.name, _this20.context.locale),
                desc: ExprUtils.localizeString(issueType.desc, _this20.context.locale)
              };
            })
          });
        }).fail(function (xhr) {
          return _this20.setState({
            error: xhr.responseText
          });
        });
      }
    }, {
      key: "handleTableAdd",
      value: function handleTableAdd(tableId) {
        boundMethodCheck(this, IssuesListComponent);
        return this.props.onExtraTableAdd(tableId);
      }
    }, {
      key: "handleTableRemove",
      value: function handleTableRemove(table) {
        boundMethodCheck(this, IssuesListComponent);

        if (confirm("Remove ".concat(ExprUtils.localizeString(table.name, this.context.locale), "? Any widgets that depend on it will no longer work properly."))) {
          return this.props.onExtraTableRemove(table.id);
        }
      }
    }, {
      key: "searchRef",
      value: function searchRef(comp) {
        boundMethodCheck(this, IssuesListComponent); // Focus

        if (comp) {
          return comp.focus();
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this21 = this;

        var escapeRegExp, issueTypes, searchStringRegExp, tables;

        if (this.state.error) {
          return R('div', {
            className: "alert alert-danger"
          }, this.state.error);
        } // Filter issueTypes


        if (this.state.search) {
          escapeRegExp = function escapeRegExp(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          };

          searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i");
          issueTypes = _.filter(this.state.issueTypes, function (issueType) {
            return issueType.name.match(searchStringRegExp);
          });
        } else {
          issueTypes = this.state.issueTypes;
        } // Remove if already included


        issueTypes = _.filter(issueTypes, function (f) {
          var ref;
          return ref = "issues:".concat(f.id), indexOf.call(_this21.props.extraTables || [], ref) < 0;
        });
        tables = _.filter(this.props.schema.getTables(), function (table) {
          return (table.id.match(/^issues:/) || table.id.match(/^issue_events:/)) && !table.deprecated;
        });
        tables = _.sortBy(tables, function (t) {
          return t.name.en;
        });
        return R('div', null, R('label', null, "Included Issues:"), tables.length > 0 ? R(uiComponents.OptionListComponent, {
          items: _.map(tables, function (table) {
            return {
              name: ExprUtils.localizeString(table.name, _this21.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this21.context.locale),
              onClick: _this21.props.onChange.bind(null, table.id),
              onRemove: _this21.handleTableRemove.bind(null, table)
            };
          })
        }) : R('div', null, "None"), R('br'), R('label', null, "All Issues:"), !this.state.issueTypes || this.state.issueTypes.length === 0 ? R('div', {
          className: "alert alert-info"
        }, R('i', {
          className: "fa fa-spinner fa-spin"
        }), "\xA0Loading...") : [R('input', {
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
          onChange: function onChange(ev) {
            return _this21.setState({
              search: ev.target.value
            });
          }
        }), R(uiComponents.OptionListComponent, {
          items: _.map(issueTypes, function (issueType) {
            return {
              name: issueType.name,
              desc: issueType.desc,
              onClick: _this21.props.onChange.bind(null, "issues:" + issueType.id)
            };
          })
        })]);
      }
    }]);
    return IssuesListComponent;
  }(React.Component);

  ;
  IssuesListComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    // Url to hit api
    client: PropTypes.string,
    // Optional client
    schema: PropTypes.object.isRequired,
    user: PropTypes.string,
    // User id
    onChange: PropTypes.func.isRequired,
    // Called with table selected
    extraTables: PropTypes.array.isRequired,
    onExtraTableAdd: PropTypes.func.isRequired,
    onExtraTableRemove: PropTypes.func.isRequired
  };
  IssuesListComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return IssuesListComponent;
}.call(void 0);