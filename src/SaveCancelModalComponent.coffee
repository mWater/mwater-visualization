H = React.DOM
Freezer = require 'freezer-js'

module.exports = React.createClass {
  propTypes: {
    title: React.PropTypes.string # Title of modal
    data: React.PropTypes.object.isRequired # Initial data 
    onClose: React.PropTypes.func # Called when modal is closed. Called during save too
    onSave: React.PropTypes.func # Called when data is changed with new data. 
    createContent: React.PropTypes.func.isRequired # Called with (data, onChange) to create content elements
    onValidate: React.PropTypes.func # Called with data to validate. Non-null for error
  }

  getInitialState: ->
    # Clone data for state
    return { data: _.cloneDeep(@props.data) }

  handleSave: (e) ->
    # Apply changes
    @props.onSave(@state.data)
    if @props.onClose then @props.onClose()

  handleCancel: (e) ->
    if @props.onClose then @props.onClose()

  handleChange: ->
    # Validate
    if @props.onValidate
      @props.onValidate(@state.data)

    # Deep copy data
    @setState(data: _.cloneDeep(@state.data))

  componentDidMount: ->
    $(React.findDOMNode(@refs.modal)).modal({ 
      show: true, 
      backdrop: "static", 
      keyboard: false 
      })

  componentWillUnmount: ->
    $(React.findDOMNode(@refs.modal)).modal("hide")    

  render: ->
    changed = not _.isEqual(@props.data, @state.data)

    H.div ref: "modal", className: "modal",
      H.div className: "modal-dialog",
        H.div className: "modal-content",
          H.div className: "modal-header",
            H.h4 className: "modal-title", @props.title
          H.div className: "modal-body",
            # Create content with data and onChange
            @props.createContent(@state.data, @handleChange)
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
