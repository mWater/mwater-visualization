H = React.DOM

# Child must be react element with value and onChange props
module.exports = React.createClass {
  propTypes: {
    title: React.PropTypes.string # Title of modal
    initialValue: React.PropTypes.object.isRequired # Initial value
    onClose: React.PropTypes.func # Called when modal is closed. Called during save too
    onChange: React.PropTypes.func # Called when value is changed with new value. 
    onValidate: React.PropTypes.func # Called with value to validate. Non-null for error
  }

  getInitialState: -> { value: @props.initialValue }

  handleSave: (e) ->
    # Apply changes
    @props.onChange(@state.value)
    if @props.onClose then @props.onClose()

  handleCancel: (e) ->
    if @props.onClose then @props.onClose()

  handleChange: (value) ->
    @setState(value: value)

  componentDidMount: ->
    $(React.findDOMNode(@refs.modal)).modal({ 
      show: true, 
      backdrop: "static", 
      keyboard: false 
      })

  componentWillUnmount: ->
    $(React.findDOMNode(@refs.modal)).modal("hide")    

  render: ->
    # TODO validate

    changed = @props.initialValue != @state.value

    H.div ref: "modal", className: "modal",
      H.div className: "modal-dialog",
        H.div className: "modal-content",
          H.div className: "modal-header",
            H.h4 className: "modal-title", @props.title
          H.div className: "modal-body",
            # Create content with value and onChange
            React.cloneElement(React.Children.only(@props.children), { value: @state.value, onChange: @handleChange })
          H.div className: "modal-footer",
            H.button 
              ref: "cancel"
              type: "button"
              onClick: @handleCancel
              className: "btn btn-default", 
                if changed then "Cancel" else "Close"
            if changed then H.button 
              type: "button"
              ref: "save"
              onClick: @handleSave
              className: "btn btn-primary",
               "Save"
}
