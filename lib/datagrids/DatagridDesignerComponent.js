var ColumnDesignerComponent, ColumnsDesignerComponent, DatagridDesignerComponent, ExprComponent, ExprUtils, FilterExprComponent, H, LabeledExprGenerator, OrderBysDesignerComponent, QuickfiltersDesignComponent, R, React, ReorderableListComponent, TabbedComponent, TableSelectComponent, _, update, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprUtils = require("mwater-expressions").ExprUtils;

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

module.exports = DatagridDesignerComponent = (function(superClass) {
  extend(DatagridDesignerComponent, superClass);

  function DatagridDesignerComponent() {
    this.handleOrderBysChange = bind(this.handleOrderBysChange, this);
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleColumnsChange = bind(this.handleColumnsChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return DatagridDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  DatagridDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  DatagridDesignerComponent.prototype.handleTableChange = function(table) {
    var design;
    design = {
      table: table,
      columns: []
    };
    return this.props.onDesignChange(design);
  };

  DatagridDesignerComponent.prototype.handleColumnsChange = function(columns) {
    return this.props.onDesignChange(update(this.props.design, {
      columns: {
        $set: columns
      }
    }));
  };

  DatagridDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.props.onDesignChange(update(this.props.design, {
      filter: {
        $set: filter
      }
    }));
  };

  DatagridDesignerComponent.prototype.handleOrderBysChange = function(orderBys) {
    return this.props.onDesignChange(update(this.props.design, {
      orderBys: {
        $set: orderBys
      }
    }));
  };

  DatagridDesignerComponent.prototype.renderTabs = function() {
    return R(TabbedComponent, {
      initialTabId: "columns",
      tabs: [
        {
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
          elem: H.div({
            style: {
              marginBottom: 200
            }
          }, R(FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            value: this.props.design.filter,
            onChange: this.handleFilterChange
          }))
        }, {
          id: "order",
          label: "Sorting",
          elem: H.div({
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
          elem: H.div({
            style: {
              marginBottom: 200
            }
          }, R(QuickfiltersDesignComponent, {
            design: this.props.design.quickfilters,
            onDesignChange: (function(_this) {
              return function(design) {
                return _this.props.onDesignChange(update(_this.props.design, {
                  quickfilters: {
                    $set: design
                  }
                }));
              };
            })(this),
            schema: this.props.schema,
            dataSource: this.props.dataSource
          }))
        }
      ]
    });
  };

  DatagridDesignerComponent.prototype.render = function() {
    return H.div(null, H.label(null, "Data Source:"), R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }), this.props.design.table ? this.renderTabs() : void 0);
  };

  return DatagridDesignerComponent;

})(React.Component);

ColumnsDesignerComponent = (function(superClass) {
  extend(ColumnsDesignerComponent, superClass);

  function ColumnsDesignerComponent() {
    this.renderColumn = bind(this.renderColumn, this);
    this.handleRemoveAllColumns = bind(this.handleRemoveAllColumns, this);
    this.handleAddDefaultColumns = bind(this.handleAddDefaultColumns, this);
    this.handleAddIdColumn = bind(this.handleAddIdColumn, this);
    this.handleAddColumn = bind(this.handleAddColumn, this);
    this.handleColumnChange = bind(this.handleColumnChange, this);
    return ColumnsDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  ColumnsDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    columns: React.PropTypes.array.isRequired,
    onColumnsChange: React.PropTypes.func.isRequired
  };

  ColumnsDesignerComponent.prototype.handleColumnChange = function(columnIndex, column) {
    var columns;
    columns = this.props.columns.slice();
    if (!column) {
      columns.splice(columnIndex, 1);
    } else if (_.isArray(column)) {
      Array.prototype.splice.apply(columns, [columnIndex, 1].concat(column));
    } else {
      columns[columnIndex] = column;
    }
    return this.props.onColumnsChange(columns);
  };

  ColumnsDesignerComponent.prototype.handleAddColumn = function() {
    var columns;
    columns = this.props.columns.slice();
    columns.push({
      id: uuid(),
      type: "expr",
      width: 150
    });
    return this.props.onColumnsChange(columns);
  };

  ColumnsDesignerComponent.prototype.handleAddIdColumn = function() {
    var columns;
    columns = this.props.columns.slice();
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
  };

  ColumnsDesignerComponent.prototype.handleAddDefaultColumns = function() {
    var columns, i, labeledExpr, labeledExprs, len;
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
        expr: labeledExpr.expr
      });
    }
    columns = this.props.columns.concat(columns);
    return this.props.onColumnsChange(columns);
  };

  ColumnsDesignerComponent.prototype.handleRemoveAllColumns = function() {
    return this.props.onColumnsChange([]);
  };

  ColumnsDesignerComponent.prototype.renderColumn = function(column, columnIndex, connectDragSource, connectDragPreview, connectDropTarget) {
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
  };

  ColumnsDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        height: "auto",
        overflowY: "auto",
        overflowX: "hidden"
      }
    }, H.div({
      style: {
        textAlign: "right"
      },
      key: "options"
    }, H.button({
      key: "addAll",
      type: "button",
      className: "btn btn-link btn-xs",
      onClick: this.handleAddDefaultColumns
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Default Columns"), H.button({
      key: "removeAll",
      type: "button",
      className: "btn btn-link btn-xs",
      onClick: this.handleRemoveAllColumns
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }), " Remove All Columns")), R(ReorderableListComponent, {
      items: this.props.columns,
      onReorder: this.props.onColumnsChange,
      renderItem: this.renderColumn,
      getItemId: (function(_this) {
        return function(item) {
          return item.id;
        };
      })(this)
    }), H.button({
      key: "add",
      type: "button",
      className: "btn btn-link",
      onClick: this.handleAddColumn
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Column"), H.button({
      key: "add-id",
      type: "button",
      className: "btn btn-link",
      onClick: this.handleAddIdColumn
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Unique Id (advanced)"));
  };

  return ColumnsDesignerComponent;

})(React.Component);

