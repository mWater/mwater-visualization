PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
asyncLatest = require 'async-latest'

# Inner view part of the chart widget. Uses a query data loading component
# to handle loading and continues to display old data if design becomes
# invalid
module.exports = class ChartViewComponent extends React.Component
  @propTypes:
    chart: PropTypes.object.isRequired # Chart object to use
    design: PropTypes.object.isRequired # Design of chart
    onDesignChange: PropTypes.func      # When design change

    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: PropTypes.object.isRequired

    width: PropTypes.number
    height: PropTypes.number
    standardWidth: PropTypes.number

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: PropTypes.array  # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked

  constructor: (props) ->
    super(props)

    @state = {
      validDesign: null     # last valid design
      data: null            # data for chart
      dataLoading: false    # True when loading data
      dataError: null       # Set when data loading returned error
      cacheExpiry: props.dataSource.getCacheExpiry()  # Save cache expiry to see if changes
    }

    # Ensure that only one load at a time
    @loadData = asyncLatest(@loadData, { serial: true })

    @state = {}

  componentDidMount: ->
    @updateData(@props)

  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.design, @props.design) or not _.isEqual(nextProps.filters, @props.filters) or nextProps.dataSource.getCacheExpiry() != @state.cacheExpiry
      # Save new cache expiry
      @setState(cacheExpiry: nextProps.dataSource.getCacheExpiry())

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
          design: @state.validDesign
          onDesignChange: @props.onDesignChange
          data: @state.data
          scope: @props.scope
          onScopeChange: @props.onScopeChange
          width: @props.width
          height: @props.height
          standardWidth: @props.standardWidth
          onRowClick: @props.onRowClick
          filters: @props.filters
          })
      if @state.dataLoading
        @renderSpinner()
