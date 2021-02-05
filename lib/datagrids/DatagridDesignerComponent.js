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

var ColumnDesignerComponent,
    ColumnsDesignerComponent,
    DatagridDesignerComponent,
    DatagridOptionsComponent,
    ExprComponent,
    ExprUtils,
    ExprValidator,
    FilterExprComponent,
    LabeledExprGenerator,
    OrderBysDesignerComponent,
    PropTypes,
    QuickfiltersDesignComponent,
    R,
    React,
    ReorderableListComponent,
    TabbedComponent,
    TableSelectComponent,
    _,
    getDefaultFormat,
    getFormatOptions,
    ui,
    update,
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
ExprUtils = require("mwater-expressions").ExprUtils;
ExprValidator = require("mwater-expressions").ExprValidator;
TabbedComponent = require('react-library/lib/TabbedComponent');
ExprComponent = require('mwater-expressions-ui').ExprComponent;
FilterExprComponent = require('mwater-expressions-ui').FilterExprComponent;
OrderBysDesignerComponent = require('./OrderBysDesignerComponent');
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");
QuickfiltersDesignComponent = require('../quickfilter/QuickfiltersDesignComponent');
LabeledExprGenerator = require('./LabeledExprGenerator');
TableSelectComponent = require('../TableSelectComponent');
uuid = require('uuid');
update = require('update-object');
ui = require('react-library/lib/bootstrap');
getFormatOptions = require('../valueFormatter').getFormatOptions;
getDefaultFormat = require('../valueFormatter').getDefaultFormat; // Designer for the datagrid. Currenly allows only single-table designs (no subtable rows)

module.exports = DatagridDesignerComponent = function () {
  var DatagridDesignerComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DatagridDesignerComponent, _React$Component);

    var _super = _createSuper(DatagridDesignerComponent);

    function DatagridDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, DatagridDesignerComponent);
      _this = _super.apply(this, arguments);
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleColumnsChange = _this.handleColumnsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleGlobalFiltersChange = _this.handleGlobalFiltersChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleOrderBysChange = _this.handleOrderBysChange.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(DatagridDesignerComponent, [{
      key: "handleTableChange",
      value: function handleTableChange(table) {
        var design;
        boundMethodCheck(this, DatagridDesignerComponent);
        design = {
          table: table,
          columns: []
        };
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleColumnsChange",
      value: function handleColumnsChange(columns) {
        boundMethodCheck(this, DatagridDesignerComponent);
        return this.props.onDesignChange(update(this.props.design, {
          columns: {
            $set: columns
          }
        }));
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(filter) {
        boundMethodCheck(this, DatagridDesignerComponent);
        return this.props.onDesignChange(update(this.props.design, {
          filter: {
            $set: filter
          }
        }));
      }
    }, {
      key: "handleGlobalFiltersChange",
      value: function handleGlobalFiltersChange(globalFilters) {
        boundMethodCheck(this, DatagridDesignerComponent);
        return this.props.onDesignChange(update(this.props.design, {
          globalFilters: {
            $set: globalFilters
          }
        }));
      }
    }, {
      key: "handleOrderBysChange",
      value: function handleOrderBysChange(orderBys) {
        boundMethodCheck(this, DatagridDesignerComponent);
        return this.props.onDesignChange(update(this.props.design, {
          orderBys: {
            $set: orderBys
          }
        }));
      } // Render the tabs of the designer

    }, {
      key: "renderTabs",
      value: function renderTabs() {
        var _this2 = this;

        return R(TabbedComponent, {
          initialTabId: "columns",
          tabs: [{
            id: "columns",
            label: "Columns",
            elem: R(ColumnsDesignerComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.design.table,
              columns: this.props.design.columns,
              onColumnsChange: this.handleColumnsChange
            })
          }, {
            id: "filter",
            label: "Filter",
            // Here because of modal scroll issue
            elem: R('div', {
              style: {
                marginBottom: 200
              }
            }, R(FilterExprComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.design.table,
              value: this.props.design.filter,
              onChange: this.handleFilterChange
            }), this.context.globalFiltersElementFactory ? R('div', {
              style: {
                marginTop: 20
              }
            }, this.context.globalFiltersElementFactory({
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              filterableTables: [this.props.design.table],
              globalFilters: this.props.design.globalFilters,
              onChange: this.handleGlobalFiltersChange,
              nullIfIrrelevant: true
            })) : void 0)
          }, {
            id: "order",
            label: "Sorting",
            elem: R('div', {
              style: {
                marginBottom: 200
              }
            }, R(OrderBysDesignerComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.design.table,
              orderBys: this.props.design.orderBys,
              onChange: this.handleOrderBysChange
            }))
          }, {
            id: "quickfilters",
            label: "Quickfilters",
            elem: R('div', {
              style: {
                marginBottom: 200
              }
            }, R(QuickfiltersDesignComponent, {
              design: this.props.design.quickfilters,
              onDesignChange: function onDesignChange(design) {
                return _this2.props.onDesignChange(update(_this2.props.design, {
                  quickfilters: {
                    $set: design
                  }
                }));
              },
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              tables: [this.props.design.table]
            }))
          }, {
            id: "options",
            label: "Options",
            elem: R('div', {
              style: {
                marginBottom: 200
              }
            }, R(DatagridOptionsComponent, {
              design: this.props.design,
              onDesignChange: this.props.onDesignChange
            }))
          }]
        });
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, R('label', null, "Data Source:"), R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.props.design.table,
          onChange: this.handleTableChange
        }), this.props.design.table ? this.renderTabs() : void 0);
      }
    }]);
    return DatagridDesignerComponent;
  }(React.Component);

  ;
  DatagridDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    design: PropTypes.object.isRequired,
    // Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func.isRequired // Called when design changes

  };
  DatagridDesignerComponent.contextTypes = {
    globalFiltersElementFactory: PropTypes.func // Call with props { schema, dataSource, globalFilters, filterableTables, onChange, nullIfIrrelevant }. Displays a component to edit global filters

  };
  return DatagridDesignerComponent;
}.call(void 0);

