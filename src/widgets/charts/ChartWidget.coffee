PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
Widget = require './../Widget'
DropdownWidgetComponent = require './../DropdownWidgetComponent'
CsvBuilder = require './../../CsvBuilder'
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
ChartViewComponent = require './ChartViewComponent'
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')
ui = require 'react-library/lib/bootstrap'

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart) ->
    super()
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
  #  onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement: (options) ->
    return R(ChartWidgetComponent,
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

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> @chart.isAutoHeight()

# Complete chart widget
class ChartWidgetComponent extends React.PureComponent
  @propTypes:
    schema: PropTypes.object.isRequired # schema to use
    dataSource: PropTypes.object.isRequired # data source to use
    widgetDataSource: PropTypes.object.isRequired

    chart: PropTypes.object.isRequired # Chart object to use

    design: PropTypes.object.isRequired # Design of chart
    onDesignChange: PropTypes.func # null/undefined for readonly
    dataSource: PropTypes.object.isRequired # Data source to use for chart

    width: PropTypes.number
    height: PropTypes.number

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked

    connectMoveHandle: PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent) TODO REMOVE
    connectResizeHandle: PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent) TODO REMOVE

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super(props)
    
    @state = { 
      # Design that is being edited. Change is propagated on closing window
      editDesign: null
    }  

  # Saves a csv file to disk
  handleSaveCsvFile: =>
    # Get the data
    @props.widgetDataSource.getData(@props.design, @props.filters, (err, data) =>
      if err  
        return alert("Failed to get data: " + err.message)

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
      FileSaver = require 'file-saver'
      FileSaver.saveAs(blob, "Exported Data.csv")
    )

  handleStartEditing: =>
    # Can't edit if already editing
    if @state.editDesign
      return
    @setState(editDesign: @props.design)

  handleEndEditing: =>
    @props.onDesignChange(@state.editDesign)
    @setState(editDesign: null)

  handleCancelEditing: =>
    @setState(editDesign: null)

  handleEditDesignChange: (design) =>
    @setState(editDesign: design)

  renderChart: (design, onDesignChange, width, height) ->
    R(ChartViewComponent, 
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
      onScopeChange: @props.onScopeChange
      onRowClick: @props.onRowClick
    )

  renderEditor: ->
    if not @state.editDesign
      return null
    
    # Create editor
    editor = @props.chart.createDesignerElement(schema: @props.schema, filters: @props.filters, dataSource: @props.dataSource, design: @state.editDesign, onDesignChange: @handleEditDesignChange)

    if @props.chart.hasDesignerPreview()
      # Create chart (maxing out at half of width of screen)
      chartWidth = Math.min(document.body.clientWidth/2, @props.width)
      chartHeight = @props.height * (chartWidth / @props.width)
      chart = @renderChart(@state.editDesign, ((design) => @setState(editDesign: design)), chartWidth, chartHeight, chartWidth)

      content = R 'div', style: { height: "100%", width: "100%" },
        R 'div', style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: chartWidth + 20, height: chartHeight + 20, overflow: "hidden" },
          chart
        R 'div', style: { width: "100%", height: "100%", paddingLeft: chartWidth + 40 },
          R 'div', style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, paddingRight: 20, borderLeft: "solid 3px #AAA" },
            editor

      return R ModalWindowComponent,
        isOpen: true
        onRequestClose: @handleEndEditing,
          content
    else
      return R ActionCancelModalComponent, 
        size: "large"
        onCancel: @handleCancelEditing
        onAction: @handleEndEditing,
          editor

  # Render a link to start editing
  renderEditLink: ->
    R 'div', className: "mwater-visualization-widget-placeholder", onClick: @handleStartEditing,
      R ui.Icon, id: @props.chart.getPlaceholderIcon()

  render: ->
    design = @props.chart.cleanDesign(@props.design, @props.schema)

    # Determine if valid design
    validDesign = not @props.chart.validateDesign(design, @props.schema)

    # Determine if empty
    emptyDesign = @props.chart.isEmpty(design)

    # Create dropdown items
    dropdownItems = @props.chart.createDropdownItems(design, @props.schema, @props.widgetDataSource, @props.filters)
    if validDesign
      dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: @handleSaveCsvFile })
    if @props.onDesignChange?      
      dropdownItems.unshift({ label: @props.chart.getEditLabel(), icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return R 'div', onDoubleClick: (if @props.onDesignChange? then @handleStartEditing), style: { position: "relative", width: @props.width },
      if @props.onDesignChange?
        @renderEditor()
      React.createElement(DropdownWidgetComponent, 
        width: @props.width
        height: @props.height
        dropdownItems: dropdownItems,
          @renderChart(design, @props.onDesignChange, @props.width, @props.height)
      )
      if (emptyDesign or not validDesign) and @props.onDesignChange?
        @renderEditLink()
