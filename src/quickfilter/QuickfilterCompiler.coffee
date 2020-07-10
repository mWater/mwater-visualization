_ = require 'lodash'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprCleaner = require('mwater-expressions').ExprCleaner
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

      # Clean expression first
      expr = new ExprCleaner(@schema).cleanExpr(item.expr)

      # Do not render if nothing
      if not expr
        continue

      # Compile to boolean expression
      filterExpr = @compileToFilterExpr(expr, value, item.multi)

      jsonql = new ExprCompiler(@schema).compileExpr(expr: filterExpr, tableAlias: "{alias}")
      # Only keep if compiles to something
      if not jsonql?
        continue

      filters.push({
        table: expr.table
        jsonql: jsonql
      })

    return filters

  compileToFilterExpr: (expr, value, multi) ->
    # Get type of expr
    type = new ExprUtils(@schema).getExprType(expr)
    idTable = new ExprUtils(@schema).getExprIdTable(expr)

    if type == 'text'
      # Create simple = expression
      if multi
        return {
          type: "op"
          op: "= any"
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: "text[]", value: value }
          ]
        }
      else
        return {
          type: "op"
          op: "="
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: "text", value: value }
          ]
        }
    else if type == 'enum'
      # Create simple = expression
      if multi
        return {
          type: "op"
          op: "= any"
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: "enumset", value: value }
          ]
        }
      else
        return {
          type: "op"
          op: "="
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: "enum", value: value }
          ]
        }
    else if type in ["enumset", "text[]"]
      # Create contains expression
      if multi
        return {
          type: "op"
          op: "intersects"
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: type, value: value }
          ]
        }
      else
        return {
          type: "op"
          op: "contains"
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: type, value: [value] }
          ]
        }
    else if type in ['id[]']
      if multi
        return {
          type: "op"
          op: "intersects"
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: "id[]", idTable: idTable, value: value }
          ]
        }
      else
        return {
          type: "op"
          op: "contains"
          table: expr.table
          exprs: [
            expr
            { type: "literal", valueType: "id[]", idTable: idTable, value: [value] }
          ]
        }
    else if type in ['date', 'datetime'] and value.op
      return {
        type: "op"
        op: value.op
        table: expr.table
        exprs: [expr].concat(value.exprs)
      }
    else
      return null
