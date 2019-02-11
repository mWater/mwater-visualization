"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var AxisBuilder, ExprCompiler, ExprUtils, PivotChartQueryBuilder, PivotChartUtils, _, injectTableAlias;

_ = require('lodash');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('../../../axes/AxisBuilder');
injectTableAlias = require('mwater-expressions').injectTableAlias;
PivotChartUtils = require('./PivotChartUtils'); // Builds pivot table queries. 
// Result is flat list for each intersection with each row being data for a single cell
// columns of result are: 
//  value: value of the cell (aggregate)
//  r0: row segment value (if present)
//  r1: inner row segment value (if present)
//  ...
//  c0: column segment value (if present)
//  c1: inner column segment value (if present)
//  ...
// Also produces queries needed to order row/column segments when ordered
// These are indexed by the segment id and contain the values in order (already asc/desc corrected)
// each row containing only { value: }

module.exports = PivotChartQueryBuilder =
/*#__PURE__*/
function () {
  // Pass in schema
  function PivotChartQueryBuilder(options) {
    (0, _classCallCheck2.default)(this, PivotChartQueryBuilder);
    this.schema = options.schema;
    this.exprUtils = new ExprUtils(this.schema);
    this.axisBuilder = new AxisBuilder({
      schema: this.schema
    });
  } // Create the queries needed for the chart.
  // extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
  // Queries are indexed by intersection id, as one query is made for each intersection


  (0, _createClass2.default)(PivotChartQueryBuilder, [{
    key: "createQueries",
    value: function createQueries(design, extraFilters) {
      var backgroundColorCondition, columnPath, columnSegment, exprCompiler, filter, filters, i, intersection, intersectionFilters, intersectionId, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, o, p, q, queries, query, r, ref, ref1, ref2, ref3, relevantFilters, rowPath, rowSegment, segment, segments, where, whereClauses;
      exprCompiler = new ExprCompiler(this.schema);
      queries = {};
      ref = PivotChartUtils.getSegmentPaths(design.rows); // For each intersection

      for (j = 0, len = ref.length; j < len; j++) {
        rowPath = ref[j];
        ref1 = PivotChartUtils.getSegmentPaths(design.columns);

        for (k = 0, len1 = ref1.length; k < len1; k++) {
          columnPath = ref1[k]; // Get id of intersection

          intersectionId = PivotChartUtils.getIntersectionId(rowPath, columnPath); // Get intersection

          intersection = design.intersections[intersectionId]; // Create shell of query

          query = {
            type: "query",
            selects: [],
            from: exprCompiler.compileTable(design.table, "main"),
            limit: 10000,
            groupBy: []
          }; // Filters to add (not yet compiled)

          filters = []; // Add segments

          for (i = l = 0, len2 = rowPath.length; l < len2; i = ++l) {
            rowSegment = rowPath[i];
            query.selects.push({
              type: "select",
              expr: this.axisBuilder.compileAxis({
                axis: rowSegment.valueAxis,
                tableAlias: "main"
              }),
              alias: "r".concat(i)
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
              alias: "c".concat(i)
            });
            query.groupBy.push(i + 1 + rowPath.length);

            if (columnSegment.filter) {
              filters.push(columnSegment.filter);
            }
          } // Add value


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
          } // Add background color


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

          ref2 = intersection.backgroundColorConditions || []; // Add background color conditions

          for (i = n = 0, len4 = ref2.length; n < len4; i = ++n) {
            backgroundColorCondition = ref2[i];
            query.selects.push({
              type: "select",
              expr: exprCompiler.compileExpr({
                expr: backgroundColorCondition.condition,
                tableAlias: "main"
              }),
              alias: "bcc".concat(i)
            });
          } // If all selects are null, don't create query


          if (_.all(query.selects, function (select) {
            return select.expr == null;
          })) {
            continue;
          } // Add where


          whereClauses = [];

          if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({
              expr: design.filter,
              tableAlias: "main"
            }));
          } // Add other filters


          whereClauses = whereClauses.concat(_.map(filters, function (filter) {
            return exprCompiler.compileExpr({
              expr: filter,
              tableAlias: "main"
            });
          })); // Add filters

          if (extraFilters && extraFilters.length > 0) {
            // Get relevant filters
            relevantFilters = _.where(extraFilters, {
              table: design.table
            }); // Add filters

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
      } // For each segment


      segments = PivotChartUtils.getAllSegments(design.rows).concat(PivotChartUtils.getAllSegments(design.columns));

      for (p = 0, len6 = segments.length; p < len6; p++) {
        segment = segments[p];

        if (segment.orderExpr) {
          // Create where which includes the segments filter (if present) and the "or" of all intersections that are present
          whereClauses = [];

          if (segment.filter) {
            whereClauses.push(exprCompiler.compileExpr({
              expr: segment.filter,
              tableAlias: "main"
            }));
          } // Get all intersection filters


          intersectionFilters = [];
          ref3 = _.keys(design.intersections);

          for (q = 0, len7 = ref3.length; q < len7; q++) {
            intersectionId = ref3[q];

            if (intersectionId.includes(segment.id)) {
              filter = design.intersections[intersectionId].filter;

              if (filter) {
                intersectionFilters.push(filter); // If intersection has no filter, still needs to "or" with true
              } else {
                intersectionFilters.push({
                  type: "literal",
                  valueType: "boolean",
                  value: true
                });
              }
            }
          }

          if (intersectionFilters.length > 0) {
            whereClauses.push({
              type: "op",
              op: "or",
              exprs: _.map(intersectionFilters, function (filter) {
                return exprCompiler.compileExpr({
                  expr: filter,
                  tableAlias: "main"
                });
              })
            });
          }

          if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({
              expr: design.filter,
              tableAlias: "main"
            }));
          } // Add extra filters


          if (extraFilters && extraFilters.length > 0) {
            // Get relevant filters
            relevantFilters = _.where(extraFilters, {
              table: design.table
            }); // Add filters

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
          } // Create query to get ordering


          queries[segment.id] = {
            type: "query",
            selects: [{
              type: "select",
              expr: this.axisBuilder.compileAxis({
                axis: segment.valueAxis,
                tableAlias: "main"
              }),
              alias: "value"
            }],
            from: exprCompiler.compileTable(design.table, "main"),
            where: where,
            groupBy: [1],
            orderBy: [{
              expr: exprCompiler.compileExpr({
                expr: segment.orderExpr,
                tableAlias: "main"
              }),
              direction: segment.orderDir || "asc"
            }]
          };
        }
      }

      return queries;
    }
  }]);
  return PivotChartQueryBuilder;
}();