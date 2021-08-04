"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var $,
    AddIndicatorConfirmPopupComponent,
    ExprUtils,
    FormsListComponent,
    IndicatorsListComponent,
    IssuesListComponent,
    MWaterCompleteTableSelectComponent,
    MWaterCustomTablesetListComponent,
    MWaterMetricsTableListComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    TabbedComponent,
    _,
    moment,
    querystring,
    sitesOrder,
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
uiComponents = require('./UIComponents');
ExprUtils = require("mwater-expressions").ExprUtils;
moment = require('moment');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent');
MWaterCustomTablesetListComponent = require('./MWaterCustomTablesetListComponent').MWaterCustomTablesetListComponent;
MWaterMetricsTableListComponent = require('./MWaterMetricsTableListComponent').MWaterMetricsTableListComponent;
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
}; // Allows selection of a table. Is the complete list mode of tables

module.exports = MWaterCompleteTableSelectComponent = function () {
  var MWaterCompleteTableSelectComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MWaterCompleteTableSelectComponent, _React$Component);

    var _super = _createSuper(MWaterCompleteTableSelectComponent);

    function MWaterCompleteTableSelectComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, MWaterCompleteTableSelectComponent);
      _this = _super.apply(this, arguments);
      _this.handleExtraTableAdd = _this.handleExtraTableAdd.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleExtraTableRemove = _this.handleExtraTableRemove.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(MWaterCompleteTableSelectComponent, [{
      key: "handleExtraTableAdd",
      value: function handleExtraTableAdd(tableId) {
        boundMethodCheck(this, MWaterCompleteTableSelectComponent);
        return this.props.onExtraTablesChange(_.union(this.props.extraTables, [tableId]));
      }
    }, {
      key: "handleExtraTableRemove",
      value: function handleExtraTableRemove(tableId) {
        boundMethodCheck(this, MWaterCompleteTableSelectComponent); // Set to null if current table

        if (this.props.table === tableId) {
          this.props.onChange(null);
        }

        return this.props.onExtraTablesChange(_.without(this.props.extraTables, tableId));
      }
    }, {
      key: "renderSites",
      value: function renderSites() {
        var _this2 = this;

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
            table = _this2.props.schema.getTable(tableId);
            return {
              name: ExprUtils.localizeString(table.name, _this2.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this2.context.locale),
              onClick: _this2.props.onChange.bind(null, table.id)
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
        var _this3 = this;

        var sweetSenseTables;
        sweetSenseTables = this.getSweetSenseTables();
        sweetSenseTables = _.sortBy(sweetSenseTables, function (table) {
          return table.name.en;
        });
        return R(uiComponents.OptionListComponent, {
          items: _.map(sweetSenseTables, function (table) {
            return {
              name: ExprUtils.localizeString(table.name, _this3.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this3.context.locale),
              onClick: _this3.props.onChange.bind(null, table.id)
            };
          })
        });
      }
    }, {
      key: "renderTablesets",
      value: function renderTablesets() {
        return R(MWaterCustomTablesetListComponent, {
          schema: this.props.schema,
          client: this.props.client,
          apiUrl: this.props.apiUrl,
          user: this.props.user,
          onChange: this.props.onChange,
          extraTables: this.props.extraTables,
          onExtraTableAdd: this.handleExtraTableAdd,
          onExtraTableRemove: this.handleExtraTableRemove,
          locale: this.context.locale
        });
      }
    }, {
      key: "renderMetrics",
      value: function renderMetrics() {
        return R(MWaterMetricsTableListComponent, {
          schema: this.props.schema,
          client: this.props.client,
          apiUrl: this.props.apiUrl,
          user: this.props.user,
          onChange: this.props.onChange,
          extraTables: this.props.extraTables,
          onExtraTableAdd: this.handleExtraTableAdd,
          onExtraTableRemove: this.handleExtraTableRemove,
          locale: this.context.locale
        });
      }
    }, {
      key: "renderOther",
      value: function renderOther() {
        var _this4 = this;

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
          } // Remove custom tablesets


          if (table.id.match(/^custom\./)) {
            return false;
          } // Remove metrics


          if (table.id.match(/^metric:/)) {
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
              name: ExprUtils.localizeString(table.name, _this4.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this4.context.locale),
              onClick: _this4.props.onChange.bind(null, table.id)
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
        }, {
          id: "tablesets",
          label: [R('i', {
            className: "fa fa-table"
          }), " Tables"],
          elem: this.renderTablesets()
        }, {
          id: "metrics",
          label: [R('i', {
            className: "fa fa-line-chart"
          }), " Metrics"],
          elem: this.renderMetrics()
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
    return MWaterCompleteTableSelectComponent;
  }(React.Component);

  ;
  MWaterCompleteTableSelectComponent.propTypes = {
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
  MWaterCompleteTableSelectComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return MWaterCompleteTableSelectComponent;
}.call(void 0);

FormsListComponent = function () {
  // Searchable list of forms
  var FormsListComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(FormsListComponent, _React$Component2);

    var _super2 = _createSuper(FormsListComponent);

    function FormsListComponent(props) {
      var _this5;

      (0, _classCallCheck2["default"])(this, FormsListComponent);
      _this5 = _super2.call(this, props);
      _this5.handleTableRemove = _this5.handleTableRemove.bind((0, _assertThisInitialized2["default"])(_this5));
      _this5.searchRef = _this5.searchRef.bind((0, _assertThisInitialized2["default"])(_this5));
      _this5.state = {
        forms: null,
        search: ""
      };
      return _this5;
    }

    (0, _createClass2["default"])(FormsListComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this6 = this;

        var query; // Get names and basic of forms

        query = {};
        query.fields = JSON.stringify({
          "design.name": 1,
          "design.description": 1,
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

            if (ref = "responses:" + form._id, indexOf.call(_this6.props.extraTables || [], ref) >= 0) {
              return 1;
            } else {
              return 0;
            }
          }, function (form) {
            if (form.created.by === _this6.props.user) {
              return 1;
            } else {
              return 0;
            }
          }, function (form) {
            return form.modified.on;
          }], ['desc', 'desc', 'desc']); // TODO use name instead of design.name

          return _this6.setState({
            forms: _.map(forms, function (form) {
              var desc;
              desc = ExprUtils.localizeString(form.design.description, _this6.context.locale) || "";

              if (desc) {
                desc += " - ";
              }

              desc += "Modified ".concat(moment(form.modified.on, moment.ISO_8601).format("ll"));
              return {
                id: form._id,
                name: ExprUtils.localizeString(form.design.name, _this6.context.locale),
                desc: desc
              };
            })
          });
        }).fail(function (xhr) {
          return _this6.setState({
            error: xhr.responseText
          });
        });
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
        var _this7 = this;

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
          return ref = "responses:".concat(f.id), indexOf.call(_this7.props.extraTables || [], ref) < 0;
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
              name: ExprUtils.localizeString(table.name, _this7.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this7.context.locale),
              onClick: _this7.props.onChange.bind(null, table.id),
              onRemove: _this7.handleTableRemove.bind(null, table)
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
            return _this7.setState({
              search: ev.target.value
            });
          }
        }), R(uiComponents.OptionListComponent, {
          items: _.map(forms, function (form) {
            return {
              name: form.name,
              desc: form.desc,
              onClick: _this7.props.onChange.bind(null, "responses:" + form.id)
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
  var IndicatorsListComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(IndicatorsListComponent, _React$Component3);

    var _super3 = _createSuper(IndicatorsListComponent);

    function IndicatorsListComponent(props) {
      var _this8;

      (0, _classCallCheck2["default"])(this, IndicatorsListComponent);
      _this8 = _super3.call(this, props);
      _this8.handleTableRemove = _this8.handleTableRemove.bind((0, _assertThisInitialized2["default"])(_this8));
      _this8.searchRef = _this8.searchRef.bind((0, _assertThisInitialized2["default"])(_this8));
      _this8.handleSelect = _this8.handleSelect.bind((0, _assertThisInitialized2["default"])(_this8));
      _this8.state = {
        indicators: null,
        search: ""
      };
      return _this8;
    }

    (0, _createClass2["default"])(IndicatorsListComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this9 = this;

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

            if (ref = "indicator_values:" + indicator._id, indexOf.call(_this9.props.extraTables || [], ref) >= 0) {
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
            return ExprUtils.localizeString(indicator.design.name, _this9.context.locale);
          }], ['asc', 'asc', 'asc']);
          return _this9.setState({
            indicators: _.map(indicators, function (indicator) {
              return {
                id: indicator._id,
                name: ExprUtils.localizeString(indicator.design.name, _this9.context.locale),
                desc: ExprUtils.localizeString(indicator.design.desc, _this9.context.locale)
              };
            })
          });
        }).fail(function (xhr) {
          return _this9.setState({
            error: xhr.responseText
          });
        });
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
        var _this10 = this;

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
          return ref = "indicator_values:".concat(f.id), indexOf.call(_this10.props.extraTables || [], ref) < 0;
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
            return _this10.addIndicatorConfirmPopup = c;
          }
        }), R('label', null, "Included Indicators:"), tables.length > 0 ? R(uiComponents.OptionListComponent, {
          items: _.map(tables, function (table) {
            return {
              name: ExprUtils.localizeString(table.name, _this10.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this10.context.locale),
              onClick: _this10.handleSelect.bind(null, table.id),
              onRemove: _this10.handleTableRemove.bind(null, table)
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
            return _this10.setState({
              search: ev.target.value
            });
          }
        }), R(uiComponents.OptionListComponent, {
          items: _.map(indicators, function (indicator) {
            return {
              name: indicator.name,
              desc: indicator.desc,
              onClick: _this10.handleSelect.bind(null, "indicator_values:" + indicator.id)
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
  var AddIndicatorConfirmPopupComponent = /*#__PURE__*/function (_React$Component4) {
    (0, _inherits2["default"])(AddIndicatorConfirmPopupComponent, _React$Component4);

    var _super4 = _createSuper(AddIndicatorConfirmPopupComponent);

    function AddIndicatorConfirmPopupComponent(props) {
      var _this11;

      (0, _classCallCheck2["default"])(this, AddIndicatorConfirmPopupComponent);
      _this11 = _super4.call(this, props);
      _this11.state = {
        visible: false,
        indicatorTable: null
      };
      return _this11;
    }

    (0, _createClass2["default"])(AddIndicatorConfirmPopupComponent, [{
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
        var _this12 = this;

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
        return R('div', null, R('p', null, "In general, it is better to get indicator values from the related site. Please select the site \nbelow, then find the indicator values in the 'Related Indicators' section. Or click on 'Use Raw Indicator' if you \nare certain that you want to use the raw indicator table"), R(uiComponents.OptionListComponent, {
          items: _.map(entityColumns, function (entityColumn) {
            return {
              name: ExprUtils.localizeString(entityColumn.name, _this12.context.locale),
              desc: ExprUtils.localizeString(entityColumn.desc, _this12.context.locale),
              onClick: function onClick() {
                // Select table
                _this12.props.onChange(entityColumn.join.toTable);

                return _this12.setState({
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
        var _this13 = this;

        if (!this.state.visible) {
          return null;
        }

        return R(ModalPopupComponent, {
          showCloseX: true,
          onClose: function onClose() {
            return _this13.setState({
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
  var IssuesListComponent = /*#__PURE__*/function (_React$Component5) {
    (0, _inherits2["default"])(IssuesListComponent, _React$Component5);

    var _super5 = _createSuper(IssuesListComponent);

    function IssuesListComponent(props) {
      var _this14;

      (0, _classCallCheck2["default"])(this, IssuesListComponent);
      _this14 = _super5.call(this, props);
      _this14.handleTableRemove = _this14.handleTableRemove.bind((0, _assertThisInitialized2["default"])(_this14));
      _this14.searchRef = _this14.searchRef.bind((0, _assertThisInitialized2["default"])(_this14));
      _this14.state = {
        issueTypes: null,
        search: ""
      };
      return _this14;
    }

    (0, _createClass2["default"])(IssuesListComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this15 = this;

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

            if (ref = "issues:" + issueType._id, indexOf.call(_this15.props.extraTables || [], ref) >= 0) {
              return 0;
            } else {
              return 1;
            }
          }, function (issueType) {
            if (issueType.created.by === _this15.props.user) {
              return 0;
            } else {
              return 1;
            }
          }, function (issueType) {
            return ExprUtils.localizeString(issueType.name, _this15.context.locale);
          }], ['asc', 'asc', 'asc']);
          return _this15.setState({
            issueTypes: _.map(issueTypes, function (issueType) {
              return {
                id: issueType._id,
                name: ExprUtils.localizeString(issueType.name, _this15.context.locale),
                desc: ExprUtils.localizeString(issueType.desc, _this15.context.locale)
              };
            })
          });
        }).fail(function (xhr) {
          return _this15.setState({
            error: xhr.responseText
          });
        });
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
        var _this16 = this;

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
          return ref = "issues:".concat(f.id), indexOf.call(_this16.props.extraTables || [], ref) < 0;
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
              name: ExprUtils.localizeString(table.name, _this16.context.locale),
              desc: ExprUtils.localizeString(table.desc, _this16.context.locale),
              onClick: _this16.props.onChange.bind(null, table.id),
              onRemove: _this16.handleTableRemove.bind(null, table)
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
            return _this16.setState({
              search: ev.target.value
            });
          }
        }), R(uiComponents.OptionListComponent, {
          items: _.map(issueTypes, function (issueType) {
            return {
              name: issueType.name,
              desc: issueType.desc,
              onClick: _this16.props.onChange.bind(null, "issues:" + issueType.id)
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