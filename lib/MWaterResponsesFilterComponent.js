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

var ExprUtils,
    MWaterResponsesFilterComponent,
    PropTypes,
    R,
    React,
    _,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
ExprUtils = require('mwater-expressions').ExprUtils;
ui = require('react-library/lib/bootstrap'); // Implements common filters for responses tables. Allows filtering by final responses only and also
// by latest for each site type linked to responses.

module.exports = MWaterResponsesFilterComponent = function () {
  var MWaterResponsesFilterComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MWaterResponsesFilterComponent, _React$Component);

    var _super = _createSuper(MWaterResponsesFilterComponent);

    function MWaterResponsesFilterComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, MWaterResponsesFilterComponent);
      _this = _super.apply(this, arguments);
      _this.handleSiteChange = _this.handleSiteChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFinalChange = _this.handleFinalChange.bind((0, _assertThisInitialized2["default"])(_this)); // Recreate all filters

      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    } // Expand "and" and null filters into a list of filters


    (0, _createClass2["default"])(MWaterResponsesFilterComponent, [{
      key: "getFilters",
      value: function getFilters() {
        if (!this.props.filter) {
          return [];
        }

        if (this.props.filter.type === "op" && this.props.filter.op === "and") {
          return this.props.filter.exprs;
        }

        return [this.props.filter];
      } // Set filters in most compact way possible

    }, {
      key: "setFilters",
      value: function setFilters(filters) {
        if (filters.length === 0) {
          return this.props.onFilterChange(null);
        } else if (filters.length === 1) {
          return this.props.onFilterChange(filters[0]);
        } else {
          return this.props.onFilterChange({
            type: "op",
            op: "and",
            table: this.props.table,
            exprs: filters
          });
        }
      }
    }, {
      key: "getFinalFilter",
      value: function getFinalFilter() {
        return {
          type: "op",
          op: "= any",
          table: this.props.table,
          exprs: [{
            type: "field",
            table: this.props.table,
            column: "status"
          }, {
            type: "literal",
            valueType: "enumset",
            value: ["final"]
          }]
        };
      }
    }, {
      key: "isFinal",
      value: function isFinal() {
        var _this2 = this;

        // Determine if final
        return _.any(this.getFilters(), function (f) {
          return _.isEqual(f, _this2.getFinalFilter()) || (f != null ? f.op : void 0) === "is latest" && _.isEqual(f.exprs[1], _this2.getFinalFilter());
        });
      } // Get column id of site filtering on latest

    }, {
      key: "getSiteValue",
      value: function getSiteValue() {
        var _this3 = this;

        var column, filters, i, len, ref;
        filters = this.getFilters();
        ref = this.props.schema.getColumns(this.props.table); // Get site columns

        for (i = 0, len = ref.length; i < len; i++) {
          column = ref[i];

          if (column.type === "join" && column.join.type === "n-1" && column.join.toTable.startsWith("entities.") && column.id.match(/^data:/)) {
            // Check for match
            if (_.any(filters, function (f) {
              return (f != null ? f.op : void 0) === "is latest" && _.isEqual(f.exprs[0], {
                type: "field",
                table: _this3.props.table,
                column: column.id
              });
            })) {
              return column.id;
            }
          }
        }

        return null;
      }
    }, {
      key: "handleSiteChange",
      value: function handleSiteChange(site) {
        boundMethodCheck(this, MWaterResponsesFilterComponent);
        return this.handleChange(this.isFinal(), site);
      }
    }, {
      key: "handleFinalChange",
      value: function handleFinalChange(_final) {
        boundMethodCheck(this, MWaterResponsesFilterComponent);
        return this.handleChange(_final, this.getSiteValue());
      }
    }, {
      key: "handleChange",
      value: function handleChange(_final2, site) {
        var _this4 = this;

        var filter, filters;
        boundMethodCheck(this, MWaterResponsesFilterComponent); // Strip all filters

        filters = this.getFilters(); // Strip simple

        filters = _.filter(filters, function (f) {
          return !_.isEqual(f, _this4.getFinalFilter());
        }); // Strip "is latest" (simplified. just removes all "is latest" from the filter since is a rare op)

        filters = _.filter(filters, function (f) {
          return (f != null ? f.op : void 0) !== "is latest";
        }); // If site, create is latest

        if (site) {
          filter = {
            type: "op",
            op: "is latest",
            table: this.props.table,
            exprs: [{
              type: "field",
              table: this.props.table,
              column: site
            }]
          };

          if (_final2) {
            filter.exprs.push(this.getFinalFilter());
          }

          filters.push(filter);
        } else if (_final2) {
          filters.push(this.getFinalFilter());
        }

        return this.setFilters(filters);
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        var siteColumnId, siteColumns; // Get site columns

        siteColumns = _.filter(this.props.schema.getColumns(this.props.table), function (col) {
          return col.type === "join" && col.join.type === "n-1" && col.join.toTable.startsWith("entities.") && col.id.match(/^data:/);
        });
        siteColumnId = this.getSiteValue();
        return R('div', {
          style: {
            paddingLeft: 5,
            paddingTop: 5
          }
        }, R('div', {
          style: {
            paddingBottom: 5
          }
        }, "Data Source Options:"), R('div', {
          style: {
            paddingLeft: 5
          }
        }, siteColumns.length > 0 ? R('div', null, R('i', null, "This data source contains links to monitoring sites. Would you like to:"), R('div', {
          style: {
            paddingLeft: 8
          }
        }, R(ui.Radio, {
          key: "all",
          value: siteColumnId,
          radioValue: null,
          onChange: this.handleSiteChange
        }, "Show all survey responses (even if there are more than one per site)"), _.map(siteColumns, function (column) {
          var ref;
          return R(ui.Radio, {
            key: column.id,
            value: siteColumnId,
            radioValue: column.id,
            onChange: _this5.handleSiteChange
          }, "Show only the latest response for each ", R('i', null, "".concat(ExprUtils.localizeString((ref = _this5.props.schema.getTable(column.join.toTable)) != null ? ref.name : void 0))), " in the question ", R('i', null, "'".concat(ExprUtils.localizeString(column.name), "'")));
        }))) : void 0, R(ui.Checkbox, {
          value: this.isFinal(),
          onChange: this.handleFinalChange
        }, "Only include final responses (recommended)")));
      }
    }]);
    return MWaterResponsesFilterComponent;
  }(React.Component);

  ;
  MWaterResponsesFilterComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    // responses:xyz
    filter: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired
  };
  return MWaterResponsesFilterComponent;
}.call(void 0);