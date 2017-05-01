AxisBuilder = require '../../../axes/AxisBuilder'

# Misc table chart utilities

# Determine if table is aggregate (must be false to allow multiselect)
exports.isTableAggr = (design, schema) ->
  axisBuilder = new AxisBuilder(schema: schema)

  return _.any(design.columns, (column) => axisBuilder.isAxisAggr(column.textAxis)) or _.any(design.orderings, (ordering) => axisBuilder.isAxisAggr(ordering.axis))

exports.createScopeF