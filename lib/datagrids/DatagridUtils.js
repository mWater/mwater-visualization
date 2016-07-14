var DatagridUtils, ExprCleaner, _, update;

_ = require('lodash');

update = require('update-object');

ExprCleaner = require('mwater-expressions').ExprCleaner;

module.exports = DatagridUtils = (function() {
  function DatagridUtils(schema) {
    this.schema = schema;
  }

  DatagridUtils.prototype.cleanDesign = function(design) {
    var column, exprCleaner, i, len, ref;
    exprCleaner = new ExprCleaner(this.schema);
    if (!this.schema.getTable(design.table)) {
      return {};
    }
    design = _.cloneDeep(design);
    ref = design.columns;
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      if (column.type === "expr") {
        column.expr = exprCleaner.cleanExpr(column.expr, {
          table: design.table,
          aggrStatuses: ["individual", "literal", "aggregate"]
        });
      }
    }
    return design;
  };

  return DatagridUtils;

})();
