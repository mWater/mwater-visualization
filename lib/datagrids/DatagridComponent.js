var Cell, Column, DatagridComponent, DatagridQueryBuilder, EditExprCellComponent, ExprCellComponent, ExprUtils, H, R, React, Table, _, moment, ref,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

moment = require('moment');

ref = require('fixed-data-table'), Table = ref.Table, Column = ref.Column, Cell = ref.Cell;

DatagridQueryBuilder = require('./DatagridQueryBuilder');

ExprUtils = require("mwater-expressions").ExprUtils;

ExprCellComponent = require('./ExprCellComponent');

EditExprCellComponent = require('./EditExprCellComponent');

module.exports = DatagridComponent = (function(superClass) {
  extend(DatagridComponent, superClass);

  DatagridComponent.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    canEditCell: React.PropTypes.func,
    updateCell: React.PropTypes.func
  };

  DatagridComponent.defaultProps = {
    pageSize: 100
  };

  function DatagridComponent(props) {
    this.renderCell = bind(this.renderCell, this);
    this.refEditCell = bind(this.refEditCell, this);
    this.handleCancelEdit = bind(this.handleCancelEdit, this);
    this.handleSaveEdit = bind(this.handleSaveEdit, this);
    this.handleCellClick = bind(this.handleCellClick, this);
    this.handleColumnResize = bind(this.handleColumnResize, this);
    this.performLoad = bind(this.performLoad, this);
    DatagridComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      rows: [],
      entirelyLoaded: false,
      editingCell: null,
      savingCell: false
    };
  }

  DatagridComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.design, this.props.design)) {
      return this.setState({
        rows: [],
        entirelyLoaded: false
      });
    }
  };

  DatagridComponent.prototype.performLoad = function(loadState, callback) {
    var query;
    query = new DatagridQueryBuilder(this.props.schema).createQuery(loadState.design, loadState.offset, loadState.pageSize);
    return this.props.dataSource.performQuery(query, (function(_this) {
      return function(error, rows) {
        if (error) {
          throw error;
        }
        return callback(rows);
      };
    })(this));
  };

  DatagridComponent.prototype.loadMoreRows = function() {
    var loadState;
    loadState = {
      design: this.props.design,
      offset: this.state.rows.length,
      pageSize: this.props.pageSize
    };
    if (_.isEqual(loadState, this.loadState)) {
      return;
    }
    this.loadState = loadState;
    return this.performLoad(loadState, (function(_this) {
      return function(newRows) {
        var rows;
        if (_.isEqual(loadState, _this.loadState)) {
          _this.loadState = null;
          rows = _this.state.rows.concat(newRows);
          return _this.setState({
            rows: rows,
            entirelyLoaded: newRows.length < _this.props.pageSize
          });
        }
      };
    })(this));
  };

  DatagridComponent.prototype.reloadRow = function(rowIndex, callback) {
    var query;
    query = new DatagridQueryBuilder(this.props.schema).createQuery(this.props.design, rowIndex, 1);
    return this.props.dataSource.performQuery(query, (function(_this) {
      return function(error, rows) {
        var newRows;
        if (error) {
          throw error;
        }
        if (!rows[0]) {
          throw new Error("Missing row");
        }
        newRows = _this.state.rows.slice();
        newRows[rowIndex] = rows[0];
        _this.setState({
          rows: newRows
        });
        return callback();
      };
    })(this));
  };

  DatagridComponent.prototype.handleColumnResize = function(newColumnWidth, columnKey) {
    var column, columnIndex, columns;
    columnIndex = _.findIndex(this.props.design.columns, {
      id: columnKey
    });
    column = this.props.design.columns[columnIndex];
    column = _.extend({}, column, {
      width: newColumnWidth
    });
    columns = this.props.design.columns.slice();
    columns[columnIndex] = column;
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      columns: columns
    }));
  };

  DatagridComponent.prototype.handleCellClick = function(rowIndex, columnIndex) {
    var column, exprType, ref1, ref2;
    if (((ref1 = this.state.editingCell) != null ? ref1.rowIndex : void 0) === rowIndex && ((ref2 = this.state.editingCell) != null ? ref2.columnIndex : void 0) === columnIndex) {
      return;
    }
    if (this.state.savingCell) {
      return;
    }
    if (this.state.editingCell) {
      this.handleSaveEdit();
      return;
    }
    if (!this.props.canEditCell) {
      return;
    }
    column = this.props.design.columns[columnIndex];
    if (!column.type === "expr") {
      return;
    }
    exprType = new ExprUtils(this.props.schema).getExprType(column.expr);
    if (exprType !== 'text' && exprType !== 'number' && exprType !== 'enum') {
      return;
    }
    return this.props.canEditCell(this.props.design.table, this.state.rows[rowIndex].id, column.expr, (function(_this) {
      return function(error, canEdit) {
        if (error) {
          throw error;
        }
        if (canEdit) {
          return _this.setState({
            editingCell: {
              rowIndex: rowIndex,
              columnIndex: columnIndex
            }
          });
        }
      };
    })(this));
  };

  DatagridComponent.prototype.handleSaveEdit = function() {
    var expr, rowId, value;
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
    }, (function(_this) {
      return function() {
        return _this.props.updateCell(_this.props.design.table, rowId, expr, value, function(error) {
          return _this.reloadRow(_this.state.editingCell.rowIndex, function() {
            return _this.setState({
              editingCell: null,
              savingCell: false
            });
          });
        });
      };
    })(this));
  };

  DatagridComponent.prototype.handleCancelEdit = function() {
    return this.setState({
      editingCell: null,
      savingCell: false
    });
  };

  DatagridComponent.prototype.refEditCell = function(comp) {
    return this.editCellComp = comp;
  };

  DatagridComponent.prototype.renderCell = function(column, columnIndex, exprType, cellProps) {
    var ref1, ref2, value;
    if (cellProps.rowIndex >= this.state.rows.length) {
      this.loadMoreRows();
      return R(Cell, cellProps, H.i({
        className: "fa fa-spinner fa-spin"
      }));
    }
    value = this.state.rows[cellProps.rowIndex]["c" + columnIndex];
    if (((ref1 = this.state.editingCell) != null ? ref1.rowIndex : void 0) === cellProps.rowIndex && ((ref2 = this.state.editingCell) != null ? ref2.columnIndex : void 0) === columnIndex) {
      if (this.state.savingCell) {
        return R(Cell, cellProps, H.i({
          className: "fa fa-spinner fa-spin"
        }));
      }
      return R(EditExprCellComponent, {
        ref: this.refEditCell,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        width: cellProps.width,
        height: cellProps.height,
        value: value,
        expr: column.expr,
        onSave: this.handleSaveEdit,
        onCancel: this.handleCancelEdit
      });
    }
    if (column.type === "expr") {
      return R(ExprCellComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        width: cellProps.width,
        height: cellProps.height,
        value: value,
        expr: column.expr,
        exprType: exprType,
        onClick: this.handleCellClick.bind(null, cellProps.rowIndex, columnIndex)
      });
    }
  };

  DatagridComponent.prototype.renderColumn = function(column, columnIndex) {
    var exprType, exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType(column.expr);
    return R(Column, {
      key: column.id,
      header: R(Cell, {
        style: {
          whiteSpace: "nowrap"
        }
      }, column.label || exprUtils.summarizeExpr(column.expr)),
      width: column.width,
      allowCellsRecycling: true,
      cell: this.renderCell.bind(null, column, columnIndex, exprType),
      columnKey: column.id,
      isResizable: true
    });
  };

  DatagridComponent.prototype.renderColumns = function() {
    return _.map(this.props.design.columns, (function(_this) {
      return function(column, columnIndex) {
        return _this.renderColumn(column, columnIndex);
      };
    })(this));
  };

  DatagridComponent.prototype.render = function() {
    var rowsCount;
    rowsCount = this.state.rows.length;
    if (!this.state.entirelyLoaded) {
      rowsCount += 1;
    }
    return R(Table, {
      rowsCount: rowsCount,
      rowHeight: 40,
      headerHeight: 40,
      width: this.props.width,
      height: this.props.height,
      isColumnResizing: false,
      onColumnResizeEndCallback: this.handleColumnResize
    }, this.renderColumns());
  };

  return DatagridComponent;

})(React.Component);
