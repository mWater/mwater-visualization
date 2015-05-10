H = React.DOM
HoverMixin = require './HoverMixin'

module.exports = HoverEditComponent = React.createClass {
  mixins: [HoverMixin]

  getInitialState: -> { editing: false }
  handleEditorClose: -> @setState(editing: false, hovered: false)

  render: ->
    if @state.editing
      editor = React.cloneElement(@props.editor, onClose: @handleEditorClose)

    highlighted = @state.hovered or @state.editing

    H.div style: { display: "inline-block" },
      editor
      H.div
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
