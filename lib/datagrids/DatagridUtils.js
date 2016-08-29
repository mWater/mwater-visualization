var DatagridUtils, ExprCleaner, ExprUtils, _, update;

_ = require('lodash');

update = require('update-object');

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require("mwater-expressions").ExprUtils;

module.exports = DatagridUtils = (function() {
  function DatagridUtils(schema) {
    this.schema = schema;
  }

  DatagridUtils.prototype.cleanDesign = function(design) {
    var column, exprCleaner, i, len, ref, subtable, table;
    exprCleaner = new ExprCleaner(this.schema);
    if (!this.schema.getTable(design.table)) {
      return {};
    }
    design = _.cloneDeep(design);
    ref = design.columns;
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      if (column.type === "expr") {
        if (column.subtable) {
          subtable = _.findWhere(design.subtables, {
            id: column.subtable
          });
          table = new ExprUtils(this.schema).followJoins(design.table, subtable.joins);
        } else {
          table = design.table;
        }
        column.expr = exprCleaner.cleanExpr(column.expr, {
          table: table,
          aggrStatuses: ["individual", "literal", "aggregate"]
        });
      }
    }
    return design;
  };

  return DatagridUtils;

})();
