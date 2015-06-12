module.exports = class HoverComponent extends React.Component
  constructor: ->
    super
    @state = { hovered: false }

  componentDidMount: ->
    React.findDOMNode(@refs.main).addEventListener("mouseover", @onOver)
    React.findDOMNode(@refs.main).addEventListener("mouseout", @onOut)

  componentWillUnmount: ->
      React.findDOMNode(@refs.main).removeEventListener("mouseover", @onOver)
      React.findDOMNode(@refs.main).removeEventListener("mouseout", @onOut)

  onOver: =>
    @setState(hovered: true)

  onOut: =>
    @setState(hovered: false)

  render: ->
    React.cloneElement(React.Children.only(@props.children), ref: "main", hovered: @state.hovered)
