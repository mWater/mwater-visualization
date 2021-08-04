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

var AxisComponent,
    FilterExprComponent,
    PivotChartDesignerComponent,
    PropTypes,
    R,
    React,
    TableSelectComponent,
    _,
    ui,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
uuid = require('uuid');
ui = require('react-library/lib/bootstrap');
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
TableSelectComponent = require('../../../TableSelectComponent');
AxisComponent = require('../../../axes/AxisComponent'); // Designer for overall chart. Has a special setup mode first time it is run

module.exports = PivotChartDesignerComponent = function () {
  var PivotChartDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(PivotChartDesignerComponent, _React$Component);

    var _super = _createSuper(PivotChartDesignerComponent);

    function PivotChartDesignerComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, PivotChartDesignerComponent);
      _this = _super.call(this, props);
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleColumnChange = _this.handleColumnChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRowChange = _this.handleRowChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleIntersectionValueAxisChange = _this.handleIntersectionValueAxisChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        isNew: !props.design.table // True if new pivot table

      };
      return _this;
    } // Updates design with the specified changes


    (0, _createClass2["default"])(PivotChartDesignerComponent, [{
      key: "updateDesign",
      value: function updateDesign(changes) {
        var design;
        design = _.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleTableChange",
      value: function handleTableChange(table) {
        var column, intersections, row;
        boundMethodCheck(this, PivotChartDesignerComponent); // Create default

        row = {
          id: uuid(),
          label: ""
        };
        column = {
          id: uuid(),
          label: ""
        };
        intersections = {};
        intersections["".concat(row.id, ":").concat(column.id)] = {
          valueAxis: {
            expr: {
              type: "op",
              op: "count",
              table: table,
              exprs: []
            }
          }
        };
        return this.updateDesign({
          table: table,
          rows: [row],
          columns: [column],
          intersections: intersections
        });
      }
    }, {
      key: "handleColumnChange",
      value: function handleColumnChange(axis) {
        boundMethodCheck(this, PivotChartDesignerComponent);
        return this.updateDesign({
          columns: [_.extend({}, this.props.design.columns[0], {
            valueAxis: axis
          })]
        });
      }
    }, {
      key: "handleRowChange",
      value: function handleRowChange(axis) {
        boundMethodCheck(this, PivotChartDesignerComponent);
        return this.updateDesign({
          rows: [_.extend({}, this.props.design.rows[0], {
            valueAxis: axis
          })]
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(filter) {
        boundMethodCheck(this, PivotChartDesignerComponent);
        return this.updateDesign({
          filter: filter
        });
      }
    }, {
      key: "handleIntersectionValueAxisChange",
      value: function handleIntersectionValueAxisChange(valueAxis) {
        var intersectionId, intersections;
        boundMethodCheck(this, PivotChartDesignerComponent);
        intersectionId = "".concat(this.props.design.rows[0].id, ":").concat(this.props.design.columns[0].id);
        intersections = {};
        intersections[intersectionId] = {
          valueAxis: valueAxis
        };
        return this.updateDesign({
          intersections: intersections
        });
      }
    }, {
      key: "renderTable",
      value: function renderTable() {
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('i', {
          className: "fa fa-database"
        }), " ", "Data Source"), ": ", R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.props.design.table,
          onChange: this.handleTableChange,
          filter: this.props.design.filter,
          onFilterChange: this.handleFilterChange
        }));
      }
    }, {
      key: "renderFilter",
      value: function renderFilter() {
        // If no table, hide
        if (!this.props.design.table) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon-filter"
        }), " ", "Filters"), R('div', {
          style: {
            marginLeft: 8
          }
        }, R(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.design.table,
          value: this.props.design.filter
        })));
      }
    }, {
      key: "renderStriping",
      value: function renderStriping() {
        var _this2 = this;

        // If no table, hide
        if (!this.props.design.table) {
          return null;
        }

        return R(ui.FormGroup, {
          labelMuted: true,
          label: "Striping"
        }, R('label', {
          key: "none",
          className: "radio-inline"
        }, R('input', {
          type: "radio",
          checked: !this.props.design.striping,
          onClick: function onClick() {
            return _this2.updateDesign({
              striping: null
            });
          }
        }), "None"), R('label', {
          key: "columns",
          className: "radio-inline"
        }, R('input', {
          type: "radio",
          checked: this.props.design.striping === "columns",
          onClick: function onClick() {
            return _this2.updateDesign({
              striping: "columns"
            });
          }
        }), "Columns"), R('label', {
          key: "rows",
          className: "radio-inline"
        }, R('input', {
          type: "radio",
          checked: this.props.design.striping === "rows",
          onClick: function onClick() {
            return _this2.updateDesign({
              striping: "rows"
            });
          }
        }), "Rows"));
      } // Show setup options

    }, {
      key: "renderSetup",
      value: function renderSetup() {
        var intersectionId;
        intersectionId = "".concat(this.props.design.rows[0].id, ":").concat(this.props.design.columns[0].id);
        return R('div', null, R(ui.FormGroup, {
          labelMuted: true,
          label: "Columns",
          help: "Field to optionally make columns out of"
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["enum", "text", "boolean", "date"],
          aggrNeed: "none",
          value: this.props.design.columns[0].valueAxis,
          onChange: this.handleColumnChange,
          filters: this.props.filters
        })), R(ui.FormGroup, {
          labelMuted: true,
          label: "Rows",
          help: "Field to optionally make rows out of"
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["enum", "text", "boolean", "date"],
          aggrNeed: "none",
          value: this.props.design.rows[0].valueAxis,
          onChange: this.handleRowChange,
          filters: this.props.filters
        })), R(ui.FormGroup, {
          labelMuted: true,
          label: "Value",
          help: "Field show in cells"
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["enum", "text", "boolean", "date", "number"],
          aggrNeed: "required",
          value: this.props.design.intersections[intersectionId].valueAxis,
          onChange: this.handleIntersectionValueAxisChange,
          showFormat: true,
          filters: this.props.filters
        })));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.renderTable(), this.state.isNew && this.props.design.table ? this.renderSetup() : void 0, this.renderFilter(), this.renderStriping());
      }
    }]);
    return PivotChartDesignerComponent;
  }(React.Component);

  ;
  PivotChartDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return PivotChartDesignerComponent;
}.call(void 0);