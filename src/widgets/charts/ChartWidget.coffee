React = require 'react'
H = React.DOM
Widget = require './../Widget'
SimpleWidgetComponent = require './../SimpleWidgetComponent'
CsvBuilder = require './../../CsvBuilder'
filesaver = require 'filesaver.js'
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
ChartViewComponent = require './ChartViewComponent'
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart) ->
    @chart = chart

  # Creates a view of the widget. width, height and standardWidth will be injected
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  onRemove: called when widget is removed
  #  onDuplicate: called when widget is duplicated
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  #  onDesignChange: called with new design. null/undefined for readonly
  createViewElement: (options) ->
    return React.createElement(ChartWidgetComponent,
      chart: @chart
      design: options.design
      schema: options.schema
      widgetDataSource: options.widgetDataSource
      dataSource: options.dataSource
      onRemove: options.onRemove
      onDuplicate: options.onDuplicate
      scope: options.scope
      filters: options.filters
      onScopeChange: options.onScopeChange
      onDesignChange: options.onDesignChange
    )

  # Get the data that the widget needs. This will be called on the server, typically.
  #   design: design of the chart
  #   schema: schema to use
  #   dataSource: data source to get data from
  #   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  #   callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    @chart.getData(design, schema, dataSource, filters, callback)

# Complete chart widget
class ChartWidgetComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # schema to use
    dataSource: React.PropTypes.object.isRequired # data source to use
    widgetDataSource: React.PropTypes.object.isRequired

    chart: React.PropTypes.object.isRequired # Chart object to use

    design: React.PropTypes.object.isRequired # Design of chart
    onDesignChange: React.PropTypes.func # null/undefined for readonly
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

    onRemove: React.PropTypes.func
    onDuplicate: React.PropTypes.func

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number   # Standard width to allow widget to scale properly to retain same appearance

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super
    @state = { 
      # True when editing chart
      editing: props.chart.isEmpty(@props.design) # Display editor if empty design
    }  

  # Saves a csv file to disk
  handleSaveCsvFile: =>
    # Get the data
    @props.widgetDataSource.getData(@props.filters, (err, data) =>
      if err  
        return alert("Failed to get data")

      # Create data table
      table = @props.chart.createDataTable(@props.design, data, @context.locale)
      if not table
        return

      # Convert to csv
      csv = new CsvBuilder().build(table)

      # Make a blob and save
      blob = new Blob([csv], {type: "text/csv"})
      filesaver(blob, "Exported Data.csv")
    )

  handleStartEditing: =>
    @setState(editing: true)

  handleEndEditing: =>
    @setState(editing: false)

    # Remove if blank
    if @props.chart.isEmpty(@props.design)
      @props.onRemove()

  renderChart: (width, height) ->
    React.createElement(ChartViewComponent, 
      chart: @props.chart
      design: @props.design
      schema: @props.schema
      dataSource: @props.dataSource
      widgetDataSource: @props.widgetDataSource
      scope: @props.scope
      filters: @props.filters
      width: width
      height: height
      standardWidth: @props.standardWidth
      onScopeChange: @props.onScopeChange)

  renderEditor: ->
    # Create editor
    editor = @props.chart.createDesignerElement(schema: @props.schema, dataSource: @props.dataSource, design: @props.design, onDesignChange: @props.onDesignChange)

    # Create chart (maxing out at half of width of screen)
    width = Math.min(document.body.clientWidth/2, @props.width)
    chart = @renderChart(width, @props.height * (width / @props.width))

    content = H.div style: { height: "100%", width: "100%" },
      H.div style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: width + 20, height: @props.height + 20 },
        chart
      H.div style: { width: "100%", height: "100%", paddingLeft: width + 40 },
        H.div style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
          editor

    React.createElement(ModalWindowComponent,
      isOpen: @state.editing
      onRequestClose: @handleEndEditing,
        content)

  render: ->
    # Determine if valid design
    validDesign = not @props.chart.validateDesign(@props.chart.cleanDesign(@props.design, @props.schema), @props.schema)

    # Create dropdown items
    dropdownItems = @props.chart.createDropdownItems(@props.design, @props.schema, @props.widgetDataSource, @props.filters)
    if validDesign
      dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: @handleSaveCsvFile })
    if @props.onRemove
      dropdownItems.push({ label: "Remove", icon: "remove", onClick: @props.onRemove })
    if @props.onDuplicate and @props.onDesignChange?
      dropdownItems.push({ label: "Duplicate", icon: "duplicate", onClick: @props.onDuplicate })
    if @props.onDesignChange?      
      dropdownItems.unshift({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div onDoubleClick: (if @props.onDesignChange? then @handleStartEditing), 
      if @props.onDesignChange?
        @renderEditor()
      React.createElement(SimpleWidgetComponent, 
        width: @props.width
        height: @props.height
        standardWidth: @props.standardWidth
        dropdownItems: dropdownItems,
        connectMoveHandle: @props.connectMoveHandle
        connectResizeHandle: @props.connectResizeHandle,
          # height and width will be injected
          @renderChart()
      )
