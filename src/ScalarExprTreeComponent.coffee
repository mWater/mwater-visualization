HoverComponent = require './HoverComponent'
H = React.DOM

# Shows a tree that selects table + path of a scalar expression
module.exports = class ScalarExprTreeComponent extends React.Component 
  @propTypes: 
    tree: React.PropTypes.array.isRequired    # Tree from ScalarExprTreeBuilder
    value: React.PropTypes.object             # Currently selected value
    onChange: React.PropTypes.func.isRequired # Called with newly selected value

  render: ->
    elems = []

    # Get tree
    for item in @props.tree
      if item.children
        elems.push(
          React.createElement(HoverComponent, null,
            React.createElement(ScalarExprTreeNodeComponent, key: item.name, item: item, onChange: @props.onChange, value: @props.value)))
      else 
        elems.push(
          React.createElement(HoverComponent, null,
            React.createElement(ScalarExprTreeLeafComponent, key: item.name, item: item, onChange: @props.onChange, value: @props.value)))

    H.div null, 
      elems

class ScalarExprTreeLeafComponent extends React.Component
  handleClick: =>
    @props.onChange(@props.item.value)

  render: ->
    style = {
      padding: 4
      borderRadius: 4
      cursor: "pointer"
    }

    selected = @props.value and _.isEqual(@props.value, @props.item.value)

    if selected
      style.color = "#EEE"
      style.backgroundColor = if @props.hovered then "#286090" else "#337AB7"
    else if @props.hovered
      style.backgroundColor = "#EEE"

    H.div style: style, onClick: @handleClick, 
      @props.item.name

class ScalarExprTreeNodeComponent extends React.Component
  constructor: (props) ->
    super
    @state = { 
      collapse: if props.item.initiallyOpen then "open" else "closed" 
    }

  handleArrowClick: =>
    if @state.collapse == "open" 
      @setState(collapse: "closed")
    else if @state.collapse == "closed" 
      @setState(collapse: "open")

  render: ->
    arrow = null
    if @state.collapse == "closed"
      arrow = H.span className: "glyphicon glyphicon-triangle-right"
    else if @state.collapse == "open"
      arrow = H.span className: "glyphicon glyphicon-triangle-bottom"

    if @state.collapse == "open"
      children = H.div style: { paddingLeft: 25 },
        React.createElement(ScalarExprTreeComponent, tree: @props.item.children(), onChange: @props.onChange, value: @props.value)

    H.div null,
      H.div onClick: @handleArrowClick, style: { cursor: "pointer", padding: 4 },
        H.span style: { color: "#AAA", cursor: "pointer", paddingRight: 3 }, arrow
        @props.item.name
      children
      