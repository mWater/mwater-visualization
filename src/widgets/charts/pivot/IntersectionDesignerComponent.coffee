_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ui = require 'react-library/lib/bootstrap'
update = require 'react-library/lib/update'

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
  update: => update(@props.intersection, @props.onChange, arguments)

  handleBackgroundColorAxisChange: (backgroundColorAxis) => 
    opacity = @props.intersection.backgroundColorOpacity or 1
    @update(backgroundColorAxis: backgroundColorAxis, backgroundColorOpacity: opacity)

  handleBackgroundColorChange: (backgroundColor) => 
    opacity = @props.intersection.backgroundColorOpacity or 1
    @update(backgroundColor: backgroundColor, backgroundColorOpacity: opacity)

  handleBackgroundColorOpacityChange: (newValue) =>
    @update(backgroundColorOpacity: newValue / 100)

  renderValueAxis: ->
    R ui.FormGroup, 
      label: "Calculation"
      help: "This is the calculated value that is displayed. Leave as blank to make an empty section",
        R AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ["enum", "text", "boolean", "date", "number"]
          aggrNeed: "required"
          value: @props.intersection.valueAxis
          onChange: @update("valueAxis")
          showFormat: true

  renderNullValue: ->
    if @props.intersection.valueAxis
      R ui.FormGroup, label: "Show Empty Cells as",
        R ui.TextInput, value: @props.intersection.valueAxis.nullLabel, emptyNull: true, onChange: @update("valueAxis.nullLabel"), placeholder: "Blank"

  renderStyling: ->
    R ui.FormGroup, key: "styling", label: "Styling",
      R ui.Checkbox, key: "bold", inline: true, value: @props.intersection.bold, onChange: @update("bold"), "Bold"
      R ui.Checkbox, key: "italic", inline: true, value: @props.intersection.italic, onChange: @update("italic"), "Italic"

  renderBackgroundColorAxis: ->
    return R ui.FormGroup, 
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
      
    return R ui.FormGroup, 
      label: "Background Color"
      help: "This is an optional background color to set on all cells",
        R ColorComponent,
          color: @props.intersection.backgroundColor
          onChange: @handleBackgroundColorChange

  renderBackgroundColorOpacityControl: ->
    if not @props.intersection.backgroundColorAxis and not @props.intersection.backgroundColor
      return

    R ui.FormGroup, 
      label: "Background Opacity: #{Math.round(@props.intersection.backgroundColorOpacity * 100) }%",
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
