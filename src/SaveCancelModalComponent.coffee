H = React.DOM
Freezer = require 'freezer-js'

module.exports = React.createClass {
  propTypes: {
    title: React.PropTypes.string # Title of modal
    createContent: React.PropTypes.func.isRequired # Passed frozen data as parameter
    data: React.PropTypes.object.isRequired # Initial data 
    onClose: React.PropTypes.func # Called when modal is closed. Called during save too
    onSave: React.PropTypes.func # Called when data is changed with new data. 
  }

  getInitialState: ->
    # Create temporary freezer for compoment
    freezer = new Freezer(@props.data)

    # Listen to changes
    freezer.get().getListener().on("update", => @setState(changed: true))

    return { changed: false, freezer: freezer }

  handleSave: (e) ->
    # Apply changes
    @props.onSave(@state.freezer.get().toJS())
    if @props.onClose then @props.onClose()

  handleCancel: (e) ->
    if @props.onClose then @props.onClose()

  componentDidMount: ->
    $(React.findDOMNode(@refs.modal)).modal({ 
      show: true, 
      backdrop: "static", 
      keyboard: false 
      })

  componentWillUnmount: ->
    $(React.findDOMNode(@refs.modal)).modal("hide")    

  render: ->
    H.div ref: "modal", className: "modal",
      H.div className: "modal-dialog",
        H.div className: "modal-content",
          H.div className: "modal-header",
            H.h4 className: "modal-title", @props.title
          H.div className: "modal-body",
            @props.createContent(@state.freezer.get())
          H.div className: "modal-footer",
            H.button 
              ref: "cancel"
              type: "button"
              onClick: @handleCancel
              className: "btn btn-default", 
                if @state.changed then "Cancel" else "Close"
            if @state.changed then H.button 
              type: "button"
              ref: "save"
              onClick: @handleSave
              className: "btn btn-primary",
               "Save"
}

# module.exports = React.createClass {
#   propTypes: {
#     title: React.PropTypes.string # Title of modal
#     createContent: React.PropTypes.func.isRequired # Passed frozen data as parameter
#     data: React.PropTypes.object.isRequired # Initial frozen data to supply
#     onClose: React.PropTypes.func # Called when modal is closed
#   }

#   getInitialState: ->
#     # Create temporary freezer for compoment
#     freezer = new Freezer(@props.data.toJS())

#     # Listen to changes
#     freezer.get().getListener().on("update", => @setState(changed: true))

#     return { changed: false, freezer: freezer }

#   handleSave: (e) ->
#     # Apply changes
#     @props.data.reset(@state.freezer.get().toJS())
#     if @props.onClose then @props.onClose()

#   handleCancel: (e) ->
#     if @props.onClose then @props.onClose()

#   componentDidMount: ->
#     $(React.findDOMNode(@refs.modal)).modal({ 
#       show: true, 
#       backdrop: "static", 
#       keyboard: false 
#       })

#   componentWillUnmount: ->
#     $(React.findDOMNode(@refs.modal)).modal("hide")    

#   render: ->
#     H.div ref: "modal", className: "modal",
#       H.div className: "modal-dialog",
#         H.div className: "modal-content",
#           H.div className: "modal-header",
#             H.h4 className: "modal-title", @props.title
#           H.div className: "modal-body",
#             @props.createContent(@state.freezer.get())
#           H.div className: "modal-footer",
#             H.button 
#               ref: "cancel"
#               type: "button"
#               onClick: @handleCancel
#               className: "btn btn-default", 
#                 if @state.changed then "Cancel" else "Close"
#             if @state.changed then H.button 
#               type: "button"
#               ref: "save"
#               onClick: @handleSave
#               className: "btn btn-primary",
#                "Save"
# }