DatagridOptionsComponent = function () {
  // Datagrid Options
  var DatagridOptionsComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(DatagridOptionsComponent, _React$Component2);

    var _super2 = _createSuper(DatagridOptionsComponent);

    function DatagridOptionsComponent() {
      (0, _classCallCheck2["default"])(this, DatagridOptionsComponent);
      return _super2.apply(this, arguments);
    }

    (0, _createClass2["default"])(DatagridOptionsComponent, [{
      key: "render",
      value: function render() {
        var _this3 = this;

        return R(ui.FormGroup, {
          label: "Display Options"
        }, R(ui.Checkbox, {
          value: this.props.design.showRowNumbers,
          onChange: function onChange(showRowNumbers) {
            return _this3.props.onDesignChange(update(_this3.props.design, {
              showRowNumbers: {
                $set: showRowNumbers
              }
            }));
          }
        }, "Show row numbers"));
      }
    }]);
    return DatagridOptionsComponent;
  }(React.Component);

  ;
  DatagridOptionsComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Datagrid design. See README.md
    onDesignChange: PropTypes.func.isRequired // Called when design changes

  };
  return DatagridOptionsComponent;
}.call(void 0);

ColumnsDesignerComponent = function () {
  // Columns list
  var ColumnsDesignerComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(ColumnsDesignerComponent, _React$Component3);

    var _super3 = _createSuper(ColumnsDesignerComponent);

    function ColumnsDesignerComponent() {
      var _this4;

      (0, _classCallCheck2["default"])(this, ColumnsDesignerComponent);
      _this4 = _super3.apply(this, arguments);
      _this4.handleColumnChange = _this4.handleColumnChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleAddColumn = _this4.handleAddColumn.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleAddIdColumn = _this4.handleAddIdColumn.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleAddDefaultColumns = _this4.handleAddDefaultColumns.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleRemoveAllColumns = _this4.handleRemoveAllColumns.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.renderColumn = _this4.renderColumn.bind((0, _assertThisInitialized2["default"])(_this4));
      return _this4;
    }

    (0, _createClass2["default"])(ColumnsDesignerComponent, [{
      key: "handleColumnChange",
      value: function handleColumnChange(columnIndex, column) {
        var columns;
        boundMethodCheck(this, ColumnsDesignerComponent);
        columns = this.props.columns.slice(); // Handle remove

        if (!column) {
          columns.splice(columnIndex, 1);
        } else if (_.isArray(column)) {
          // Handle array case
          Array.prototype.splice.apply(columns, [columnIndex, 1].concat(column));
        } else {
          columns[columnIndex] = column;
        }

        return this.props.onColumnsChange(columns);
      }
    }, {
      key: "handleAddColumn",
      value: function handleAddColumn() {
        var columns;
        boundMethodCheck(this, ColumnsDesignerComponent);
        columns = this.props.columns.slice();
        columns.push({
          id: uuid(),
          type: "expr",
          width: 150
        });
        return this.props.onColumnsChange(columns);
      }
    }, {
      key: "handleAddIdColumn",
      value: function handleAddIdColumn() {
        var columns;
        boundMethodCheck(this, ColumnsDesignerComponent);
        columns = this.props.columns.slice(); // TODO we should display label when available but without breaking Peter's id downloads. Need format field to indicate raw id.

        columns.push({
          id: uuid(),
          type: "expr",
          width: 150,
          expr: {
            type: "id",
            table: this.props.table
          },
          label: "Unique Id"
        });
        return this.props.onColumnsChange(columns);
      }
    }, {
      key: "handleAddDefaultColumns",
      value: function handleAddDefaultColumns() {
        var columns, i, labeledExpr, labeledExprs, len;
        boundMethodCheck(this, ColumnsDesignerComponent); // Create labeled expressions

        labeledExprs = new LabeledExprGenerator(this.props.schema).generate(this.props.table, {
          headerFormat: "text"
        });
        columns = [];

        for (i = 0, len = labeledExprs.length; i < len; i++) {
          labeledExpr = labeledExprs[i];
          columns.push({
            id: uuid(),
            width: 150,
            type: "expr",
            label: null,
            // Use default label instead. # labeledExpr.label
            expr: labeledExpr.expr
          });
        }

        columns = this.props.columns.concat(columns);
        return this.props.onColumnsChange(columns);
      }
    }, {
      key: "handleRemoveAllColumns",
      value: function handleRemoveAllColumns() {
        boundMethodCheck(this, ColumnsDesignerComponent);
        return this.props.onColumnsChange([]);
      }
    }, {
      key: "renderColumn",
      value: function renderColumn(column, columnIndex, connectDragSource, connectDragPreview, connectDropTarget) {
        boundMethodCheck(this, ColumnsDesignerComponent);
        return R(ColumnDesignerComponent, {
          key: columnIndex,
          schema: this.props.schema,
          table: this.props.table,
          dataSource: this.props.dataSource,
          column: column,
          onColumnChange: this.handleColumnChange.bind(null, columnIndex),
          connectDragSource: connectDragSource,
          connectDragPreview: connectDragPreview,
          connectDropTarget: connectDropTarget
        });
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            height: "auto",
            overflowY: "auto",
            overflowX: "hidden"
          }
        }, R('div', {
          style: {
            textAlign: "right"
          },
          key: "options"
        }, R('button', {
          key: "addAll",
          type: "button",
          className: "btn btn-link btn-xs",
          onClick: this.handleAddDefaultColumns
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Default Columns"), R('button', {
          key: "removeAll",
          type: "button",
          className: "btn btn-link btn-xs",
          onClick: this.handleRemoveAllColumns
        }, R('span', {
          className: "glyphicon glyphicon-remove"
        }), " Remove All Columns")), R(ReorderableListComponent, {
          items: this.props.columns,
          onReorder: this.props.onColumnsChange,
          renderItem: this.renderColumn,
          getItemId: function getItemId(item) {
            return item.id;
          }
        }), R('button', {
          key: "add",
          type: "button",
          className: "btn btn-link",
          onClick: this.handleAddColumn
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Column"), R('button', {
          key: "add-id",
          type: "button",
          className: "btn btn-link",
          onClick: this.handleAddIdColumn
        }, R('span', {
          className: "glyphicon glyphicon-plus"
        }), " Add Unique Id (advanced)"));
      }
    }]);
    return ColumnsDesignerComponent;
  }(React.Component);

  ;
  ColumnsDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    table: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    // Columns list See README.md of this folder
    onColumnsChange: PropTypes.func.isRequired // Called when columns changes

  };
  return ColumnsDesignerComponent;
}.call(void 0);

