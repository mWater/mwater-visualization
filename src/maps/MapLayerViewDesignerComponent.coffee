React = require 'react'
H = React.DOM
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')

# A single row in the table of layer views. Handles the editor state
module.exports = class MapLayerViewDesignerComponent extends React.Component
  @propTypes:
    layerView: React.PropTypes.object.isRequired  # See Map Design.md
    onLayerViewChange: React.PropTypes.func.isRequired # Called with new layer view
    onRemove: React.PropTypes.func.isRequired # Called to remove
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use

  constructor: ->
    super

    layer = @props.layerFactory.createLayer(@props.layerView.type, @props.layerView.design)

    @state = { 
      editing: layer.isIncomplete() # Editing initially if incomplete
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
    layer = @props.layerFactory.createLayer(@props.layerView.type, @props.layerView.design)
    return H.div style: { paddingTop: 10 },
      layer.createDesignerElement(onDesignChange: @handleSaveEditing)

  renderLayerEditToggle: ->
    layer = @props.layerFactory.createLayer(@props.layerView.type, @props.layerView.design)

    if not layer.isEditable()
      return 

    H.div style: { float: "right" }, key: "gear", 
      H.a onClick: @handleToggleEditing,
        if @state.editing
          H.i className: "fa fa-caret-square-o-up"
        else
          H.i className: "fa fa-caret-square-o-down"

  # renderLayerGearMenu: ->
  #   layer = @props.layerFactory.createLayer(@props.layerView.type, @props.layerView.design)
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

  render: ->
    layer = @props.layerFactory.createLayer(@props.layerView.type, @props.layerView.design)

    H.div null, 
      H.div style: { fontSize: 16 }, key: "layerView",
        if layer.isEditable()
          @renderLayerEditToggle()
        @renderVisible()
        @renderName()
      if @state.editing
        @renderEditor()

