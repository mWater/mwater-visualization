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

  # Creates a React element that is a designer for the widget
  # options:
  #  onDesignChange: called with new design if changed
  createDesignerElement: (options) ->
    # TODO REMOVE
    return null

# Complete chart widget. Stores state of editing and renders editor if open
class ChartWidgetComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    design: React.PropTypes.object.isRequired # Design of chart
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

    onRemove: React.PropTypes.func

    width: React.PropTypes.number
    handleight: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)

  constructor: ->
    super
    # editingDesign is not null if editing
    @state = { editingDesign: null }

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

  handleSaveEditing: =>
    @props.onDesignChange(@state.editingDesign)
    @setState(editingDesign: null)

  handleCancelEditing: => @setState(editingDesign: null)
  handleStartEditing: => @setState(editingDesign: @props.design)
  handleEditingChange: (design) =>  @setState(editingDesign: design)

  renderEditor: ->
    if not @state.editingDesign?
      return

    return React.createElement(ActionCancelModalComponent,
      title: "Edit Chart"
      onAction: @handleSaveEditing
      onCancel: @handleCancelEditing,
        @props.chart.createDesignerElement(
          design: @state.editingDesign
          onDesignChange: @handleEditingChange)
    )

  render: ->
    # Create dropdown items
    dropdownItems = @props.chart.createDropdownItems(@props.design, @props.dataSource, @props.filters)
    dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: => @handleSaveCsvFile(@props.filters) })
    dropdownItems.push({ label: "Remove", icon: "remove", onClick: @props.onRemove })
    dropdownItems.unshift({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div onDoubleClick: @handleStartEditing, 
      @renderEditor()
      React.createElement(SimpleWidgetComponent,
        highlighted: @state.editingDesign?
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

