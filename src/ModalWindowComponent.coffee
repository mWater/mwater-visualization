React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
_ = require 'lodash'

# Modal window that fills screen
module.exports = class ModalWindowComponent extends React.Component
  @propTypes: 
    isOpen: React.PropTypes.bool.isRequired
    onRequestClose: React.PropTypes.func.isRequired

  componentDidMount: ->
    # Add special region to body
    @modalNode = $('<div></div>').get(0)
    $("body").append(@modalNode)

    @update(@props)

  componentWillReceiveProps: (nextProps) ->
    @update(nextProps)

  update: (props) ->
    elem = React.createElement(InnerModalComponent, props)
    ReactDOM.render(elem, @modalNode)

  componentWillUnmount: ->
    ReactDOM.unmountComponentAtNode(@modalNode)
    $(@modalNode).remove()

  render: -> null
    
# Content must be rendered at body level to prevent weird behaviour, so this is the inner component
class InnerModalComponent extends React.Component
  @propTypes: 
    isOpen: React.PropTypes.bool.isRequired
    onRequestClose: React.PropTypes.func.isRequired

  render: ->
    if not @props.isOpen
      return null

    overlayStyle = {
      position: "fixed"
      left: 0
      right: 0
      top: 0
      bottom: 0
      zIndex: 1030 # Below bootstrap modals
      backgroundColor: "rgba(0, 0, 0, 0.7)"
    }

    windowStyle = {
      position: "fixed"
      left: 40
      right: 40
      top: 40
      bottom: 40
      zIndex: 1030 # Below bootstrap modals
      backgroundColor: "white"
      borderRadius: 10
      border: "solid 1px #AAA"
    }

    contentStyle = {
      position: "absolute"
      left: 20
      right: 20
      top: 20
      bottom: 20
    }

    closeStyle = {
      position: "absolute"
      right: 8
      top: 8
      color: "#888"
    }

    H.div className: "mwater-visualization-modal-window-component",
      H.style null, '''body { overflow-y: hidden }'''
      H.div style: overlayStyle, onClick: @props.onRequestClose
      H.div style: windowStyle,
        H.div style: closeStyle,
          H.span className: "glyphicon glyphicon-remove", onClick: @props.onRequestClose
        H.div style: contentStyle,
          @props.children