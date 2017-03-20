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

  componentDidMount: ->
    @labelElem?.focus()

  # Updates segment with the specified changes
  update: (changes) ->
    segment = _.extend({}, @props.segment, changes)
    @props.onChange(segment)

  handleValueAxisChange: (valueAxis) => @update(valueAxis: valueAxis)

  handleLabelChange: (ev) =>
    @update(label: ev.target.value)

  renderLabel: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Label"
      H.input 
        ref: (elem) => @labelElem = elem
        type: "text"
        className: "form-control"
        value: @props.segment.label or ""
        onChange: @handleLabelChange
      H.p className: "help-block",
        "This is an optional label for the #{@props.segmentType}"

  renderValueAxis: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Field"
      H.div style: { marginLeft: 8 }, 
        R AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ["enum", "text", "boolean", "date"]
          aggrNeed: "none"
          value: @props.segment.valueAxis
          onChange: @handleValueAxisChange

          # Can exclude values
          allowExcludedValues: true
      H.p className: "help-block",
        "This is an optional field for the #{@props.segmentType}. Leave blank to make a totals #{@props.segmentType}."

  renderStyling: ->
    H.div className: 'form-group', style: { paddingTop: 10 }, key: "styling",
      H.label className: 'text-muted',
        "Styling"
      H.div null,
        H.label className: "checkbox-inline", key: "bold",
          H.input type: "checkbox", checked: @props.segment.bold == true, onChange: (ev) => @update({ bold: ev.target.checked })
          "Bold"
        H.label className: "checkbox-inline", key: "italic",
          H.input type: "checkbox", checked: @props.segment.italic == true, onChange: (ev) => @update({ italic: ev.target.checked })
          "Italic"

  render: ->
    H.div null,
      @renderLabel()
      @renderValueAxis()
      @renderStyling()
