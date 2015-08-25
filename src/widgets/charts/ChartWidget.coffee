React = require 'react'
H = React.DOM
Widget = require './../Widget'
SimpleWidgetComponent = require './../SimpleWidgetComponent'
CsvBuilder = require './../../CsvBuilder'
filesaver = require 'filesaver.js'
ActionCancelModalComponent = require '../../ActionCancelModalComponent'
ChartWidgetViewComponent = require './ChartWidgetViewComponent'

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart, design, dataSource) ->
    @chart = chart
    @design = design
    @dataSource = dataSource

  # Creates a view of the widget. width and height will be injected
  # options:
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  #  onDesignChange: called with new design
  createViewElement: (options) ->
    return React.createElement(ChartWidgetComponent,
      chart: @chart
      design: @design
      dataSource: @dataSource
      onRemove: options.onRemove
      scope: options.scope
      filters: options.filters
      onScopeChange: options.onScopeChange
      onDesignChange: options.onDesignChange
    )

# Complete chart widget
class ChartWidgetComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    design: React.PropTypes.object.isRequired # Design of chart
    onDesignChange: React.PropTypes.func.isRequired 
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

    onRemove: React.PropTypes.func

    width: React.PropTypes.number
    height: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)

  # Saves a csv file to disk
  handleSaveCsvFile: =>
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

  handleStartEditing: =>
    @refs.simpleWidget.displayEditor()

  render: ->
    # Create dropdown items
    dropdownItems = @props.chart.createDropdownItems(@props.design, @props.dataSource, @props.filters)
    dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: @handleSaveCsvFile })
    dropdownItems.push({ label: "Remove", icon: "remove", onClick: @props.onRemove })
    dropdownItems.unshift({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Create editor
    editor = @props.chart.createDesignerElement(design: @props.design, onDesignChange: @props.onDesignChange)

    # Wrap in a simple widget
    return H.div onDoubleClick: @handleStartEditing, 
      React.createElement(SimpleWidgetComponent, 
        ref: "simpleWidget",
        width: @props.width
        height: @props.height
        dropdownItems: dropdownItems,
        editor: editor
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

