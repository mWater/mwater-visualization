React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
MapDesignerComponent = require '../maps/MapDesignerComponent'
MapViewComponent = require '../maps/MapViewComponent'

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

  handleStartEditing: =>
    @refs.simpleWidget.displayEditor()

  render: ->
    dropdownItems = [
      { label: "Edit", icon: "pencil", onClick: @handleStartEditing }
      { label: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: @props.onRemove }
    ]

    # Create editor
    editor = React.createElement(MapDesignerComponent, 
      schema: @props.schema
      dataSource: @props.dataSource
      layerFactory: @props.layerFactory
      design: @props.design
      onDesignChange: @props.onDesignChange
    )

    # Wrap in a simple widget
    return React.createElement(SimpleWidgetComponent, 
      ref: "simpleWidget"
      editor: editor
      width: @props.width
      height: @props.height
      connectMoveHandle: @props.connectMoveHandle
      connectResizeHandle: @props.connectResizeHandle
      dropdownItems: dropdownItems,
        React.createElement(InnerMapWidgetComponent, {
          schema: @props.schema
          layerFactory: @props.layerFactory
          design: @props.design
          onDesignChange: @props.onDesignChange
          filters: @props.filters
        })
      )

class InnerMapWidgetComponent extends React.Component
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
