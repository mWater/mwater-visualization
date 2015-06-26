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
  createViewElement: (options) ->
    # Wrap in a chart widget
    return React.createElement(ChartWidgetComponent, {
      chart: @chart
      dataSource: @dataSource
      design: @design
      width: options.width
      height: options.height
    })

  createDesignerElement: (options) ->
    throw new Error("Not implemented")

class ChartWidgetComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    design: React.PropTypes.object.isRequired # Design of chart
    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

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
    queries = props.chart.createQueries(props.design)

    # Skip if same
    if _.isEqual(queries, @state.dataQueries)
      return

    # Call data source
    @setState(data: null, dataQueries: null, dataError: null)
    props.dataSource.fetchData(queries, (err, data) =>
      if err
        @setState(data: null, dataQueries: null, dataError: err)
      else
        @setState(data: data, dataQueries: queries, dataError: null)
      )

  render: ->
    # Check if design is invalid
    results = @props.chart.validateDesign(@props.design)
    if results
      return H.div style: { width: @props.width, height: @props.height },
        "Invalid design: "
        results

    # If data error, display
    if @state.dataError
      return H.div style: { width: @props.width, height: @props.height },
        "Error loading data: "
        @state.dataError.toString()

    # If no data, loading
    if not @state.data
      return H.div style: { width: @props.width, height: @props.height },
        "Loading..."

    chartElem = @props.chart.createViewElement({
      design: @props.design
      data: @state.data
      width: @props.width
      height: @props.height
    })

    H.div style: { width: @props.width, height: @props.height },
      chartElem