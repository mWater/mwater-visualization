_ = require 'lodash'
ExprUtils = require('mwater-expressions').ExprUtils

# Generates labeled expressions (expr, label and rosterId) for a form. Used to make a datagrid, do export or import.
module.exports = class LabeledExprGenerator
  constructor: (schema, table) ->
    @schema = schema
    @table = table

  # Generate labeled exprs, an array of ({ expr: mwater expression, label: plain string, rosterId: id of roster if from roster })
  # options are: [default]
  #  locale: e.g. "en". Uses _base by default, then en [null]
  #  headerFormat: "text", "code" or "both" ["code"]
  #  enumFormat: "name" or "code" ["name"]
  #  splitLatLng: split geometry into lat/lng [false]
  #  splitEnumset: split enumset into true/false expressions [false]
  #  useJoinIds: use ids of n-1 joins, not the code/name/etc [false]
  #  skipJoins: array containing the joins to skip, defaults to []
  generate: (options = {}) ->
    _.defaults(options, {
      locale: null
      headerFormat: "code"
      enumFormat: "code"
      splitLatLng: false
      splitEnumset: false
      useJoinIds: false
      skipJoins: []
     })

    table = @table

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
    convertColumn = (table, column, rosterId) =>
      if column.type == "join"
        # If n-1 join, create scalar
        if column.join.type == "n-1" and not _.contains(options.skipJoins, column.join.type)
          # Use id if that option is enabled
          if options.useJoinIds
            return [
              {
                expr: { type: "scalar", table: table, joins: [column.id], expr: { type: "id", table: column.join.toTable } }
                label: createLabel(column)
                rosterId: rosterId
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
                  rosterId: rosterId
                }
              ]
            else
              return []

        # If 1-n and roster, convert each child
        if column.join.type == "1-n" and column.join.toTable.match(/:roster:/) and not _.contains(options.skipJoins, column.join.type)
          rosterLabelledExprs = []

          for rosterColumn in @schema.getColumns(column.join.toTable)
            # Skip if response
            if rosterColumn.id == "response"
              continue

            rosterId = column.id.split(":")[1]
            rosterLabelledExprs = rosterLabelledExprs.concat(convertColumn(column.join.toTable, rosterColumn, rosterId))

          return rosterLabelledExprs

      else if column.type == "geometry" and options.splitLatLng
        # Use lat/lng
        return [
          { expr: { table: table, type: "op", op: "latitude", exprs: [{ type: "field", table: table, column: column.id }] }, label: createLabel(column, "latitude"), rosterId: rosterId }
          { expr: { table: table, type: "op", op: "longitude", exprs: [{ type: "field", table: table, column: column.id }] }, label: createLabel(column, "longitude"), rosterId: rosterId }
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
            rosterId: rosterId
           }
        )
      else # Simple columns
        return [
          { expr: { type: "field", table: table, column: column.id }, label: createLabel(column), rosterId: rosterId }
        ]

    # For each column in form
    labeledExprs = []
    for column in @schema.getColumns(table)
      # Convert column into labels and exprs
      labeledExprs = labeledExprs.concat(convertColumn(table, column))

    return _.compact(labeledExprs)
