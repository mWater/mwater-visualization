React = require 'react'
H = React.DOM
Widget = require './../Widget'
DropdownWidgetComponent = require './../DropdownWidgetComponent'
CsvBuilder = require './../../CsvBuilder'
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
ChartViewComponent = require './ChartViewComponent'
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart) ->
    @chart = chart

  # Creates a view of the widget.
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  createViewElement: (options) ->
    return React.createElement(ChartWidgetComponent,
      chart: @chart
      design: options.design
      schema: options.schema
      widgetDataSource: options.widgetDataSource
      dataSource: options.dataSource
      scope: options.scope
      filters: options.filters
      onScopeChange: options.onScopeChange
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height
      standardWidth: options.standardWidth
    )

  # Get the data that the widget needs. This will be called on the server, typically.
  #   design: design of the chart
  #   schema: schema to use
  #   dataSource: data source to get data from
  #   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  #   callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    # Clean design first
    design = @chart.cleanDesign(design, schema)
    
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

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number   # Standard width to allow widget to scale properly to retain same appearance

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent) TODO REMOVE
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent) TODO REMOVE

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super
    @state = { 
      # True when editing chart
      editing: false
    }  

  # Saves a csv file to disk
  handleSaveCsvFile: =>
    # Get the data
    @props.widgetDataSource.getData(@props.filters, (err, data) =>
      if err  
        return alert("Failed to get data")

      # Create data table
      table = @props.chart.createDataTable(@props.design, @props.schema, data, @context.locale)
      if not table
        return

      # Convert to csv
      csv = new CsvBuilder().build(table)

      # Make a blob and save
      blob = new Blob([csv], {type: "text/csv"})

      # Require at use as causes server problems
      filesaver = require 'filesaver.js'
      filesaver(blob, "Exported Data.csv")
    )

  handleStartEditing: =>
    @setState(editing: true)

  handleEndEditing: =>
    @setState(editing: false)

  renderChart: (width, height, standardWidth) ->
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
      standardWidth: standardWidth
      onScopeChange: @props.onScopeChange)

  renderEditor: ->
    # Create editor
    editor = @props.chart.createDesignerElement(schema: @props.schema, dataSource: @props.dataSource, design: @props.design, onDesignChange: @props.onDesignChange)

    # Create chart (maxing out at half of width of screen)
    width = Math.min(document.body.clientWidth/2, @props.width)
    chart = @renderChart(width, @props.height * (width / @props.width), width)

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

  # Render a link to start editing
  renderEditLink: ->
    H.div style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
      H.a className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Edit"

  render: ->
    # Determine if valid design
    validDesign = not @props.chart.validateDesign(@props.chart.cleanDesign(@props.design, @props.schema), @props.schema)

    # Determine if empty
    emptyDesign = @props.chart.isEmpty(@props.design)

    # Create dropdown items
    dropdownItems = @props.chart.createDropdownItems(@props.design, @props.schema, @props.widgetDataSource, @props.filters)
    if validDesign
      dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: @handleSaveCsvFile })
    if @props.onDesignChange?      
      dropdownItems.unshift({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div onDoubleClick: (if @props.onDesignChange? then @handleStartEditing), style: { position: "relative", width: @props.width },
      if @props.onDesignChange?
        @renderEditor()
      React.createElement(DropdownWidgetComponent, 
        width: @props.width
        height: @props.height
        dropdownItems: dropdownItems,
          @renderChart(@props.width, @props.height, @props.standardWidth)
      )
      if (emptyDesign or not validDesign) and @props.onDesignChange?
        @renderEditLink()
