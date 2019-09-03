"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var ExprUtils, LabeledExprGenerator, _;

_ = require('lodash');
ExprUtils = require('mwater-expressions').ExprUtils; // Generates labeled expressions (expr, label and joins) for a table. Used to make a datagrid, do export or import.

module.exports = LabeledExprGenerator =
/*#__PURE__*/
function () {
  function LabeledExprGenerator(schema) {
    (0, _classCallCheck2["default"])(this, LabeledExprGenerator);
    this.schema = schema;
  } // Generate labeled exprs, an array of ({ expr: mwater expression, label: plain string, joins: array of join column ids to get to current table. Usually []. Only present for 1-n joins })
  // table is id of table to generate from
  // options are: [default]
  //  locale: e.g. "en". Uses _base by default, then en [null]
  //  headerFormat: "text", "code" or "both" ["code"]
  //  enumFormat: "name" or "code" ["name"]
  //  splitLatLng: split geometry into lat/lng [false]
  //  splitEnumset: split enumset into true/false expressions [false]
  //  useJoinIds: use ids of n-1 joins, not the code/name/etc [false]
  //  columnFilter: optional boolean predicate to filter columns included. Called with table id, column object
  //  multipleJoinCondition: optional boolean predicate to filter 1-n/n-n joins to include. Called with table id, join column object. Default is to not include those joins
  //  useConfidential: optional boolean to replace redacted columns with unredacted ones
  //  numberDuplicatesLabels: number duplicate label columns with " (1)", " (2)" , etc.


  (0, _createClass2["default"])(LabeledExprGenerator, [{
    key: "generate",
    value: function generate(table) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var column, _convertColumn, createLabel, group, i, item, j, k, key, labelGroups, labeledExprs, len, len1, ref;

      _.defaults(options, {
        locale: null,
        headerFormat: "code",
        enumFormat: "code",
        splitLatLng: false,
        splitEnumset: false,
        useJoinIds: false,
        columnFilter: null,
        multipleJoinCondition: null,
        useConfidential: false,
        numberDuplicatesLabels: false
      }); // Create a label for a column


      createLabel = function createLabel(column, suffix) {
        var label; // By header mode

        if (options.headerFormat === "code" && column.code) {
          label = column.code;

          if (suffix) {
            label += " (".concat(ExprUtils.localizeString(suffix, options.locale), ")");
          }
        } else if (options.headerFormat === "both" && column.code) {
          label = column.code;

          if (suffix) {
            label += " (".concat(ExprUtils.localizeString(suffix, options.locale), ")");
          }

          label += "\n" + ExprUtils.localizeString(column.name, options.locale);

          if (suffix) {
            label += " (".concat(ExprUtils.localizeString(suffix, options.locale) // text
            , ")");
          }
        } else {
          label = ExprUtils.localizeString(column.name, options.locale);

          if (suffix) {
            label += " (".concat(ExprUtils.localizeString(suffix, options.locale), ")");
          }
        }

        return label;
      }; // Convert a table + schema column into multiple labeled expres


      _convertColumn = function convertColumn(table, column, joins) {
        var childColumn, childExprs, j, joinColumn, len, ref, ref1, ref2; // Filter if present

        if (options.columnFilter && !options.columnFilter(table, column)) {
          return [];
        } // Skip deprecated


        if (column.deprecated) {
          return [];
        } // Skip redacted if confidential on


        if (column.redacted && options.useConfidential) {
          return [];
        } // Skip confidential data


        if (column.confidential && !options.useConfidential) {
          return [];
        }

        if (column.type === "join") {
          // If n-1, 1-1 join, create scalar
          if ((ref = column.join.type) === "n-1" || ref === "1-1") {
            // Use id if that option is enabled
            if (options.useJoinIds) {
              return [{
                expr: {
                  type: "scalar",
                  table: table,
                  joins: [column.id],
                  expr: {
                    type: "id",
                    table: column.join.toTable
                  }
                },
                label: createLabel(column),
                joins: joins // use code, full name, or name of dest table

              }];
            } else {
              joinColumn = _this.schema.getColumn(column.join.toTable, "code");
              joinColumn = joinColumn || _this.schema.getColumn(column.join.toTable, "full_name");
              joinColumn = joinColumn || _this.schema.getColumn(column.join.toTable, "name");
              joinColumn = joinColumn || _this.schema.getColumn(column.join.toTable, "username");

              if (joinColumn) {
                return [{
                  expr: {
                    type: "scalar",
                    table: table,
                    joins: [column.id],
                    expr: {
                      type: "field",
                      table: column.join.toTable,
                      column: joinColumn.id
                    }
                  },
                  label: createLabel(column),
                  joins: joins
                }];
              } else {
                return [];
              }
            }
          } // If 1-n/n-1, convert each child


          if (((ref1 = column.join.type) === "1-n" || ref1 === "n-n") && options.multipleJoinCondition && options.multipleJoinCondition(table, column)) {
            childExprs = [];
            ref2 = _this.schema.getColumns(column.join.toTable);

            for (j = 0, len = ref2.length; j < len; j++) {
              childColumn = ref2[j];
              childExprs = childExprs.concat(_convertColumn(column.join.toTable, childColumn, joins.concat([column.id])));
            }

            return childExprs;
          }
        } else if (column.type === "geometry" && options.splitLatLng) {
          return [{
            // Use lat/lng
            expr: {
              table: table,
              type: "op",
              op: "latitude",
              exprs: [{
                type: "field",
                table: table,
                column: column.id
              }]
            },
            label: createLabel(column, "latitude"),
            joins: joins
          }, {
            expr: {
              table: table,
              type: "op",
              op: "longitude",
              exprs: [{
                type: "field",
                table: table,
                column: column.id
              }]
            },
            label: createLabel(column, "longitude"),
            joins: joins
          }];
        } else if (column.type === "enumset" && options.splitEnumset) {
          // Split into one for each enumset value
          return _.map(column.enumValues, function (ev) {
            return {
              expr: {
                table: table,
                type: "op",
                op: "contains",
                exprs: [{
                  type: "field",
                  table: table,
                  column: column.id
                }, {
                  type: "literal",
                  valueType: "enumset",
                  value: [ev.id]
                }]
              },
              label: createLabel(column, options.enumFormat === "text" ? ev.name : ev.code || ev.name),
              joins: joins
            };
          }); // If expression
        } else if (column.expr) {
          return [{
            expr: column.expr,
            label: createLabel(column),
            joins: joins // Simple columns

          }];
        } else {
          return [{
            expr: {
              type: "field",
              table: table,
              column: column.id
            },
            label: createLabel(column),
            joins: joins
          }];
        }
      }; // For each column in form


      labeledExprs = [];
      ref = this.schema.getColumns(table);

      for (j = 0, len = ref.length; j < len; j++) {
        column = ref[j]; // Convert column into labels and exprs

        labeledExprs = labeledExprs.concat(_convertColumn(table, column, []));
      } // If numberDuplicatesLabels, label distinctly


      if (options.numberDuplicatesLabels) {
        labelGroups = _.groupBy(labeledExprs, "label");

        for (key in labelGroups) {
          group = labelGroups[key];

          if (group.length > 1) {
            for (i = k = 0, len1 = group.length; k < len1; i = ++k) {
              item = group[i];
              item.label = item.label + " (".concat(i + 1, ")");
            }
          }
        }
      }

      return _.compact(labeledExprs);
    }
  }]);
  return LabeledExprGenerator;
}();