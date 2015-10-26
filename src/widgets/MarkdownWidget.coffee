React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
markdown = require("markdown").markdown
ModalWindowComponent = require '../ModalWindowComponent'

module.exports = class MarkdownWidget extends Widget
  constructor: (design) ->
    @design = design

  # Creates a view of the widget
  # options:
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design
  createViewElement: (options) ->
    return React.createElement(MarkdownWidgetComponent,
      design: @design
      onDesignChange: options.onDesignChange
      onRemove: options.onRemove
    )

class MarkdownWidgetComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

    onRemove: React.PropTypes.func

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

  constructor: (props) ->
    super
    @state = { 
      # True when editing
      editing: false
    }  

  handleStartEditing: =>
    @setState(editing: true)

  renderEditor: ->
    # Create editor
    editor = React.createElement(MarkdownWidgetDesignerComponent, 
      design: @props.design
      onDesignChange: @props.onDesignChange
    )

    # Create item (maxing out at half of width of screen)
    width = Math.min(document.body.clientWidth/2, @props.width)
    chart = @renderContent()

    content = H.div style: { height: "100%", width: "100%" },
      H.div style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: width + 20, height: @props.height + 20 },
        chart
      H.div style: { width: "100%", height: "100%", paddingLeft: width + 40 },
        H.div style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
          editor

    React.createElement(ModalWindowComponent,
      isOpen: @state.editing
      onRequestClose: (=> @setState(editing: false)),
        content)

  renderContent: (scale) ->
    React.createElement(MarkdownWidgetViewComponent, {
      design: @props.design
      onDesignChange: @props.onDesignChange
    })

  render: ->
    dropdownItems = [
      { label: "Edit", icon: "pencil", onClick: @handleStartEditing }
      { label: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: @props.onRemove }
    ]

    # Wrap in a simple widget
    return H.div onDoubleClick: @handleStartEditing, 
      @renderEditor()
      React.createElement(SimpleWidgetComponent, 
        width: @props.width
        height: @props.height
        standardWidth: @props.standardWidth
        connectMoveHandle: @props.connectMoveHandle
        connectResizeHandle: @props.connectResizeHandle
        dropdownItems: dropdownItems,
          @renderContent()
        )


class MarkdownWidgetViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

  render: ->
    # Render in a standard width container and then scale up to ensure that widget always looks consistent
    H.div 
      style: { 
        width: @props.standardWidth
        height: @props.height * (@props.standardWidth / @props.width)
        transform: "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
        transformOrigin: "0 0"
      }
      dangerouslySetInnerHTML: { __html: markdown.toHTML(@props.design.markdown or "") }

class MarkdownWidgetDesignerComponent extends React.Component 
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  handleMarkdownChange: (ev) =>
    design = _.extend({}, @props.design, markdown: ev.target.value)
    @props.onDesignChange(design)

  render: ->
    H.textarea className: "form-control", style: { width: "100%", height: "100%" }, value: @props.design.markdown, onChange: @handleMarkdownChange


