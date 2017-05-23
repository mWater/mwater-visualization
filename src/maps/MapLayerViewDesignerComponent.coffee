React = require 'react'
H = React.DOM
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
Rcslider = require 'rc-slider'
LayerFactory = require './LayerFactory'

# A single row in the table of layer views. Handles the editor state
module.exports = class MapLayerViewDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    layerView: React.PropTypes.object.isRequired  # See Map Design.md
    onLayerViewChange: React.PropTypes.func.isRequired # Called with new layer view
    onRemove: React.PropTypes.func.isRequired  # Called to remove
    connectDragSource: React.PropTypes.func    # connector for reorderable
    connectDragPreview: React.PropTypes.func  #connector for reorderable
    connectDropTarget: React.PropTypes.func # connector for reorderable
    allowEditingLayer: React.PropTypes.bool.isRequired

    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"

    # Gets available system actions for a table. Called with (tableId). 
    # Returns [{ id: id of action, name: name of action, multiple: true if for multiple rows support, false for single }]
    getSystemActions: React.PropTypes.func 

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func # Sets popups of dashboard. If not set, readonly
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

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
          onSystemAction: @props.onSystemAction
          getSystemActions: @props.getSystemActions
          popups: @props.popups
          onPopupsChange: @props.onPopupsChange
          namedStrings: @props.namedStrings
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

