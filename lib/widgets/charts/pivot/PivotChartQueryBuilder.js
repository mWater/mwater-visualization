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
    var backgroundColorCondition, columnPath, columnSegment, exprCompiler, filter, filters, i, intersection, intersectionId, j, k, l, len, len1, len2, len3, len4, len5, m, n, o, queries, query, ref, ref1, ref2, relevantFilters, rowPath, rowSegment, whereClauses;
    exprCompiler = new ExprCompiler(this.schema);
    queries = {};
    ref = PivotChartUtils.getSegmentPaths(design.rows);
    for (j = 0, len = ref.length; j < len; j++) {
      rowPath = ref[j];
      ref1 = PivotChartUtils.getSegmentPaths(design.columns);
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        columnPath = ref1[k];
        intersectionId = PivotChartUtils.getIntersectionId(rowPath, columnPath);
        intersection = design.intersections[intersectionId];
        query = {
          type: "query",
          selects: [],
          from: exprCompiler.compileTable(design.table, "main"),
          limit: 1000,
          groupBy: []
        };
        filters = [];
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
          query.groupBy.push(i + 1);
          if (rowSegment.filter) {
            filters.push(rowSegment.filter);
          }
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
          query.groupBy.push(i + 1 + rowPath.length);
          if (columnSegment.filter) {
            filters.push(columnSegment.filter);
          }
        }
        query.selects.push({
          type: "select",
          expr: this.axisBuilder.compileAxis({
            axis: intersection != null ? intersection.valueAxis : void 0,
            tableAlias: "main"
          }),
          alias: "value"
        });
        if (intersection != null ? intersection.filter : void 0) {
          filters.push(intersection.filter);
        }
        if (intersection != null ? intersection.backgroundColorAxis : void 0) {
          query.selects.push({
            type: "select",
            expr: this.axisBuilder.compileAxis({
              axis: intersection != null ? intersection.backgroundColorAxis : void 0,
              tableAlias: "main"
            }),
            alias: "bc"
          });
        }
        ref2 = intersection.backgroundColorConditions || [];
        for (i = n = 0, len4 = ref2.length; n < len4; i = ++n) {
          backgroundColorCondition = ref2[i];
          query.selects.push({
            type: "select",
            expr: exprCompiler.compileExpr({
              expr: backgroundColorCondition.condition,
              tableAlias: "main"
            }),
            alias: "bcc" + i
          });
        }
        if (_.all(query.selects, function(select) {
          return select.expr == null;
        })) {
          continue;
        }
        whereClauses = [];
        if (design.filter) {
          whereClauses.push(exprCompiler.compileExpr({
            expr: design.filter,
            tableAlias: "main"
          }));
        }
        whereClauses = whereClauses.concat(_.map(filters, function(filter) {
          return exprCompiler.compileExpr({
            expr: filter,
            tableAlias: "main"
          });
        }));
        if (extraFilters && extraFilters.length > 0) {
          relevantFilters = _.where(extraFilters, {
            table: design.table
          });
          for (o = 0, len5 = relevantFilters.length; o < len5; o++) {
            filter = relevantFilters[o];
            whereClauses.push(injectTableAlias(filter.jsonql, "main"));
          }
        }
        whereClauses = _.compact(whereClauses);
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
