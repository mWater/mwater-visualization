"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var $,
    EditModeTableSelectComponent,
    ExprUtils,
    MWaterCompleteTableSelectComponent,
    MWaterResponsesFilterComponent,
    MWaterTableSelectComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    _,
    uiComponents,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
$ = require('jquery');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
uiComponents = require('./UIComponents');
ExprUtils = require("mwater-expressions").ExprUtils;
MWaterResponsesFilterComponent = require('./MWaterResponsesFilterComponent');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent');
MWaterCompleteTableSelectComponent = require('./MWaterCompleteTableSelectComponent'); // Allows selection of a mwater-visualization table. Loads forms as well and calls event if modified

module.exports = MWaterTableSelectComponent = function () {
  var MWaterTableSelectComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MWaterTableSelectComponent, _React$Component);

    var _super = _createSuper(MWaterTableSelectComponent);

    function MWaterTableSelectComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MWaterTableSelectComponent);
      _this = _super.call(this, props);
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        pendingExtraTable: null // Set when waiting for a table to load

      };
      return _this;
    }

    (0, _createClass2["default"])(MWaterTableSelectComponent, [{
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

        boundMethodCheck(this, MWaterTableSelectComponent); // If not part of extra tables, add it and wait for new schema

        if (tableId && !this.props.schema.getTable(tableId)) {
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
          editor: editor // Make sure table still exists

        }), this.props.table && this.props.onFilterChange && this.props.table.match(/^responses:/) && this.props.schema.getTable(this.props.table) ? R(MWaterResponsesFilterComponent, {
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
  var EditModeTableSelectComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(EditModeTableSelectComponent, _React$Component2);

    var _super2 = _createSuper(EditModeTableSelectComponent);

    function EditModeTableSelectComponent(props) {
      var _this4;

      (0, _classCallCheck2["default"])(this, EditModeTableSelectComponent);
      _this4 = _super2.call(this, props);
      _this4.handleShowMore = _this4.handleShowMore.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleCompleteChange = _this4.handleCompleteChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.state = {
        // True when in popup mode that shows all tables
        completeMode: false
      };
      return _this4;
    }

    (0, _createClass2["default"])(EditModeTableSelectComponent, [{
      key: "handleShowMore",
      value: function handleShowMore() {
        boundMethodCheck(this, EditModeTableSelectComponent);
        return this.setState({
          completeMode: true
        });
      } // Get list of tables that should be included in shortlist
      // This is all active tables and all responses tables in schema (so as to include rosters) and all extra tables
      // Also includes current table

    }, {
      key: "getTableShortlist",
      value: function getTableShortlist() {
        var _this5 = this;

        var extraTable, i, j, len, len1, ref, ref1, table, tables;
        tables = this.context.activeTables || []; // Remove dead tables

        tables = tables.filter(function (t) {
          return _this5.props.schema.getTable(t) != null;
        });
        tables = _.union(tables, _.filter(_.pluck(this.props.schema.getTables(), "id"), function (t) {
          return t.match(/^responses:/);
        }));

        if (this.props.table) {
          tables = _.union(tables, [this.props.table]);
        }

        ref = this.props.extraTables || [];

        for (i = 0, len = ref.length; i < len; i++) {
          extraTable = ref[i]; // Check if wildcard

          if (extraTable.match(/\*$/)) {
            ref1 = this.props.schema.getTables();

            for (j = 0, len1 = ref1.length; j < len1; j++) {
              table = ref1[j];

              if (table.id.startsWith(extraTable.substr(0, extraTable.length - 1)) && !table.deprecated) {
                tables = _.union(tables, [table.id]);
              }
            }
          } else {
            // Add if exists
            if (this.props.schema.getTable(extraTable) && !table.deprecated) {
              tables = _.union(tables, [extraTable]);
            }
          }
        } // Sort by name


        tables = _.sortBy(tables, function (tableId) {
          return ExprUtils.localizeString(_this5.props.schema.getTable(tableId).name, _this5.context.locale);
        });
        return tables;
      }
    }, {
      key: "handleCompleteChange",
      value: function handleCompleteChange(tableId) {
        boundMethodCheck(this, EditModeTableSelectComponent);
        this.setState({
          completeMode: false
        });
        return this.props.onChange(tableId);
      }
    }, {
      key: "render",
      value: function render() {
        var _this6 = this;

        var items;
        items = _.map(this.getTableShortlist(), function (tableId) {
          var table;
          table = _this6.props.schema.getTable(tableId);
          return {
            name: ExprUtils.localizeString(table.name, _this6.context.locale),
            desc: ExprUtils.localizeString(table.desc, _this6.context.locale),
            onClick: _this6.props.onChange.bind(null, table.id)
          };
        });
        return R('div', null, this.state.completeMode ? R(ModalPopupComponent, {
          header: "Select Data Source",
          onClose: function onClose() {
            return _this6.setState({
              completeMode: false
            });
          },
          showCloseX: true,
          size: "large"
        }, R(MWaterCompleteTableSelectComponent, {
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          schema: this.props.schema,
          user: this.props.user,
          table: this.props.table,
          onChange: this.handleCompleteChange,
          extraTables: this.props.extraTables,
          onExtraTablesChange: this.props.onExtraTablesChange
        })) : void 0, items.length > 0 ? [R('div', {
          className: "text-muted"
        }, "Select Data Source:"), R(uiComponents.OptionListComponent, {
          items: items
        }), R('div', null, items.length > 0 ? R('button', {
          type: "button",
          className: "btn btn-link btn-sm",
          onClick: this.handleShowMore
        }, "Show All Available Data Sources...") : void 0)] : R('button', {
          type: "button",
          className: "btn btn-link",
          onClick: this.handleShowMore
        }, "Select Data Source..."));
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