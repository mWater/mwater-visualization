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

var ExprCleaner,
    ExprUtils,
    FilterExprComponent,
    FiltersDesignerComponent,
    MapFiltersDesignerComponent,
    MapUtils,
    PopoverHelpComponent,
    PropTypes,
    R,
    React,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require('mwater-expressions').ExprUtils;
PopoverHelpComponent = require('react-library/lib/PopoverHelpComponent');
FiltersDesignerComponent = require('../FiltersDesignerComponent');
MapUtils = require('./MapUtils'); // Designer for filters for a map

module.exports = MapFiltersDesignerComponent = function () {
  var MapFiltersDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MapFiltersDesignerComponent, _React$Component);

    var _super = _createSuper(MapFiltersDesignerComponent);

    function MapFiltersDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, MapFiltersDesignerComponent);
      _this = _super.apply(this, arguments);
      _this.handleFiltersChange = _this.handleFiltersChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleGlobalFiltersChange = _this.handleGlobalFiltersChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(MapFiltersDesignerComponent, [{
      key: "handleFiltersChange",
      value: function handleFiltersChange(filters) {
        var design;
        boundMethodCheck(this, MapFiltersDesignerComponent);
        design = _.extend({}, this.props.design, {
          filters: filters
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleGlobalFiltersChange",
      value: function handleGlobalFiltersChange(globalFilters) {
        var design;
        boundMethodCheck(this, MapFiltersDesignerComponent);
        design = _.extend({}, this.props.design, {
          globalFilters: globalFilters
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        var filterableTables; // Get filterable tables

        filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema);

        if (filterableTables.length === 0) {
          return null;
        }

        return R('div', null, R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Filters ", R(PopoverHelpComponent, {
          placement: "left"
        }, "Filters all layers in the map. Individual layers can be filtered by clicking on Customize...")), R('div', {
          style: {
            margin: 5
          }
        }, R(FiltersDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          filters: this.props.design.filters,
          onFiltersChange: this.handleFiltersChange,
          filterableTables: filterableTables
        }))), this.context.globalFiltersElementFactory ? R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Global Filters "), R('div', {
          style: {
            margin: 5
          }
        }, this.context.globalFiltersElementFactory({
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          filterableTables: filterableTables,
          globalFilters: this.props.design.globalFilters || [],
          onChange: this.handleGlobalFiltersChange
        }))) : void 0);
      }
    }]);
    return MapFiltersDesignerComponent;
  }(React.Component);

  ;
  MapFiltersDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func.isRequired // Called with new design

  };
  MapFiltersDesignerComponent.contextTypes = {
    globalFiltersElementFactory: PropTypes.func // Call with props { schema, dataSource, globalFilters, filterableTables, onChange, nullIfIrrelevant }. Displays a component to edit global filters

  };
  return MapFiltersDesignerComponent;
}.call(void 0);