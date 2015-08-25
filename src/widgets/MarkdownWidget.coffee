React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
markdown = require("markdown").markdown

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

  handleStartEditing: =>
    @refs.simpleWidget.displayEditor()

  render: ->
    dropdownItems = [
      { label: "Edit", icon: "pencil", onClick: @handleStartEditing }
      { label: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: @props.onRemove }
    ]

    # Create editor
    editor = React.createElement(MarkdownWidgetDesignerComponent, 
      design: @props.design
      onDesignChange: @props.onDesignChange
    )

    # Wrap in a simple widget
    return H.div onDoubleClick: @handleStartEditing, 
      React.createElement(SimpleWidgetComponent, 
        ref: "simpleWidget"
        editor: editor
        width: @props.width
        height: @props.height
        connectMoveHandle: @props.connectMoveHandle
        connectResizeHandle: @props.connectResizeHandle
        dropdownItems: dropdownItems,
          React.createElement(MarkdownWidgetViewComponent, {
            design: @props.design
            onDesignChange: @props.onDesignChange
          })
        )


class MarkdownWidgetViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    width: React.PropTypes.number
    height: React.PropTypes.number

  render: ->
    H.div dangerouslySetInnerHTML: { __html: markdown.toHTML(@props.design.markdown or "") }

class MarkdownWidgetDesignerComponent extends React.Component 
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  handleMarkdownChange: (ev) =>
    design = _.extend({}, @props.design, markdown: ev.target.value)
    @props.onDesignChange(design)

  render: ->
    H.textarea className: "form-control", rows: 10, value: @props.design.markdown, onChange: @handleMarkdownChange


