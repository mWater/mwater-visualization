React = require 'react'
ReactDOM = require 'react-dom'

module.exports = class HoverComponent extends React.Component
  constructor: (props) ->
    super(props)
    @state = { hovered: false }

  componentDidMount: ->
    ReactDOM.findDOMNode(@main).addEventListener("mouseover", @onOver)
    ReactDOM.findDOMNode(@main).addEventListener("mouseout", @onOut)

  componentWillUnmount: ->
    ReactDOM.findDOMNode(@main).removeEventListener("mouseover", @onOver)
    ReactDOM.findDOMNode(@main).removeEventListener("mouseout", @onOut)

  onOver: =>
    @setState(hovered: true)

  onOut: =>
    @setState(hovered: false)

  render: ->
    React.cloneElement(React.Children.only(@props.children), ref: ((c) => @main = c), hovered: @state.hovered)
