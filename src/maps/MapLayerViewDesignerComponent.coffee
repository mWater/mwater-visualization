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
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use
    connectDragSource: React.PropTypes.func    # connector for reorderable

  constructor: (props) ->
    super(props)

    layer = LayerFactory.createLayer(@props.layerView.type)

    @state = { 
      editing: layer.isIncomplete(@props.layerView.design, @props.schema) # Editing initially if incomplete
    }

  update: (updates) ->
    @props.onLayerViewChange(_.extend({}, @props.layerView, updates))

  handleVisibleClick: (index) =>
    @update(visible: not @props.layerView.visible)

  handleToggleEditing: => @setState(editing: not @state.editing)
  handleSaveEditing: (design) => @update(design: design)

  handleRename: =>
    name = prompt("Enter new name", @props.layerView.name)
    if name
      @update(name: name)

  renderVisible: ->
    if @props.layerView.visible
      H.i className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }, onClick: @handleVisibleClick
    else
      H.i className: "fa fa-fw fa-square", style: { color: "#DDDDDD" }, onClick: @handleVisibleClick

  renderName: ->
    H.span className: "hover-display-parent",
      "\u00A0"
      @props.layerView.name
      " "
      H.a className: "hover-display-child glyphicon glyphicon-pencil", onClick: @handleRename

  renderEditor: ->
    layer = LayerFactory.createLayer(@props.layerView.type)
    return H.div null,
      H.div style: { textAlign: "right" },
        H.a className: "btn btn-link btn-xs", onClick: @props.onRemove, "Delete Layer"
      @renderOpacityControl()
      if layer.isEditable(@props.layerView.design)
        layer.createDesignerElement({
          design: @props.layerView.design
          schema: @props.schema
          dataSource: @props.dataSource
          onDesignChange: @handleSaveEditing
        })

  renderLayerEditToggle: ->
    layer = LayerFactory.createLayer(@props.layerView.type)

    H.div style: { float: "right" }, key: "gear",
      H.a onClick: @handleToggleEditing,
        if @state.editing
          H.i className: "fa fa-caret-square-o-up"
        else
          H.i className: "fa fa-caret-square-o-down"

  # renderLayerGearMenu: ->
  #   layer = LayerFactory.createLayer(@props.layerView.type)
  #   if not layer.isEditable()
  #     return 

  #   H.div className: "btn-group", style: { float: "right" }, key: "gear",
  #     H.button type: "button", className: "btn btn-link dropdown-toggle", "data-toggle": "dropdown",
  #       H.span className: "glyphicon glyphicon-cog"
  #     H.ul className: "dropdown-menu dropdown-menu-right",
  #       H.li(key: "rename", H.a(onClick: @handleRename, "Rename Layer"))
  #       if layer.isEditable()
  #         H.li(key: "edit", H.a(onClick: @handleStartEditing, "Edit Layer"))
  #       # H.li(key: "opacity", H.a(null, "Set Opacity"))
  #       H.li(key: "remove", H.a(onClick: @props.onRemove, "Remove Layer"))

  handleOpacityChange: (newValue) =>
    @update( opacity: newValue )

  renderOpacityControl: ->
    H.div className: 'form-group',
      H.label className: 'text-muted',
        H.span null,
          "Opacity: #{@props.layerView.opacity}"
      H.div style: {padding: '10px'},
        React.createElement(Rcslider,
          min: 0
          max: 1
          step: 0.1
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: @props.layerView.opacity,
          onChange: @handleOpacityChange
        )

  render: ->
    layer = LayerFactory.createLayer(@props.layerView.type)
    style =
      cursor: "move"
      marginRight: 8
      opacity: 0.6
      # float: "right"

    H.div null,
      H.div style: { fontSize: 16 }, key: "layerView", className: "hover-display-parent",
        if @props.connectDragSource
          @props.connectDragSource(H.i(className: "fa fa-bars hover-display-child", style: style))
        @renderLayerEditToggle()
        @renderVisible()
        @renderName()
      if @state.editing
        @renderEditor()

