React = require 'react'
H = React.DOM
_ = require 'lodash'

# Modal with action and cancel buttons
module.exports = class ActionCancelModalComponent
  @propTypes: 
    title: React.PropTypes.node # Title of modal. Any react element
    actionLabel: React.PropTypes.string # Action button. Defaults to "Save"
    onAction: React.PropTypes.func # Called when action button is clicked
    onCancel: React.PropTypes.func # Called when cancel is clicked
    size: React.PropTypes.string # "large" for large

  componentDidMount: ->
    # Add special region to body
    @modalNode = $('<div></div>').get(0)
    $("body").append(@modalNode)

    elem = React.createElement(ActionCancelModalComponentContent, @props)
    React.render(elem, @modalNode)

    _.defer () =>
      $(@modalNode).children().modal({ 
        show: true, 
        backdrop: "static", 
        keyboard: false 
        })

  componentDidUpdate: (prevProps) ->
    elem = React.createElement(ActionCancelModalComponentContent, @props)
    React.render(elem, @modalNode)

  componentWillUnmount: ->
    $(@modalNode).children().modal("hide")
    React.unmountComponentAtNode(@modalNode)
    $(@modalNode).remove()

  render: ->
    H.div null

# Content must be rendered at body level to prevent weird behaviour, so this is the inner component
class ActionCancelModalComponentContent extends React.Component
  @propTypes: 
    title: React.PropTypes.node # Title of modal. Any react element
    actionLabel: React.PropTypes.string # Action button. Defaults to "Save"
    onAction: React.PropTypes.func # Called when action button is clicked
    onCancel: React.PropTypes.func # Called when cancel is clicked
    size: React.PropTypes.string # "large" for large

  render: ->
    dialogExtraClass = ""
    if @props.size == "large"
      dialogExtraClass = " modal-lg"

    H.div ref: "modal", className: "modal",
      H.div className: "modal-dialog#{dialogExtraClass}",
        H.div className: "modal-content",
          H.div className: "modal-header",
            H.h4 className: "modal-title", @props.title
          H.div className: "modal-body",
            @props.children
          H.div className: "modal-footer",
            H.button 
              key: "cancel"
              type: "button"
              onClick: @props.onCancel
              className: "btn btn-default", 
                "Cancel"
            H.button 
              key: "action"
              type: "button"
              onClick: @props.onAction
              className: "btn btn-primary",
                @props.actionLabel or "Save"
