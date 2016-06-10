var DatagridQueryBuilder, ExprCompiler, ExprUtils, _, injectTableAlias;

_ = require('lodash');

ExprCompiler = require("mwater-expressions").ExprCompiler;

ExprUtils = require("mwater-expressions").ExprUtils;

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = DatagridQueryBuilder = (function() {
  function DatagridQueryBuilder(schema) {
    this.schema = schema;
  }

  DatagridQueryBuilder.prototype.createQuery = function(design, options) {
    if (options == null) {
      options = {};
    }
    if (!design.subtables || design.subtables.length === 0) {
      return this.createSimpleQuery(design, options);
    } else {
      return this.createComplexQuery(design, options);
    }
  };

  DatagridQueryBuilder.prototype.createSimpleQuery = function(design, options) {
    var direction, expr, exprCompiler, extraFilter, i, j, k, l, len, len1, len2, query, ref, ref1, ref2, wheres;
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
      offset: options.offset,
      limit: options.limit
    };
    wheres = [];
    if (design.filter) {
      wheres.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    ref = options.extraFilters || [];
    for (j = 0, len = ref.length; j < len; j++) {
      extraFilter = ref[j];
      if (extraFilter.table === design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"));
      }
    }
    wheres = _.compact(wheres);
    if (wheres.length === 1) {
      query.where = wheres[0];
    } else if (wheres.length > 1) {
      query.where = {
        type: "op",
        op: "and",
        exprs: wheres
      };
    }
    ref1 = this.getMainSortExprs(design);
    for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
      expr = ref1[i];
      query.orderBy.push({
        expr: expr
      });
    }
    ref2 = this.getMainSortDirections(design);
    for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
      direction = ref2[i];
      query.orderBy[i].direction = direction;
    }
    return query;
  };

  DatagridQueryBuilder.prototype.createComplexQuery = function(design, options) {
    var column, direction, i, index, j, k, l, len, len1, len2, len3, len4, m, n, query, ref, ref1, ref2, ref3, ref4, stindex, subtable, unionQueries, unionQuery;
    unionQueries = [];
    unionQueries.push(this.createComplexMainQuery(design, options));
    ref = design.subtables;
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      subtable = ref[index];
      unionQueries.push(this.createComplexSubtableQuery(design, options, subtable, index));
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
      offset: options.offset,
      limit: options.limit
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

  DatagridQueryBuilder.prototype.createComplexMainQuery = function(design, options) {
    var expr, exprCompiler, extraFilter, i, j, k, l, len, len1, len2, len3, m, query, ref, ref1, ref2, ref3, selects, stindex, subtable, type, wheres;
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
      ref2 = this.getSubtableSortExprTypes(design, subtable);
      for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
        type = ref2[i];
        selects.push({
          type: "select",
          expr: this.createNullExpr(type),
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
    wheres = [];
    if (design.filter) {
      wheres.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    ref3 = options.extraFilters || [];
    for (m = 0, len3 = ref3.length; m < len3; m++) {
      extraFilter = ref3[m];
      if (extraFilter.table === design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"));
      }
    }
    wheres = _.compact(wheres);
    if (wheres.length === 1) {
      query.where = wheres[0];
    } else if (wheres.length > 1) {
      query.where = {
        type: "op",
        op: "and",
        exprs: wheres
      };
    }
    return query;
  };

  DatagridQueryBuilder.prototype.createComplexSubtableQuery = function(design, options, subtable, subtableIndex) {
    var expr, exprCompiler, exprUtils, extraFilter, i, j, k, l, len, len1, len2, len3, m, query, ref, ref1, ref2, ref3, selects, st, stindex, subtableTable, types, wheres;
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
      st = ref1[stindex];
      ref2 = this.getSubtableSortExprs(design, st);
      for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
        expr = ref2[i];
        if (stindex === subtableIndex) {
          selects.push({
            type: "select",
            expr: expr,
            alias: "st" + stindex + "s" + i
          });
        } else {
          types = this.getSubtableSortExprTypes(design, st);
          selects.push({
            type: "select",
            expr: this.createNullExpr(types[i]),
            alias: "st" + stindex + "s" + i
          });
        }
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
    wheres = [];
    if (design.filter) {
      wheres.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    ref3 = options.extraFilters || [];
    for (m = 0, len3 = ref3.length; m < len3; m++) {
      extraFilter = ref3[m];
      if (extraFilter.table === design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"));
      }
      if (extraFilter.table === subtableTable) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "st"));
      }
    }
    wheres = _.compact(wheres);
    if (wheres.length === 1) {
      query.where = wheres[0];
    } else if (wheres.length > 1) {
      query.where = {
        type: "op",
        op: "and",
        exprs: wheres
      };
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

  DatagridQueryBuilder.prototype.getSubtableSortExprTypes = function(design, subtable) {
    var exprUtils, ordering, subtableTable, types;
    exprUtils = new ExprUtils(this.schema);
    subtableTable = exprUtils.followJoins(design.table, subtable.joins);
    types = [];
    ordering = this.schema.getTable(subtableTable).ordering;
    if (ordering) {
      types.push(this.schema.getColumn(subtableTable, ordering).type);
    }
    types.push("text");
    return types;
  };

  DatagridQueryBuilder.prototype.createColumnSelect = function(column, columnIndex, subtable) {
    var compiledExpr, exprCompiler, exprType, exprUtils;
    exprUtils = new ExprUtils(this.schema);
    exprType = exprUtils.getExprType(column.expr);
    if (column.subtable && !subtable) {
      return {
        type: "select",
        expr: this.createNullExpr(exprType),
        alias: "c" + columnIndex
      };
    }
    if (column.subtable && subtable) {
      if (subtable.id !== column.subtable) {
        return {
          type: "select",
          expr: this.createNullExpr(exprType),
          alias: "c" + columnIndex
        };
      }
    }
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

  DatagridQueryBuilder.prototype.createNullExpr = function(exprType) {
    switch (exprType) {
      case "text":
      case "enum":
      case "geometry":
      case "id":
      case "date":
      case "datetime":
        return {
          type: "op",
          op: "::text",
          exprs: [null]
        };
      case "boolean":
        return {
          type: "op",
          op: "::boolean",
          exprs: [null]
        };
      case "number":
        return {
          type: "op",
          op: "::decimal",
          exprs: [null]
        };
      case "enumset":
      case "text[]":
      case "image":
      case "imagelist":
        return {
          type: "op",
          op: "::jsonb",
          exprs: [null]
        };
      default:
        return exprType + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx";
    }
  };

  return DatagridQueryBuilder;

})();
