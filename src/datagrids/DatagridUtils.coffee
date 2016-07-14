_ = require 'lodash'
update = require 'update-object'
ExprCleaner = require('mwater-expressions').ExprCleaner


module.exports = class DatagridUtils
  constructor: (schema) ->
    @schema = schema

  # Cleans a datagrid design, removing invalid columns
  cleanDesign: (design) ->
    exprCleaner = new ExprCleaner(@schema)

    # Erase all if table doesn't exist
    if not @schema.getTable(design.table)
      return {}

    # Clean columns
    design = _.cloneDeep(design)
    for column in design.columns
      if column.type == "expr"
        column.expr = exprCleaner.cleanExpr(column.expr, { table: design.table, aggrStatuses: ["individual", "literal", "aggregate"] })

    return design
  