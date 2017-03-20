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

  render: ->
    H.div null,
      @renderMode()
      @renderLabel()
      if @state.mode == "multiple"
        @renderValueAxis()
      @renderStyling()

FormGroup = (props) ->
  H.div className: "form-group",
    H.label className: "text-muted", 
      props.label
    H.div style: { marginLeft: 5 }, 
      props.children
    if props.help
      H.p className: "help-block", style: { marginLeft: 5 },
        props.help
