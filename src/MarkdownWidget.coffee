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
  #  width: width in pixels
  #  height: height in pixels
  #  selected: true if selected
  #  onSelect: called when selected
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply (array of expressions)
  #  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  createViewElement: (options) ->
    # Wrap in a simple widget
    return React.createElement(SimpleWidgetComponent, 
      width: options.width
      height: options.height
      selected: options.selected
      onSelect: options.onSelect
      onRemove: options.onRemove,
        React.createElement(MarkdownWidgetViewComponent, {
          design: @design
        })
      )

  # Creates a React element that is a designer for the widget
  # options:
  #  onDesignChange: called with new design if changed
  createDesignerElement: (options) ->
    return React.createElement(MarkdownWidgetDesignerComponent, design: @design, onDesignChange: options.onDesignChange)

class MarkdownWidgetViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

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
