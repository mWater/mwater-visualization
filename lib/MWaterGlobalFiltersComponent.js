"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var IdLiteralComponent,
    MWaterGlobalFiltersComponent,
    PropTypes,
    R,
    React,
    _,
    querystring,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
querystring = require('querystring');
ui = require('react-library/lib/bootstrap');
IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent; // Control to edit the global filters (_managed_by and admin_region)

module.exports = MWaterGlobalFiltersComponent = function () {
  var MWaterGlobalFiltersComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(MWaterGlobalFiltersComponent, _React$Component);

    function MWaterGlobalFiltersComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, MWaterGlobalFiltersComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(MWaterGlobalFiltersComponent).apply(this, arguments));
      _this.handleRegionsChange = _this.handleRegionsChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleManagedByChange = _this.handleManagedByChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(MWaterGlobalFiltersComponent, [{
      key: "handleRegionsChange",
      value: function handleRegionsChange(regions) {
        var globalFilters;
        boundMethodCheck(this, MWaterGlobalFiltersComponent); // Remove existing filter

        globalFilters = _.filter(this.props.globalFilters || [], function (gf) {
          return !(gf.op === "within any" && gf.columnId === "admin_region");
        }); // Add new filter if present

        if (regions && regions.length > 0) {
          globalFilters.push({
            columnId: "admin_region",
            columnType: "id",
            op: "within any",
            exprs: [{
              type: "literal",
              valueType: "id[]",
              idTable: "admin_regions",
              value: regions
            }]
          });
        }

        return this.props.onChange(globalFilters);
      }
    }, {
      key: "handleManagedByChange",
      value: function handleManagedByChange(managedBy) {
        var globalFilters;
        boundMethodCheck(this, MWaterGlobalFiltersComponent); // Remove existing filter

        globalFilters = _.filter(this.props.globalFilters || [], function (gf) {
          return !(gf.op === "within" && gf.columnId === "_managed_by");
        }); // Add new filter if present

        if (managedBy) {
          globalFilters.push({
            columnId: "_managed_by",
            columnType: "id",
            op: "within",
            exprs: [{
              type: "literal",
              valueType: "id",
              idTable: "subjects",
              value: "group:" + managedBy
            }]
          });
        }

        return this.props.onChange(globalFilters);
      }
    }, {
      key: "render",
      value: function render() {
        var adminRegionEntry, adminRegions, managedBy, managedByEntry; // Find managed by

        managedByEntry = _.find(this.props.globalFilters, function (gf) {
          return gf.op === "within" && gf.columnId === "_managed_by";
        });

        if (managedByEntry) {
          managedBy = managedByEntry.exprs[0].value.split(":")[1];
        } else {
          managedBy = null;
        } // Find admin region


        adminRegionEntry = _.find(this.props.globalFilters, function (gf) {
          return gf.op === "within any" && gf.columnId === "admin_region";
        });

        if (adminRegionEntry) {
          adminRegions = adminRegionEntry.exprs[0].value;
        } else {
          adminRegions = null;
        }

        return R('div', null, R(ui.FormGroup, {
          label: "Only sites managed by",
          labelMuted: true
        }, R(IdLiteralComponent, {
          value: managedBy,
          onChange: this.handleManagedByChange,
          idTable: "groups",
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          placeholder: "All Organizations",
          multi: false,
          filter: {
            type: "field",
            tableAlias: "main",
            column: "canManageEntities"
          }
        })), R(ui.FormGroup, {
          label: "Only sites located in",
          labelMuted: true
        }, R(IdLiteralComponent, {
          value: adminRegions,
          onChange: this.handleRegionsChange,
          idTable: "admin_regions",
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          placeholder: "All Regions",
          multi: true,
          orderBy: [{
            expr: {
              type: "field",
              tableAlias: "main",
              column: "level"
            },
            direction: "asc"
          }]
        })));
      }
    }]);
    return MWaterGlobalFiltersComponent;
  }(React.Component);

  ;
  MWaterGlobalFiltersComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema of the database
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    filterableTables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    globalFilters: PropTypes.array,
    onChange: PropTypes.func.isRequired
  };
  return MWaterGlobalFiltersComponent;
}.call(void 0);