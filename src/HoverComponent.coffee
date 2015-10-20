React = require 'react'
ReactDOM = require 'react-dom'

module.exports = class HoverComponent extends React.Component
  constructor: ->
    super
    @state = { hovered: false }

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.main).addEventListener("mouseover", @onOver)
    ReactDOM.findDOMNode(@refs.main).addEventListener("mouseout", @onOut)

  componentWillUnmount: ->
      ReactDOM.findDOMNode(@refs.main).removeEventListener("mouseover", @onOver)
      ReactDOM.findDOMNode(@refs.main).removeEventListener("mouseout", @onOut)

  onOver: =>
    @setState(hovered: true)

  onOut: =>
    @setState(hovered: false)

  render: ->
    React.cloneElement(React.Children.only(@props.children), ref: "main", hovered: @state.hovered)
