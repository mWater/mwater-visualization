React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
MapDesignerComponent = require '../maps/MapDesignerComponent'
MapViewComponent = require '../maps/MapViewComponent'
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')

# Design is the map design specified in maps/Map Design.md
module.exports = class MapWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  onRemove: called when widget is removed
  #  onDuplicate: called when widget is duplicated
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #
  # Element will have the following props injected:
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  #  connectMoveHandle:  Connects move handle for dragging (see WidgetContainerComponent)
  #  connectResizeHandle: Connects resize handle for dragging (see WidgetContainerComponent)
  createViewElement: (options) ->
    return React.createElement(MapWidgetComponent,
      schema: options.schema
      dataSource: options.dataSource
      widgetDataSource: options.widgetDataSource

      design: options.design
      onDesignChange: options.onDesignChange
      onRemove: options.onRemove
      filters: options.filters
    )

class MapWidgetComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    widgetDataSource: React.PropTypes.object.isRequired

    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func # Called with new design.  null/undefined for readonly

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
      widgetDataSource: @props.widgetDataSource
      design: @props.design
      onDesignChange: @props.onDesignChange
      filters: @props.filters
      width: width
      height: height
    })

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })
    if @props.onRemove?
      dropdownItems.push({ label: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: @props.onRemove })

    # Wrap in a simple widget
    return H.div null,
      if @props.onDesignChange?
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
    widgetDataSource: React.PropTypes.object.isRequired

    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func  # Called with new design. null/undefined for readonly

    width: React.PropTypes.number
    height: React.PropTypes.number

    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  render: ->
    # Create mapUrlSource
    mapUrlSource = {
      getTileUrl: (layerId, filters) =>
        return @props.widgetDataSource.getTileUrl(layerId, filters)
      getUtfGridUrl: (layerId, filters) =>
        return @props.widgetDataSource.getUtfGridUrl(layerId, filters)
    }

    H.div style: { width: @props.width, height: @props.height, padding: 10 },
      React.createElement(MapViewComponent, {
        schema: @props.schema
        design: @props.design
        mapUrlSource: mapUrlSource
        onDesignChange: @props.onDesignChange
        extraFilters: @props.filters
        width: @props.width - 20
        height: @props.height - 20
        touchZoom: false    # Prevent accidental zooming
        scrollWheelZoom: false # Prevent accidental zooming
      })
