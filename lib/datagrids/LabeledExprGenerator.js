var ExprUtils, LabeledExprGenerator, _;

_ = require('lodash');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = LabeledExprGenerator = (function() {
  function LabeledExprGenerator(schema, table) {
    this.schema = schema;
    this.table = table;
  }

  LabeledExprGenerator.prototype.generate = function(options) {
    var column, convertColumn, createLabel, i, labeledExprs, len, ref, table;
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
      skipJoins: []
    });
    table = this.table;
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
      return function(table, column, rosterId) {
        var i, joinColumn, len, ref, rosterColumn, rosterLabelledExprs;
        if (column.type === "join") {
          if (column.join.type === "n-1" && !_.contains(options.skipJoins, column.join.type)) {
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
                  rosterId: rosterId
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
                    rosterId: rosterId
                  }
                ];
              } else {
                return [];
              }
            }
          }
          if (column.join.type === "1-n" && column.join.toTable.match(/:roster:/) && !_.contains(options.skipJoins, column.join.type)) {
            rosterLabelledExprs = [];
            ref = _this.schema.getColumns(column.join.toTable);
            for (i = 0, len = ref.length; i < len; i++) {
              rosterColumn = ref[i];
              if (rosterColumn.id === "response") {
                continue;
              }
              rosterId = column.id.split(":")[1];
              rosterLabelledExprs = rosterLabelledExprs.concat(convertColumn(column.join.toTable, rosterColumn, rosterId));
            }
            return rosterLabelledExprs;
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
              rosterId: rosterId
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
              rosterId: rosterId
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
              rosterId: rosterId
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
              rosterId: rosterId
            }
          ];
        }
      };
    })(this);
    labeledExprs = [];
    ref = this.schema.getColumns(table);
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      labeledExprs = labeledExprs.concat(convertColumn(table, column));
    }
    return _.compact(labeledExprs);
  };

  return LabeledExprGenerator;

})();
