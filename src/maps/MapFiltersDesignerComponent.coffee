PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
PopoverHelpComponent = require 'react-library/lib/PopoverHelpComponent'
FiltersDesignerComponent = require '../FiltersDesignerComponent'
MapUtils = require './MapUtils'

# Designer for filters for a map
module.exports = class MapFiltersDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func.isRequired # Called with new design

  @contextTypes:
    globalFiltersElementFactory: PropTypes.func # Call with props { schema, dataSource, globalFilters, onChange }. Displays a component to edit global filters

  handleFiltersChange: (filters) =>
    design = _.extend({}, @props.design, filters: filters)
    @props.onDesignChange(design)

  handleGlobalFiltersChange: (globalFilters) =>
    design = _.extend({}, @props.design, globalFilters: globalFilters)
    @props.onDesignChange(design)

  render: ->
    # Get filterable tables
    filterableTables = MapUtils.getFilterableTables(@props.design, @props.schema)
    if filterableTables.length == 0
      return null

    return H.div null,
      H.div className: "form-group",
        H.label className: "text-muted", 
          "Filters "
          R PopoverHelpComponent, placement: "left",
            '''Filters all layers in the map. Individual layers can be filtered by clicking on Customize...'''

        H.div style: { margin: 5 }, 
          R FiltersDesignerComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            filters: @props.design.filters
            onFiltersChange: @handleFiltersChange
            filterableTables: filterableTables

      if @context.globalFiltersElementFactory
        H.div className: "form-group",
          H.label className: "text-muted", 
            "Global Filters "

          H.div style: { margin: 5 }, 
            @context.globalFiltersElementFactory({ 
              schema: @props.schema
              dataSource: @props.dataSource
              filterableTables: filterableTables
              globalFilters: @props.design.globalFilters or []
              onChange: @handleGlobalFiltersChange
            })