ColumnDesignerComponent = function () {
  // Column item
  var ColumnDesignerComponent = /*#__PURE__*/function (_React$Component4) {
    (0, _inherits2["default"])(ColumnDesignerComponent, _React$Component4);

    var _super4 = _createSuper(ColumnDesignerComponent);

    function ColumnDesignerComponent() {
      var _this5;

      (0, _classCallCheck2["default"])(this, ColumnDesignerComponent);
      _this5 = _super4.apply(this, arguments);
      _this5.handleExprChange = _this5.handleExprChange.bind((0, _assertThisInitialized2["default"])(_this5));
      _this5.handleLabelChange = _this5.handleLabelChange.bind((0, _assertThisInitialized2["default"])(_this5));
      _this5.handleFormatChange = _this5.handleFormatChange.bind((0, _assertThisInitialized2["default"])(_this5));
      _this5.handleSplitEnumset = _this5.handleSplitEnumset.bind((0, _assertThisInitialized2["default"])(_this5));
      _this5.handleSplitGeometry = _this5.handleSplitGeometry.bind((0, _assertThisInitialized2["default"])(_this5));
      _this5.render = _this5.render.bind((0, _assertThisInitialized2["default"])(_this5));
      return _this5;
    }

    (0, _createClass2["default"])(ColumnDesignerComponent, [{
      key: "handleExprChange",
      value: function handleExprChange(expr) {
        boundMethodCheck(this, ColumnDesignerComponent);
        return this.props.onColumnChange(update(this.props.column, {
          expr: {
            $set: expr
          }
        }));
      }
    }, {
      key: "handleLabelChange",
      value: function handleLabelChange(label) {
        boundMethodCheck(this, ColumnDesignerComponent);
        return this.props.onColumnChange(update(this.props.column, {
          label: {
            $set: label
          }
        }));
      }
    }, {
      key: "handleFormatChange",
      value: function handleFormatChange(ev) {
        boundMethodCheck(this, ColumnDesignerComponent);
        return this.props.onColumnChange(update(this.props.column, {
          format: {
            $set: ev.target.value
          }
        }));
      }
    }, {
      key: "handleSplitEnumset",
      value: function handleSplitEnumset() {
        var _this6 = this;

        var exprUtils;
        boundMethodCheck(this, ColumnDesignerComponent);
        exprUtils = new ExprUtils(this.props.schema);
        return this.props.onColumnChange(_.map(exprUtils.getExprEnumValues(this.props.column.expr), function (enumVal) {
          return {
            id: uuid(),
            type: "expr",
            width: 150,
            expr: {
              type: "op",
              op: "contains",
              table: _this6.props.table,
              exprs: [_this6.props.column.expr, {
                type: "literal",
                valueType: "enumset",
                value: [enumVal.id]
              }]
            }
          };
        }));
      }
    }, {
      key: "handleSplitGeometry",
      value: function handleSplitGeometry() {
        boundMethodCheck(this, ColumnDesignerComponent);
        return this.props.onColumnChange([{
          id: uuid(),
          type: "expr",
          width: 150,
          expr: {
            type: "op",
            op: "latitude",
            table: this.props.table,
            exprs: [this.props.column.expr]
          }
        }, {
          id: uuid(),
          type: "expr",
          width: 150,
          expr: {
            type: "op",
            op: "longitude",
            table: this.props.table,
            exprs: [this.props.column.expr]
          }
        }]);
      } // Render options to split a column, such as an enumset to booleans or geometry to lat/lng

    }, {
      key: "renderSplit",
      value: function renderSplit() {
        var exprType, exprUtils;
        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType(this.props.column.expr);

        switch (exprType) {
          case "enumset":
            return R('a', {
              className: "btn btn-xs btn-link",
              onClick: this.handleSplitEnumset
            }, R('i', {
              className: "fa fa-chain-broken"
            }), " Split by options");

          case "geometry":
            return R('a', {
              className: "btn btn-xs btn-link",
              onClick: this.handleSplitGeometry
            }, R('i', {
              className: "fa fa-chain-broken"
            }), " Split by lat/lng");
        }

        return null;
      }
    }, {
      key: "renderFormat",
      value: function renderFormat() {
        var exprType, exprUtils, formats;
        exprUtils = new ExprUtils(this.props.schema);
        exprType = exprUtils.getExprType(this.props.column.expr);
        formats = getFormatOptions(exprType);

        if (!formats) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Format"), ": ", R('select', {
          value: this.props.column.format != null ? this.props.column.format : getDefaultFormat(exprType),
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
      key: "render",
      value: function render() {
        var _this7 = this;

        var allowedTypes, elem, error, exprUtils, exprValidator, type;
        boundMethodCheck(this, ColumnDesignerComponent);
        exprUtils = new ExprUtils(this.props.schema);
        exprValidator = new ExprValidator(this.props.schema); // Get type of current expression

        type = exprUtils.getExprType(this.props.column.expr); // Determine allowed types

        allowedTypes = ['text', 'number', 'enum', 'enumset', 'boolean', 'date', 'datetime', 'image', 'imagelist', 'text[]', 'geometry']; // If type id, allow id (e.g. don't allow to be added directly, but keep if present)

        if (type === "id") {
          allowedTypes.push("id");
        }

        error = exprValidator.validateExpr(this.props.column.expr, {
          aggrStatuses: ["individual", "literal", "aggregate"]
        });
        elem = R('div', {
          className: "row"
        }, R('div', {
          className: "col-xs-1"
        }, this.props.connectDragSource(R('span', {
          className: "text-muted fa fa-bars"
        }))), R('div', {
          className: "col-xs-6" // style: { border: "solid 1px #DDD", padding: 4 },

        }, R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          value: this.props.column.expr,
          aggrStatuses: ['literal', 'individual', 'aggregate'],
          types: allowedTypes,
          onChange: this.handleExprChange
        }), this.renderSplit(), this.renderFormat(), error ? R('i', {
          className: "fa fa-exclamation-circle text-danger"
        }) : void 0), R('div', {
          className: "col-xs-4"
        }, R('input', {
          type: "text",
          className: "form-control",
          placeholder: exprUtils.summarizeExpr(this.props.column.expr),
          value: this.props.column.label,
          onChange: function onChange(ev) {
            return _this7.handleLabelChange(ev.target.value);
          }
        })), R('div', {
          className: "col-xs-1"
        }, R('a', {
          onClick: this.props.onColumnChange.bind(null, null)
        }, R('span', {
          className: "glyphicon glyphicon-remove"
        }))));
        return this.props.connectDropTarget(this.props.connectDragPreview(elem));
      }
    }]);
    return ColumnDesignerComponent;
  }(React.Component);

  ;
  ColumnDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    table: PropTypes.string.isRequired,
    column: PropTypes.object.isRequired,
    // Column See README.md of this folder
    onColumnChange: PropTypes.func.isRequired,
    // Called when column changes. Null to remove. Array to replace with multiple entries
    connectDragSource: PropTypes.func.isRequired,
    // Connect drag source (handle) here       
    connectDragPreview: PropTypes.func.isRequired,
    // Connect drag preview here
    connectDropTarget: PropTypes.func.isRequired // Connect drop target

  };
  return ColumnDesignerComponent;
}.call(void 0);