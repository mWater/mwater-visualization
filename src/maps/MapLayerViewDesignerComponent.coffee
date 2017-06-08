PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
Rcslider = require 'rc-slider'
LayerFactory = require './LayerFactory'

# A single row in the table of layer views. Handles the editor state
module.exports = class MapLayerViewDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    layerView: PropTypes.object.isRequired  # See Map Design.md
    onLayerViewChange: PropTypes.func.isRequired # Called with new layer view
    onRemove: PropTypes.func.isRequired  # Called to remove
    connectDragSource: PropTypes.func    # connector for reorderable
    connectDragPreview: PropTypes.func  #connector for reorderable
    connectDropTarget: PropTypes.func # connector for reorderable
    allowEditingLayer: PropTypes.bool.isRequired
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  constructor: (props) ->
    super(props)

    layer = LayerFactory.createLayer(@props.layerView.type)

    @state = { 
      editing: props.allowEditingLayer and layer.isIncomplete(@props.layerView.design, @props.schema) # Editing initially if incomplete
    }

  update: (updates) ->
    @props.onLayerViewChange(_.extend({}, @props.layerView, updates))

  handleVisibleClick: (index) =>
    @update(visible: not @props.layerView.visible)

  handleToggleEditing: => @setState(editing: not @state.editing)
  handleSaveEditing: (design) => @update(design: design)

  handleRename: =>
    if @props.allowEditingLayer
      name = prompt("Enter new name", @props.layerView.name)
      if name
        @update(name: name)

  renderVisible: ->
    if @props.layerView.visible
      H.i className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }, onClick: @handleVisibleClick
    else
      H.i className: "fa fa-fw fa-square", style: { color: "#DDDDDD" }, onClick: @handleVisibleClick

  renderName: ->
    H.span className: "hover-display-parent", onClick: @handleRename, style: { cursor: "pointer" },
      @props.layerView.name
      " "
      H.span className: "hover-display-child glyphicon glyphicon-pencil text-muted"

  renderEditor: ->
    layer = LayerFactory.createLayer(@props.layerView.type)
    return H.div null,
      if layer.isEditable()
        layer.createDesignerElement({
          design: @props.layerView.design
          schema: @props.schema
          dataSource: @props.dataSource
          onDesignChange: @handleSaveEditing
          filters: @props.filters
        })
      @renderOpacityControl()

  renderLayerEditToggle: ->
    return H.div key: "edit", style: { marginBottom: (if @state.editing then 10) },
      H.a onClick: @handleToggleEditing, style: { fontSize: 12, cursor: "pointer" },
        if @state.editing
          [
            H.i className: "fa fa-caret-up"
            " Close"
          ]
        else
          [
            H.i className: "fa fa-cog"
            " Customize..."
          ]

  handleOpacityChange: (newValue) =>
    @update(opacity: newValue/100)

  handleRemove: =>
    if confirm("Delete layer?")
      @props.onRemove()

  renderOpacityControl: ->
    H.div className: 'form-group', style: { paddingTop: 10 },
      H.label className: 'text-muted',
        H.span null,
          "Opacity: #{Math.round(@props.layerView.opacity * 100) }%"
      H.div style: {padding: '10px'},
        React.createElement(Rcslider,
          min: 0
          max: 100
          step: 1
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: @props.layerView.opacity * 100,
          onChange: @handleOpacityChange
        )

  renderDeleteLayer: ->
    H.div style: { float: "right", cursor: "pointer", marginLeft: 10 }, key: "delete",
      H.a onClick: @handleRemove,
        H.i className: "fa fa-remove"

  render: ->
    layer = LayerFactory.createLayer(@props.layerView.type)
    style =
      cursor: "move"
      marginRight: 8
      opacity: 0.5
      # float: "right"

    @props.connectDragPreview(@props.connectDropTarget(H.div null,
      H.div style: { fontSize: 16 }, key: "layerView",
        if @props.connectDragSource
          @props.connectDragSource(H.i(className: "fa fa-bars", style: style))
        if @props.allowEditingLayer
          @renderDeleteLayer()
        @renderVisible()
        "\u00A0"
        @renderName()
      if @props.allowEditingLayer
        @renderLayerEditToggle()
      if @state.editing
        @renderEditor()
    ))

