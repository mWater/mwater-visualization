_ = require 'lodash'
$ = require 'jquery'
PropTypes = require('prop-types')
React = require 'react'
ReactDOM = require 'react-dom'

# Wraps a child with an optional popover
module.exports = class PopoverComponent extends React.Component
  @propTypes: 
    content: PropTypes.node.isRequired     # contents of popover
    placement: PropTypes.string # See http://getbootstrap.com/javascript/#popovers
    visible: PropTypes.bool.isRequired

  componentDidMount: ->
    @updatePopover(@props, null)

  componentWillUnmount: ->
    @updatePopover(null, @props)

  componentDidUpdate: (prevProps) ->
    if not _.isEqual(prevProps.content, @props.content) or prevProps.visible != @props.visible or prevProps.placement != @props.placement
      @updatePopover(@props, prevProps)

  updatePopover: (props, oldProps) ->
    # Destroy old popover
    if oldProps and oldProps.visible
      $(ReactDOM.findDOMNode(this)).popover("destroy")      
      
    if props and props.visible
      div = document.createElement("div")
      ReactDOM.render(@props.content, div, =>
        $(ReactDOM.findDOMNode(this)).popover({
          content: -> $(div)
          html: true
          trigger: "manual"
          placement: @props.placement
        })
        $(ReactDOM.findDOMNode(this)).popover("show")
      )
      
  render: ->
    React.Children.only(@props.children)
