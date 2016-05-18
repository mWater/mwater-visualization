var DatagridQueryBuilder, ExprCompiler, ExprUtils;

ExprCompiler = require("mwater-expressions").ExprCompiler;

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = DatagridQueryBuilder = (function() {
  function DatagridQueryBuilder(schema) {
    this.schema = schema;
  }

  DatagridQueryBuilder.prototype.createQuery = function(design, offset, limit) {
    var exprCompiler, query;
    design = design;
    exprCompiler = new ExprCompiler(this.schema);
    query = {
      type: "query",
      selects: this.createLoadSelects(design),
      from: {
        type: "table",
        table: design.table,
        alias: "main"
      },
      offset: offset,
      limit: limit
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
          column: this.schema.getTable(design.table).primaryKey
        },
        direction: "asc"
      }
    ];
    return query;
  };

  DatagridQueryBuilder.prototype.createColumnSelect = function(column, columnIndex) {
    var compiledExpr, exprCompiler, exprType, exprUtils;
    exprUtils = new ExprUtils(this.schema);
    exprType = exprUtils.getExprType(column.expr);
    exprCompiler = new ExprCompiler(this.schema);
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
