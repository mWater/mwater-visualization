"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var DatagridQueryBuilder, ExprCleaner, ExprCompiler, ExprUtils, _, injectTableAlias;

_ = require('lodash');
ExprCompiler = require("mwater-expressions").ExprCompiler;
ExprCleaner = require("mwater-expressions").ExprCleaner;
ExprUtils = require("mwater-expressions").ExprUtils;
injectTableAlias = require('mwater-expressions').injectTableAlias; // Builds a datagrid query. 
// columns are named c0, c1, c2...
// primary key is included as id
// subtable index is included as subtable. -1 for main table so it sorts first
// Warning: mwater-server requires this directly!

module.exports = DatagridQueryBuilder = /*#__PURE__*/function () {
  function DatagridQueryBuilder(schema) {
    (0, _classCallCheck2["default"])(this, DatagridQueryBuilder);
    this.schema = schema;
  } // Create the query for the design
  // options:
  //  offset: start at row offset
  //  limit: limit rows
  //  extraFilters: array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
  //  fillSubtableRows: repeat main level values in subtable rows instead of leaving blank


  (0, _createClass2["default"])(DatagridQueryBuilder, [{
    key: "createQuery",
    value: function createQuery(design) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // Create query to get the page of rows at the specific offset
      // Handle simple case
      if (!design.subtables || design.subtables.length === 0) {
        return this.createSimpleQuery(design, options);
      } else {
        return this.createComplexQuery(design, options);
      }
    } // Simple query with no subtables

  }, {
    key: "createSimpleQuery",
    value: function createSimpleQuery(design, options) {
      var column, columnExpr, direction, expr, exprCleaner, exprCompiler, exprUtils, extraFilter, filter, i, isAggr, j, k, l, len, len1, len2, len3, len4, m, n, orderBy, query, ref, ref1, ref2, ref3, ref4, wheres;
      exprUtils = new ExprUtils(this.schema);
      exprCompiler = new ExprCompiler(this.schema);
      exprCleaner = new ExprCleaner(this.schema);
      isAggr = this.isMainAggr(design);
      query = {
        type: "query",
        selects: this.createSimpleSelects(design, isAggr),
        from: {
          type: "table",
          table: design.table,
          alias: "main"
        },
        orderBy: [],
        offset: options.offset,
        limit: options.limit
      }; // Filter by filter

      wheres = [];

      if (design.filter) {
        wheres.push(exprCompiler.compileExpr({
          expr: design.filter,
          tableAlias: "main"
        }));
      }

      ref = design.globalFilters || []; // Add global filters

      for (j = 0, len = ref.length; j < len; j++) {
        filter = ref[j]; // Check if exists and is correct type

        column = this.schema.getColumn(design.table, filter.columnId);

        if (!column) {
          continue;
        }

        columnExpr = {
          type: "field",
          table: design.table,
          column: column.id
        };

        if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
          continue;
        } // Create expr


        expr = {
          type: "op",
          op: filter.op,
          table: design.table,
          exprs: [columnExpr].concat(filter.exprs)
        }; // Clean expr

        expr = exprCleaner.cleanExpr(expr, {
          table: design.table
        });
        wheres.push(exprCompiler.compileExpr({
          expr: expr,
          tableAlias: "main"
        }));
      }

      ref1 = options.extraFilters || []; // Add extra filters

      for (k = 0, len1 = ref1.length; k < len1; k++) {
        extraFilter = ref1[k];

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

      ref2 = this.getMainOrderByDirections(design, isAggr); // Add order of main

      for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
        direction = ref2[i]; // Leave room for primary key (if not aggr) and columns

        query.orderBy.push({
          ordinal: i + (isAggr ? 1 : 2) + design.columns.length,
          direction: direction
        });
      } // Add group bys if any expressions are individual and overall is aggregate


      if (isAggr) {
        query.groupBy = [];
        ref3 = design.columns;

        for (i = m = 0, len3 = ref3.length; m < len3; i = ++m) {
          column = ref3[i];

          if (exprUtils.getExprAggrStatus(column.expr) === "individual") {
            query.groupBy.push(i + 1);
          }
        }

        ref4 = design.orderBys || [];

        for (i = n = 0, len4 = ref4.length; n < len4; i = ++n) {
          orderBy = ref4[i];

          if (exprUtils.getExprAggrStatus(orderBy.expr) === "individual") {
            query.groupBy.push(i + 1 + design.columns.length);
          }
        }
      }

      return query;
    } // Query with subtables

  }, {
    key: "createComplexQuery",
    value: function createComplexQuery(design, options) {
      var column, direction, i, index, j, k, l, len, len1, len2, len3, len4, m, n, query, ref, ref1, ref2, ref3, ref4, stindex, subtable, unionQueries, unionQuery; // Queries to union

      unionQueries = []; // Create main query

      unionQueries.push(this.createComplexMainQuery(design, options));
      ref = design.subtables;

      for (index = j = 0, len = ref.length; j < len; index = ++j) {
        subtable = ref[index];
        unionQueries.push(this.createComplexSubtableQuery(design, options, subtable, index));
      } // Union together


      unionQuery = {
        type: "union all",
        queries: unionQueries
      }; // Create wrapper query that orders

      query = {
        type: "query",
        selects: [{
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
        }],
        from: {
          type: "subquery",
          query: unionQuery,
          alias: "unioned"
        },
        orderBy: [],
        offset: options.offset,
        limit: options.limit
      };
      ref1 = design.columns; // Add column references

      for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
        column = ref1[index];
        query.selects.push({
          type: "select",
          expr: {
            type: "field",
            tableAlias: "unioned",
            column: "c".concat(index)
          },
          alias: "c".concat(index)
        });
      }

      ref2 = this.getMainOrderByDirections(design); // Add order of main

      for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
        direction = ref2[i];
        query.orderBy.push({
          expr: {
            type: "field",
            tableAlias: "unioned",
            column: "s".concat(i)
          },
          direction: direction
        });
      } // Add subtable order


      query.orderBy.push({
        expr: {
          type: "field",
          tableAlias: "unioned",
          column: "subtable"
        },
        direction: "asc"
      });
      ref3 = design.subtables; // Add orders of subtables

      for (stindex = m = 0, len3 = ref3.length; m < len3; stindex = ++m) {
        subtable = ref3[stindex];
        ref4 = this.getSubtableOrderByDirections(design, subtable);

        for (i = n = 0, len4 = ref4.length; n < len4; i = ++n) {
          direction = ref4[i];
          query.orderBy.push({
            expr: {
              type: "field",
              tableAlias: "unioned",
              column: "st".concat(stindex, "s").concat(i)
            },
            direction: direction
          });
        }
      }

      return query;
    } // Create the main query (not joined to subtables) part of the overall complex query. See tests for more details

  }, {
    key: "createComplexMainQuery",
    value: function createComplexMainQuery(design, options) {
      var _this = this;

      var column, columnExpr, expr, exprCleaner, exprCompiler, extraFilter, filter, i, j, k, l, len, len1, len2, len3, len4, m, n, query, ref, ref1, ref2, ref3, ref4, selects, stindex, subtable, type, wheres;
      exprCompiler = new ExprCompiler(this.schema);
      exprCleaner = new ExprCleaner(this.schema); // Create selects

      selects = [{
        // Primary key
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
      }];
      ref = this.getMainOrderByExprs(design); // Add order bys of main

      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        expr = ref[i];
        selects.push({
          type: "select",
          expr: expr,
          alias: "s".concat(i)
        });
      }

      ref1 = design.subtables; // Add order bys of subtables

      for (stindex = k = 0, len1 = ref1.length; k < len1; stindex = ++k) {
        subtable = ref1[stindex];
        ref2 = this.getSubtableOrderByExprTypes(design, subtable);

        for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
          type = ref2[i];
          selects.push({
            type: "select",
            expr: this.createNullExpr(type),
            alias: "st".concat(stindex, "s").concat(i)
          });
        }
      } // Add columns


      selects = selects.concat(_.map(design.columns, function (column, columnIndex) {
        return _this.createColumnSelect(column, columnIndex);
      }));
      query = {
        type: "query",
        selects: selects,
        from: {
          type: "table",
          table: design.table,
          alias: "main"
        }
      }; // Filter by filter

      wheres = [];

      if (design.filter) {
        wheres.push(exprCompiler.compileExpr({
          expr: design.filter,
          tableAlias: "main"
        }));
      }

      ref3 = design.globalFilters || []; // Add global filters

      for (m = 0, len3 = ref3.length; m < len3; m++) {
        filter = ref3[m]; // Check if exists and is correct type

        column = this.schema.getColumn(design.table, filter.columnId);

        if (!column) {
          continue;
        }

        columnExpr = {
          type: "field",
          table: design.table,
          column: column.id
        };

        if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
          continue;
        } // Create expr


        expr = {
          type: "op",
          op: filter.op,
          table: design.table,
          exprs: [columnExpr].concat(filter.exprs)
        }; // Clean expr

        expr = exprCleaner.cleanExpr(expr, {
          table: design.table
        });
        wheres.push(exprCompiler.compileExpr({
          expr: expr,
          tableAlias: "main"
        }));
      }

      ref4 = options.extraFilters || []; // Add extra filters

      for (n = 0, len4 = ref4.length; n < len4; n++) {
        extraFilter = ref4[n];

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
    } // Create one subtable query part of the overall complex query. See tests for more details

  }, {
    key: "createComplexSubtableQuery",
    value: function createComplexSubtableQuery(design, options, subtable, subtableIndex) {
      var _this2 = this;

      var expr, exprCompiler, exprUtils, extraFilter, i, j, k, l, len, len1, len2, len3, m, query, ref, ref1, ref2, ref3, selects, st, stindex, subtableTable, types, wheres;
      exprUtils = new ExprUtils(this.schema);
      exprCompiler = new ExprCompiler(this.schema); // Create selects

      selects = [{
        // Primary key
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
      }];
      ref = this.getMainOrderByExprs(design); // Add order bys of main

      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        expr = ref[i];
        selects.push({
          type: "select",
          expr: expr,
          alias: "s".concat(i)
        });
      }

      ref1 = design.subtables; // Add order bys of subtables

      for (stindex = k = 0, len1 = ref1.length; k < len1; stindex = ++k) {
        st = ref1[stindex];
        ref2 = this.getSubtableOrderByExprs(design, st);

        for (i = l = 0, len2 = ref2.length; l < len2; i = ++l) {
          expr = ref2[i];

          if (stindex === subtableIndex) {
            selects.push({
              type: "select",
              expr: expr,
              alias: "st".concat(stindex, "s").concat(i)
            });
          } else {
            // Null placeholder
            types = this.getSubtableOrderByExprTypes(design, st);
            selects.push({
              type: "select",
              expr: this.createNullExpr(types[i]),
              alias: "st".concat(stindex, "s").concat(i)
            });
          }
        }
      } // Add columns


      selects = selects.concat(_.map(design.columns, function (column, columnIndex) {
        return _this2.createColumnSelect(column, columnIndex, subtable, options.fillSubtableRows);
      })); // Get subtable actual table

      subtableTable = exprUtils.followJoins(design.table, subtable.joins); // Can't handle multiple joins yet

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
          on: exprCompiler.compileJoin(design.table, this.schema.getColumn(design.table, subtable.joins[0]), "main", "st")
        }
      }; // Filter by filter

      wheres = [];

      if (design.filter) {
        wheres.push(exprCompiler.compileExpr({
          expr: design.filter,
          tableAlias: "main"
        }));
      }

      ref3 = options.extraFilters || []; // Add extra filters

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
    } // Get expressions to order main query by
    // isAggr is true if any column or ordering is aggregate. 
    // If so, only use explicit ordering

  }, {
    key: "getMainOrderByExprs",
    value: function getMainOrderByExprs(design) {
      var isAggr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var exprCompiler, exprs, j, len, orderBy, ordering, ref;
      exprCompiler = new ExprCompiler(this.schema);
      exprs = [];
      ref = design.orderBys || []; // First explicit order bys

      for (j = 0, len = ref.length; j < len; j++) {
        orderBy = ref[j];
        exprs.push(exprCompiler.compileExpr({
          expr: orderBy.expr,
          tableAlias: "main"
        }));
      }

      if (!isAggr) {
        // Natural order if present
        ordering = this.schema.getTable(design.table).ordering;

        if (ordering) {
          exprs.push(exprCompiler.compileExpr({
            expr: {
              type: "field",
              table: design.table,
              column: ordering
            },
            tableAlias: "main"
          }));
        } // Always primary key


        exprs.push({
          type: "field",
          tableAlias: "main",
          column: this.schema.getTable(design.table).primaryKey
        });
      }

      return exprs;
    } // Get directions to order main query by (asc/desc)
    // isAggr is true if any column or ordering is aggregate. 
    // If so, only use explicit ordering

  }, {
    key: "getMainOrderByDirections",
    value: function getMainOrderByDirections(design) {
      var isAggr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var directions, j, len, orderBy, ordering, ref;
      directions = [];
      ref = design.orderBys || []; // First explicit order bys

      for (j = 0, len = ref.length; j < len; j++) {
        orderBy = ref[j];
        directions.push(orderBy.direction);
      }

      if (!isAggr) {
        // Natural order if present
        ordering = this.schema.getTable(design.table).ordering;

        if (ordering) {
          directions.push("asc");
        } // Always primary key


        directions.push("asc");
      }

      return directions;
    } // Get expressions to order subtable query by

  }, {
    key: "getSubtableOrderByExprs",
    value: function getSubtableOrderByExprs(design, subtable) {
      var exprCompiler, exprUtils, exprs, j, len, orderBy, ordering, ref, subtableTable;
      exprUtils = new ExprUtils(this.schema);
      exprCompiler = new ExprCompiler(this.schema); // Get subtable actual table

      subtableTable = exprUtils.followJoins(design.table, subtable.joins);
      exprs = [];
      ref = subtable.orderBys || []; // First explicit order bys

      for (j = 0, len = ref.length; j < len; j++) {
        orderBy = ref[j];
        exprs.push(exprCompiler.compileExpr({
          expr: orderBy.expr,
          tableAlias: "st"
        }));
      } // Natural order if present


      ordering = this.schema.getTable(subtableTable).ordering;

      if (ordering) {
        exprs.push(exprCompiler.compileExpr({
          expr: {
            type: "field",
            table: subtableTable,
            column: ordering
          },
          tableAlias: "st"
        }));
      } // Always primary key


      exprs.push({
        type: "field",
        tableAlias: "st",
        column: this.schema.getTable(subtableTable).primaryKey
      });
      return exprs;
    } // Get directions to order subtable query by (asc/desc)

  }, {
    key: "getSubtableOrderByDirections",
    value: function getSubtableOrderByDirections(design, subtable) {
      var directions, exprUtils, j, len, orderBy, ordering, ref, subtableTable;
      exprUtils = new ExprUtils(this.schema); // Get subtable actual table

      subtableTable = exprUtils.followJoins(design.table, subtable.joins);
      directions = [];
      ref = subtable.orderBys || []; // First explicit order bys

      for (j = 0, len = ref.length; j < len; j++) {
        orderBy = ref[j];
        directions.push(orderBy.direction);
      } // Natural order if present


      ordering = this.schema.getTable(subtableTable).ordering;

      if (ordering) {
        directions.push("asc");
      } // Always primary key


      directions.push("asc");
      return directions;
    } // Get types of expressions to order subtable query by.

  }, {
    key: "getSubtableOrderByExprTypes",
    value: function getSubtableOrderByExprTypes(design, subtable) {
      var exprUtils, j, len, orderBy, ordering, ref, subtableTable, types;
      exprUtils = new ExprUtils(this.schema); // Get subtable actual table

      subtableTable = exprUtils.followJoins(design.table, subtable.joins);
      types = [];
      ref = subtable.orderBys || []; // First explicit order bys

      for (j = 0, len = ref.length; j < len; j++) {
        orderBy = ref[j];
        types.push(exprUtils.getExprType(orderBy.expr));
      } // Natural order if present


      ordering = this.schema.getTable(subtableTable).ordering;

      if (ordering) {
        types.push(exprUtils.getExprType({
          type: "field",
          table: subtableTable,
          column: ordering
        }));
      } // Always primary key. Assume text


      types.push("text");
      return types;
    } // Create the select for a column in JsonQL format

  }, {
    key: "createColumnSelect",
    value: function createColumnSelect(column, columnIndex, subtable, fillSubtableRows) {
      var compiledExpr, exprCleaner, exprCompiler, exprType, exprUtils;
      exprUtils = new ExprUtils(this.schema);
      exprCleaner = new ExprCleaner(this.schema); // Get expression type

      exprType = exprUtils.getExprType(column.expr); // Null if wrong subtable

      if (column.subtable && !subtable) {
        return {
          type: "select",
          expr: this.createNullExpr(exprType),
          alias: "c".concat(columnIndex)
        };
      } // Null if from wrong subtable 


      if (column.subtable && subtable) {
        if (subtable.id !== column.subtable) {
          return {
            type: "select",
            expr: this.createNullExpr(exprType),
            alias: "c".concat(columnIndex)
          };
        }
      } // Null if main column and in subtable and not fillSubtableRows


      if (!column.subtable && subtable && !fillSubtableRows) {
        return {
          type: "select",
          expr: this.createNullExpr(exprType),
          alias: "c".concat(columnIndex)
        };
      } // Compile expression


      exprCompiler = new ExprCompiler(this.schema);
      compiledExpr = exprCompiler.compileExpr({
        expr: exprCleaner.cleanExpr(column.expr, {
          aggrStatuses: ["individual", "literal", "aggregate"]
        }),
        tableAlias: column.subtable ? "st" : "main"
      }); // Handle special case of geometry, converting to GeoJSON

      if (exprType === "geometry") {
        // Convert to 4326 (lat/long). Force ::geometry for null
        compiledExpr = {
          type: "op",
          op: "ST_AsGeoJSON",
          exprs: [{
            type: "op",
            op: "ST_Transform",
            exprs: [{
              type: "op",
              op: "::geometry",
              exprs: [compiledExpr]
            }, 4326]
          }]
        };
      }

      return {
        type: "select",
        expr: compiledExpr,
        alias: "c".concat(columnIndex)
      };
    } // Create selects to load given a design

  }, {
    key: "createSimpleSelects",
    value: function createSimpleSelects(design, isAggr) {
      var _this3 = this;

      var expr, i, j, len, ref, selects;
      selects = []; // Primary key if not aggr

      if (!isAggr) {
        selects.push({
          type: "select",
          expr: {
            type: "field",
            tableAlias: "main",
            column: this.schema.getTable(design.table).primaryKey
          },
          alias: "id"
        });
      }

      selects = selects.concat(_.map(design.columns, function (column, columnIndex) {
        return _this3.createColumnSelect(column, columnIndex);
      }));
      ref = this.getMainOrderByExprs(design, isAggr); // Add sorting

      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        expr = ref[i];
        selects.push({
          type: "select",
          expr: expr,
          alias: "s".concat(i)
        });
      }

      return selects;
    } // Create a null expression, but cast to correct type. See https://github.com/mWater/mwater-visualization/issues/183

  }, {
    key: "createNullExpr",
    value: function createNullExpr(exprType) {
      switch (exprType) {
        // Geometry is as textual geojson
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
          return null;
      }
    } // Determine if main is aggregate

  }, {
    key: "isMainAggr",
    value: function isMainAggr(design) {
      var column, exprUtils, j, k, len, len1, orderBy, ref, ref1;
      exprUtils = new ExprUtils(this.schema);
      ref = design.columns;

      for (j = 0, len = ref.length; j < len; j++) {
        column = ref[j];

        if (exprUtils.getExprAggrStatus(column.expr) === "aggregate") {
          return true;
        }
      }

      ref1 = design.orderBys || [];

      for (k = 0, len1 = ref1.length; k < len1; k++) {
        orderBy = ref1[k];

        if (exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate") {
          return true;
        }
      }

      return false;
    }
  }]);
  return DatagridQueryBuilder;
}();