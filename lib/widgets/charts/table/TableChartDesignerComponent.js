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

var AxisBuilder,
    ExprComponent,
    ExprUtils,
    FilterExprComponent,
    LinkComponent,
    OrderingsComponent,
    PropTypes,
    R,
    React,
    ReorderableListComponent,
    TableChartColumnDesignerComponent,
    TableChartDesignerComponent,
    TableSelectComponent,
    _,
    getDefaultFormat,
    getFormatOptions,
    ui,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
uuid = require('uuid');
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('../../../axes/AxisBuilder');
LinkComponent = require('mwater-expressions-ui').LinkComponent;
ExprComponent = require("mwater-expressions-ui").ExprComponent;
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
OrderingsComponent = require('./OrderingsComponent');
TableSelectComponent = require('../../../TableSelectComponent');
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");
ui = require('react-library/lib/bootstrap');
getFormatOptions = require('../../../valueFormatter').getFormatOptions;
getDefaultFormat = require('../../../valueFormatter').getDefaultFormat;

module.exports = TableChartDesignerComponent = function () {
  var TableChartDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(TableChartDesignerComponent, _React$Component);

    var _super = _createSuper(TableChartDesignerComponent);

    function TableChartDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, TableChartDesignerComponent);
      _this = _super.apply(this, arguments);
      _this.handleTitleTextChange = _this.handleTitleTextChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOrderingsChange = _this.handleOrderingsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleLimitChange = _this.handleLimitChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleColumnChange = _this.handleColumnChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemoveColumn = _this.handleRemoveColumn.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAddColumn = _this.handleAddColumn.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderColumn = _this.renderColumn.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleReorder = _this.handleReorder.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    } // Updates design with the specified changes


    (0, _createClass2["default"])(TableChartDesignerComponent, [{
      key: "updateDesign",
      value: function updateDesign(changes) {
        var design;
        design = _.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleTitleTextChange",
      value: function handleTitleTextChange(ev) {
        boundMethodCheck(this, TableChartDesignerComponent);
        return this.updateDesign({
          titleText: ev.target.value
        });
      }
    }, {
      key: "handleTableChange",
      value: function handleTableChange(table) {
        boundMethodCheck(this, TableChartDesignerComponent);
        return this.updateDesign({
          table: table
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(filter) {
        boundMethodCheck(this, TableChartDesignerComponent);
        return this.updateDesign({
          filter: filter
        });
      }
    }, {
      key: "handleOrderingsChange",
      value: function handleOrderingsChange(orderings) {
        boundMethodCheck(this, TableChartDesignerComponent);
        return this.updateDesign({
          orderings: orderings
        });
      }
    }, {
      key: "handleLimitChange",
      value: function handleLimitChange(limit) {
        boundMethodCheck(this, TableChartDesignerComponent);
        return this.updateDesign({
          limit: limit
        });
      }
    }, {
      key: "handleColumnChange",
      value: function handleColumnChange(index, column) {
        var columns;
        boundMethodCheck(this, TableChartDesignerComponent);
        columns = this.props.design.columns.slice();
        columns[index] = column;
        return this.updateDesign({
          columns: columns
        });
      }
    }, {
      key: "handleRemoveColumn",
      value: function handleRemoveColumn(index) {
        var columns;
        boundMethodCheck(this, TableChartDesignerComponent);
        columns = this.props.design.columns.slice();
        columns.splice(index, 1);
        return this.updateDesign({
          columns: columns
        });
      }
    }, {
      key: "handleAddColumn",
      value: function handleAddColumn() {
        var columns;
        boundMethodCheck(this, TableChartDesignerComponent);
        columns = this.props.design.columns.slice();
        columns.push({
          id: uuid()
        });
        return this.updateDesign({
          columns: columns
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
      key: "renderColumn",
      value: function renderColumn(column, index, connectDragSource, connectDragPreview, connectDropTarget) {
        var style;
        boundMethodCheck(this, TableChartDesignerComponent);
        style = {
          borderTop: "solid 1px #EEE",
          paddingTop: 10,
          paddingBottom: 10
        };
        return connectDragPreview(connectDropTarget(R('div', {
          key: index,
          style: style
        }, React.createElement(TableChartColumnDesignerComponent, {
          design: this.props.design,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          index: index,
          onChange: this.handleColumnChange.bind(null, index),
          onRemove: this.handleRemoveColumn.bind(null, index),
          connectDragSource: connectDragSource
        }))));
      }
    }, {
      key: "handleReorder",
      value: function handleReorder(map) {
        boundMethodCheck(this, TableChartDesignerComponent);
        return this.updateDesign({
          columns: map
        });
      }
    }, {
      key: "renderColumns",
      value: function renderColumns() {
        if (!this.props.design.table) {
          return;
        }

        return R('div', null, R(ReorderableListComponent, {
          items: this.props.design.columns,
          onReorder: this.handleReorder,
          renderItem: this.renderColumn,
          getItemId: function getItemId(item) {
            return item.id;
          }
        }), R('button', {
          className: "btn btn-default btn-sm",
          type: "button",
          onClick: this.handleAddColumn
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Column"));
      } // return R 'div', className: "form-group",
      //   _.map(@props.design.columns, (column, i) => @renderColumn(i))

    }, {
      key: "renderOrderings",
      value: function renderOrderings() {
        // If no table, hide
        if (!this.props.design.table) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon-sort-by-attributes"
        }), " ", "Ordering"), R('div', {
          style: {
            marginLeft: 8
          }
        }, React.createElement(OrderingsComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          orderings: this.props.design.orderings,
          onOrderingsChange: this.handleOrderingsChange,
          table: this.props.design.table
        })));
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
      key: "renderLimit",
      value: function renderLimit() {
        // If no table, hide
        if (!this.props.design.table) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Maximum Number of Rows (up to 1000)"), R('div', {
          style: {
            marginLeft: 8
          }
        }, R(ui.NumberInput, {
          value: this.props.design.limit,
          onChange: this.handleLimitChange,
          decimal: false,
          placeholder: "1000"
        })));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.renderTable(), this.renderColumns(), this.props.design.table ? R('hr') : void 0, this.renderOrderings(), this.renderFilter(), this.renderLimit(), R('hr'), this.renderTitle());
      }
    }]);
    return TableChartDesignerComponent;
  }(React.Component);

  ;
  TableChartDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };
  return TableChartDesignerComponent;
}.call(void 0);

