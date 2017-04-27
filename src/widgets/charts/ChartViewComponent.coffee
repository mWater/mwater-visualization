React = require 'react'
H = React.DOM
asyncLatest = require 'async-latest'

# Inner view part of the chart widget. Uses a query data loading component
# to handle loading and continues to display old data if design becomes
# invalid
module.exports = class ChartViewComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    design: React.PropTypes.object.isRequired # Design of chart
    onDesignChange: React.PropTypes.func      # When design change

    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    # scope of the widget (when the widget self-selects a particular scope)
    scope: React.PropTypes.shape({ 
      name: React.PropTypes.node.isRequired
      filter: React.PropTypes.shape({ table: React.PropTypes.string.isRequired, jsonql: React.PropTypes.object.isRequired })
      data: React.PropTypes.any
    }) 
    filters: React.PropTypes.array  # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    onRowClick: React.PropTypes.func     # Called with (tableId, rowId) when item is clicked

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func # Sets popups of dashboard. If not set, readonly
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  constructor: ->
    super

    @state = {
      validDesign: null     # last valid design
      data: null            # data for chart
      dataLoading: false    # True when loading data
      dataError: null       # Set when data loading returned error
    }

    # Ensure that only one load at a time
    @loadData = asyncLatest(@loadData, { serial: true })

    @state = {}

  componentDidMount: ->
    @updateData(@props)

  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.design, @props.design) or not _.isEqual(nextProps.filters, @props.filters)
      @updateData(nextProps)

  updateData: (props) ->
    # Clean design first (needed to validate properly)
    design = props.chart.cleanDesign(props.design, props.schema)

    # If design is not valid, do nothing as can't query invalid design
    errors = props.chart.validateDesign(design, props.schema)
    if errors
      return

    # Loading data
    @setState(dataLoading: true)

    @loadData(props, (error, data) =>
      @setState(dataLoading: false, dataError: error, data: data, validDesign: design)
    )

  loadData: (props, callback) ->
    # Get data from widget data source
    props.widgetDataSource.getData(props.design, props.filters, callback)

  renderSpinner: ->
    H.div style: { position: "absolute", bottom: "50%", left: 0, right: 0, textAlign: "center", fontSize: 20 },
      H.i className: "fa fa-spinner fa-spin"

  render: ->
    style = { width: @props.width, height: @props.height }

    # Faded if loading
    if @state.dataLoading
      style.opacity = 0.5

    # If nothing to show, show grey
    if not @state.validDesign
      # Invalid. Show faded with background
      style.backgroundColor = "#E0E0E0"
      style.opacity = 0.35

      # Set height to 1.6 ratio if not set so the control is visible
      if not @props.height and @props.width
        style.height = @props.width / 1.6

    if @state.dataError
      return H.div className: "alert alert-danger",
       "Error loading data: #{@state.dataError.message or @state.dataError}" 

    return H.div style: style,
      if @state.validDesign
        @props.chart.createViewElement({
          schema: @props.schema
          dataSource: @props.dataSource
          widgetDataSource: @props.widgetDataSource
          design: @state.validDesign
          onDesignChange: @props.onDesignChange
          data: @state.data
          scope: @props.scope
          onScopeChange: @props.onScopeChange
          width: @props.width
          height: @props.height
          standardWidth: @props.standardWidth
          onRowClick: @props.onRowClick
          namedStrings: @props.namedStrings
          popups: @props.popups
          onPopupsChange: @props.onPopupsChange
          })
      if @state.dataLoading
        @renderSpinner()
