React = require 'react'
H = React.DOM
Widget = require './Widget'
QueryDataLoadingComponent = require './QueryDataLoadingComponent'
SimpleWidgetComponent = require './SimpleWidgetComponent'

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart, design, dataSource) ->
    @chart = chart
    @design = design
    @dataSource = dataSource

  # Creates a view of the widget
  # options:
  #  selected: true if selected
  #  onSelect: called when selected
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply (array of expressions)
  #  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  createViewElement: (options) ->
    dropdownItems = @chart.createDropdownItems(@design, @dataSource, options.filters)
    dropdownItems.push({ node: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: options.onRemove })

    # Wrap in a simple widget
    return React.createElement(SimpleWidgetComponent,
      selected: options.selected
      onSelect: options.onSelect
      dropdownItems: dropdownItems,
      React.createElement(ChartWidgetComponent, {
        chart: @chart
        dataSource: @dataSource
        design: @design
        scope: options.scope
        filters: options.filters
        onScopeChange: options.onScopeChange
      })
    )

  # Creates a React element that is a designer for the widget
  # options:
  #  onDesignChange: called with new design if changed
  createDesignerElement: (options) ->
    return @chart.createDesignerElement(design: @design, onDesignChange: options.onDesignChange)

class ChartWidgetComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    design: React.PropTypes.object.isRequired # Design of chart

    width: React.PropTypes.number
    height: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array  # array of filters to apply (array of expressions)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  render: ->
    # Clean design first (needed to validate properly)
    design = @props.chart.cleanDesign(@props.design)

    # Check if design is invalid
    results = @props.chart.validateDesign(design)

    if not results
      elemFactory = (data) =>
        @props.chart.createViewElement({
          design: design
          data: data
          width: @props.width
          height: @props.height
          scope: @props.scope
          onScopeChange: @props.onScopeChange
          })

      # Get queries
      queries = @props.chart.createQueries(@props.design, @props.filters)

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

