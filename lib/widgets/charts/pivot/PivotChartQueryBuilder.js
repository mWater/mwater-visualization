var AxisBuilder, ExprCompiler, ExprUtils, PivotChartQueryBuilder, PivotChartUtils, _, injectTableAlias;

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../../../axes/AxisBuilder');

injectTableAlias = require('mwater-expressions').injectTableAlias;

PivotChartUtils = require('./PivotChartUtils');

module.exports = PivotChartQueryBuilder = (function() {
  function PivotChartQueryBuilder(options) {
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  }

  PivotChartQueryBuilder.prototype.createQueries = function(design, extraFilters) {
    var columnPath, columnSegment, exprCompiler, filter, i, intersection, intersectionId, j, k, l, len, len1, len2, len3, len4, m, n, queries, query, ref, ref1, relevantFilters, rowPath, rowSegment, whereClauses;
    exprCompiler = new ExprCompiler(this.schema);
    queries = {};
    ref = PivotChartUtils.getSegmentPaths(design.rows);
    for (j = 0, len = ref.length; j < len; j++) {
      rowPath = ref[j];
      ref1 = PivotChartUtils.getSegmentPaths(design.columns);
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        columnPath = ref1[k];
        intersectionId = _.pluck(rowPath, "id").join(",") + ":" + _.pluck(columnPath, "id").join(",");
        intersection = design.intersections[intersectionId];
        query = {
          type: "query",
          selects: [],
          from: exprCompiler.compileTable(design.table, "main"),
          limit: 1000,
          groupBy: []
        };
        query.selects.push({
          type: "select",
          expr: this.axisBuilder.compileAxis({
            axis: intersection != null ? intersection.valueAxis : void 0,
            tableAlias: "main"
          }),
          alias: "value"
        });
        for (i = l = 0, len2 = rowPath.length; l < len2; i = ++l) {
          rowSegment = rowPath[i];
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({
              axis: rowSegment.valueAxis,
              tableAlias: "main"
            }),
            alias: "r" + i
          });
          query.groupBy.push(i + 2);
        }
        for (i = m = 0, len3 = columnPath.length; m < len3; i = ++m) {
          columnSegment = columnPath[i];
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({
              axis: columnSegment.valueAxis,
              tableAlias: "main"
            }),
            alias: "c" + i
          });
          query.groupBy.push(i + 2 + rowPath.length);
        }
        whereClauses = [];
        if (design.filter) {
          whereClauses.push(exprCompiler.compileExpr({
            expr: design.filter,
            tableAlias: "main"
          }));
        }
        if (extraFilters && extraFilters.length > 0) {
          relevantFilters = _.where(extraFilters, {
            table: design.table
          });
          for (n = 0, len4 = relevantFilters.length; n < len4; n++) {
            filter = relevantFilters[n];
            whereClauses.push(injectTableAlias(filter.jsonql, "main"));
          }
        }
        if (whereClauses.length === 1) {
          query.where = whereClauses[0];
        } else if (whereClauses.length > 1) {
          query.where = {
            type: "op",
            op: "and",
            exprs: whereClauses
          };
        }
        queries[intersectionId] = query;
      }
    }
    return queries;
  };

  return PivotChartQueryBuilder;

})();
