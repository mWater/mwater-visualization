# Mixin that sets hovered state to true/false
module.exports = {
  componentWillMount: ->
    @state = @state or {}
    @state.hovered = false
  
  componentDidMount: ->
    @getDOMNode().addEventListener("mouseover", @onOver)
    @getDOMNode().addEventListener("mouseout", @onOut)

  componentWillUnmount: ->
    @getDOMNode().removeEventListener("mouseover", @onOver)
    @getDOMNode().removeEventListener("mouseout", @onOut)

  onOver: ->
    @setState(hovered: true)

  onOut: ->
    @setState(hovered: false)
}