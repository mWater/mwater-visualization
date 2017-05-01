_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ui = require 'react-library/lib/bootstrap'
update = require 'react-library/lib/update'

AxisComponent = require '../../../axes/AxisComponent'
ColorComponent = require '../../../ColorComponent'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
DashboardPopupSelectorComponent = require '../../../dashboards/DashboardPopupSelectorComponent'

# Design a single segment of a pivot table
module.exports = class SegmentDesignerComponent extends React.Component
  @propTypes: 
    segment: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    widgetDataSource: React.PropTypes.object.isRequired # dashboard data source for widget
    segmentType: React.PropTypes.string.isRequired  # "row" or "column"
    onChange: React.PropTypes.func.isRequired

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func               # If not set, readonly

    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Filters to add to the dashboard
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired    # id table to filter
      jsonql: React.PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))


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

  # Updates segment with the specified changes
  update: => update(@props.segment, @props.onChange, arguments)

  componentDidMount: ->
    @labelElem?.focus()

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
    R ui.FormGroup, 
      labelMuted: true
      label: "Label"
      help: (if @state.mode == "multiple" then "Optional label for the #{@props.segmentType}s"),
        H.input 
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
          H.div style: { paddingTop: 5 },
            "Shade filler cells: "
            R ColorComponent, color: @props.segment.fillerColor, onChange: @update("fillerColor")

  renderBorders: ->
    R ui.FormGroup, 
      labelMuted: true
      label: "Borders",
        H.div key: "before",
          if @props.segmentType == "row" then "Top: " else "Left: "
        R BorderComponent, value: @props.segment.borderBefore, defaultValue: 2, onChange: @update("borderBefore")
        H.div key: "within",
          "Within: "
        R BorderComponent, value: @props.segment.borderWithin, defaultValue: 1, onChange: @update("borderWithin")
        H.div key: "after",
          if @props.segmentType == "row" then "Bottom: " else "Right: "
        R BorderComponent, value: @props.segment.borderAfter, defaultValue: 2, onChange: @update("borderAfter")

  renderAdvanced: ->
    if @props.segment.valueAxis
      R ui.CollapsibleSection,
        label: "Advanced"
        labelMuted: true,
          R ui.FormGroup, 
            labelMuted: true
            label: "When #{@props.segmentType} value is clicked:",
              R ui.Select,
                value: @props.segment.clickAction or null
                onChange: @update("clickAction")
                options: [
                  { value: null, label: "Do nothing"}
                  { value: "scope", label: "Filter other widgets"}
                  { value: "popup", label: "Open popup"}
                ]

          if @props.segment.clickAction == "popup"
            R DashboardPopupSelectorComponent,
              popups: @props.popups
              onPopupsChange: @props.onPopupsChange
              schema: @props.schema
              dataSource: @props.dataSource
              widgetDataSource: @props.widgetDataSource
              onSystemAction: @props.onSystemAction
              namedStrings: @props.namedStrings
              filters: @props.filters
              popupId: @props.segment.clickActionPopup
              onPopupIdChange: @update("clickActionPopup")

  render: ->
    H.div null,
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
      if @state.mode
        @renderAdvanced()

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
