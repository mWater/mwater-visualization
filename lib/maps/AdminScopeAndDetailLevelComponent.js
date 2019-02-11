"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var AdminScopeAndDetailLevelComponent,
    DetailLevelSelectComponent,
    PropTypes,
    R,
    React,
    ReactSelect,
    RegionSelectComponent,
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
RegionSelectComponent = require('./RegionSelectComponent');
DetailLevelSelectComponent = require('./DetailLevelSelectComponent');
ReactSelect = require('react-select').default; // Scope and detail level setter for AdminChoropleth layers when using admin_regions

module.exports = AdminScopeAndDetailLevelComponent = function () {
  var AdminScopeAndDetailLevelComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(AdminScopeAndDetailLevelComponent, _React$Component);

    function AdminScopeAndDetailLevelComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, AdminScopeAndDetailLevelComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AdminScopeAndDetailLevelComponent).apply(this, arguments));
      _this.handleScopeChange = _this.handleScopeChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleDetailLevelChange = _this.handleDetailLevelChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(AdminScopeAndDetailLevelComponent, [{
      key: "handleScopeChange",
      value: function handleScopeChange(scope, scopeLevel) {
        boundMethodCheck(this, AdminScopeAndDetailLevelComponent);

        if (scope) {
          // Detail level will be set by DetailLevelSelectComponent
          return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, null);
        } else {
          return this.props.onScopeAndDetailLevelChange(null, null, 0);
        }
      }
    }, {
      key: "handleDetailLevelChange",
      value: function handleDetailLevelChange(detailLevel) {
        boundMethodCheck(this, AdminScopeAndDetailLevelComponent);
        return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var basicDetailLevelOptions;
        basicDetailLevelOptions = [{
          value: 0,
          label: "Countries"
        }, {
          value: 1,
          label: "Level 1 (State/Province/District)"
        }];
        return R('div', null, R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Region to Map"), R(RegionSelectComponent, {
          region: this.props.scope,
          onChange: this.handleScopeChange,
          schema: this.props.schema,
          dataSource: this.props.dataSource
        })), this.props.scope != null && this.props.detailLevel != null ? R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Detail Level"), R(DetailLevelSelectComponent, {
          scope: this.props.scope,
          scopeLevel: this.props.scopeLevel,
          detailLevel: this.props.detailLevel,
          onChange: this.handleDetailLevelChange,
          schema: this.props.schema,
          dataSource: this.props.dataSource // Case of whole world. Allow selecting country or admin level 1

        })) : this.props.scope == null && this.props.detailLevel != null ? R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Detail Level"), R(ReactSelect, {
          value: _.findWhere(basicDetailLevelOptions, {
            value: this.props.detailLevel
          }) || null,
          options: basicDetailLevelOptions,
          onChange: function onChange(opt) {
            return _this2.handleDetailLevelChange(opt.value);
          }
        })) : void 0);
      }
    }]);
    return AdminScopeAndDetailLevelComponent;
  }(React.Component);

  ;
  AdminScopeAndDetailLevelComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    scope: PropTypes.string,
    // admin region that is outside bounds. null for whole world
    scopeLevel: PropTypes.number,
    // level of scope region. null for whole world
    detailLevel: PropTypes.number,
    // Detail level within scope region
    onScopeAndDetailLevelChange: PropTypes.func.isRequired // Called with (scope, scopeLevel, detailLevel)

  };
  return AdminScopeAndDetailLevelComponent;
}.call(void 0);