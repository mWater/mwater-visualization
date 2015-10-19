React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
_ = require 'lodash'

# Modal popup
module.exports = class ModalPopupComponent extends React.Component
  @propTypes: 
    header: React.PropTypes.node # Header of modal. Any react element
    footer: React.PropTypes.node # Footer of modal. Any react element
    size: React.PropTypes.string # "large" for large

  componentDidMount: ->
    # Add special region to body
    @modalNode = $('<div></div>').get(0)
    $("body").append(@modalNode)

    elem = React.createElement(ModalComponentContent, @props)
    ReactDOM.render(elem, @modalNode)

    _.defer () =>
      $(@modalNode).children().modal({ 
        show: true, 
        backdrop: "static", 
        keyboard: false 
        })

  componentDidUpdate: (prevProps) ->
    elem = React.createElement(ModalComponentContent, @props)
    ReactDOM.render(elem, @modalNode)

  componentWillUnmount: ->
    $(@modalNode).children().modal("hide")
    ReactDOM.unmountComponentAtNode(@modalNode)
    $(@modalNode).remove()

  render: -> null
    
# Content must be rendered at body level to prevent weird behaviour, so this is the inner component
class ModalComponentContent extends React.Component
  @propTypes: 
    header: React.PropTypes.node # Header of modal. Any react element
    footer: React.PropTypes.node # Footer of modal. Any react element
    size: React.PropTypes.string # "large" for large

  render: ->
    dialogExtraClass = ""
    if @props.size == "large"
      dialogExtraClass = " modal-lg"

    H.div ref: "modal", className: "modal",
      H.div className: "modal-dialog#{dialogExtraClass}",
        H.div className: "modal-content",
          if @props.header
            H.div className: "modal-header",
              @props.header
          H.div className: "modal-body",
            @props.children
          if @props.footer
            H.div className: "modal-footer",
              @props.footer
