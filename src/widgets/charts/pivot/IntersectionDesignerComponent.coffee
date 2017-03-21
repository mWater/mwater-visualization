_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

Rcslider = require 'rc-slider'
AxisComponent = require '../../../axes/AxisComponent'
ColorComponent = require '../../../ColorComponent'

# Design an intersection of a pivot table
module.exports = class IntersectionDesignerComponent extends React.Component
  @propTypes: 
    intersection: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  # Updates intersection with the specified changes
  update: (changes) ->
    intersection = _.extend({}, @props.intersection, changes)
    @props.onChange(intersection)

  handleValueAxisChange: (valueAxis) => @update(valueAxis: valueAxis)

  handleBackgroundColorAxisChange: (backgroundColorAxis) => 
    opacity = @props.intersection.backgroundColorOpacity or 0.3
    @update(backgroundColorAxis: backgroundColorAxis, backgroundColorOpacity: opacity)

  handleBackgroundColorChange: (backgroundColor) => 
    opacity = @props.intersection.backgroundColorOpacity or 0.3
    @update(backgroundColor: backgroundColor, backgroundColorOpacity: opacity)

  handleBackgroundColorOpacityChange: (newValue) =>
    @update(backgroundColorOpacity: newValue / 100)

  handleNullLabelChange: (ev) =>
    valueAxis = _.extend({}, @props.intersection.valueAxis, { nullLabel: ev.target.value or null })
    @update({ valueAxis: valueAxis })

  renderValueAxis: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Calculation"
      H.div style: { marginLeft: 8 }, 
        R AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ["enum", "text", "boolean", "date", "number"]
          aggrNeed: "required"
          value: @props.intersection.valueAxis
          onChange: @handleValueAxisChange
          showFormat: true

      H.p className: "help-block",
        "This is the calculated value that is displayed. Leave as blank to make an empty section"

  renderNullValue: ->
    if not @props.intersection.valueAxis
      return null

    R FormGroup, label: "Show Empty Cells as",
      H.input type: "text", className: "form-control", value: @props.intersection.valueAxis.nullLabel or "", onChange: @handleNullLabelChange, placeholder: "Blank"

  renderStyling: ->
    H.div className: 'form-group', style: { paddingTop: 10 }, key: "styling",
      H.label className: 'text-muted',
        "Styling"
      H.div null,
        H.label className: "checkbox-inline", key: "bold",
          H.input type: "checkbox", checked: @props.intersection.bold == true, onChange: (ev) => @update({ bold: ev.target.checked })
          "Bold"
        H.label className: "checkbox-inline", key: "italic",
          H.input type: "checkbox", checked: @props.intersection.italic == true, onChange: (ev) => @update({ italic: ev.target.checked })
          "Italic"

  renderBackgroundColorAxis: ->
    return R FormGroup, 
      label: "Background Color From Values"
      help: "This is an optional background color to set on cells that is controlled by the data",
        R AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ["enum", "text", "boolean", "date"]
          aggrNeed: "required"
          value: @props.intersection.backgroundColorAxis
          onChange: @handleBackgroundColorAxisChange
          showColorMap: true

  renderBackgroundColor: ->
    if @props.intersection.backgroundColorAxis
      return
      
    return R FormGroup, 
      label: "Background Color"
      help: "This is an optional background color to set on all cells",
        R ColorComponent,
          color: @props.intersection.backgroundColor
          onChange: @handleBackgroundColorChange

  renderBackgroundColorOpacityControl: ->
    if not @props.intersection.backgroundColorAxis and not @props.intersection.backgroundColor
      return

    H.div className: 'form-group', style: { paddingTop: 10 },
      H.label className: 'text-muted',
        H.span null,
          "Background Opacity: #{Math.round(@props.intersection.backgroundColorOpacity * 100) }%"
      H.div style: {padding: '10px'},
        R Rcslider,
          min: 0
          max: 100
          step: 1
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: @props.intersection.backgroundColorOpacity * 100,
          onChange: @handleBackgroundColorOpacityChange

  render: ->
    H.div null,
      @renderValueAxis()
      @renderNullValue()
      @renderStyling()
      @renderBackgroundColorAxis()
      @renderBackgroundColor()
      @renderBackgroundColorOpacityControl()

FormGroup = (props) ->
  H.div className: "form-group",
    H.label className: "text-muted", 
      props.label
    H.div style: { marginLeft: 5 }, 
      props.children
    if props.help
      H.p className: "help-block", style: { marginLeft: 5 },
        props.help
