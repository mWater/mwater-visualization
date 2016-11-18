_ = require 'lodash'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils

# Compiles quickfilter values into filters.
module.exports = class QuickfilterCompiler
  constructor: (schema) ->
    @schema = schema

  # design is array of quickfilters (see README.md)
  # values is array of values 
  # locks is array of locked quickfilters. Overrides values
  # Returns array of filters { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
  # See README for values
  compile: (design, values, locks) ->
    if not design
      return []

    filters = []

    for item, index in design
      # Determine if locked
      lock = _.find(locks, (lock) -> _.isEqual(lock.expr, item.expr))

      # Determine value
      if lock 
        value = lock.value
      else
        value = values?[index]

      # Null means no filter
      if not value
        continue

      # Get type of expr
      type = new ExprUtils(@schema).getExprType(item.expr)

      if type in ['enum', 'text']
        # Create simple = expression
        filterExpr = {
          type: "op"
          op: "="
          table: item.expr.table
          exprs: [
            item.expr
            { type: "literal", valueType: "enum", value: value }
          ]
        }
      else if type in ['date', 'datetime']
        filterExpr = {
          type: "op"
          op: value.op
          table: item.expr.table
          exprs: [item.expr].concat(value.exprs)
        }

      jsonql = new ExprCompiler(@schema).compileExpr(expr: filterExpr, tableAlias: "{alias}")
      # Only keep if compiles to something
      if not jsonql?
        continue

      filters.push({
        table: item.expr.table
        jsonql: jsonql
        })

    return filters