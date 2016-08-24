React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
DropdownWidgetComponent = require './DropdownWidgetComponent'
markdown = require("markdown").markdown
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')

module.exports = class MarkdownWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  createViewElement: (options) ->
    return React.createElement(MarkdownWidgetComponent,
      design: options.design
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height
      standardWidth: options.standardWidth
    )

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> true

class MarkdownWidgetComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

  constructor: (props) ->
    super
    @state = { 
      # Design that is being edited. Change is propagated on closing window
      editDesign: null
    }  

  handleStartEditing: =>
    @setState(editDesign: @props.design)

  handleEndEditing: =>
    @props.onDesignChange(@state.editDesign)
    @setState(editDesign: null)

  handleEditDesignChange: (design) =>
    @setState(editDesign: design)

  renderEditor: ->
    if not @state.editDesign
      return null

    # Create editor
    editor = React.createElement(MarkdownWidgetDesignerComponent, 
      design: @state.editDesign
      onDesignChange: @handleEditDesignChange
    )

    # Create item (maxing out at half of width of screen)
    width = Math.min(document.body.clientWidth/2, @props.width)
    chart = @renderContent(@state.editDesign)

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

  renderContent: (design) ->
    React.createElement(MarkdownWidgetViewComponent, {
      design: design
      width: @props.width
      height: @props.height
      standardWidth: @props.standardWidth
    })

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div onDoubleClick: @handleStartEditing, 
      if @props.onDesignChange?
        @renderEditor()
      React.createElement(DropdownWidgetComponent, 
        width: @props.width
        height: @props.height
        dropdownItems: dropdownItems,
          @renderContent(@props.design)
      )


class MarkdownWidgetViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart

    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired
    standardWidth: React.PropTypes.number.isRequired

  render: ->
    # Render in a standard width container and then scale up to ensure that widget always looks consistent
    H.div 
      style: { 
        width: @props.standardWidth
        height: @props.height * (@props.standardWidth / @props.width)
        transform: "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
        transformOrigin: "0 0"
      }
      className: "mwater-visualization-markdown"
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
