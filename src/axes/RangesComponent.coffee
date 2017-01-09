React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'uuid'

update = require 'update-object'

LinkComponent = require('mwater-expressions-ui').LinkComponent
AxisBuilder = require './AxisBuilder'
NumberInputComponent = require('react-library/lib/NumberInputComponent')
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")

# Allows setting of ranges 
module.exports = class RangesComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired 
    dataSource: React.PropTypes.object.isRequired

    expr: React.PropTypes.object.isRequired   # Expression for computing min/max
    xform: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  handleRangeChange: (index, range) =>
    ranges = @props.xform.ranges.slice()
    ranges[index] = range
    @props.onChange(update(@props.xform, { ranges: { $set: ranges }}))

  handleAddRange: =>
    ranges = @props.xform.ranges.slice()
    ranges.push({ id: uuid(), minOpen: false, maxOpen: true })
    @props.onChange(update(@props.xform, { ranges: { $set: ranges }}))

  handleRemoveRange: (index) =>
    ranges = @props.xform.ranges.slice()
    ranges.splice(index, 1)
    @props.onChange(update(@props.xform, { ranges: { $set: ranges }}))

  renderRange: (range, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    R RangeComponent,
      key: range.id
      range: range
      onChange: @handleRangeChange.bind(null, index)
      onRemove: @handleRemoveRange.bind(null, index)
      connectDragSource: connectDragSource
      connectDragPreview: connectDragPreview
      connectDropTarget: connectDropTarget

  handleReorder: (ranges) =>
    @props.onChange(update(@props.xform, { ranges: { $set: ranges }}))

  render: ->
    H.div null,
      H.table null,
        if @props.xform.ranges.length > 0
          H.thead null,
            H.tr null,
              H.th null, " "
              H.th key: "min", colSpan: 2, style: { textAlign: "center" }, "From"
              H.th key: "and", ""
              H.th key: "max", colSpan: 2, style: { textAlign: "center" }, "To"
              H.th key: "label", colSpan: 1, style: { textAlign: "center" }, "Label"
              H.th key: "remove"

        React.createElement(ReorderableListComponent,
          items: @props.xform.ranges
          onReorder: @handleReorder
          renderItem: @renderRange
          getItemId: (range) => range.id
          element: H.tbody null
        )
#          _.map @props.xform.ranges, (range, i) =>
#            R RangeComponent, key: range.id, range: range, onChange: @handleRangeChange.bind(null, i), onRemove: @handleRemoveRange.bind(null, i)

      H.button className: "btn btn-link btn-sm", type: "button", onClick: @handleAddRange,
        H.span className: "glyphicon glyphicon-plus"
        " Add Range"

# Single range (row)
class RangeComponent extends React.Component
  @propTypes:
    range: React.PropTypes.object.isRequired   # Range to edit
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired
    connectDragSource: React.PropTypes.func.isRequired #reorderable connector
    connectDragPreview: React.PropTypes.func.isRequired #reorderable connector
    connectDropTarget: React.PropTypes.func.isRequired #reorderable connector

  handleMinOpenChange: (minOpen) =>
    @props.onChange(update(@props.range, { minOpen: { $set: minOpen }}))

  handleMaxOpenChange: (maxOpen) =>
    @props.onChange(update(@props.range, { maxOpen: { $set: maxOpen }}))

  render: ->
    placeholder = ""
    if @props.range.minValue?
      if @props.range.minOpen
        placeholder = "> #{@props.range.minValue}"
      else
        placeholder = ">= #{@props.range.minValue}"

    if @props.range.maxValue?
      if placeholder
        placeholder += " and "
      if @props.range.maxOpen
        placeholder += "< #{@props.range.maxValue}"
      else
        placeholder += "<= #{@props.range.maxValue}"

    @props.connectDragPreview(@props.connectDropTarget(H.tr null,
      H.td null,
        @props.connectDragSource(H.span className: "fa fa-bars")
      H.td key: "minOpen",
        R LinkComponent, 
          dropdownItems: [{ id: true, name: "greater than"}, { id: false, name: "greater than or equal to"}]
          onDropdownItemClicked: @handleMinOpenChange
          if @props.range.minOpen then "greater than" else "greater than or equal to"

      H.td key: "minValue",
        R NumberInputComponent, value: @props.range.minValue, placeholder: "None", small: true, onChange: (v) => @props.onChange(update(@props.range, { minValue: { $set: v }}))

      H.td key: "and", "\u00A0and\u00A0"

      H.td key: "maxOpen",
        R LinkComponent, 
          dropdownItems: [{ id: true, name: "less than"}, { id: false, name: "less than or equal to"}]
          onDropdownItemClicked: @handleMaxOpenChange
          if @props.range.maxOpen then "less than" else "less than or equal to"

      H.td key: "maxValue",
        R NumberInputComponent, value: @props.range.maxValue, placeholder: "None", small: true, onChange: (v) => @props.onChange(update(@props.range, { maxValue: { $set: v }}))

      H.td key: "label",
        H.input type: "text", className: "form-control input-sm", value: @props.range.label or "", placeholder: placeholder, onChange: (ev) => @props.onChange(update(@props.range, { label: { $set: ev.target.value or null }}))

      H.td key: "remove",
        H.button className: "btn btn-xs btn-link", type: "button", onClick: @props.onRemove,
          H.span className: "glyphicon glyphicon-remove"
    ))


