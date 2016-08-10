ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils

# Compiles quickfilter values into filters
module.exports = class QuickfilterCompiler
  constructor: (schema) ->
    @schema = schema

  # design is array of quickfilters (see README.md). values is array of values 
  # Returns array of filters { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
  # See README for values
  compile: (design, values) ->
    if not design
      return []

    filters = []

    for index in [0...design.length]
      # Null means no filter
      if not values or not values[index]?
        continue

      # Get type of expr
      type = new ExprUtils(@schema).getExprType(design[index].expr)

      if type in ['enum', 'text']
        # Create simple = expression
        filterExpr = {
          type: "op"
          op: "="
          table: design[index].expr.table
          exprs: [
            design[index].expr
            { type: "literal", valueType: "enum", value: values[index] }
          ]
        }
      else if type in ['date', 'datetime']
        filterExpr = {
          type: "op"
          op: values[index].op
          table: design[index].expr.table
          exprs: [design[index].expr].concat(values[index].exprs)
        }

      jsonql = new ExprCompiler(@schema).compileExpr(expr: filterExpr, tableAlias: "{alias}")
      # Only keep if compiles to something
      if not jsonql?
        continue

      filters.push({
        table: design[index].table
        jsonql: jsonql
        })

    return filters