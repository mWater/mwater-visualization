PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ui = require 'react-library/lib/bootstrap'
AxisComponent = require '../../../axes/AxisComponent'
ColorComponent = require '../../../ColorComponent'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent

# Design a single segment of a pivot table
module.exports = class SegmentDesignerComponent extends React.Component
  @propTypes: 
    segment: PropTypes.object.isRequired
    table: PropTypes.string.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    segmentType: PropTypes.string.isRequired  # "row" or "column"
    onChange: PropTypes.func.isRequired
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  constructor: (props) ->
    super

    @state = {
      # Mode switcher to make UI clearer
      mode: if not props.segment.label? and not props.segment.valueAxis
          null
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

  handleFilterChange: (filter) =>
    @update(filter: filter)

  renderMode: ->
    R ui.FormGroup, 
      labelMuted: true
      label: "Type",
        R 'div', key: "single", className: "radio",
          R 'label', null,
            R 'input', type: "radio", checked: @state.mode == "single", onChange: @handleSingleMode
            "Single #{@props.segmentType}"
            R 'span', className: "text-muted", " - used for summary #{@props.segmentType}s and empty #{@props.segmentType}s"

        R 'div', key: "multiple", className: "radio",
          R 'label', null,
            R 'input', type: "radio", checked: @state.mode == "multiple", onChange: @handleMultipleMode
            "Multiple #{@props.segmentType}s"
            R 'span', className: "text-muted", " - disaggregate data by a field"

  renderLabel: ->
    R ui.FormGroup, 
      labelMuted: true
      label: "Label"
      help: (if @state.mode == "multiple" then "Optional label for the #{@props.segmentType}s"),
        R 'input', 
          ref: (elem) => @labelElem = elem
          type: "text"
          className: "form-control"
          value: @props.segment.label or ""
          onChange: @handleLabelChange

  renderValueAxis: ->
    R ui.FormGroup, 
      labelMuted: true
      label: "Field"
      help: "Field to disaggregate data by",
        R 'div', style: { marginLeft: 8 }, 
          R AxisComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            types: ["enum", "text", "boolean", "date"]
            aggrNeed: "none"
            value: @props.segment.valueAxis
            onChange: @handleValueAxisChange
            allowExcludedValues: true
            filters: @props.filters

  renderFilter: ->
    R ui.FormGroup, 
      labelMuted: true
      label: [R(ui.Icon, id: "glyphicon-filter"), " Filters"]
      hint: "Filters all data associated with this #{@props.segmentType}",
        R FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.table
          value: @props.segment.filter

  renderStyling: ->
    R ui.FormGroup, 
      labelMuted: true
      label: "Styling",
        R 'label', className: "checkbox-inline", key: "bold",
          R 'input', type: "checkbox", checked: @props.segment.bold == true, onChange: (ev) => @update({ bold: ev.target.checked })
          "Bold"
        R 'label', className: "checkbox-inline", key: "italic",
          R 'input', type: "checkbox", checked: @props.segment.italic == true, onChange: (ev) => @update({ italic: ev.target.checked })
          "Italic"
        if @props.segment.valueAxis and @props.segment.label
          R 'label', className: "checkbox-inline", key: "valueLabelBold",
            R 'input', type: "checkbox", checked: @props.segment.valueLabelBold == true, onChange: (ev) => @update({ valueLabelBold: ev.target.checked })
            "Header Bold"
        if @props.segment.valueAxis and @props.segment.label
          R 'div', style: { paddingTop: 5 },
            "Shade filler cells: "
            R ColorComponent, color: @props.segment.fillerColor, onChange: (color) => @update({ fillerColor: color })

  renderBorders: ->
    R ui.FormGroup, 
      labelMuted: true
      label: "Borders",
        R 'div', key: "before",
          if @props.segmentType == "row" then "Top: " else "Left: "
        R BorderComponent, value: @props.segment.borderBefore, defaultValue: 2, onChange: (value) => @update(borderBefore: value)
        R 'div', key: "within",
          "Within: "
        R BorderComponent, value: @props.segment.borderWithin, defaultValue: 1, onChange: (value) => @update(borderWithin: value)
        R 'div', key: "after",
          if @props.segmentType == "row" then "Bottom: " else "Right: "
        R BorderComponent, value: @props.segment.borderAfter, defaultValue: 2, onChange: (value) => @update(borderAfter: value)

  render: ->
    R 'div', null,
      @renderMode()
      if @state.mode
        @renderLabel()
      if @state.mode == "multiple"
        @renderValueAxis()
      if @state.mode
        @renderFilter()
      if @state.mode
        @renderStyling()
      if @state.mode
        @renderBorders()

# Allows setting border heaviness
class BorderComponent extends React.Component
  @propTypes:
    value: PropTypes.number
    defaultValue: PropTypes.number
    onChange: PropTypes.func.isRequired

  render: ->
    value = if @props.value? then @props.value else @props.defaultValue

    R 'span', null,
      R 'label', className: "radio-inline",
        R 'input', type: "radio", checked: value == 0, onClick: => @props.onChange(0)
        "None"
      R 'label', className: "radio-inline",
        R 'input', type: "radio", checked: value == 1, onClick: => @props.onChange(1)
        "Light"
      R 'label', className: "radio-inline",
        R 'input', type: "radio", checked: value == 2, onClick: => @props.onChange(2)
        "Medium"
      R 'label', className: "radio-inline",
        R 'input', type: "radio", checked: value == 3, onClick: => @props.onChange(3)
        "Heavy"
