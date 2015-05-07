Freezer = require 'freezer-js'
SaveCancelModalComponent = require './SaveCancelModalComponent'
ListComponent = require './ListComponent'
ReactSelect = require 'react-select'
React = require 'react'
H = React.DOM

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


# Sample = React.createClass {
#   getInitialState: ->
#     freezer = new Freezer({ x: 1 })
#     freezer.get().getListener().on 'update', (q) => 
#       @setState(data: q)

#     freezer.get().reset(x:2)
#     return { editing: false, data: freezer.get() }

#   handleEditClick: ->
#     @setState(editing: !@state.editing)

#   render: ->
#     if @state.editing
#       modal = React.createElement(SaveCancelModalComponent, { 
#         title: "Title"
#         data: @state.data
#         onClose: => @setState(editing: false)
#         createContent: (data) => React.createElement(Child, data: data)
#         })

#     H.div null, 
#       H.button className: "btn btn-default", onClick: @handleEditClick, "Edit"
#       H.div null, @state.data.x
#       modal
# }

Sample = React.createClass {
  getInitialState: ->
    { selected: null }

  render: ->
    editor = React.createElement(SaveCancelModalComponent, { 
      title: "Select Data Source"
      data: { selected: @state.selected }
      onSave: (data) => @setState(selected: data.selected)
      createContent: (data) => 
        React.createElement(ListComponent, 
          items: options,
          selected: data.selected,
          onSelect: (id) => data.set({selected: id}))
      })

    H.div null, 
      "Data Source: "
      React.createElement HoverEditComponent, 
        editor: editor
        @state.selected or H.i(null, "None")
}

GreenArrow = React.createClass {
  render: ->
    H.span className: "glyphicon glyphicon-arrow-left", style: { color: "#0A0", paddingLeft: 5}
}

options = [
  { id: 'one', display: H.div(null, H.span(className:"glyphicon glyphicon-pencil"), ' One')}
  { id: 'two', display: 'Two' }
]

Sample2 = React.createClass {
  render: ->
    H.div null,
      "test"
      React.createElement(ReactSelect, { name: "x", value: "one", options: options })
}


HoverEditComponent = React.createClass {
  getInitialState: -> { hover: false, editing: false }
  mouseOver: -> @setState(hover: true)
  mouseOut: -> @setState(hover: false)

  handleEditorClose: -> @setState(editing: false)
  render: ->
    if @state.editing
      editor = React.cloneElement(@props.editor, onClose: @handleEditorClose)

    highlighted = @state.hover or @state.editing

    H.div style: { display: "inline-block" },
      editor
      H.div
        onMouseOver: @mouseOver
        onMouseOut: @mouseOut
        onClick: => @setState(editing: true)
        style: { 
          display: "inline-block"
          padding: 3
          cursor: "pointer"
          # border: if highlighted then "solid 1px rgba(128, 128, 128, 0.3)" else "solid 1px transparent"
          borderRadius: 4
          backgroundColor: if highlighted then "rgba(0, 0, 0, 0.1)"
        },
          @props.children
          # H.span 
          #   style: { 
          #     color: if highlighted then "#08A" else "transparent"
          #     paddingLeft: 7
          #   }
          #   className: "glyphicon glyphicon-pencil"
} 

$ ->
  sample = React.createElement(Sample)
  # sample = React.createElement(ListControl, { items: [
  #   { id: "a", display: "A" }
  #   { id: "b", display: "B" }
  #   ], selected: "a", onSelect: (id) -> console.log(id) })
  React.render(sample, document.getElementById('root'))




