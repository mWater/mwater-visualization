React = require 'react'
H = React.DOM
Widget = require './../Widget'
QueryDataLoadingComponent = require './../QueryDataLoadingComponent'
SimpleWidgetComponent = require './../SimpleWidgetComponent'
CsvBuilder = require './../../CsvBuilder'
filesaver = require 'filesaver.js'

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart, design, dataSource) ->
    @chart = chart
    @design = design
    @dataSource = dataSource

  # Creates a view of the widget. width and height will be injected
  # options:
  #  selected: true if selected
  #  onSelect: called when selected
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply (array of expressions)
  #  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  createViewElement: (options) ->
    return React.createElement(ChartWidgetComponent,
      chart: @chart
      design: @design
      dataSource: @dataSource
      onRemove: options.onRemove
      scope: options.scope
      filters: options.filters
      onScopeChange: options.onScopeChange
      selected: options.selected # TODO REMOVE
      onSelect: options.onSelect # TODO REMOVE
    )


  # Creates a React element that is a designer for the widget
  # options:
  #  onDesignChange: called with new design if changed
  createDesignerElement: (options) ->
    # TODO REMOVE?
    return @chart.createDesignerElement(design: @design, onDesignChange: options.onDesignChange)

class ChartWidgetComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    design: React.PropTypes.object.isRequired # Design of chart
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

    onRemove: React.PropTypes.func

    width: React.PropTypes.number
    handleight: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array  # array of filters to apply (array of expressions)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)

  # Saves a csv file to disk
  handleSaveCsvFile: ->
    # Get the queries
    queries = @props.chart.createQueries(@props.design, @props.filters)

    # Execute queries
    @props.dataSource.performQueries(queries, (err, data) =>
      if err  
        return alert("Failed to get data")

      # Create data table
      table = @props.chart.createDataTable(@props.design, data)

      # Convert to csv
      csv = new CsvBuilder().build(table)

      # Make a blob and save
      blob = new Blob([csv], {type: "text/csv"})
      filesaver(blob, "Exported Data.csv")
    )

  render: ->
    # Create dropdown items
    dropdownItems = @props.chart.createDropdownItems(@props.design, @props.dataSource, @props.filters)
    dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: => @handleSaveCsvFile(@props.filters) })
    dropdownItems.push({ label: "Remove", icon: "remove", onClick: @props.onRemove })

    # Wrap in a simple widget
    return React.createElement(SimpleWidgetComponent,
      selected: @props.selected
      onSelect: @props.onSelect
      width: @props.width
      height: @props.height
      dropdownItems: dropdownItems,
      connectMoveHandle: @props.connectMoveHandle
      connectResizeHandle: @props.connectResizeHandle,
        React.createElement(ChartWidgetViewComponent, 
          chart: @props.chart
          design: @props.design
          dataSource: @props.dataSource
          scope: @props.scope
          filters: @props.filters
          onScopeChange: @props.onScopeChange)
    )

# View part of the chart widget. Uses a query data loading component
# to handle loading and continues to display old data if design becomes
# invalid
class ChartWidgetViewComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    design: React.PropTypes.object.isRequired # Design of chart
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

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