ColumnDesignerComponent = (function(superClass) {
  extend(ColumnDesignerComponent, superClass);

  function ColumnDesignerComponent() {
    this.render = bind(this.render, this);
    this.handleSplitGeometry = bind(this.handleSplitGeometry, this);
    this.handleSplitEnumset = bind(this.handleSplitEnumset, this);
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return ColumnDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  ColumnDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    column: React.PropTypes.object.isRequired,
    onColumnChange: React.PropTypes.func.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDragPreview: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired
  };

  ColumnDesignerComponent.prototype.handleExprChange = function(expr) {
    return this.props.onColumnChange(update(this.props.column, {
      expr: {
        $set: expr
      }
    }));
  };

  ColumnDesignerComponent.prototype.handleLabelChange = function(label) {
    return this.props.onColumnChange(update(this.props.column, {
      label: {
        $set: label
      }
    }));
  };

  ColumnDesignerComponent.prototype.handleSplitEnumset = function() {
    var exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    return this.props.onColumnChange(_.map(exprUtils.getExprEnumValues(this.props.column.expr), (function(_this) {
      return function(enumVal) {
        return {
          id: uuid(),
          type: "expr",
          width: 150,
          expr: {
            type: "op",
            op: "contains",
            table: _this.props.table,
            exprs: [
              _this.props.column.expr, {
                type: "literal",
                valueType: "enumset",
                value: [enumVal.id]
              }
            ]
          }
        };
      };
    })(this)));
  };

  ColumnDesignerComponent.prototype.handleSplitGeometry = function() {
    return this.props.onColumnChange([
      {
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
      }
    ]);
  };

  ColumnDesignerComponent.prototype.renderSplit = function() {
    var exprType, exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType(this.props.column.expr);
    switch (exprType) {
      case "enumset":
        return H.a({
          className: "btn btn-xs btn-link",
          onClick: this.handleSplitEnumset
        }, H.i({
          className: "fa fa-chain-broken"
        }), " Split by options");
      case "geometry":
        return H.a({
          className: "btn btn-xs btn-link",
          onClick: this.handleSplitGeometry
        }, H.i({
          className: "fa fa-chain-broken"
        }), " Split by lat/lng");
    }
    return null;
  };

  ColumnDesignerComponent.prototype.render = function() {
    var allowedTypes, elem, exprUtils, type;
    exprUtils = new ExprUtils(this.props.schema);
    type = exprUtils.getExprType(this.props.column.expr);
    allowedTypes = ['text', 'number', 'enum', 'enumset', 'boolean', 'date', 'datetime', 'image', 'imagelist', 'text[]', 'geometry'];
    if (type === "id") {
      allowedTypes.push("id");
    }
    elem = H.div({
      className: "row"
    }, H.div({
      className: "col-xs-1"
    }, this.props.connectDragSource(H.span({
      className: "text-muted fa fa-bars"
    }))), H.div({
      className: "col-xs-5"
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      value: this.props.column.expr,
      aggrStatuses: ['literal', 'individual', 'aggregate'],
      types: allowedTypes,
      onChange: this.handleExprChange
    }), this.renderSplit()), H.div({
      className: "col-xs-5"
    }, H.input({
      type: "text",
      className: "form-control",
      placeholder: exprUtils.summarizeExpr(this.props.column.expr),
      value: this.props.column.label,
      onChange: (function(_this) {
        return function(ev) {
          return _this.handleLabelChange(ev.target.value);
        };
      })(this)
    })), H.div({
      className: "col-xs-1"
    }, H.a({
      onClick: this.props.onColumnChange.bind(null, null)
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }))));
    return this.props.connectDropTarget(this.props.connectDragPreview(elem));
  };

  return ColumnDesignerComponent;

})(React.Component);
