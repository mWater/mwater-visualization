var ExprCompiler, ImplicitFilterBuilder, _, injectTableAlias;

_ = require('lodash');

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCompiler = require('mwater-expressions').ExprCompiler;

module.exports = ImplicitFilterBuilder = (function() {
  function ImplicitFilterBuilder(schema) {
    this.schema = schema;
  }

  ImplicitFilterBuilder.prototype.findJoins = function(filterableTables) {
    var allJoins, filterableTable, i, joins, len, table;
    allJoins = [];
    for (i = 0, len = filterableTables.length; i < len; i++) {
      filterableTable = filterableTables[i];
      table = this.schema.getTable(filterableTable);
      if (!table) {
        continue;
      }
      joins = _.filter(this.schema.getColumns(filterableTable), (function(_this) {
        return function(column) {
          return column.type === "join" && column.join.type === "n-1" && column.join.toTable !== filterableTable;
        };
      })(this));
      joins = _.flatten(_.filter(_.values(_.groupBy(joins, function(join) {
        return join.join.toTable;
      })), function(list) {
        return list.length === 1;
      }));
      allJoins = allJoins.concat(_.map(joins, function(join) {
        return {
          table: filterableTable,
          column: join.id
        };
      }));
    }
    return allJoins;
  };

  ImplicitFilterBuilder.prototype.extendFilters = function(filterableTables, filters) {
    var exprCompiler, i, implicitFilter, implicitFilters, j, join, joinColumn, joins, len, len1, parentFilter, parentFilters;
    implicitFilters = [];
    joins = this.findJoins(filterableTables);
    exprCompiler = new ExprCompiler(this.schema);
    for (i = 0, len = joins.length; i < len; i++) {
      join = joins[i];
      parentFilters = _.filter(filters, (function(_this) {
        return function(f) {
          return f.table === _this.schema.getColumn(join.table, join.column).join.toTable && f.jsonql;
        };
      })(this));
      if (parentFilters.length === 0) {
        continue;
      }
      joinColumn = this.schema.getColumn(join.table, join.column);
      implicitFilter = {
        table: join.table,
        jsonql: {
          type: "op",
          op: "or",
          exprs: [
            {
              type: "op",
              op: "exists",
              exprs: [
                {
                  type: "query",
                  selects: [],
                  from: {
                    type: "table",
                    table: joinColumn.join.toTable,
                    alias: "explicit"
                  },
                  where: {
                    type: "op",
                    op: "and",
                    exprs: [exprCompiler.compileJoin(joinColumn.join, "{alias}", "explicit")]
                  }
                }
              ]
            }, {
              type: "op",
              op: "is null",
              exprs: [
                exprCompiler.compileExpr({
                  expr: {
                    type: "field",
                    table: join.table,
                    column: join.column
                  },
                  tableAlias: "{alias}"
                })
              ]
            }
          ]
        }
      };
      for (j = 0, len1 = parentFilters.length; j < len1; j++) {
        parentFilter = parentFilters[j];
        implicitFilter.jsonql.exprs[0].exprs[0].where.exprs.push(injectTableAlias(parentFilter.jsonql, "explicit"));
      }
      implicitFilters.push(implicitFilter);
    }
    return filters.concat(implicitFilters);
    return filters;
  };

  return ImplicitFilterBuilder;

})();
