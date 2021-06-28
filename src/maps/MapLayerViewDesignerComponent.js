_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
Rcslider = require('rc-slider').default
LayerFactory = require './LayerFactory'
ui = require('react-library/lib/bootstrap')
PopoverHelpComponent = require 'react-library/lib/PopoverHelpComponent'

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

  handleVisibleClick: =>
    @update(visible: not @props.layerView.visible)

  handleHideLegend: (hideLegend) =>
    @update(hideLegend: hideLegend)

  handleGroupChange: (group) =>
    @update(group: group)

  handleToggleEditing: => @setState(editing: not @state.editing)
  handleSaveEditing: (design) => @update(design: design)

  handleRename: =>
    if @props.allowEditingLayer
      name = prompt("Enter new name", @props.layerView.name)
      if name
        @update(name: name)

  renderVisible: ->
    if @props.layerView.visible
      R 'i', className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }, onClick: @handleVisibleClick
    else
      R 'i', className: "fa fa-fw fa-square", style: { color: "#DDDDDD" }, onClick: @handleVisibleClick

  renderAdvanced: ->
    R 'div', key: "advanced", style: { display: "grid", gridTemplateColumns: "50% auto auto 1fr", alignItems: "center", columnGap: 5 },
      R ui.Checkbox, value: @props.layerView.hideLegend, onChange: @handleHideLegend, inline: true,
        "Hide Legend"
      R 'label', className: "text-muted", key: "label",
        "Group:"
      R ui.TextInput, key: "input", value: @props.layerView.group, onChange: @handleGroupChange, style: { width: "5em" }, placeholder: "None"
      R 'div', null,
        R PopoverHelpComponent, placement: "top", key: "help",
          '''Layers in the same group can only be selected one at a time'''

  renderName: ->
    R 'span', className: "hover-display-parent", onClick: @handleRename, style: { cursor: "pointer" },
      @props.layerView.name
      " "
      R 'span', className: "hover-display-child glyphicon glyphicon-pencil text-muted"

  renderEditor: ->
    layer = LayerFactory.createLayer(@props.layerView.type)
    return R 'div', null,
      if layer.isEditable()
        layer.createDesignerElement({
          design: @props.layerView.design
          schema: @props.schema
          dataSource: @props.dataSource
          onDesignChange: @handleSaveEditing
          filters: @props.filters
        })
      @renderOpacityControl()
      @renderAdvanced()

  renderLayerEditToggle: ->
    return R 'div', key: "edit", style: { marginBottom: (if @state.editing then 10) },
      R 'a', onClick: @handleToggleEditing, style: { fontSize: 12, cursor: "pointer" },
        if @state.editing
          [
            R 'i', className: "fa fa-caret-up"
            " Close"
          ]
        else
          [
            R 'i', className: "fa fa-cog"
            " Customize..."
          ]

  handleOpacityChange: (newValue) =>
    @update(opacity: newValue/100)

  handleRemove: =>
    if confirm("Delete layer?")
      @props.onRemove()

  renderOpacityControl: ->
    R 'div', className: 'form-group', style: { paddingTop: 10 },
      R 'label', className: 'text-muted',
        R 'span', null,
          "Opacity: #{Math.round(@props.layerView.opacity * 100) }%"
      R 'div', style: {padding: '10px'},
        React.createElement(Rcslider,
          min: 0
          max: 100
          step: 1
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: @props.layerView.opacity * 100,
          onChange: @handleOpacityChange
        )

  renderDeleteLayer: ->
    R 'div', style: { float: "right", cursor: "pointer", marginLeft: 10 }, key: "delete",
      R 'a', onClick: @handleRemove,
        R 'i', className: "fa fa-remove"

  render: ->
    layer = LayerFactory.createLayer(@props.layerView.type)
    style =
      cursor: "move"
      marginRight: 8
      opacity: 0.5
      # float: "right"

    @props.connectDragPreview(@props.connectDropTarget(R 'div', null,
      R 'div', style: { fontSize: 16 }, key: "layerView",
        if @props.connectDragSource
          @props.connectDragSource(R('i', className: "fa fa-bars", style: style))
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