TableChartColumnDesignerComponent = function () {
  var TableChartColumnDesignerComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(TableChartColumnDesignerComponent, _React$Component2);

    var _super2 = _createSuper(TableChartColumnDesignerComponent);

    function TableChartColumnDesignerComponent() {
      var _this2;

      (0, _classCallCheck2["default"])(this, TableChartColumnDesignerComponent);
      _this2 = _super2.apply(this, arguments);
      _this2.handleExprChange = _this2.handleExprChange.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleHeaderTextChange = _this2.handleHeaderTextChange.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleAggrChange = _this2.handleAggrChange.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleFormatChange = _this2.handleFormatChange.bind((0, _assertThisInitialized2["default"])(_this2));
      return _this2;
    } // Updates column with the specified changes


    (0, _createClass2["default"])(TableChartColumnDesignerComponent, [{
      key: "updateColumn",
      value: function updateColumn(changes) {
        var column;
        column = _.extend({}, this.props.design.columns[this.props.index], changes);
        return this.props.onChange(column);
      }
    }, {
      key: "updateTextAxis",
      value: function updateTextAxis(changes) {
        var textAxis;
        textAxis = _.extend({}, this.props.design.columns[this.props.index].textAxis, changes);
        return this.updateColumn({
          textAxis: textAxis
        });
      }
    }, {
      key: "handleExprChange",
      value: function handleExprChange(expr) {
        boundMethodCheck(this, TableChartColumnDesignerComponent);
        return this.updateTextAxis({
          expr: expr
        });
      }
    }, {
      key: "handleHeaderTextChange",
      value: function handleHeaderTextChange(ev) {
        boundMethodCheck(this, TableChartColumnDesignerComponent);
        return this.updateColumn({
          headerText: ev.target.value
        });
      }
    }, {
      key: "handleAggrChange",
      value: function handleAggrChange(aggr) {
        boundMethodCheck(this, TableChartColumnDesignerComponent);
        return this.updateTextAxis({
          aggr: aggr
        });
      }
    }, {
      key: "handleFormatChange",
      value: function handleFormatChange(ev) {
        boundMethodCheck(this, TableChartColumnDesignerComponent);
        return this.updateColumn({
          format: ev.target.value
        });
      }
    }, {
      key: "renderRemove",
      value: function renderRemove() {
        if (this.props.design.columns.length > 1) {
          return R('button', {
            className: "btn btn-xs btn-link pull-right",
            type: "button",
            onClick: this.props.onRemove
          }, R('span', {
            className: "glyphicon glyphicon-remove"
          }));
        }
      }
    }, {
      key: "renderExpr",
      value: function renderExpr() {
        var column, title;
        column = this.props.design.columns[this.props.index];
        title = "Value";
        return R('div', null, R('label', {
          className: "text-muted"
        }, title), ": ", React.createElement(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          value: column.textAxis ? column.textAxis.expr : void 0,
          onChange: this.handleExprChange,
          aggrStatuses: ["literal", "individual", "aggregate"]
        }));
      }
    }, {
      key: "renderFormat",
      value: function renderFormat() {
        var column, exprType, exprUtils, formats, ref;
        column = this.props.design.columns[this.props.index]; // Get type

        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType((ref = column.textAxis) != null ? ref.expr : void 0);
        formats = getFormatOptions(exprType);

        if (!formats) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Format"), ": ", R('select', {
          value: column.format != null ? column.format : getDefaultFormat(exprType),
          className: "form-control",
          style: {
            width: "auto",
            display: "inline-block"
          },
          onChange: this.handleFormatChange
        }, _.map(formats, function (format) {
          return R('option', {
            key: format.value,
            value: format.value
          }, format.label);
        })));
      }
    }, {
      key: "renderHeader",
      value: function renderHeader() {
        var axisBuilder, column, placeholder;
        column = this.props.design.columns[this.props.index];
        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        });
        placeholder = axisBuilder.summarizeAxis(column.textAxis, this.context.locale);
        return R('div', null, R('label', {
          className: "text-muted"
        }, "Header"), ": ", R('input', {
          type: "text",
          className: "form-control input-sm",
          style: {
            display: "inline-block",
            width: "15em"
          },
          value: column.headerText,
          onChange: this.handleHeaderTextChange,
          placeholder: placeholder
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var iconStyle;
        iconStyle = {
          cursor: "move",
          marginRight: 8,
          opacity: 0.5,
          fontSize: 12,
          height: 20
        };
        return R('div', null, this.props.connectDragSource(R('i', {
          className: "fa fa-bars",
          style: iconStyle
        })), this.renderRemove(), R('label', null, "Column ".concat(this.props.index + 1)), R('div', {
          style: {
            marginLeft: 5
          }
        }, this.renderExpr(), this.renderFormat(), this.renderHeader()));
      }
    }]);
    return TableChartColumnDesignerComponent;
  }(React.Component);

  ;
  TableChartColumnDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
  };
  TableChartColumnDesignerComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return TableChartColumnDesignerComponent;
}.call(void 0);