_ = require 'lodash'
LayerFactory = require './LayerFactory'

# General utilities for a map


# Check if can convert to a cluster map. Only maps containing marker views can be
exports.canConvertToClusterMap = (design) ->
  return _.any(design.layerViews, (lv) -> lv.type == "Markers")

# Convert to a cluster map
exports.convertToClusterMap = (design) ->
  layerViews = _.map design.layerViews, (lv) =>
    if lv.type != "Markers"
      return lv

    lv = _.cloneDeep(lv)

    # Set type and design
    lv.type = "Cluster"
    lv.design = {
      table: lv.design.table
      axes: { geometry: lv.design.axes?.geometry }
      filter: lv.design.filter
      fillColor: lv.design.color
      minZoom: lv.design.minZoom
      maxZoom: lv.design.maxZoom
    }

    return lv

  return _.extend({}, design, layerViews: layerViews)

# Get ids of filterable tables
exports.getFilterableTables = (design, schema) ->
  filterableTables = []
  for layerView in design.layerViews
    # Create layer
    layer = LayerFactory.createLayer(layerView.type)

    # Get filterable tables
    filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, schema)))

  # Remove non-existant tables
  filterableTables = _.filter(filterableTables, (table) => schema.getTable(table))
