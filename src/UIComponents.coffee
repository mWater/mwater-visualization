React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
R = React.createElement
motion = require 'react-motion'

EditableLinkComponent = require './EditableLinkComponent'

# Miscellaneous ui components

# Section with a title and icon
exports.SectionComponent = class SectionComponent extends React.Component
  @propTypes: 
    icon: React.PropTypes.string
    label: React.PropTypes.node

  render: ->
    H.div style: { marginBottom: 15 }, 
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-#{@props.icon}")
        " "
        @props.label
      H.div style: { marginLeft: 10 },
        @props.children

# List of options with a name and description each
exports.OptionListComponent = class OptionListComponent extends React.Component
  @propTypes:
    items: React.PropTypes.array.isRequired # name, desc, onClick
    hint: React.PropTypes.string

  render: ->
    H.div null,
      H.div style: { color: "#AAA", fontStyle: "italic" }, key: "hint", @props.hint
      H.div className: "mwater-visualization-big-options", key: "options",
        _.map @props.items, (item) =>
          R OptionComponent, name: item.name, desc: item.desc, onClick: item.onClick, key: item.name

# Single option
class OptionComponent extends React.Component
  @propTypes:
    name: React.PropTypes.string
    desc: React.PropTypes.string
    onClick: React.PropTypes.func.isRequired

  render: ->
    H.div className: "mwater-visualization-big-option", onClick: @props.onClick,
      H.div style: { fontWeight: "bold" }, @props.name
      H.div style: { color: "#888" }, @props.desc

# Switches views smoothly
exports.SwitchViewComponent = class SwitchViewComponent extends React.Component
  @propTypes:
    views: React.PropTypes.object.isRequired  # Map of view id to view element
    viewId: React.PropTypes.string.isRequired   # Current view id to display

  constructor: (props) ->
    @state = { 
      measuring: false
    }

  componentWillReceiveProps: (nextProps) ->
    # If view changes, measure all components
    if nextProps.viewId != @props.viewId
      @setState(measuring: true)

  # Save components
  refCallback: (id, comp) => 
    @comps = @comps or {}
    @comps[id] = comp

  componentDidUpdate: (prevProps, prevState) ->
    # If measuring, get the heights to interpolate
    if @state.measuring
      @heights = {}

      # Get heights
      for id in _.keys(@props.views)
        @heights[id] = ReactDOM.findDOMNode(@comps[id]).clientHeight

      @setState(measuring: false)

  render: ->
    # Create the style object that has the opacity for each view
    style = {}
    for id, view of @props.views
      style[id] = motion.spring(if id == @props.viewId then 1 else 0)

    return R motion.Motion,
      style: style
      (style) =>
        # If measuring, display all positioned at top
        if @state.measuring
          return H.div style: { position: "relative" },
            _.map _.keys(@props.views), (v) =>
              H.div style: { position: "absolute", top: 0, opacity: style[v] }, ref: @refCallback.bind(null, v), key: v,
                @props.views[v]

        # If transitioning
        if style[@props.viewId] != 1
          # Calculate interpolated height
          height = 0
          for id, val of style
            height += val * @heights[id]

          return H.div style: { position: "relative", height: height },
            _.map _.keys(@props.views), (v) =>
              H.div style: { position: "absolute", top: 0, left: 0, right: 0, opacity: style[v] }, key: v,
                @props.views[v]

        # Just display (but wrapped to keep same component)
        return H.div null,
          H.div key: @props.viewId,
            @props.views[@props.viewId]

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

  close: =>
    # Save height of editor
    if @editorComp
      @editorHeight = ReactDOM.findDOMNode(@editorComp).clientHeight

    @setState(open: false)

  open: =>
    @setState(open: true)
  
  handleToggle: => 
    @setState(open: not @state.open)

  # Save editor comp
  editorRef: (editorComp) => @editorComp = editorComp

  render: ->
    editor = @props.editor
    if _.isFunction(editor)
      editor = editor(@close)

    link = R(EditableLinkComponent, onClick: @open, onRemove: @props.onRemove, @props.label)
    
    isOpen = @state.open or @props.forceOpen

    return R SwitchViewComponent,
      views: { editor: editor, link: link },
      viewId: if isOpen then "editor" else "link"

# Switch between several values as a series of radio buttons
exports.ButtonToggleComponent = class ButtonToggleComponent extends React.Component
  @propTypes:
    value: React.PropTypes.any
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired
      value: React.PropTypes.any
      })).isRequired # List of layers
    onChange: React.PropTypes.func.isRequired # Called with value

  render: ->
    H.div className: "btn-group btn-group-xs",
      _.map @props.options, (option, i) =>
        H.button type: "button", className: (if option.value == @props.value then "btn btn-primary active" else "btn btn-default"), onClick: @props.onChange.bind(null, option.value),
          option.label
