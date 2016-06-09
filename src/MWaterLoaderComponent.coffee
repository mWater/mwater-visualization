_ = require 'lodash'
React = require 'react'
H = React.DOM

Schema = require('mwater-expressions').Schema
LayerFactory = require './maps/LayerFactory'
WidgetFactory = require './widgets/WidgetFactory'
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource')
MWaterTableSelectComponent = require './MWaterTableSelectComponent'
querystring = require 'querystring'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Loads an mWater schema from the server and creates child with schema and related items passed in.
# Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
module.exports = class MWaterLoaderComponent extends AsyncLoadComponent
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string
    user: React.PropTypes.string                              # user id of logged in user

    extraTables: React.PropTypes.arrayOf(React.PropTypes.string)  # Extra tables to load in schema. Forms are not loaded by default as they are too many
    onExtraTablesChange: React.PropTypes.func                     # Called when extra tables are changed and schema should be reloaded

    onMarkerClick: React.PropTypes.func                       # Called with (table, id)
    newLayers: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired
      type: React.PropTypes.string.isRequired
      design: React.PropTypes.object.isRequired
    }))

    children: React.PropTypes.func.isRequired                 # Called with (error, { schema:, dataSource:, widgetFactory:, layerFactory: })

  @defaultProps:
    newLayers: [
      { label: "Custom Marker Layer", name: "Untitled Layer", type: "Markers", design: { } }
      {
        label: "Choropleth Indicator Layer (experimental)"
        name: "Untitled Layer"
        type: "AdminIndicatorChoropleth"
        design: { }
      }
    ]

  constructor: ->
    super
    @state = {
      error: null
      schema: null
      dataSource: null
      widgetFactory: null
      layerFactory: null
    }

    @mounted = false

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    return not _.isEqual(_.pick(newProps, "apiUrl", "client", "user", "extraTables"), _.pick(oldProps, "apiUrl", "client", "user", "extraTables"))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Load schema
    url = props.apiUrl + "jsonql/schema"

    query = {}
    if props.client
      query.client = props.client
    if props.extraTables and props.extraTables.length > 0
      query.extraTables = props.extraTables.join(',')

    url += "?" + querystring.stringify(query)

    $.getJSON url, (schemaJson) =>
      schema = new Schema(schemaJson)
      dataSource = new MWaterDataSource(props.apiUrl, props.client, { serverCaching: false, localCaching: true })

      layerFactory = new LayerFactory(props.newLayers)

      widgetFactory = new WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory) 

      callback({
        schema: schema
        dataSource: dataSource
        layerFactory: layerFactory
        widgetFactory: widgetFactory
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
      layerFactory: @state.layerFactory
      widgetFactory: @state.widgetFactory
    })
