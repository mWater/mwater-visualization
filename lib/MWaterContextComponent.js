"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var MWaterAddRelatedFormComponent,
    MWaterAddRelatedIndicatorComponent,
    MWaterContextComponent,
    MWaterGlobalFiltersComponent,
    MWaterTableSelectComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
MWaterTableSelectComponent = require('./MWaterTableSelectComponent');
MWaterAddRelatedFormComponent = require('./MWaterAddRelatedFormComponent');
MWaterAddRelatedIndicatorComponent = require('./MWaterAddRelatedIndicatorComponent');
MWaterGlobalFiltersComponent = require('./MWaterGlobalFiltersComponent'); // Creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
// and several other context items

module.exports = MWaterContextComponent = function () {
  var MWaterContextComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(MWaterContextComponent, _React$Component);

    function MWaterContextComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, MWaterContextComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(MWaterContextComponent).apply(this, arguments));
      _this.handleAddTable = _this.handleAddTable.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(MWaterContextComponent, [{
      key: "getChildContext",
      value: function getChildContext() {
        var _this2 = this;

        var context;
        context = {};

        context.tableSelectElementFactory = function (props) {
          return React.createElement(MWaterTableSelectComponent, {
            apiUrl: _this2.props.apiUrl,
            client: _this2.props.client,
            schema: props.schema,
            user: _this2.props.user,
            table: props.value,
            onChange: props.onChange,
            extraTables: _this2.props.extraTables,
            onExtraTablesChange: _this2.props.onExtraTablesChange,
            filter: props.filter,
            onFilterChange: props.onFilterChange
          });
        };

        if (this.props.addLayerElementFactory) {
          context.addLayerElementFactory = this.props.addLayerElementFactory;
        }

        context.globalFiltersElementFactory = function (props) {
          if (props.nullIfIrrelevant && !_.any(props.filterableTables, function (t) {
            return t.match(/^entities./);
          })) {
            return null;
          }

          return React.createElement(MWaterGlobalFiltersComponent, props);
        };

        context.decorateScalarExprTreeSectionChildren = function (options) {
          // If related forms section of entities table
          if (options.tableId.match(/^entities\./) && options.section.id === "!related_forms") {
            return R('div', {
              key: "_add_related_form_parent"
            }, options.children, R(MWaterAddRelatedFormComponent, {
              key: "_add_related_form",
              table: options.tableId,
              apiUrl: _this2.props.apiUrl,
              client: _this2.props.client,
              user: _this2.props.user,
              schema: _this2.props.schema,
              onSelect: _this2.handleAddTable
            }));
          } // If indicators section of entities table


          if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
            return R('div', {
              key: "_add_related_indicator_parent"
            }, options.children, R(MWaterAddRelatedIndicatorComponent, {
              key: "_add_related_indicator",
              table: options.tableId,
              apiUrl: _this2.props.apiUrl,
              client: _this2.props.client,
              user: _this2.props.user,
              schema: _this2.props.schema,
              onSelect: _this2.handleAddTable,
              filter: options.filter
            }));
          } else {
            return options.children;
          }
        }; // Always match indicator section


        context.isScalarExprTreeSectionMatch = function (options) {
          if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
            return true;
          }

          return null;
        }; // Always open indicator section


        context.isScalarExprTreeSectionInitiallyOpen = function (options) {
          if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
            return true;
          }

          return null;
        };

        return context;
      }
    }, {
      key: "handleAddTable",
      value: function handleAddTable(table) {
        var extraTables;
        boundMethodCheck(this, MWaterContextComponent);
        extraTables = _.union(this.props.extraTables, [table]);
        return this.props.onExtraTablesChange(extraTables);
      }
    }, {
      key: "render",
      value: function render() {
        return this.props.children;
      }
    }]);
    return MWaterContextComponent;
  }(React.Component);

  ;
  MWaterContextComponent.propTypes = {
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    user: PropTypes.string,
    // user id of logged in user
    extraTables: PropTypes.arrayOf(PropTypes.string),
    // Extra tables to load in schema. Forms are not loaded by default as they are too many
    onExtraTablesChange: PropTypes.func,
    // Called when extra tables are changed and schema will be reloaded
    schema: PropTypes.object.isRequired,
    // Override default add layer component. See AddLayerComponent for details
    addLayerElementFactory: PropTypes.func
  };
  MWaterContextComponent.childContextTypes = {
    tableSelectElementFactory: PropTypes.func,
    // Call with props of TableSelectComponent
    addLayerElementFactory: PropTypes.func,
    // Call with props of AddLayerComponent
    globalFiltersElementFactory: PropTypes.func,
    // Call with props { schema, dataSource, filterableTables, globalFilters, onChange, nullIfIrrelevant }. 
    // Displays a component to edit global filters. nullIfIrrelevant causes null element if not applicable to filterableTables
    // Decorates sections (the children element, specifically) in the expression picker
    decorateScalarExprTreeSectionChildren: PropTypes.func,
    // Function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return true to set initially open
    isScalarExprTreeSectionInitiallyOpen: PropTypes.func,
    // Function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
    // Should return null for default, true to include, false to exclude
    isScalarExprTreeSectionMatch: PropTypes.func
  };
  return MWaterContextComponent;
}.call(void 0);