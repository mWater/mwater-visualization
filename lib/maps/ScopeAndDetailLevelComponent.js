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

var DetailLevelSelectComponent,
    ExprUtils,
    H,
    PropTypes,
    R,
    React,
    RegionSelectComponent,
    ScopeAndDetailLevelComponent,
    _,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
H = React.DOM;
R = React.createElement;
ExprUtils = require('mwater-expressions').ExprUtils;
RegionSelectComponent = require('./RegionSelectComponent');
DetailLevelSelectComponent = require('./DetailLevelSelectComponent');
ui = require('react-library/lib/bootstrap'); // Generic scope and detail level setter for AdminChoropleth layers 

module.exports = ScopeAndDetailLevelComponent = function () {
  var ScopeAndDetailLevelComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ScopeAndDetailLevelComponent, _React$Component);

    var _super = _createSuper(ScopeAndDetailLevelComponent);

    function ScopeAndDetailLevelComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, ScopeAndDetailLevelComponent);
      _this = _super.apply(this, arguments);
      _this.handleScopeChange = _this.handleScopeChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleDetailLevelChange = _this.handleDetailLevelChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(ScopeAndDetailLevelComponent, [{
      key: "handleScopeChange",
      value: function handleScopeChange(scope, scopeLevel) {
        boundMethodCheck(this, ScopeAndDetailLevelComponent);

        if (scope) {
          return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1);
        } else {
          return this.props.onScopeAndDetailLevelChange(null, null, 0);
        }
      }
    }, {
      key: "handleDetailLevelChange",
      value: function handleDetailLevelChange(detailLevel) {
        boundMethodCheck(this, ScopeAndDetailLevelComponent);
        return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
      }
    }, {
      key: "render",
      value: function render() {
        var detailLevelOptions, i, level, levelColumn, maxLevel; // Determine number of levels by looking for levelN field

        maxLevel = 0;
        detailLevelOptions = [];

        for (level = i = 0; i <= 9; level = ++i) {
          levelColumn = this.props.schema.getColumn(this.props.regionsTable, "level".concat(level));

          if (levelColumn) {
            maxLevel = level; // Can't select same detail level as scope

            if (level > (this.props.scopeLevel != null ? this.props.scopeLevel : -1)) {
              detailLevelOptions.push({
                value: level,
                label: ExprUtils.localizeString(levelColumn.name)
              });
            }
          }
        }

        return R('div', null, R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Region to Map"), R(RegionSelectComponent, {
          region: this.props.scope,
          onChange: this.handleScopeChange,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          regionsTable: this.props.regionsTable,
          maxLevel: maxLevel - 1,
          placeholder: "All Regions"
        })), R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Detail Level"), R(ui.Select, {
          value: this.props.detailLevel,
          options: detailLevelOptions,
          onChange: this.handleDetailLevelChange
        })));
      }
    }]);
    return ScopeAndDetailLevelComponent;
  }(React.Component);

  ;
  ScopeAndDetailLevelComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    scope: PropTypes.string,
    // admin region that is outside bounds. null for whole world
    scopeLevel: PropTypes.number,
    // level of scope region. null for whole world
    detailLevel: PropTypes.number,
    // Detail level within scope region
    onScopeAndDetailLevelChange: PropTypes.func.isRequired,
    // Called with (scope, scopeLevel, detailLevel)
    regionsTable: PropTypes.string.isRequired // Table name of regions

  };
  return ScopeAndDetailLevelComponent;
}.call(void 0);