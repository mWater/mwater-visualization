_ = require 'lodash'
React = require 'react'
H = React.DOM

Schema = require('mwater-expressions').Schema
LayerFactory = require './maps/LayerFactory'
WidgetFactory = require './widgets/WidgetFactory'
MWaterDataSource = require './MWaterDataSource'
MWaterTableSelectComponent = require './MWaterTableSelectComponent'
querystring = require 'querystring'

# Loads an mWater schema from the server and creates child with schema and related items passed in.
# Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
module.exports = class MWaterLoaderComponent extends React.Component
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string
    user: React.PropTypes.string                              # username of logged in user

    formIds: React.PropTypes.arrayOf(React.PropTypes.string)  # Forms to load in schema
    onFormIdsChange: React.PropTypes.func.isRequired          # Called when form ids are changed and schema should be reloaded

    onMarkerClick: React.PropTypes.func                       # Called with (table, id)

    children: React.PropTypes.func.isRequired                 # Called with { schema:, dataSource:, widgetFactory:, layerFactory: }

  constructor: ->
    super
    @state = {
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
    url = @props.apiUrl + "jsonql/schema"

    query = {}
    if @props.client
      query.client = @props.client
    if @props.formIds and @props.formIds.length > 0
      query.formIds = @props.formIds.join(',')

    url += "?" + querystring.stringify(query)

    $.getJSON url, (schemaJson) =>
      if not @mounted
        return

      schema = new Schema(schemaJson)
      dataSource = new MWaterDataSource(@props.apiUrl, @props.client, false)

      layerFactory = new LayerFactory({
        schema: schema
        dataSource: dataSource
        apiUrl: @props.apiUrl
        client: @props.client
        newLayers: [
          { name: "Custom Layer", type: "Markers", design: {} }
        ]
        onMarkerClick: @props.onMarkerClick
      })

      widgetFactory = new WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory) 

      @setState({
        schema: schema
        dataSource: dataSource
        layerFactory: layerFactory
        widgetFactory: widgetFactory
        })
    # TODO error handling

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
        )
    }

  render: ->
    if not @state.schema
      return H.div null, "Loading..."

    return @props.children({
      schema: @state.schema
      dataSource: @state.dataSource
      layerFactory: @state.layerFactory
      widgetFactory: @state.widgetFactory
    })
