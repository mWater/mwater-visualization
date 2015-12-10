React = require 'react'
H = React.DOM
QueryDataLoadingComponent = require './../QueryDataLoadingComponent'

# Inner view part of the chart widget. Uses a query data loading component
# to handle loading and continues to display old data if design becomes
# invalid
module.exports = class ChartViewComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    design: React.PropTypes.object.isRequired # Design of chart
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array  # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  render: ->
    # Clean design first (needed to validate properly)
    design = @props.chart.cleanDesign(@props.design)

    # Check if design is invalid
    results = @props.chart.validateDesign(design)

    # If no errors
    if not results
      elemFactory = (data) =>
        @props.chart.createViewElement({
          design: design
          data: data
          scope: @props.scope
          onScopeChange: @props.onScopeChange
          width: @props.width
          height: @props.height
          standardWidth: @props.standardWidth
          })

      # Get queries
      queries = @props.chart.createQueries(design, @props.filters)

    else
      # Can't create with invalid design
      elemFactory = null

    dataSource = (queries, cb) =>
      @props.dataSource.performQueries(queries, cb)

    return React.createElement(QueryDataLoadingComponent, {
      elemFactory: elemFactory
      dataSource: dataSource
      queries: queries
      })
