"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder,
    AxisComponent,
    CalendarChartDesignerComponent,
    ExprUtils,
    FilterExprComponent,
    PropTypes,
    R,
    React,
    TableSelectComponent,
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
R = React.createElement;
ui = require('../../../UIComponents');
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('../../../axes/AxisBuilder');
AxisComponent = require('../../../axes/AxisComponent');
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
TableSelectComponent = require('../../../TableSelectComponent');

module.exports = CalendarChartDesignerComponent = function () {
  var CalendarChartDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(CalendarChartDesignerComponent, _React$Component);

    function CalendarChartDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, CalendarChartDesignerComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(CalendarChartDesignerComponent).apply(this, arguments));
      _this.handleTitleTextChange = _this.handleTitleTextChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleDateAxisChange = _this.handleDateAxisChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleValueAxisChange = _this.handleValueAxisChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    } // Updates design with the specified changes


    (0, _createClass2["default"])(CalendarChartDesignerComponent, [{
      key: "updateDesign",
      value: function updateDesign(changes) {
        var design;
        design = _.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleTitleTextChange",
      value: function handleTitleTextChange(ev) {
        boundMethodCheck(this, CalendarChartDesignerComponent);
        return this.updateDesign({
          titleText: ev.target.value
        });
      }
    }, {
      key: "handleTableChange",
      value: function handleTableChange(table) {
        boundMethodCheck(this, CalendarChartDesignerComponent);
        return this.updateDesign({
          table: table
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(filter) {
        boundMethodCheck(this, CalendarChartDesignerComponent);
        return this.updateDesign({
          filter: filter
        });
      }
    }, {
      key: "handleDateAxisChange",
      value: function handleDateAxisChange(dateAxis) {
        var valueAxis;
        boundMethodCheck(this, CalendarChartDesignerComponent); // Default value axis to count if date axis present

        if (!this.props.design.valueAxis && dateAxis) {
          // Create count expr
          valueAxis = {
            expr: {
              type: "op",
              op: "count",
              table: this.props.design.table,
              exprs: []
            },
            xform: null
          };
          return this.updateDesign({
            dateAxis: dateAxis,
            valueAxis: valueAxis
          });
        } else {
          return this.updateDesign({
            dateAxis: dateAxis
          });
        }
      }
    }, {
      key: "handleValueAxisChange",
      value: function handleValueAxisChange(valueAxis) {
        boundMethodCheck(this, CalendarChartDesignerComponent);
        return this.updateDesign({
          valueAxis: valueAxis
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
      key: "renderTitle",
      value: function renderTitle() {
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Title"), R('input', {
          type: "text",
          className: "form-control input-sm",
          value: this.props.design.titleText,
          onChange: this.handleTitleTextChange,
          placeholder: "Untitled"
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
        }, React.createElement(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.design.table,
          value: this.props.design.filter
        })));
      }
    }, {
      key: "renderDateAxis",
      value: function renderDateAxis() {
        if (!this.props.design.table) {
          return;
        }

        return R(ui.SectionComponent, {
          label: "Date Axis"
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["date"],
          aggrNeed: "none",
          required: true,
          value: this.props.design.dateAxis,
          onChange: this.handleDateAxisChange,
          filters: this.props.filter
        }));
      }
    }, {
      key: "renderValueAxis",
      value: function renderValueAxis() {
        if (!this.props.design.table || !this.props.design.dateAxis) {
          return;
        }

        return R(ui.SectionComponent, {
          label: "Value Axis"
        }, R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["number"],
          aggrNeed: "required",
          required: true,
          value: this.props.design.valueAxis,
          onChange: this.handleValueAxisChange,
          filters: this.props.filter
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.renderTable(), this.renderDateAxis(), this.renderValueAxis(), this.renderFilter(), R('hr'), this.renderTitle());
      }
    }]);
    return CalendarChartDesignerComponent;
  }(React.Component);

  ;
  CalendarChartDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return CalendarChartDesignerComponent;
}.call(void 0);