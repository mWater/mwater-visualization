_ = require 'lodash'
ExprUtils = require('mwater-expressions').ExprUtils

# Generates labeled expressions (expr, label and joins) for a table. Used to make a datagrid, do export or import.
module.exports = class LabeledExprGenerator
  constructor: (schema) ->
    @schema = schema

  # Generate labeled exprs, an array of ({ expr: mwater expression, label: plain string, joins: array of join column ids to get to current table. Usually []. Only present for 1-n joins })
  # table is id of table to generate from
  # options are: [default]
  #  locale: e.g. "en". Uses _base by default, then en [null]
  #  headerFormat: "text", "code" or "both" ["code"]
  #  enumFormat: "name" or "code" ["name"]
  #  splitLatLng: split geometry into lat/lng [false]
  #  splitEnumset: split enumset into true/false expressions [false]
  #  useJoinIds: use ids of n-1 joins, not the code/name/etc [false]
  #  columnFilter: optional boolean predicate to filter columns included. Called with table id, column object
  #  multipleJoinCondition: optional boolean predicate to filter 1-n/n-n joins to include. Called with table id, join column object. Default is to not include those joins
  generate: (table, options = {}) ->
    _.defaults(options, {
      locale: null
      headerFormat: "code"
      enumFormat: "code"
      splitLatLng: false
      splitEnumset: false
      useJoinIds: false
      columnFilter: null
      multipleJoinCondition: null
     })

    # Create a label for a column
    createLabel = (column, suffix) ->
      # By header mode
      if options.headerFormat == "code" and column.code
        label = column.code
        if suffix
          label += " (#{ExprUtils.localizeString(suffix, options.locale)})"
      else if options.headerFormat == "both" and column.code
        label = column.code
        if suffix
          label += " (#{ExprUtils.localizeString(suffix, options.locale)})"
        label += "\n" + ExprUtils.localizeString(column.name, options.locale)
        if suffix
          label += " (#{ExprUtils.localizeString(suffix, options.locale)})"
      else  # text
        label = ExprUtils.localizeString(column.name, options.locale)
        if suffix
          label += " (#{ExprUtils.localizeString(suffix, options.locale)})"

      return label

    # Convert a table + schema column into multiple labeled expres
    convertColumn = (table, column, joins) =>
      # Filter if present
      if options.columnFilter and not options.columnFilter(table, column)
        return []

      if column.type == "join"
        # If n-1, 1-1 join, create scalar
        if column.join.type in ["n-1", "1-1"]
          # Use id if that option is enabled
          if options.useJoinIds
            return [
              {
                expr: { type: "scalar", table: table, joins: [column.id], expr: { type: "id", table: column.join.toTable } }
                label: createLabel(column)
                joins: joins
              }
            ]
          else # use code, full name, or name of dest table
            joinColumn = @schema.getColumn(column.join.toTable, "code")
            joinColumn = joinColumn or @schema.getColumn(column.join.toTable, "full_name")
            joinColumn = joinColumn or @schema.getColumn(column.join.toTable, "name")
            joinColumn = joinColumn or @schema.getColumn(column.join.toTable, "username")
            if joinColumn
              return [
                {
                  expr: { type: "scalar", table: table, joins: [column.id], expr: { type: "field", table: column.join.toTable, column: joinColumn.id } }
                  label: createLabel(column)
                  joins: joins
                }
              ]
            else
              return []

        # If 1-n/n-1, convert each child
        if column.join.type in ["1-n", "n-n"] and options.multipleJoinCondition and options.multipleJoinCondition(table, column)
          childExprs = []

          for childColumn in @schema.getColumns(column.join.toTable)
            childExprs = childExprs.concat(convertColumn(column.join.toTable, childColumn, joins.concat([column.id])))

          return childExprs

      else if column.type == "geometry" and options.splitLatLng
        # Use lat/lng
        return [
          { expr: { table: table, type: "op", op: "latitude", exprs: [{ type: "field", table: table, column: column.id }] }, label: createLabel(column, "latitude"), joins: joins }
          { expr: { table: table, type: "op", op: "longitude", exprs: [{ type: "field", table: table, column: column.id }] }, label: createLabel(column, "longitude"), joins: joins }
        ]
      else if column.type == "enumset" and options.splitEnumset
        # Split into one for each enumset value
        return _.map(column.enumValues, (ev) =>
          {
            expr: { table: table, type: "op", op: "contains", exprs: [
                { type: "field", table: table, column: column.id }
                { type: "literal", valueType: "enumset", value: [ev.id] }
              ]}
            label: createLabel(column, if options.enumFormat == "text" then ev.name else ev.code or ev.name)
            joins: joins
           }
        )
      else # Simple columns
        return [
          { expr: { type: "field", table: table, column: column.id }, label: createLabel(column), joins: joins }
        ]

    # For each column in form
    labeledExprs = []
    for column in @schema.getColumns(table)
      # Skip deprecated
      if column.deprecated
        continue
        
      # Convert column into labels and exprs
      labeledExprs = labeledExprs.concat(convertColumn(table, column, []))

    return _.compact(labeledExprs)
