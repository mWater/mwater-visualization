React = require 'react'
H = React.DOM
_ = require 'lodash'
ModalComponent = require('./ModalComponent')

# Modal with action and cancel buttons
module.exports = class ActionCancelModalComponent extends React.Component
  @propTypes: 
    title: React.PropTypes.node # Title of modal. Any react element
    actionLabel: React.PropTypes.string # Action button. Defaults to "Save"
    onAction: React.PropTypes.func # Called when action button is clicked
    onCancel: React.PropTypes.func # Called when cancel is clicked
    size: React.PropTypes.string # "large" for large

  render: ->
    React.createElement(ModalComponent,
      header: if @props.title then H.h4(className: "modal-title", @props.title)
      footer: [
        H.button 
          key: "cancel"
          type: "button"
          onClick: @props.onCancel
          className: "btn btn-default", 
            "Cancel"
        if @props.onAction 
          H.button 
            key: "action"
            type: "button"
            onClick: @props.onAction
            className: "btn btn-primary",
              @props.actionLabel or "Save"
      ],
      @props.children)
