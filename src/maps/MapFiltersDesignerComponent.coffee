React = require 'react'
H = React.DOM
R = React.createElement
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
PopoverHelpComponent = require 'react-library/lib/PopoverHelpComponent'

LayerFactory = require './LayerFactory'

# Designer for filters for a map
module.exports = class MapFiltersDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  handleFilterChange: (table, expr) =>
    # Clean filter
    expr = new ExprCleaner(@props.schema).cleanExpr(expr, { table: table })

    update = {}
    update[table] = expr

    filters = _.extend({}, @props.design.filters, update)
    design = _.extend({}, @props.design, filters: filters)
    @props.onDesignChange(design)

  renderFilterableTable: (table) =>
    name = ExprUtils.localizeString(@props.schema.getTable(table).name, @context.locale)

    H.div key: table, 
      H.label null, name
      React.createElement(FilterExprComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        onChange: @handleFilterChange.bind(null, table)
        table: table
        value: @props.design.filters[table])

  render: ->
    # Get filterable tables
    filterableTables = []
    for layerView in @props.design.layerViews
      # Create layer
      layer = LayerFactory.createLayer(layerView.type)

      # Get filterable tables
      filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, @props.schema)))

    if filterableTables.length == 0
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Filters "
        R PopoverHelpComponent, placement: "left",
          '''Filters all layers in the map. Individual layers can be filtered by clicking on Customize...'''

      H.div style: { margin: 5 }, 
        _.map(filterableTables, @renderFilterableTable)
