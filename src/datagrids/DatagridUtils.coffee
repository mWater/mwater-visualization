_ = require 'lodash'
update = require 'update-object'
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require("mwater-expressions").ExprUtils

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
        # Determine if subtable
        if column.subtable
          subtable = _.findWhere(design.subtables, id: column.subtable)

          # Now get destination table
          table = new ExprUtils(@schema).followJoins(design.table, subtable.joins)
        else
          table = design.table

        column.expr = exprCleaner.cleanExpr(column.expr, { table: table, aggrStatuses: ["individual", "literal", "aggregate"] })

    return design
  