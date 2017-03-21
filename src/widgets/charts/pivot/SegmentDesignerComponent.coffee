_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AxisComponent = require '../../../axes/AxisComponent'

# Design a single segment of a pivot table
module.exports = class SegmentDesignerComponent extends React.Component
  @propTypes: 
    segment: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    segmentType: React.PropTypes.string.isRequired  # "row" or "column"
    onChange: React.PropTypes.func.isRequired

  constructor: (props) ->
    super

    @state = {
      # Mode switcher to make UI clearer
      mode: if not props.segment.label and not props.segment.valueAxis
          "multiple" # New row/column
        else if props.segment.valueAxis
          "multiple"
        else 
          "single"
    }

  componentDidMount: ->
    @labelElem?.focus()

  # Updates segment with the specified changes
  update: (changes) ->
    segment = _.extend({}, @props.segment, changes)
    @props.onChange(segment)

  handleSingleMode: =>
    @update(valueAxis: null)
    @setState(mode: "single")

  handleMultipleMode: =>
    @setState(mode: "multiple")

  handleValueAxisChange: (valueAxis) => @update(valueAxis: valueAxis)

  handleLabelChange: (ev) =>
    @update(label: ev.target.value)

  renderMode: ->
    R FormGroup, 
      label: "Type",
        H.div key: "single", className: "radio",
          H.label null,
            H.input type: "radio", checked: @state.mode == "single", onChange: @handleSingleMode
            "Single #{@props.segmentType}"
            H.span className: "text-muted", " - used for summary #{@props.segmentType}s and empty #{@props.segmentType}s"

        H.div key: "multiple", className: "radio",
          H.label null,
            H.input type: "radio", checked: @state.mode == "multiple", onChange: @handleMultipleMode
            "Multiple #{@props.segmentType}s"
            H.span className: "text-muted", " - disaggregate data by a field"

  renderLabel: ->
    R FormGroup, 
      label: "Label"
      help: (if @state.mode == "multiple" then "Optional label for the #{@props.segmentType}s"),
        H.input 
          ref: (elem) => @labelElem = elem
          type: "text"
          className: "form-control"
          value: @props.segment.label or ""
          onChange: @handleLabelChange

  renderValueAxis: ->
    R FormGroup, 
      label: "Field"
      help: "Field to disaggregate data by",
        H.div style: { marginLeft: 8 }, 
          R AxisComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            types: ["enum", "text", "boolean", "date"]
            aggrNeed: "none"
            value: @props.segment.valueAxis
            onChange: @handleValueAxisChange
            allowExcludedValues: true

  renderStyling: ->
    R FormGroup, 
      label: "Styling",
        H.label className: "checkbox-inline", key: "bold",
          H.input type: "checkbox", checked: @props.segment.bold == true, onChange: (ev) => @update({ bold: ev.target.checked })
          "Bold"
        H.label className: "checkbox-inline", key: "italic",
          H.input type: "checkbox", checked: @props.segment.italic == true, onChange: (ev) => @update({ italic: ev.target.checked })
          "Italic"
        if @props.segment.valueAxis and @props.segment.label
          H.label className: "checkbox-inline", key: "valueLabelBold",
            H.input type: "checkbox", checked: @props.segment.valueLabelBold == true, onChange: (ev) => @update({ valueLabelBold: ev.target.checked })
            "Header Bold"
        if @props.segment.valueAxis and @props.segment.label
          H.label className: "checkbox-inline", key: "fillerColor",
            H.input type: "checkbox", checked: @props.segment.fillerColor?, onChange: (ev) => @update({ fillerColor: if ev.target.checked then "#EEE" else null })
            "Shade Filler Cells"

  renderBorders: ->
    R FormGroup, 
      label: "Borders",
        H.div key: "before",
          if @props.segmentType == "row" then "Top: " else "Left: "
        R BorderComponent, value: @props.segment.borderBefore, defaultValue: 2, onChange: (value) => @update(borderBefore: value)
        H.div key: "within",
          "Within: "
        R BorderComponent, value: @props.segment.borderWithin, defaultValue: 1, onChange: (value) => @update(borderWithin: value)
        H.div key: "after",
          if @props.segmentType == "row" then "Bottom: " else "Right: "
        R BorderComponent, value: @props.segment.borderAfter, defaultValue: 2, onChange: (value) => @update(borderAfter: value)

  render: ->
    H.div null,
      @renderMode()
      @renderLabel()
      if @state.mode == "multiple"
        @renderValueAxis()
      @renderStyling()
      @renderBorders()

# Allows setting border heaviness
class BorderComponent extends React.Component
  @propTypes:
    value: React.PropTypes.number
    defaultValue: React.PropTypes.number
    onChange: React.PropTypes.func.isRequired

  render: ->
    value = if @props.value? then @props.value else @props.defaultValue

    H.span null,
      H.label className: "radio-inline",
        H.input type: "radio", checked: value == 0, onClick: => @props.onChange(0)
        "None"
      H.label className: "radio-inline",
        H.input type: "radio", checked: value == 1, onClick: => @props.onChange(1)
        "Light"
      H.label className: "radio-inline",
        H.input type: "radio", checked: value == 2, onClick: => @props.onChange(2)
        "Medium"
      H.label className: "radio-inline",
        H.input type: "radio", checked: value == 3, onClick: => @props.onChange(3)
        "Heavy"

FormGroup = (props) ->
  H.div className: "form-group",
    H.label className: "text-muted", 
      props.label
    H.div style: { marginLeft: 5 }, 
      props.children
    if props.help
      H.p className: "help-block", style: { marginLeft: 5 },
        props.help