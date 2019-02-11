"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ActionCancelModalComponent,
    DashboardUtils,
    FiltersDesignerComponent,
    PropTypes,
    QuickfiltersDesignComponent,
    R,
    React,
    ReactSelect,
    SettingsModalComponent,
    _,
    languages,
    ui,
    update,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
update = require('update-object');
languages = require('languages');
ui = require('react-library/lib/bootstrap');
ReactSelect = require('react-select').default;
DashboardUtils = require('./DashboardUtils');
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');
QuickfiltersDesignComponent = require('../quickfilter/QuickfiltersDesignComponent');
FiltersDesignerComponent = require('../FiltersDesignerComponent'); // Popup with settings for dashboard

module.exports = SettingsModalComponent = function () {
  var SettingsModalComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(SettingsModalComponent, _React$Component);

    function SettingsModalComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, SettingsModalComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(SettingsModalComponent).call(this, props));
      _this.handleSave = _this.handleSave.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleCancel = _this.handleCancel.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleDesignChange = _this.handleDesignChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleFiltersChange = _this.handleFiltersChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleGlobalFiltersChange = _this.handleGlobalFiltersChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        design: null // Set when being edited

      };
      return _this;
    }

    (0, _createClass2.default)(SettingsModalComponent, [{
      key: "show",
      value: function show(design) {
        return this.setState({
          design: design
        });
      }
    }, {
      key: "handleSave",
      value: function handleSave() {
        boundMethodCheck(this, SettingsModalComponent);
        this.props.onDesignChange(this.state.design);
        return this.setState({
          design: null
        });
      }
    }, {
      key: "handleCancel",
      value: function handleCancel() {
        boundMethodCheck(this, SettingsModalComponent);
        return this.setState({
          design: null
        });
      }
    }, {
      key: "handleDesignChange",
      value: function handleDesignChange(design) {
        boundMethodCheck(this, SettingsModalComponent);
        return this.setState({
          design: design
        });
      }
    }, {
      key: "handleFiltersChange",
      value: function handleFiltersChange(filters) {
        var design;
        boundMethodCheck(this, SettingsModalComponent);
        design = _.extend({}, this.state.design, {
          filters: filters
        });
        return this.handleDesignChange(design);
      }
    }, {
      key: "handleGlobalFiltersChange",
      value: function handleGlobalFiltersChange(globalFilters) {
        var design;
        boundMethodCheck(this, SettingsModalComponent);
        design = _.extend({}, this.state.design, {
          globalFilters: globalFilters
        });
        return this.handleDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var filterableTables, localeOptions; // Don't show if not editing

        if (!this.state.design) {
          return null;
        } // Get filterable tables


        filterableTables = DashboardUtils.getFilterableTables(this.state.design, this.props.schema);
        localeOptions = _.map(languages.getAllLanguageCode(), function (code) {
          return {
            value: code,
            label: languages.getLanguageInfo(code).name + " (" + languages.getLanguageInfo(code).nativeName + ")"
          };
        });
        return R(ActionCancelModalComponent, {
          size: "large",
          onCancel: this.handleCancel,
          onAction: this.handleSave
        }, R('div', {
          style: {
            paddingBottom: 200
          }
        }, R('h4', null, "Quick Filters"), R('div', {
          className: "text-muted"
        }, "Quick filters are shown to the user as a dropdown at the top of the dashboard and can be used to filter data of widgets."), filterableTables.length > 0 ? R(QuickfiltersDesignComponent, {
          design: this.state.design.quickfilters,
          onDesignChange: function onDesignChange(design) {
            return _this2.handleDesignChange(update(_this2.state.design, {
              quickfilters: {
                $set: design
              }
            }));
          },
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          tables: filterableTables
        }) : "Nothing to quickfilter. Add widgets to the dashboard", R('h4', {
          style: {
            paddingTop: 10
          }
        }, "Filters"), R('div', {
          className: "text-muted"
        }, "Filters are built in to the dashboard and cannot be changed by viewers of the dashboard."), filterableTables.length > 0 ? R(FiltersDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          filters: this.state.design.filters,
          onFiltersChange: this.handleFiltersChange,
          filterableTables: filterableTables
        }) : "Nothing to filter. Add widgets to the dashboard", this.context.globalFiltersElementFactory ? R('div', null, R('h4', {
          style: {
            paddingTop: 10
          }
        }, "Global Filters"), this.context.globalFiltersElementFactory({
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          filterableTables: filterableTables,
          globalFilters: this.state.design.globalFilters || [],
          onChange: this.handleGlobalFiltersChange
        })) : void 0, R('h4', {
          style: {
            paddingTop: 10
          }
        }, "Language"), R('div', {
          className: "text-muted"
        }, "Controls the preferred language of widgets and uses specified language when available"), R(ReactSelect, {
          value: _.findWhere(localeOptions, {
            value: this.state.design.locale || "en"
          }) || null,
          options: localeOptions,
          onChange: function onChange(locale) {
            return _this2.handleDesignChange(update(_this2.state.design, {
              locale: {
                $set: locale.value
              }
            }));
          }
        }), R('h4', {
          style: {
            paddingTop: 10
          }
        }, "Advanced"), R(ui.Checkbox, {
          value: this.state.design.implicitFiltersEnabled != null ? this.state.design.implicitFiltersEnabled : true,
          onChange: function onChange(value) {
            return _this2.handleDesignChange(update(_this2.state.design, {
              implicitFiltersEnabled: {
                $set: value
              }
            }));
          }
        }, "Enable Implicit Filtering (leave unchecked for new dashboards)")));
      }
    }]);
    return SettingsModalComponent;
  }(React.Component);

  ;
  SettingsModalComponent.propTypes = {
    onDesignChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired
  };
  SettingsModalComponent.contextTypes = {
    globalFiltersElementFactory: PropTypes.func // Call with props { schema, dataSource, globalFilters, onChange, nullIfIrrelevant }. Displays a component to edit global filters

  };
  return SettingsModalComponent;
}.call(void 0);