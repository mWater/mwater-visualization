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
    var backgroundColorCondition, columnPath, columnSegment, exprCompiler, filter, filters, i, intersection, intersectionFilters, intersectionId, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, o, p, q, queries, query, r, ref, ref1, ref2, ref3, relevantFilters, rowPath, rowSegment, segment, segments, where, whereClauses;
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
          limit: 10000,
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
    segments = PivotChartUtils.getAllSegments(design.rows).concat(PivotChartUtils.getAllSegments(design.columns));
    for (p = 0, len6 = segments.length; p < len6; p++) {
      segment = segments[p];
      if (segment.orderExpr) {
        whereClauses = [];
        if (segment.filter) {
          whereClauses.push(exprCompiler.compileExpr({
            expr: segment.filter,
            tableAlias: "main"
          }));
        }
        intersectionFilters = [];
        ref3 = _.keys(design.intersections);
        for (q = 0, len7 = ref3.length; q < len7; q++) {
          intersectionId = ref3[q];
          if (intersectionId.includes(segment.id)) {
            filter = design.intersections[intersectionId].filter;
            if (filter) {
              intersectionFilters.push(filter);
            }
          }
        }
        if (intersectionFilters.length > 0) {
          whereClauses.push({
            type: "op",
            op: "or",
            exprs: _.map(intersectionFilters, (function(_this) {
              return function(filter) {
                return exprCompiler.compileExpr({
                  expr: filter,
                  tableAlias: "main"
                });
              };
            })(this))
          });
        }
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
          for (r = 0, len8 = relevantFilters.length; r < len8; r++) {
            filter = relevantFilters[r];
            whereClauses.push(injectTableAlias(filter.jsonql, "main"));
          }
        }
        whereClauses = _.compact(whereClauses);
        where = null;
        if (whereClauses.length === 1) {
          where = whereClauses[0];
        } else if (whereClauses.length > 1) {
          where = {
            type: "op",
            op: "and",
            exprs: whereClauses
          };
        }
        queries[segment.id] = {
          type: "query",
          selects: [
            {
              type: "select",
              expr: this.axisBuilder.compileAxis({
                axis: segment.valueAxis,
                tableAlias: "main"
              }),
              alias: "value"
            }
          ],
          from: exprCompiler.compileTable(design.table, "main"),
          where: where,
          groupBy: [1],
          orderBy: [
            {
              expr: exprCompiler.compileExpr({
                expr: segment.orderExpr,
                tableAlias: "main"
              }),
              direction: segment.orderDir || "asc"
            }
          ]
        };
      }
    }
    return queries;
  };

  return PivotChartQueryBuilder;

})();
