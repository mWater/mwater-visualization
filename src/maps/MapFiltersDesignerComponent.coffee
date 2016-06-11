React = require 'react'
H = React.DOM
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils

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
      H.h4 null, name
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
      layer = LayerFactory.createLayer(layerView.type, layerView.design)

      # Get filterable tables
      filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, @props.schema)))

    H.div style: { margin: 5 }, 
      _.map(filterableTables, @renderFilterableTable)
