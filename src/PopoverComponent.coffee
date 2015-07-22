React = require 'react'

# Wraps a child with an optional popover
module.exports = class PopoverComponent extends React.Component
  @propTypes: 
    html: React.PropTypes.string # html to display
    placement: React.PropTypes.string # See http://getbootstrap.com/javascript/#popovers

  componentDidMount: ->
    @updatePopover(@props, null)

  componentWillUnmount: ->
    @updatePopover(null, @props)

  componentDidUpdate: (prevProps) ->
    @updatePopover(@props, prevProps)

  updatePopover: (props, oldProps) ->
    if props and oldProps and props.html == oldProps.html
      return
      
    # Destroy old popover
    if oldProps and oldProps.html
      $(React.findDOMNode(@refs.child)).popover("destroy")      
      
    if props and props.html
      $(React.findDOMNode(@refs.child)).popover({
        content: props.html
        html: true
        trigger: "manual"
        placement: @props.placement
        })
      $(React.findDOMNode(@refs.child)).popover("show")

  render: ->
    React.cloneElement(React.Children.only(@props.children), ref: "child")
