React = require 'react'
H = React.DOM
Widget = require './Widget'

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart, design, dataSource) ->
    @chart = chart
    @design = design
    @dataSource = dataSource

  # Creates a view of the widget
  # options:
  #  width: width in pixels
  #  height: height in pixels
  #  selected: true if selected
  #  onSelect: called when selected
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply (array of expressions)
  #  onScopeChange: called with (scope, filter) as a scope to apply to self and filter to apply to other widgets
  createViewElement: (options) ->
    # Wrap in a chart widget
    return React.createElement(ChartWidgetComponent, {
      chart: @chart
      dataSource: @dataSource
      design: @design
      width: options.width
      height: options.height
      selected: options.selected
      onSelect: options.onSelect
      onRemove: options.onRemove
      scope: options.scope
      filters: options.filters
      onScopeChange: options.onScopeChange
    })

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

    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    selected: React.PropTypes.bool # true if selected
    onSelect: React.PropTypes.func # called when selected
    onRemove: React.PropTypes.func # called when widget is removed
    
    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: React.PropTypes.array  # array of filters to apply (array of expressions)
    onScopeChange: React.PropTypes.func # called with (scope, filter) as a scope to apply to self and filter to apply to other widgets

    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)

  constructor: (props) ->
    super

    # State is initially with no data
    @state = {
      data: null          # Data returned from data source
      dataQueries: null   # Queries that produced data
      dataError: null     # True if an error returned from data source
    }

  componentDidMount: ->
    @updateData(@props)

  componentWillReceiveProps: (nextProps) ->
    @updateData(nextProps)

  updateData: (props) ->
    # Skip if invalid
    if props.chart.validateDesign(props.design)
      return

    # Get queries
    queries = props.chart.createQueries(props.design, props.filters)

    # Skip if same
    if _.isEqual(queries, @state.dataQueries)
      return

    # Call data source
    @setState(data: null, dataQueries: null, dataError: null)
    props.dataSource.performQueries(queries, (err, data) =>
      if err
        @setState(data: null, dataQueries: null, dataError: err)
      else
        @setState(data: data, dataQueries: queries, dataError: null)
      )

  handleClick: (ev) =>
    ev.stopPropagation()
    @props.onSelect()

  handleRemove: (ev) =>
    ev.stopPropagation()
    @props.onRemove()

  renderResizeHandle: ->
    resizeHandleStyle = {
      position: "absolute"
      right: 0
      bottom: 0
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')"
      width: 10
      height: 10
      cursor: "nwse-resize"
    }

    if @props.connectResizeHandle
      return @props.connectResizeHandle(
        H.div style: resizeHandleStyle, className: "mwater-chart-widget-resize-handle"
        )

  renderRemoveButton: ->
    removeButtonStyle = {
      position: "absolute"
      right: 5
      top: 5
      cursor: "pointer"
    }

    if @props.onRemove
      H.div style: removeButtonStyle, className: "mwater-chart-widget-remove-button", onClick: @handleRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderChart: (design, width, height) ->
    return @props.chart.createViewElement({
      design: design
      data: @state.data
      width: width
      height: height
      scope: @props.scope
      onScopeChange: @props.onScopeChange
      })

  render: ->
    style = { 
      width: @props.width
      height: @props.height 
      padding: 10
    }
    
    if @props.selected
      style.border = "dashed 2px #AAA"

    # Clean design first (needed to validate properly)
    design = @props.chart.cleanDesign(@props.design)

    # Check if design is invalid
    results = @props.chart.validateDesign(design)
    if results
      contents = H.div null, 
        "Invalid design: "
        results
      style.backgroundColor = "#EEE"
    # If data error, display
    else if @state.dataError
      contents = H.div null,
        "Error loading data: "
        @state.dataError.toString()
      style.backgroundColor = "#EEE"

    # If no data, loading
    else if not @state.data
      contents = H.div null,
        "Loading..."
    else 
      contents = H.div style: { position: "absolute", left: 10, top: 10 }, 
        @renderChart(design, @props.width - 20, @props.height - 20)

    elem = H.div className: "mwater-chart-widget", style: style, onClick: @handleClick,
      contents
      @renderResizeHandle()
      @renderRemoveButton()

    if @props.connectMoveHandle
      elem = @props.connectMoveHandle(elem)

    return elem

