var Cell, Column, DatagridComponent, ExprCompiler, ExprUtils, H, R, React, Table, _, moment, ref,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

moment = require('moment');

ExprCompiler = require("mwater-expressions").ExprCompiler;

ExprUtils = require("mwater-expressions").ExprUtils;

ref = require('fixed-data-table'), Table = ref.Table, Column = ref.Column, Cell = ref.Cell;

module.exports = DatagridComponent = (function(superClass) {
  extend(DatagridComponent, superClass);

  DatagridComponent.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  function DatagridComponent(props) {
    this.renderCell = bind(this.renderCell, this);
    this.handleColumnResize = bind(this.handleColumnResize, this);
    this.performLoad = bind(this.performLoad, this);
    DatagridComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      rows: [],
      entirelyLoaded: false
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

  DatagridComponent.prototype.createColumnSelect = function(column, columnIndex) {
    var compiledExpr, exprCompiler, exprType, exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType(column.expr);
    exprCompiler = new ExprCompiler(this.props.schema);
    compiledExpr = exprCompiler.compileExpr({
      expr: column.expr,
      tableAlias: "main"
    });
    if (exprType === "geometry") {
      compiledExpr = {
        type: "op",
        op: "ST_AsGeoJSON",
        exprs: [
          {
            type: "op",
            op: "ST_Transform",
            exprs: [compiledExpr, 4326]
          }
        ]
      };
    }
    return {
      type: "select",
      expr: compiledExpr,
      alias: "c" + columnIndex
    };
  };

  DatagridComponent.prototype.createLoadSelects = function(design) {
    return _.map(design.columns, (function(_this) {
      return function(column, columnIndex) {
        return _this.createColumnSelect(column, columnIndex);
      };
    })(this));
  };

  DatagridComponent.prototype.performLoad = function(loadState, callback) {
    var design, exprCompiler, query;
    design = loadState.design;
    exprCompiler = new ExprCompiler(this.props.schema);
    query = {
      type: "query",
      selects: this.createLoadSelects(design),
      from: {
        type: "table",
        table: design.table,
        alias: "main"
      },
      offset: loadState.offset,
      limit: loadState.pageSize
    };
    if (design.filter) {
      query.where = exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      });
    }
    query.orderBy = [
      {
        expr: {
          type: "field",
          tableAlias: "main",
          column: this.props.schema.getTable(design.table).primaryKey
        },
        direction: "asc"
      }
    ];
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

  DatagridComponent.prototype.renderImage = function(id) {
    var url;
    url = this.props.dataSource.getImageUrl(id);
    return H.a({
      href: url,
      key: id,
      target: "_blank",
      style: {
        paddingLeft: 5,
        paddingRight: 5
      }
    }, "Image");
  };

  DatagridComponent.prototype.renderCell = function(column, columnIndex, exprType, cellProps) {
    var exprUtils, node, value;
    if (cellProps.rowIndex >= this.state.rows.length) {
      this.loadMoreRows();
      return R(Cell, cellProps, H.i({
        className: "fa fa-spinner fa-spin"
      }));
    }
    value = this.state.rows[cellProps.rowIndex]["c" + columnIndex];
    exprUtils = new ExprUtils(this.props.schema);
    if (value == null) {
      node = null;
    } else {
      if ((exprType === 'image' || exprType === 'imagelist' || exprType === 'geometry' || exprType === 'text[]') && _.isString(value)) {
        value = JSON.parse(value);
      }
      switch (exprType) {
        case "text":
        case "number":
          node = value;
          break;
        case "boolean":
        case "enum":
        case "enumset":
        case "text[]":
          node = exprUtils.stringifyExprLiteral(column.expr, value);
          break;
        case "date":
          node = moment(value, "YYYY-MM-DD").format("ll");
          break;
        case "datetime":
          node = moment(value, moment.ISO_8601).format("lll");
          break;
        case "image":
          node = this.renderImage(value.id);
          break;
        case "imagelist":
          node = _.map(value, (function(_this) {
            return function(v) {
              return _this.renderImage(v.id);
            };
          })(this));
          break;
        case "geometry":
          node = (value.coordinates[1].toFixed(6)) + " " + (value.coordinates[0].toFixed(6));
          break;
        default:
          node = "" + value;
      }
    }
    return R(Cell, {
      width: cellProps.width,
      height: cellProps.height,
      style: {
        whiteSpace: "nowrap"
      }
    }, node);
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
