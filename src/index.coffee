H = React.DOM
Freezer = require 'freezer-js'

Child = React.createClass {
  handleClick: ->
    @props.data.set(x: @props.data.x + 1)

  render: ->
    H.button 
      type: "button"
      onClick: @handleClick
      className: "btn btn-default", 
        "Button " + @props.data.x
}

ModalPopup = React.createClass {
  getInitialState: ->
    # Create temporary freezer for child
    freezer = new Freezer(@props.data.toJS())

    # Listen to changes
    freezer.get().getListener().on("update", => @setState(changed: true))

    return { changed: false, freezer: freezer }

  handleSave: (e) ->
    # Send changes
    @props.data.reset(@state.freezer.get().toJS())

    @props.onClose()

  handleCancel: (e) ->
    @props.onClose()

  componentDidMount: ->
    $(React.findDOMNode(@refs.modal)).modal({ show: true, backdrop: "static", keyboard: false })

  componentWillUnmount: ->
    $(React.findDOMNode(@refs.modal)).modal("hide")    

  render: ->
    H.div ref: "modal", className: "modal fade",
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

Sample = React.createClass {
  getInitialState: ->
    freezer = new Freezer({ x: 1 })
    freezer.get().getListener().on 'update', (q) => 
      @setState(data: q)

    freezer.get().reset(x:2)
    return { editing: false, data: freezer.get() }

  handleEditClick: ->
    @setState(editing: !@state.editing)

  render: ->
    if @state.editing
      modal = React.createElement(ModalPopup, { 
        title: "Title"
        data: @state.data
        onClose: => @setState(editing: false)
        createContent: (data) => React.createElement(Child, data: data)
        })

    H.div null, 
      H.button className: "btn btn-default", onClick: @handleEditClick, "Edit"
      H.div null, @state.data.x
      modal
}

$ ->
  sample = React.createElement(Sample, title: "Test")
  React.render(sample, document.getElementById('root'))




