React = require 'react'
H = React.DOM

# Loads data from queries, showing an faded version of the last valid
# version until the data is loaded
module.exports = class QueryDataLoadingComponent extends React.Component
  @propTypes: 
    elemFactory: React.PropTypes.func # Takes data and produces React element. Null for none available
    queries: React.PropTypes.any  # Current queries to give to data source
    dataSource: React.PropTypes.func.isRequired # Takes queries and callback with data in Node-style i.e. (err, data)

  constructor: (props) ->
    super
    @state = { currentElem: null, loadingQueries: null }

  componentDidMount: ->
    @update()

  componentDidUpdate: (prevProps, prevState) ->
    # Only update if changed
    if prevProps.elemFactory != @props.elemFactory or not _.isEqual(@props.queries, prevProps.queries)
      @update()

  update: (prevProps, prevState) ->
    # If loading, do nothing
    if @state.loadingQueries
      return

    # Start loading if elemFactory and queries
    if @props.elemFactory and @props.queries
      loadingQueries = @props.queries

      @setState(loadingQueries: loadingQueries)

      @props.dataSource(@props.queries, (err, data) =>
        # If queries matches the ones we are loading
        if _.isEqual(loadingQueries, @props.queries)
          # Handle error
          if err
            @setState(currentElem: H.div(className: "alert alert-danger", "Error loading data"), loadingQueries: null)
          else
            # Create element
            elem = @props.elemFactory(data)
            @setState(currentElem: elem, loadingQueries: null)
        else
          # Start another query
          @setState(loadingQueries: null)
          @update()
      )

  render: ->
    style = { width: "100%", height: "100%" }

    if @state.loadingQueries
      style.opacity = 0.5

    if not @props.elemFactory or not @props.queries
      # Invalid. Show faded with background
      style.backgroundColor = "#E8E8E8"
      style.opacity = 0.35

    return H.div style: style, @state.currentElem