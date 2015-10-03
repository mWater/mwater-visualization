React = require 'react'
H = React.DOM
R = React.createElement

EditableLinkComponent = require './EditableLinkComponent'

# Miscellaneous ui components
exports.SectionComponent = class SectionComponent extends React.Component
  @propTypes: 
    icon: React.PropTypes.string
    label: React.PropTypes.node

  render: ->
    H.div style: { marginBottom: 10 }, 
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-#{@props.icon}")
        " "
        @props.label
      H.div style: { marginLeft: 10 },
        @props.children

exports.BigOptions = class BigOptions extends React.Component
  @propTypes:
    items: React.PropTypes.array.isRequired # name, desc, onClick
    hint: React.PropTypes.string

  render: ->
    H.div null,
      H.div style: { color: "#AAA", fontStyle: "italic" }, key: "hint", @props.hint
      H.div className: "mwater-visualization-big-options", key: "options",
        _.map @props.items, (item) =>
          R BigOption, name: item.name, desc: item.desc, onClick: item.onClick, key: item.name

exports.BigOption = class BigOption extends React.Component
  @propTypes:
    name: React.PropTypes.string
    desc: React.PropTypes.string
    onClick: React.PropTypes.func.isRequired

  render: ->
    H.div className: "mwater-visualization-big-option", onClick: @props.onClick,
      H.div style: { fontWeight: "bold" }, @props.name
      H.div style: { color: "#888" }, @props.desc

# Shows as editable link that can be clicked to open 
# Editor can be node or can be function that takes onClose function as first parameter
exports.ToggleEditComponent = class ToggleEditComponent extends React.Component
  @propTypes:
    forceOpen: React.PropTypes.bool
    initiallyOpen: React.PropTypes.bool
    label: React.PropTypes.node.isRequired
    editor: React.PropTypes.any.isRequired
    onRemove: React.PropTypes.func

  constructor: (props) ->
    @state = { open: props.initiallyOpen or false }

  close: ->
    @setState(open: false)

  handleOpen: => @setState(open: true)
  handleClose: => @setState(open: false)
  handleToggle: => @setState(open: not @state.open)

  render: ->
    editor = @props.editor

    # # Add close icon
    # if not @props.forceOpen
    #   editor = H.div null,
    #     H.div style: { position: "absolute", right: 4, top: 10, color: "#AAA" }, onClick: @handleClose,
    #       H.div className: "glyphicon glyphicon-remove"
    #     editor
    if _.isFunction(editor)
      editor = editor(@handleClose)

    if @state.open or @props.forceOpen
      return editor
    else
      R(EditableLinkComponent, onClick: @handleToggle, onRemove: @props.onRemove, @props.label)
      # R Popover, 
      #   isOpen: @state.open or @props.forceOpen
      #   preferPlace: "below"
      #   onOuterAction: => @setState(open: false)
      #   body: editor,




