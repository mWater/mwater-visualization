HoverMixin = require './HoverMixin'
H = React.DOM

# Shows a tree that selects a join expression (joins + expression)
module.exports = JoinExprTreeComponent = React.createClass {
  propTypes: {
    tree: React.PropTypes.array.isRequired    # Tree from Schema getJoinExprTree
    selectedValue: React.PropTypes.object     # Currently selected value
    onSelect: React.PropTypes.func.isRequired # Called with newly selected value
  }

  render: ->
    elems = []

    # Get tree
    for item in @props.tree
      if not item.getChildren?
        elems.push(React.createElement(JoinExprLeafComponent, item: item, onSelect: @props.onSelect, selectedValue: @props.selectedValue))
      else 
        elems.push(React.createElement(JoinExprNodeComponent, item: item, onSelect: @props.onSelect, selectedValue: @props.selectedValue))

    H.div null, 
      elems
}

JoinExprLeafComponent = React.createClass {
  mixins: [HoverMixin]

  handleClick: ->
    @props.onSelect(@props.item.value)

  render: ->
    style = {
      padding: 4
      borderRadius: 4
      cursor: "pointer"
    }

    selected = _.isEqual(@props.selectedValue, @props.item.value)

    if selected
      style.color = "#EEE"
      style.backgroundColor = if @state.hovered then "#286090" else "#337AB7"
    else if @state.hovered
      style.backgroundColor = "#CCC"

    typeElemStyle = {
      color: "#999"
      fontStyle: "italic"
      width: 20
      fontSize: "60%"
      paddingRight: 4
      display: "inline-block"
    }
    switch @props.item.type
      when "uuid"
        typeElemText = "#"
      when "number"
        typeElemText = "123.4"
      when "integer"
        typeElemText = "123"
      when "text"
        typeElemText = "abc"

    H.div style: style, onClick: @handleClick, 
      H.div style: typeElemStyle, typeElemText
      @props.item.name
}

JoinExprNodeComponent = React.createClass {
  getInitialState: -> 
    if @props.item.value.joinIds.length < 1 
      return { collapse: "open" }
    return { collapse: "closed" }

  handleArrowClick: ->
    if @state.collapse == "open" then @setState(collapse: "closed")
    else if @state.collapse == "closed" then @setState(collapse: "open")

  render: ->
    arrow = null
    if @state.collapse == "closed"
      arrow = H.span className: "glyphicon glyphicon-triangle-right"
    else if @state.collapse == "open"
      arrow = H.span className: "glyphicon glyphicon-triangle-bottom"

    if @state.collapse == "open"
      children = H.div style: { paddingLeft: 15 },
        React.createElement(JoinExprTreeComponent, tree: @props.item.getChildren(), onSelect: @props.onSelect, selectedValue: @props.selectedValue)

    H.div null,
      H.div onClick: @handleArrowClick, style: { cursor: "pointer", padding: 4 },
        H.span style: { color: "#AAA", cursor: "pointer", paddingRight: 3 }, arrow
        @props.item.name
      children
      
}
