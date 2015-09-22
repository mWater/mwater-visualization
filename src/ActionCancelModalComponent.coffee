React = require 'react'
H = React.DOM
_ = require 'lodash'
ModalPopupComponent = require('./ModalPopupComponent')

# Modal with action and cancel buttons
module.exports = class ActionCancelModalComponent extends React.Component
  @propTypes: 
    title: React.PropTypes.node # Title of modal. Any react element
    actionLabel: React.PropTypes.node # Action button. Defaults to "Save"
    onAction: React.PropTypes.func # Called when action button is clicked
    onCancel: React.PropTypes.func # Called when cancel is clicked
    onDelete: React.PropTypes.func # Big red destuctive action in footer. Not present if null
    deleteLabel: React.PropTypes.node # Label of delete button. Default "Delete"
    size: React.PropTypes.string # "large" for large

  render: ->
    React.createElement(ModalPopupComponent,
      size: @props.size
      header: if @props.title then H.h4(className: "modal-title", @props.title)
      footer: [
        H.button 
          key: "cancel"
          type: "button"
          onClick: @props.onCancel
          className: "btn btn-default", 
            if @props.onAction then "Cancel" else "Close"
        if @props.onAction 
          H.button 
            key: "action"
            type: "button"
            onClick: @props.onAction
            className: "btn btn-primary",
              @props.actionLabel or "Save"
        if @props.onDelete 
          H.button 
            key: "delete"
            type: "button"
            style: { float: "left" }
            onClick: @props.onDelete
            className: "btn btn-danger",
              @props.deleteLabel or "Delete"
      ],
      @props.children)
