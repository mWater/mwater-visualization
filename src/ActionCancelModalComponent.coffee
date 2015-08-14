React = require 'react'
H = React.DOM

# Child must be react element with value and onChange props
module.exports = class ActionCancelModalComponent extends React.Component
  @propTypes: 
    title: React.PropTypes.node # Title of modal. Any react element
    actionLabel: React.PropTypes.string # Action button. Defaults to "Save"
    onAction: React.PropTypes.func # Called when action button is clicked
    onCancel: React.PropTypes.func # Called when cancel is clicked
    size: React.PropTypes.string # "large" for large

  componentDidMount: ->
    $(React.findDOMNode(@refs.modal)).modal({ 
      show: true, 
      backdrop: "static", 
      keyboard: false 
      })

  componentWillUnmount: ->
    $(React.findDOMNode(@refs.modal)).modal("hide")    

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
