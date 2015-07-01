React = require 'react'
H = React.DOM

# Automatically injects the width of the DOM element into the
# child component, updating as window resizes
module.exports = class AutoWidthComponent extends React.Component
  constructor: ->
    @state = { width: null }

  componentDidMount: ->
    # Listen for changes
    $(window).on('resize', @updateWidth)
    @updateWidth()

  componentWillUnmount: ->
    # Stop listening to resize events
    $(window).off('resize', @updateWidth)

  updateWidth: =>
    # Get width of self
    @setState(width: $(React.findDOMNode(this)).width())

  render: ->
    if not @state.width
      return H.div null
    else
      return React.cloneElement(React.Children.only(@props.children), width: @state.width)