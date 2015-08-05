React = require 'react'
H = React.DOM

# Automatically injects the width of the DOM element into the
# child component, updating as window resizes
module.exports = class AutoSizeComponent extends React.Component
  @propTypes:
    injectWidth: React.PropTypes.bool # True to inject width
    injectHeight: React.PropTypes.bool # True to inject height

  constructor: ->
    @state = { width: null, height: null }

  componentDidMount: ->
    # Listen for changes
    $(window).on('resize', @updateSize)
    @updateSize()

  componentWillUnmount: ->
    # Stop listening to resize events
    $(window).off('resize', @updateSize)

  updateSize: =>
    # Get width of self
    node = React.findDOMNode(this)
    @setState(width: node.clientWidth, height: node.clientHeight)

  # Call child component with parameter
  callChild: (method, params...) =>
    @refs.child[method].apply(@refs.child, params)

  render: ->
    if not @state.width? or not @state.height?
      return H.div null
    else
      overrides = { ref: "child" }
      if @props.injectWidth
        overrides.width = @state.width
      if @props.injectHeight
        overrides.height = @state.height

      return React.cloneElement(React.Children.only(@props.children), overrides)