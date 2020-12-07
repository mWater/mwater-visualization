PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
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
  createViewElement: (options) ->
    return React.createElement(MarkdownWidgetComponent,
      design: options.design
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height
    )

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> true

class MarkdownWidgetComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly

    width: PropTypes.number
    height: PropTypes.number

  constructor: (props) ->
    super(props)
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

    content = R 'div', style: { height: "100%", width: "100%" },
      R 'div', style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: width + 20, height: @props.height + 20 },
        chart
      R 'div', style: { width: "100%", height: "100%", paddingLeft: width + 40 },
        R 'div', style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
          editor

    React.createElement(ModalWindowComponent,
      isOpen: true
      onRequestClose: @handleEndEditing,
        content)

  renderContent: (design) ->
    React.createElement(MarkdownWidgetViewComponent, {
      design: design
      width: @props.width
      height: @props.height
    })

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return R 'div', onDoubleClick: @handleStartEditing, 
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
    design: PropTypes.object.isRequired # Design of chart

    width: PropTypes.number
    height: PropTypes.number

  render: ->
    R 'div', 
      style: { 
        width: @props.width
        height: @props.height
      }
      className: "mwater-visualization-markdown"
      dangerouslySetInnerHTML: { __html: markdown.toHTML(@props.design.markdown or "") }

class MarkdownWidgetDesignerComponent extends React.Component 
  @propTypes: 
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired

  handleMarkdownChange: (ev) =>
    design = _.extend({}, @props.design, markdown: ev.target.value)
    @props.onDesignChange(design)

  render: ->
    R 'textarea', className: "form-control", style: { width: "100%", height: "100%" }, value: @props.design.markdown, onChange: @handleMarkdownChange
