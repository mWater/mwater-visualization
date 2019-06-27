"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var ExprCompiler, ImplicitFilterBuilder, _, injectTableAlias;

_ = require('lodash');
injectTableAlias = require('mwater-expressions').injectTableAlias;
ExprCompiler = require('mwater-expressions').ExprCompiler; // Given a series of explicit filters on tables (array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by })
// extends the filters to all filterable tables with a single 1-n relationship.
// For example, a given community has N water points. If communities are filtered, we want to filter water points as well since there is a 
// clear parent-child relationship (specifically, a single n-1 join between water points and communities)

module.exports = ImplicitFilterBuilder =
/*#__PURE__*/
function () {
  function ImplicitFilterBuilder(schema) {
    (0, _classCallCheck2["default"])(this, ImplicitFilterBuilder);
    this.schema = schema;
  } // Find joins between parent and child tables that can be used to extend explicit filters. 
  // To be a useable join, must be only n-1 join between child and parent and child must be filterable table 
  // filterableTables: array of table ids of filterable tables
  // Returns list of { table, column } of joins from child to parent


  (0, _createClass2["default"])(ImplicitFilterBuilder, [{
    key: "findJoins",
    value: function findJoins(filterableTables) {
      var allJoins, filterableTable, i, joins, len, table;
      allJoins = []; // For each filterable table

      for (i = 0, len = filterableTables.length; i < len; i++) {
        filterableTable = filterableTables[i];
        table = this.schema.getTable(filterableTable);

        if (!table) {
          continue;
        } // Find n-1 joins to another filterable table that are not self-references


        joins = _.filter(this.schema.getColumns(filterableTable), function (column) {
          return column.type === "join" && column.join.type === "n-1" && column.join.toTable !== filterableTable;
        }); // Only keep if singular

        joins = _.flatten(_.filter(_.values(_.groupBy(joins, function (join) {
          return join.join.toTable;
        })), function (list) {
          return list.length === 1;
        }));
        allJoins = allJoins.concat(_.map(joins, function (join) {
          return {
            table: filterableTable,
            column: join.id
          };
        }));
      }

      return allJoins;
    } // Extends filters to include implicit filters
    // filterableTables: array of table ids of filterable tables
    // filters: array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by } of explicit filters
    // returns similar array, but including any extra implicit filters

  }, {
    key: "extendFilters",
    value: function extendFilters(filterableTables, filters) {
      var _this = this;

      var exprCompiler, i, implicitFilter, implicitFilters, j, join, joinColumn, joins, len, len1, parentFilter, parentFilters;
      implicitFilters = []; // Find joins

      joins = this.findJoins(filterableTables);
      exprCompiler = new ExprCompiler(this.schema); // For each join, find filters on parent table

      for (i = 0, len = joins.length; i < len; i++) {
        join = joins[i];
        parentFilters = _.filter(filters, function (f) {
          return f.table === _this.schema.getColumn(join.table, join.column).join.toTable && f.jsonql;
        });

        if (parentFilters.length === 0) {
          continue;
        }

        joinColumn = this.schema.getColumn(join.table, join.column); // Create where exists with join to parent table (filtered) OR no parent exists

        implicitFilter = {
          table: join.table,
          jsonql: {
            type: "op",
            op: "or",
            exprs: [{
              type: "op",
              op: "exists",
              exprs: [{
                type: "query",
                // select null
                selects: [],
                from: {
                  type: "table",
                  table: joinColumn.join.toTable,
                  alias: "explicit"
                },
                where: {
                  type: "op",
                  op: "and",
                  // Join two tables
                  exprs: [exprCompiler.compileJoin(joinColumn.join, "{alias}", "explicit")]
                }
              }]
            }, {
              type: "op",
              op: "is null",
              exprs: [exprCompiler.compileExpr({
                expr: {
                  type: "field",
                  table: join.table,
                  column: join.column
                },
                tableAlias: "{alias}"
              })]
            }]
          }
        }; // Add filters

        for (j = 0, len1 = parentFilters.length; j < len1; j++) {
          parentFilter = parentFilters[j];
          implicitFilter.jsonql.exprs[0].exprs[0].where.exprs.push(injectTableAlias(parentFilter.jsonql, "explicit"));
        }

        implicitFilters.push(implicitFilter);
      }

      return filters.concat(implicitFilters);
      return filters;
    }
  }]);
  return ImplicitFilterBuilder;
}();