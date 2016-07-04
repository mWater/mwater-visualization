_ = require 'lodash'
React = require 'react'
H = React.DOM

Schema = require('mwater-expressions').Schema
LayerFactory = require './maps/LayerFactory'
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource')
MWaterTableSelectComponent = require './MWaterTableSelectComponent'
querystring = require 'querystring'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Loads an mWater schema from the server and creates child with schema and dataSource
# Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
module.exports = class MWaterLoaderComponent extends AsyncLoadComponent
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string
    share: React.PropTypes.string
    user: React.PropTypes.string                              # user id of logged in user
    asUser: React.PropTypes.string                            # Load schema as a specific user (for shared dashboards, etc)

    extraTables: React.PropTypes.arrayOf(React.PropTypes.string)  # Extra tables to load in schema. Forms are not loaded by default as they are too many
    onExtraTablesChange: React.PropTypes.func                     # Called when extra tables are changed and schema should be reloaded

    children: React.PropTypes.func.isRequired                 # Called with (error, { schema:, dataSource: })

  constructor: ->
    super
    @state = {
      error: null
      schema: null
      dataSource: null
    }

    @mounted = false

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    return not _.isEqual(_.pick(newProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"), _.pick(oldProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Load schema
    query = {}
    if props.client
      query.client = props.client
    if props.share
      query.share = props.share
    if props.asUser
      query.asUser = props.asUser
    if props.extraTables and props.extraTables.length > 0
      query.extraTables = props.extraTables.join(',')

    url = props.apiUrl + "jsonql/schema?" + querystring.stringify(query)

    $.getJSON url, (schemaJson) =>
      schema = new Schema(schemaJson)
      dataSource = new MWaterDataSource(props.apiUrl, props.client, { serverCaching: false, localCaching: true })

      callback({
        schema: schema
        dataSource: dataSource
        })
    .fail (xhr) =>
      console.log xhr.responseText
      callback(error: "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you?")

  @childContextTypes: 
    tableSelectElementFactory: React.PropTypes.func
  
  getChildContext: ->
    { 
      tableSelectElementFactory: (schema, value, onChange) =>
        return React.createElement(MWaterTableSelectComponent,
          apiUrl: @props.apiUrl
          client: @props.client
          schema: schema
          user: @props.user
          table: value
          onChange: onChange
          extraTables: @props.extraTables
          onExtraTablesChange: @props.onExtraTablesChange
        )
    }

  render: ->
    if not @state.schema and not @state.error
      return H.div null, "Loading..."

    return @props.children(@state.error, {
      schema: @state.schema
      dataSource: @state.dataSource
    })
