"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var Cell,
    Column,
    DatagridQueryBuilder,
    DatagridViewComponent,
    EditExprCellComponent,
    ExprCellComponent,
    ExprUtils,
    PropTypes,
    R,
    React,
    Table,
    _,
    moment,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');

var _require = require('fixed-data-table');

Table = _require.Table;
Column = _require.Column;
Cell = _require.Cell;
DatagridQueryBuilder = require('./DatagridQueryBuilder');
ExprUtils = require("mwater-expressions").ExprUtils;
ExprCellComponent = require('./ExprCellComponent');
EditExprCellComponent = require('./EditExprCellComponent'); // Datagrid table itself without decorations such as edit button etc.
// See README.md for description of datagrid format
// Design should be cleaned already before being passed in (see DatagridUtils)

module.exports = DatagridViewComponent = function () {
  var DatagridViewComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(DatagridViewComponent, _React$Component);

    function DatagridViewComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, DatagridViewComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(DatagridViewComponent).call(this, props)); // Reloads all data

      _this.reload = _this.reload.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleColumnResize = _this.handleColumnResize.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleCellClick = _this.handleCellClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Called to save 

      _this.handleSaveEdit = _this.handleSaveEdit.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleCancelEdit = _this.handleCancelEdit.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Called with current ref edit. Save

      _this.refEditCell = _this.refEditCell.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleRowDoubleClick = _this.handleRowDoubleClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleRowClick = _this.handleRowClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Render a single cell. exprType is passed in for performance purposes and is calculated once per column

      _this.renderCell = _this.renderCell.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        rows: [],
        entirelyLoaded: false,
        editingCell: null,
        // set to { rowIndex: 0, 1, 2, columnIndex: 0, 1, 2... } if editing a cell 
        savingCell: false // True when saving a cell's contents

      };
      return _this;
    }

    (0, _createClass2.default)(DatagridViewComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        // If design or filters changed, delete all rows
        // TODO won't this reload on column resize?
        if (!_.isEqual(nextProps.design, this.props.design) || !_.isEqual(nextProps.filters, this.props.filters)) {
          return this.setState({
            rows: [],
            entirelyLoaded: false
          });
        }
      } // Loads more rows because the placeholder last row has been rendered

    }, {
      key: "loadMoreRows",
      value: function loadMoreRows() {
        var _this2 = this;

        var loadState; // Get the current load state (the values that determine what to load and if the loaded results can still be used or are stale)

        loadState = {
          design: this.props.design,
          offset: this.state.rows.length,
          limit: this.props.pageSize,
          filters: this.props.filters
        }; // If already loading what we want, return

        if (_.isEqual(loadState, this.loadState)) {
          return;
        } // Record what we're loading


        this.loadState = loadState; // Perform the actual load

        return this.props.datagridDataSource.getRows(loadState.design, loadState.offset, loadState.limit, loadState.filters, function (error, newRows) {
          var rows;

          if (error) {
            console.error(error);
            alert("Error loading data");
            return;
          } // Check that the required load state has not changed


          if (_.isEqual(loadState, _this2.loadState)) {
            // Load is complete
            _this2.loadState = null; // Add rows, setting entirelyLoaded based on whether fewer than requested were returned

            rows = _this2.state.rows.concat(newRows);
            return _this2.setState({
              rows: rows,
              entirelyLoaded: newRows.length < _this2.props.pageSize
            });
          }
        });
      }
    }, {
      key: "reload",
      value: function reload() {
        boundMethodCheck(this, DatagridViewComponent);
        return this.setState({
          rows: [],
          entirelyLoaded: false
        });
      }
    }, {
      key: "deleteRow",
      value: function deleteRow(rowIndex, callback) {
        var newRows;
        newRows = this.state.rows.slice();

        _.pullAt(newRows, rowIndex);

        this.setState({
          rows: newRows
        });
        return callback();
      } // Reload a single row

    }, {
      key: "reloadRow",
      value: function reloadRow(rowIndex, callback) {
        var _this3 = this;

        return this.props.datagridDataSource.getRows(this.props.design, rowIndex, 1, this.props.filters, function (error, rows) {
          var newRows;

          if (error || !rows[0]) {
            console.error(error);
            alert("Error loading data");
            callback();
            return;
          } // Set row


          newRows = _this3.state.rows.slice();
          newRows[rowIndex] = rows[0];

          _this3.setState({
            rows: newRows
          });

          return callback();
        });
      }
    }, {
      key: "handleColumnResize",
      value: function handleColumnResize(newColumnWidth, columnKey) {
        var column, columnIndex, columns;
        boundMethodCheck(this, DatagridViewComponent); // Find index of column

        columnIndex = _.findIndex(this.props.design.columns, {
          id: columnKey
        }); // Set new width

        column = this.props.design.columns[columnIndex];
        column = _.extend({}, column, {
          width: newColumnWidth
        }); // Re-add to list

        columns = this.props.design.columns.slice();
        columns[columnIndex] = column;
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          columns: columns
        }));
      }
    }, {
      key: "handleCellClick",
      value: function handleCellClick(rowIndex, columnIndex) {
        var _this4 = this;

        var column, exprType, ref, ref1;
        boundMethodCheck(this, DatagridViewComponent); // Ignore if already editing

        if (((ref = this.state.editingCell) != null ? ref.rowIndex : void 0) === rowIndex && ((ref1 = this.state.editingCell) != null ? ref1.columnIndex : void 0) === columnIndex) {
          return;
        } // Ignore if saving


        if (this.state.savingCell) {
          return;
        } // Save editing if editing and return


        if (this.state.editingCell) {
          this.handleSaveEdit();
          return;
        } // Check if can edit


        if (!this.props.canEditCell) {
          return;
        } // Get column


        column = this.props.design.columns[columnIndex]; // If not expr, return

        if (!column.type === "expr") {
          return;
        } // Get expression type


        exprType = new ExprUtils(this.props.schema).getExprType(column.expr); // If cannot edit type, return

        if (exprType !== 'text' && exprType !== 'number' && exprType !== 'enum') {
          return;
        }

        return this.props.canEditCell(this.props.design.table, this.state.rows[rowIndex].id, column.expr, function (error, canEdit) {
          // TODO handle error
          if (error) {
            throw error;
          }

          if (canEdit) {
            // Start editing 
            return _this4.setState({
              editingCell: {
                rowIndex: rowIndex,
                columnIndex: columnIndex
              }
            });
          }
        });
      }
    }, {
      key: "handleSaveEdit",
      value: function handleSaveEdit() {
        var _this5 = this;

        var expr, rowId, value;
        boundMethodCheck(this, DatagridViewComponent); // Ignore if not changed

        if (!this.editCellComp.hasChanged()) {
          this.setState({
            editingCell: null,
            savingCell: false
          });
          return;
        }

        rowId = this.state.rows[this.state.editingCell.rowIndex].id;
        expr = this.props.design.columns[this.state.editingCell.columnIndex].expr;
        value = this.editCellComp.getValue();
        return this.setState({
          savingCell: true
        }, function () {
          return _this5.props.updateCell(_this5.props.design.table, rowId, expr, value, function (error) {
            // TODO handle error
            // Reload row
            return _this5.reloadRow(_this5.state.editingCell.rowIndex, function () {
              return _this5.setState({
                editingCell: null,
                savingCell: false
              });
            });
          });
        });
      }
    }, {
      key: "handleCancelEdit",
      value: function handleCancelEdit() {
        boundMethodCheck(this, DatagridViewComponent);
        return this.setState({
          editingCell: null,
          savingCell: false
        });
      }
    }, {
      key: "refEditCell",
      value: function refEditCell(comp) {
        boundMethodCheck(this, DatagridViewComponent);
        return this.editCellComp = comp;
      }
    }, {
      key: "handleRowDoubleClick",
      value: function handleRowDoubleClick(ev, rowIndex) {
        boundMethodCheck(this, DatagridViewComponent);

        if (this.props.onRowDoubleClick != null && this.state.rows[rowIndex].id) {
          return this.props.onRowDoubleClick(this.props.design.table, this.state.rows[rowIndex].id, rowIndex);
        }
      }
    }, {
      key: "handleRowClick",
      value: function handleRowClick(ev, rowIndex) {
        boundMethodCheck(this, DatagridViewComponent);

        if (this.props.onRowClick != null && this.state.rows[rowIndex].id) {
          return this.props.onRowClick(this.props.design.table, this.state.rows[rowIndex].id, rowIndex);
        }
      }
    }, {
      key: "renderCell",
      value: function renderCell(column, columnIndex, exprType, cellProps) {
        var _this6 = this;

        var muted, ref, ref1, value;
        boundMethodCheck(this, DatagridViewComponent); // If rendering placeholder row

        if (cellProps.rowIndex >= this.state.rows.length) {
          // Load next tick as cannot update while rendering
          _.defer(function () {
            return _this6.loadMoreRows();
          });

          return R(Cell, cellProps, R('i', {
            className: "fa fa-spinner fa-spin"
          }));
        } // Special case for row number


        if (columnIndex === -1) {
          return R(Cell, {
            width: cellProps.width,
            height: cellProps.height,
            style: {
              whiteSpace: "nowrap",
              textAlign: "right"
            }
          }, cellProps.rowIndex + 1);
        } // Get value (columns are c0, c1, c2, etc.)


        value = this.state.rows[cellProps.rowIndex]["c".concat(columnIndex)]; // Render special if editing

        if (((ref = this.state.editingCell) != null ? ref.rowIndex : void 0) === cellProps.rowIndex && ((ref1 = this.state.editingCell) != null ? ref1.columnIndex : void 0) === columnIndex) {
          // Special if saving
          if (this.state.savingCell) {
            return R(Cell, cellProps, R('i', {
              className: "fa fa-spinner fa-spin"
            }));
          }

          return R(EditExprCellComponent, {
            ref: this.refEditCell,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            locale: this.props.design.locale,
            width: cellProps.width,
            height: cellProps.height,
            value: value,
            expr: column.expr,
            onSave: this.handleSaveEdit,
            onCancel: this.handleCancelEdit
          });
        }

        if (column.type === "expr") {
          // Muted if from main and are displaying subtable
          muted = !column.subtable && this.state.rows[cellProps.rowIndex].subtable >= 0;
          return R(ExprCellComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            locale: this.props.design.locale,
            width: cellProps.width,
            height: cellProps.height,
            value: value,
            expr: column.expr,
            exprType: exprType,
            muted: muted,
            onClick: this.handleCellClick.bind(null, cellProps.rowIndex, columnIndex)
          });
        }
      } // Render a single column

    }, {
      key: "renderColumn",
      value: function renderColumn(column, columnIndex) {
        var exprType, exprUtils;
        exprUtils = new ExprUtils(this.props.schema); // Get expression type

        exprType = exprUtils.getExprType(column.expr);
        return R(Column, {
          key: column.id,
          header: R(Cell, {
            style: {
              whiteSpace: "nowrap"
            }
          }, column.label || exprUtils.summarizeExpr(column.expr, this.props.design.locale)),
          width: column.width,
          allowCellsRecycling: true,
          cell: this.renderCell.bind(null, column, columnIndex, exprType),
          columnKey: column.id,
          isResizable: this.props.onDesignChange != null
        });
      } // Render all columns

    }, {
      key: "renderColumns",
      value: function renderColumns() {
        var _this7 = this;

        var columns;
        columns = _.map(this.props.design.columns, function (column, columnIndex) {
          return _this7.renderColumn(column, columnIndex);
        });

        if (this.props.design.showRowNumbers) {
          columns.unshift(this.renderColumn({
            label: "#",
            width: 50
          }, -1));
        }

        return columns;
      }
    }, {
      key: "render",
      value: function render() {
        var rowsCount;
        rowsCount = this.state.rows.length; // Add loading row if not entirely loaded

        if (!this.state.entirelyLoaded) {
          rowsCount += 1;
        }

        return R(Table, {
          rowsCount: rowsCount,
          rowHeight: 40,
          headerHeight: 40,
          width: this.props.width,
          height: this.props.height,
          onRowDoubleClick: this.handleRowDoubleClick,
          onRowClick: this.handleRowClick,
          isColumnResizing: false,
          onColumnResizeEndCallback: this.handleColumnResize
        }, this.renderColumns());
      }
    }]);
    return DatagridViewComponent;
  }(React.Component);

  ;
  DatagridViewComponent.propTypes = {
    width: PropTypes.number.isRequired,
    // Width of control
    height: PropTypes.number.isRequired,
    // Height of control
    pageSize: PropTypes.number,
    schema: PropTypes.object.isRequired,
    // schema to use
    dataSource: PropTypes.object.isRequired,
    // dataSource to use
    datagridDataSource: PropTypes.object.isRequired,
    // datagrid dataSource to use
    design: PropTypes.object.isRequired,
    // Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func,
    // Called when design changes
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      // id table to filter
      jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias

    })),
    // Check if cell is editable
    // If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditCell: PropTypes.func,
    // Update cell value
    // Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateCell: PropTypes.func,
    // Called when row is double-clicked with (tableId, rowId, rowIndex)
    onRowDoubleClick: PropTypes.func,
    // Called when a row is clicked with (tableId, rowId, rowIndex)
    onRowClick: PropTypes.func
  };
  DatagridViewComponent.defaultProps = {
    pageSize: 100
  };
  return DatagridViewComponent;
}.call(void 0);