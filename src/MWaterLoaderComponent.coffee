PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

Schema = require('mwater-expressions').Schema
querystring = require 'querystring'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'
LoadingComponent = require 'react-library/lib/LoadingComponent'
mWaterLoader = require './mWaterLoader'
MWaterContextComponent = require './MWaterContextComponent'

# Loads an mWater schema from the server and creates child with schema and dataSource
# Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
# and several other context items
module.exports = class MWaterLoaderComponent extends AsyncLoadComponent
  @propTypes:
    apiUrl: PropTypes.string.isRequired
    client: PropTypes.string
    share: PropTypes.string
    user: PropTypes.string                              # user id of logged in user
    asUser: PropTypes.string                            # Load schema as a specific user (for shared dashboards, etc)

    extraTables: PropTypes.arrayOf(PropTypes.string)  # Extra tables to load in schema. Forms are not loaded by default as they are too many
    onExtraTablesChange: PropTypes.func                     # Called when extra tables are changed and schema will be reloaded

    # Override default add layer component. See AddLayerComponent for details
    addLayerElementFactory: PropTypes.func              

    children: PropTypes.func.isRequired                 # Called with (error, { schema:, dataSource: })
    errorFormatter: PropTypes.func    # Custom error formatter that returns React node or string, gets passed the error response from server

  constructor: (props) ->
    super(props)
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
    # Load schema and data source
    mWaterLoader({
      apiUrl: props.apiUrl
      client: props.client
      share: props.share
      asUser: props.asUser
      extraTables: props.extraTables
      }, (error, config) =>
        if error
          defaultError = "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you? Details: #{error.message}"
          if @props.errorFormatter
            return callback(error: @props.errorFormatter(JSON.parse(error.message), defaultError))
          return callback(error: defaultError)
        callback({ schema: config.schema, dataSource: config.dataSource })
    )

  render: ->
    if not @state.schema and not @state.error
      return React.createElement(LoadingComponent)

    # Inject context
    return R MWaterContextComponent, 
      apiUrl: @props.apiUrl
      client: @props.client
      user: @props.user
      schema: @state.schema
      extraTables: @props.extraTables
      onExtraTablesChange: @props.onExtraTablesChange
      addLayerElementFactory: @props.addLayerElementFactory,
        @props.children(@state.error, {
          schema: @state.schema
          dataSource: @state.dataSource
        })