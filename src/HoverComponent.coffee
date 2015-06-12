module.exports = class HoverComponent extends React.Component
  constructor: ->
    super
    @state = { hovered: false }

  refMain: (el) =>
    if el
      React.findDOMNode(el).addEventListener("mouseover", @onOver)
      React.findDOMNode(el).addEventListener("mouseout", @onOut)
    else
      React.findDOMNode(el).removeEventListener("mouseover", @onOver)
      React.findDOMNode(el).removeEventListener("mouseout", @onOut)

  onOver: =>
    @setState(hovered: true)

  onOut: =>
    @setState(hovered: false)

  render: ->
    React.cloneElement(React.Children.only(@props.children), ref: @refMain, hovered: @state.hovered)
