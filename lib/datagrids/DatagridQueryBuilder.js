var DatagridQueryBuilder, ExprCompiler, ExprUtils, _;

_ = require('lodash');

ExprCompiler = require("mwater-expressions").ExprCompiler;

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = DatagridQueryBuilder = (function() {
  function DatagridQueryBuilder(schema) {
    this.schema = schema;
  }

  DatagridQueryBuilder.prototype.createQuery = function(design, offset, limit) {
    if (!design.subtables || design.subtables.length === 0) {
      return this.createSimpleQuery(design, offset, limit);
    } else {
      return this.createComplexQuery(design, offset, limit);
    }
  };

  DatagridQueryBuilder.prototype.createSimpleQuery = function(design, offset, limit) {
    var direction, expr, exprCompiler, i, j, k, len, len1, query, ref, ref1;
    exprCompiler = new ExprCompiler(this.schema);
    query = {
      type: "query",
      selects: this.createLoadSelects(design),
      from: {
        type: "table",
        table: design.table,
        alias: "main"
      },
      orderBy: [],
      offset: offset,
      limit: limit
    };
    if (design.filter) {
      query.where = exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      });
    }
    ref = this.getMainSortExprs(design);
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      expr = ref[i];
      query.orderBy.push({
        expr: expr
      });
    }
    ref1 = this.getMainSortDirections(design);
    for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
      direction = ref1[i];
      query.orderBy[i].direction = direction;
    }
    return query;
  };

  DatagridQueryBuilder.prototype.createComplexQuery = function(design, offset, limit) {
    var column, direction, exprCompiler, i, index, j, k, l, len, len1, len2, len3, len4, m, n, query, ref, ref1, ref2, ref3, ref4, stindex, subtable, unionQueries, unionQuery;
    exprCompiler = new ExprCompiler(this.schema);
    unionQueries = [];
    unionQueries.push(this.createComplexMainQuery(design));
    ref = design.subtables;
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      subtable = ref[index];
      unionQueries.push(this.createComplexSubtableQuery(design, subtable, index));
    }
    unionQuery = {
      type: "union all",
      queries: unionQueries
    };
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "unioned",
            column: "id"
          },
          alias: "id"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "unioned",
            column: "subtable"
          },
          alias: "subtable"
        }
      ],
      from: {
        type: "subquery",
        query: unionQuery,
        alias: "unioned"
      },
      orderBy: [],
      offset: offset,
      limit: limit
    };
    ref1 = design.columns;
    for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
      column = ref1[index];
      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "unioned",
          column: "c" + index
        },
        alias: "c" + index
      });
    }
    ref2 = this.getMainSortDirections(design);
    for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
      direction = ref2[i];
      query.orderBy.push({
        expr: {
          type: "field",
          tableAlias: "unioned",
          column: "s" + i
        },
        direction: direction
      });
    }
    query.orderBy.push({
      expr: {
        type: "field",
        tableAlias: "unioned",
        column: "subtable"
      },
      direction: "asc"
    });
    ref3 = design.subtables;
    for (stindex = m = 0, len3 = ref3.length; m < len3; stindex = ++m) {
      subtable = ref3[stindex];
      ref4 = this.getSubtableSortDirections(design, subtable);
      for (i = n = 0, len4 = ref4.length; n < len4; i = ++n) {
        direction = ref4[i];
        query.orderBy.push({
          expr: {
            type: "field",
            tableAlias: "unioned",
            column: "st" + stindex + "s" + i
          },
          direction: direction
        });
      }
    }
    return query;
  };

  DatagridQueryBuilder.prototype.createComplexMainQuery = function(design) {
    var expr, i, j, k, l, len, len1, len2, query, ref, ref1, ref2, selects, stindex, subtable;
    selects = [
      {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: this.schema.getTable(design.table).primaryKey
        },
        alias: "id"
      }, {
        type: "select",
        expr: -1,
        alias: "subtable"
      }
    ];
    ref = this.getMainSortExprs(design);
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      expr = ref[i];
      selects.push({
        type: "select",
        expr: expr,
        alias: "s" + i
      });
    }
    ref1 = design.subtables;
    for (stindex = k = 0, len1 = ref1.length; k < len1; stindex = ++k) {
      subtable = ref1[stindex];
      ref2 = this.getSubtableSortExprs(design, subtable);
      for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
        expr = ref2[i];
        selects.push({
          type: "select",
          expr: null,
          alias: "st" + stindex + "s" + i
        });
      }
    }
    selects = selects.concat(_.map(design.columns, (function(_this) {
      return function(column, columnIndex) {
        return _this.createColumnSelect(column, columnIndex);
      };
    })(this)));
    query = {
      type: "query",
      selects: selects,
      from: {
        type: "table",
        table: design.table,
        alias: "main"
      }
    };
    if (design.filter) {
      query.where = exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      });
    }
    return query;
  };

  DatagridQueryBuilder.prototype.createComplexSubtableQuery = function(design, subtable, subtableIndex) {
    var expr, exprCompiler, exprUtils, i, j, k, l, len, len1, len2, query, ref, ref1, ref2, selects, stindex, subtableTable;
    exprUtils = new ExprUtils(this.schema);
    exprCompiler = new ExprCompiler(this.schema);
    selects = [
      {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: this.schema.getTable(design.table).primaryKey
        },
        alias: "id"
      }, {
        type: "select",
        expr: subtableIndex,
        alias: "subtable"
      }
    ];
    ref = this.getMainSortExprs(design);
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      expr = ref[i];
      selects.push({
        type: "select",
        expr: expr,
        alias: "s" + i
      });
    }
    ref1 = design.subtables;
    for (stindex = k = 0, len1 = ref1.length; k < len1; stindex = ++k) {
      subtable = ref1[stindex];
      ref2 = this.getSubtableSortExprs(design, subtable);
      for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
        expr = ref2[i];
        selects.push({
          type: "select",
          expr: expr,
          alias: "st" + stindex + "s" + i
        });
      }
    }
    selects = selects.concat(_.map(design.columns, (function(_this) {
      return function(column, columnIndex) {
        return _this.createColumnSelect(column, columnIndex, subtable);
      };
    })(this)));
    subtableTable = exprUtils.followJoins(design.table, subtable.joins);
    if (subtable.joins.length > 1) {
      throw new Error("Multiple subtable joins not implemented");
    }
    query = {
      type: "query",
      selects: selects,
      from: {
        type: "join",
        kind: "inner",
        left: {
          type: "table",
          table: design.table,
          alias: "main"
        },
        right: {
          type: "table",
          table: subtableTable,
          alias: "st"
        },
        on: exprCompiler.compileJoin(this.schema.getColumn(design.table, subtable.joins[0]).join, "main", "st")
      }
    };
    if (design.filter) {
      query.where = exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      });
    }
    return query;
  };

  DatagridQueryBuilder.prototype.getMainSortExprs = function(design) {
    var exprs, ordering;
    exprs = [];
    ordering = this.schema.getTable(design.table).ordering;
    if (ordering) {
      exprs.push({
        type: "field",
        tableAlias: "main",
        column: ordering
      });
    }
    exprs.push({
      type: "field",
      tableAlias: "main",
      column: this.schema.getTable(design.table).primaryKey
    });
    return exprs;
  };

  DatagridQueryBuilder.prototype.getMainSortDirections = function(design) {
    var directions, ordering;
    directions = [];
    ordering = this.schema.getTable(design.table).ordering;
    if (ordering) {
      directions.push("asc");
    }
    directions.push("asc");
    return directions;
  };

  DatagridQueryBuilder.prototype.getSubtableSortExprs = function(design, subtable) {
    var exprUtils, exprs, ordering, subtableTable;
    exprUtils = new ExprUtils(this.schema);
    subtableTable = exprUtils.followJoins(design.table, subtable.joins);
    exprs = [];
    ordering = this.schema.getTable(subtableTable).ordering;
    if (ordering) {
      exprs.push({
        type: "field",
        tableAlias: "st",
        column: ordering
      });
    }
    exprs.push({
      type: "field",
      tableAlias: "st",
      column: this.schema.getTable(subtableTable).primaryKey
    });
    return exprs;
  };

  DatagridQueryBuilder.prototype.getSubtableSortDirections = function(design, subtable) {
    var directions, exprUtils, ordering, subtableTable;
    exprUtils = new ExprUtils(this.schema);
    subtableTable = exprUtils.followJoins(design.table, subtable.joins);
    directions = [];
    ordering = this.schema.getTable(subtableTable).ordering;
    if (ordering) {
      directions.push("asc");
    }
    directions.push("asc");
    return directions;
  };

  DatagridQueryBuilder.prototype.createColumnSelect = function(column, columnIndex, subtable) {
    var compiledExpr, exprCompiler, exprType, exprUtils;
    if (column.subtable && !subtable) {
      return {
        type: "select",
        expr: null,
        alias: "c" + columnIndex
      };
    }
    if (column.subtable && subtable) {
      if (subtable.id !== column.subtable) {
        return {
          type: "select",
          expr: null,
          alias: "c" + columnIndex
        };
      }
    }
    exprUtils = new ExprUtils(this.schema);
    exprType = exprUtils.getExprType(column.expr);
    exprCompiler = new ExprCompiler(this.schema);
    compiledExpr = exprCompiler.compileExpr({
      expr: column.expr,
      tableAlias: column.subtable ? "st" : "main"
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

  DatagridQueryBuilder.prototype.createLoadSelects = function(design) {
    var selects;
    selects = [
      {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: this.schema.getTable(design.table).primaryKey
        },
        alias: "id"
      }, {
        type: "select",
        expr: -1,
        alias: "subtable"
      }
    ];
    return selects = selects.concat(_.map(design.columns, (function(_this) {
      return function(column, columnIndex) {
        return _this.createColumnSelect(column, columnIndex);
      };
    })(this)));
  };

  return DatagridQueryBuilder;

})();
