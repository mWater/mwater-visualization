React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
MapDesignerComponent = require '../maps/MapDesignerComponent'
MapViewComponent = require '../maps/MapViewComponent'
ModalWindowComponent = require '../ModalWindowComponent'

module.exports = class MapWidget extends Widget
  # design, schema, dataSource, layerFactory
  constructor: (options) ->
    @schema = options.schema
    @design = options.design
    @dataSource = options.dataSource
    @layerFactory = options.layerFactory

  # Creates a view of the widget
  # options:
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design
  createViewElement: (options) ->
    return React.createElement(MapWidgetComponent,
      schema: @schema
      dataSource: @dataSource
      layerFactory: @layerFactory

      design: @design
      onDesignChange: options.onDesignChange
      onRemove: options.onRemove
      filters: options.filters
    )

class MapWidgetComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use

    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

    onRemove: React.PropTypes.func

    width: React.PropTypes.number
    height: React.PropTypes.number

    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  constructor: (props) ->
    super
    @state = { 
      # True when editing map
      editing: false
    }  

  handleStartEditing: =>
    @setState(editing: true)

  renderEditor: ->
    # Create editor
    editor = React.createElement(MapDesignerComponent, 
      schema: @props.schema
      dataSource: @props.dataSource
      layerFactory: @props.layerFactory
      design: @props.design
      onDesignChange: @props.onDesignChange
    )

    # Create map (maxing out at half of width of screen)
    width = Math.min(document.body.clientWidth/2, @props.width)
    chart = @renderContent(width, @props.height)

    content = H.div style: { height: "100%", width: "100%" },
      H.div style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: width + 20, height: @props.height + 20 },
        chart
      H.div style: { width: "100%", height: "100%", paddingLeft: width + 40 },
        H.div style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
          editor

    React.createElement(ModalWindowComponent,
      isOpen: @state.editing
      onRequestClose: (=> @setState(editing: false)),
        content)

  renderContent: (width, height) ->
    React.createElement(InnerMapWidgetComponent, {
      schema: @props.schema
      layerFactory: @props.layerFactory
      design: @props.design
      onDesignChange: @props.onDesignChange
      filters: @props.filters
      width: width
      height: height
    })

  render: ->
    dropdownItems = [
      { label: "Edit", icon: "pencil", onClick: @handleStartEditing }
      { label: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: @props.onRemove }
    ]

    # Wrap in a simple widget
    return H.div null,
      @renderEditor()
      React.createElement(SimpleWidgetComponent, 
        width: @props.width
        height: @props.height
        connectMoveHandle: @props.connectMoveHandle
        connectResizeHandle: @props.connectResizeHandle
        dropdownItems: dropdownItems,
          @renderContent()
      )

class InnerMapWidgetComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use

    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

    onRemove: React.PropTypes.func

    width: React.PropTypes.number
    height: React.PropTypes.number

    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  render: ->
    H.div style: { width: @props.width, height: @props.height, padding: 10 },
      React.createElement(MapViewComponent, {
        schema: @props.schema
        layerFactory: @props.layerFactory
        design: @props.design
        onDesignChange: @props.onDesignChange
        extraFilters: @props.filters
        width: @props.width - 20
        height: @props.height - 20
      })
