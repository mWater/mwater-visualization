PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

Schema = require('mwater-expressions').Schema
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource')
MWaterTableSelectComponent = require './MWaterTableSelectComponent'
MWaterAddRelatedFormComponent = require './MWaterAddRelatedFormComponent'
querystring = require 'querystring'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'
LoadingComponent = require 'react-library/lib/LoadingComponent'
mWaterLoader = require './mWaterLoader'

# Loads an mWater schema from the server and creates child with schema and dataSource
# Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
module.exports = class MWaterLoaderComponent extends AsyncLoadComponent
  @propTypes:
    apiUrl: PropTypes.string.isRequired
    client: PropTypes.string
    share: PropTypes.string
    user: PropTypes.string                              # user id of logged in user
    asUser: PropTypes.string                            # Load schema as a specific user (for shared dashboards, etc)

    extraTables: PropTypes.arrayOf(PropTypes.string)  # Extra tables to load in schema. Forms are not loaded by default as they are too many
    onExtraTablesChange: PropTypes.func                     # Called when extra tables are changed and schema should be reloaded

    # Override default add layer component. See AddLayerComponent for details
    addLayerElementFactory: PropTypes.func              

    children: PropTypes.func.isRequired                 # Called with (error, { schema:, dataSource: })

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
    # Load schema and data source
    mWaterLoader({
      apiUrl: props.apiUrl
      client: props.client
      share: props.share
      asUser: props.asUser
      extraTables: props.extraTables
      }, (error, config) =>
        if error
          console.log error.message
          return callback(error: "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you?")
        callback({ schema: config.schema, dataSource: config.dataSource })
    )

  @childContextTypes: 
    tableSelectElementFactory: PropTypes.func
    addLayerElementFactory: PropTypes.func
    # Decorates sections (the children element, specifically) in the expression picker
    decorateScalarExprTreeSectionChildren: PropTypes.func
  
  getChildContext: ->
    context = {}

    context.tableSelectElementFactory = (schema, value, onChange) =>
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

    if @props.addLayerElementFactory
      context.addLayerElementFactory = @props.addLayerElementFactory

    context.decorateScalarExprTreeSectionChildren = (options) =>
      # If related forms section of entities table
      if options.tableId.match(/^entities\./) and options.section.id == "!related_forms"
        return H.div null,
          options.children
          R MWaterAddRelatedFormComponent, 
            table: options.tableId
            apiUrl: @props.apiUrl
            client: @props.client
            user: @props.user
            schema: @state.schema
            onSelect: @handleAddTable

      else
        return options.children

    return context

  handleAddTable: (table) =>
    extraTables = _.union(@props.extraTables, [table])
    @props.onExtraTablesChange(extraTables)

  render: ->
    if not @state.schema and not @state.error
      return React.createElement(LoadingComponent)

    return @props.children(@state.error, {
      schema: @state.schema
      dataSource: @state.dataSource
    })

