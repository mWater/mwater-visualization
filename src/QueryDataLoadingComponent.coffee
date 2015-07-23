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

  render: ->
    return H.div null, "hello"