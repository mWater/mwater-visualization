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
  #  onRowClick: Called with (tableId, rowId) when item is clicked
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
      onRowClick: options.onRowClick
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

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    # Clean design first
    design = @chart.cleanDesign(design, schema)

    return @chart.getFilterableTables(design, schema)

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

    onRowClick: React.PropTypes.func     # Called with (tableId, rowId) when item is clicked

    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent) TODO REMOVE
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent) TODO REMOVE

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super
    @state = { 
      # Design that is being edited. Change is propagated on closing window
      editDesign: null
    }  

  # Saves a csv file to disk
  handleSaveCsvFile: =>
    # Get the data
    @props.widgetDataSource.getData(@props.design, @props.filters, (err, data) =>
      if err  
        return alert("Failed to get data")

      # Create data table
      table = @props.chart.createDataTable(@props.design, @props.schema, @props.dataSource, data, @context.locale)
      if not table
        return

      # Convert to csv
      csv = new CsvBuilder().build(table)

      # Add BOM
      csv = "\uFEFF" + csv

      # Make a blob and save
      blob = new Blob([csv], {type: "text/csv"})

      # Require at use as causes server problems
      filesaver = require 'filesaver.js'
      filesaver(blob, "Exported Data.csv")
    )

  handleStartEditing: =>
    @setState(editDesign: @props.design)

  handleEndEditing: =>
    @props.onDesignChange(@state.editDesign)
    @setState(editDesign: null)

  handleEditDesignChange: (design) =>
    @setState(editDesign: design)

  renderChart: (design, onDesignChange, width, height, standardWidth) ->
    React.createElement(ChartViewComponent, 
      chart: @props.chart
      design: design
      onDesignChange: onDesignChange
      schema: @props.schema
      dataSource: @props.dataSource
      widgetDataSource: @props.widgetDataSource
      scope: @props.scope
      filters: @props.filters
      width: width
      height: height
      standardWidth: standardWidth
      onScopeChange: @props.onScopeChange
      onRowClick: @props.onRowClick
    )

  renderEditor: ->
    if not @state.editDesign
      return null

    # Create editor
    editor = @props.chart.createDesignerElement(schema: @props.schema, dataSource: @props.dataSource, design: @state.editDesign, onDesignChange: @handleEditDesignChange)

    # Create chart (maxing out at half of width of screen)
    chartWidth = Math.min(document.body.clientWidth/2, @props.width)
    chartHeight = @props.height * (chartWidth / @props.width)
    chart = @renderChart(@state.editDesign, ((design) => @setState(editDesign: design)), chartWidth, chartHeight, chartWidth)

    content = H.div style: { height: "100%", width: "100%" },
      H.div style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: chartWidth + 20, height: chartHeight + 20, overflow: "hidden" },
        chart
      H.div style: { width: "100%", height: "100%", paddingLeft: chartWidth + 40 },
        H.div style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
          editor

    React.createElement(ModalWindowComponent,
      isOpen: true
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
          @renderChart(@props.design, @props.onDesignChange, @props.width, @props.height, @props.standardWidth)
      )
      if (emptyDesign or not validDesign) and @props.onDesignChange?
        @renderEditLink()
