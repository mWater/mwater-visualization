AxisBuilder = require '../../../axes/AxisBuilder'

# Misc table chart utilities

# Determine if table is aggregate (must be false to allow multiselect)
exports.isTableAggr = (design, schema) ->
  axisBuilder = new AxisBuilder(schema: schema)

  return _.any(design.columns, (column) => axisBuilder.isAxisAggr(column.textAxis)) or _.any(design.orderings, (ordering) => axisBuilder.isAxisAggr(ordering.axis))

# Creates the filter used for scoping to a particular row. Includes all non-aggr columns and orderings
# Returns filter ({ table:, jsonql: })
exports.createRowFilter = (design, schema, row) ->
  axisBuilder = new AxisBuilder(schema: schema)

  filter = {
    table: design.table
    jsonql: {
      type: "op"
      op: "and"
      exprs: []
    }
  }

  if exports.isTableAggr(design, schema)
    for column, index in design.columns
      if not axisBuilder.isAxisAggr(column.textAxis)
        filter.jsonql.exprs.push(axisBuilder.createValueFilter(column.textAxis, row["c#{index}"]))

    for ordering, index in design.orderings
      if not axisBuilder.isAxisAggr(ordering.axis)
        filter.jsonql.exprs.push(axisBuilder.createValueFilter(ordering.axis, row["o#{index}"]))

  else
    # Just use id if non-aggr
    filter.jsonql.exprs.push({ type: "op", op: "=", exprs: [
      { type: "field", tableAlias: "{alias}", column: schema.getTable(design.table).primaryKey }
      { type: "literal", value: row.id }]})

  return filter

# Creates the scope for a row
exports.createRowScope = (design, schema, row) ->
  axisBuilder = new AxisBuilder(schema: schema)

  data = [{}]

  if exports.isTableAggr(design, schema)
    for column, index in design.columns
      if not axisBuilder.isAxisAggr(column.textAxis)
        data[0]["c#{index}"] = row["c#{index}"]

    for ordering, index in design.orderings
      if not axisBuilder.isAxisAggr(ordering.textAxis)
        data[0]["o#{index}"] = row["o#{index}"]

  else
    data[0].id = row.id

  return {
    name: "Selected Row"
    filter: exports.createRowFilter(design, schema, row)
    data: data
  }

# Determines if a row is scoped
exports.isRowScoped = (row, scopeData) ->
  for item in scopeData
    if _.all(_.keys(item), (key) -> _.isEqual(row[key], item[key]))
      return true

  return false
