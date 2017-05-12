var ExprUtils, LabeledExprGenerator, _;

_ = require('lodash');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = LabeledExprGenerator = (function() {
  function LabeledExprGenerator(schema) {
    this.schema = schema;
  }

  LabeledExprGenerator.prototype.generate = function(table, options) {
    var column, convertColumn, createLabel, i, labeledExprs, len, ref;
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      locale: null,
      headerFormat: "code",
      enumFormat: "code",
      splitLatLng: false,
      splitEnumset: false,
      useJoinIds: false,
      columnFilter: null,
      multipleJoinCondition: null
    });
    createLabel = function(column, suffix) {
      var label;
      if (options.headerFormat === "code" && column.code) {
        label = column.code;
        if (suffix) {
          label += " (" + (ExprUtils.localizeString(suffix, options.locale)) + ")";
        }
      } else if (options.headerFormat === "both" && column.code) {
        label = column.code;
        if (suffix) {
          label += " (" + (ExprUtils.localizeString(suffix, options.locale)) + ")";
        }
        label += "\n" + ExprUtils.localizeString(column.name, options.locale);
        if (suffix) {
          label += " (" + (ExprUtils.localizeString(suffix, options.locale)) + ")";
        }
      } else {
        label = ExprUtils.localizeString(column.name, options.locale);
        if (suffix) {
          label += " (" + (ExprUtils.localizeString(suffix, options.locale)) + ")";
        }
      }
      return label;
    };
    convertColumn = (function(_this) {
      return function(table, column, joins) {
        var childColumn, childExprs, i, joinColumn, len, ref, ref1, ref2;
        if (options.columnFilter && !options.columnFilter(table, column)) {
          return [];
        }
        if (column.type === "join") {
          if ((ref = column.join.type) === "n-1" || ref === "1-1") {
            if (options.useJoinIds) {
              return [
                {
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
                  joins: joins
                }
              ];
            } else {
              joinColumn = _this.schema.getColumn(column.join.toTable, "code");
              joinColumn = joinColumn || _this.schema.getColumn(column.join.toTable, "full_name");
              joinColumn = joinColumn || _this.schema.getColumn(column.join.toTable, "name");
              joinColumn = joinColumn || _this.schema.getColumn(column.join.toTable, "username");
              if (joinColumn) {
                return [
                  {
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
                  }
                ];
              } else {
                return [];
              }
            }
          }
          if (((ref1 = column.join.type) === "1-n" || ref1 === "n-n") && options.multipleJoinCondition && options.multipleJoinCondition(table, column)) {
            childExprs = [];
            ref2 = _this.schema.getColumns(column.join.toTable);
            for (i = 0, len = ref2.length; i < len; i++) {
              childColumn = ref2[i];
              childExprs = childExprs.concat(convertColumn(column.join.toTable, childColumn, joins.concat([column.id])));
            }
            return childExprs;
          }
        } else if (column.type === "geometry" && options.splitLatLng) {
          return [
            {
              expr: {
                table: table,
                type: "op",
                op: "latitude",
                exprs: [
                  {
                    type: "field",
                    table: table,
                    column: column.id
                  }
                ]
              },
              label: createLabel(column, "latitude"),
              joins: joins
            }, {
              expr: {
                table: table,
                type: "op",
                op: "longitude",
                exprs: [
                  {
                    type: "field",
                    table: table,
                    column: column.id
                  }
                ]
              },
              label: createLabel(column, "longitude"),
              joins: joins
            }
          ];
        } else if (column.type === "enumset" && options.splitEnumset) {
          return _.map(column.enumValues, function(ev) {
            return {
              expr: {
                table: table,
                type: "op",
                op: "contains",
                exprs: [
                  {
                    type: "field",
                    table: table,
                    column: column.id
                  }, {
                    type: "literal",
                    valueType: "enumset",
                    value: [ev.id]
                  }
                ]
              },
              label: createLabel(column, options.enumFormat === "text" ? ev.name : ev.code || ev.name),
              joins: joins
            };
          });
        } else {
          return [
            {
              expr: {
                type: "field",
                table: table,
                column: column.id
              },
              label: createLabel(column),
              joins: joins
            }
          ];
        }
      };
    })(this);
    labeledExprs = [];
    ref = this.schema.getColumns(table);
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      if (column.deprecated) {
        continue;
      }
      if (column.confidential) {
        continue;
      }
      labeledExprs = labeledExprs.concat(convertColumn(table, column, []));
    }
    return _.compact(labeledExprs);
  };

  return LabeledExprGenerator;

})();
