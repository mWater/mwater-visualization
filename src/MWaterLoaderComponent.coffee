_ = require 'lodash'
React = require 'react'
H = React.DOM

Schema = require('mwater-expressions').Schema
LayerFactory = require './maps/LayerFactory'
WidgetFactory = require './widgets/WidgetFactory'
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource')
MWaterTableSelectComponent = require './MWaterTableSelectComponent'
querystring = require 'querystring'

# Loads an mWater schema from the server and creates child with schema and related items passed in.
# Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
module.exports = class MWaterLoaderComponent extends React.Component
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string
    user: React.PropTypes.string                              # username of logged in user

    formIds: React.PropTypes.arrayOf(React.PropTypes.string)  # Forms to load in schema. Forms are not loaded by default as they are too many
    onFormIdsChange: React.PropTypes.func                     # Called when form ids are changed and schema should be reloaded

    onMarkerClick: React.PropTypes.func                       # Called with (table, id)
    newLayers: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired
      type: React.PropTypes.string.isRequired
      design: React.PropTypes.object.isRequired
    }))

    children: React.PropTypes.func.isRequired                 # Called with (error, { schema:, dataSource:, widgetFactory:, layerFactory: })

  @defaultProps:
    newLayers: [{ label: "Custom Layer", name: "Untitled Layer", type: "Markers", design: { } }]

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

  componentDidMount: ->
    @mounted = true
    
    @updateSchema(@props, null)

  componentWillReceiveProps: (nextProps) ->
    @updateSchema(nextProps, @props)

  componentWillUnmount: ->
    @mounted = false

  # Load the schema if the formIds have changed
  updateSchema: (newProps, oldProps) ->
    # Do nothing if not changed
    if oldProps and _.isEqual(newProps.formIds, oldProps.formIds)
      return

    # Load schema
    url = newProps.apiUrl + "jsonql/schema"

    query = {}
    if newProps.client
      query.client = newProps.client
    if newProps.formIds and newProps.formIds.length > 0
      query.formIds = newProps.formIds.join(',')

    url += "?" + querystring.stringify(query)

    $.getJSON url, (schemaJson) =>
      if not @mounted
        return

      schema = new Schema(schemaJson)
      dataSource = new MWaterDataSource(newProps.apiUrl, newProps.client, { serverCaching: false, localCaching: true })

      layerFactory = new LayerFactory({
        schema: schema
        dataSource: dataSource
        apiUrl: newProps.apiUrl
        client: newProps.client
        newLayers: newProps.newLayers
        onMarkerClick: newProps.onMarkerClick
      })

      widgetFactory = new WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory) 

      @setState({
        schema: schema
        dataSource: dataSource
        layerFactory: layerFactory
        widgetFactory: widgetFactory
        })
    .fail (xhr) =>
      console.log xhr.responseText
      @setState(error: "Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you?")

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
          formIds: @props.formIds
          onFormIdsChange: @props.onFormIdsChange
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
