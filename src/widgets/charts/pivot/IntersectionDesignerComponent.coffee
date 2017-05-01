_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ui = require 'react-library/lib/bootstrap'
update = require 'react-library/lib/update'

Rcslider = require 'rc-slider'
AxisComponent = require '../../../axes/AxisComponent'
ColorComponent = require '../../../ColorComponent'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprComponent = require("mwater-expressions-ui").ExprComponent

DashboardPopupSelectorComponent = require '../../../dashboards/DashboardPopupSelectorComponent'

# Design an intersection of a pivot table
module.exports = class IntersectionDesignerComponent extends React.Component
  @propTypes: 
    intersection: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    widgetDataSource: React.PropTypes.object.isRequired # dashboard data source for widget
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

  # Updates intersection with the specified changes
  update: => update(@props.intersection, @props.onChange, arguments)

  handleBackgroundColorAxisChange: (backgroundColorAxis) => 
    opacity = @props.intersection.backgroundColorOpacity or 1
    @update(backgroundColorAxis: backgroundColorAxis, backgroundColorOpacity: opacity)

  handleBackgroundColorChange: (backgroundColor) => 
    opacity = @props.intersection.backgroundColorOpacity or 1
    @update(backgroundColor: backgroundColor, backgroundColorOpacity: opacity)

  handleBackgroundColorConditionsChange: (backgroundColorConditions) =>
    opacity = @props.intersection.backgroundColorOpacity or 1
    @update(backgroundColorConditions: backgroundColorConditions, backgroundColorOpacity: opacity)

  handleBackgroundColorOpacityChange: (newValue) =>
    @update(backgroundColorOpacity: newValue / 100)

  handleFilterChange: (filter) => @update(filter: filter)

  renderValueAxis: ->
    R ui.FormGroup, 
      labelMuted: true
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
      R ui.FormGroup, 
        labelMuted: true
        label: "Show Empty Cells as",
          R ui.TextInput, value: @props.intersection.valueAxis.nullLabel, emptyNull: true, onChange: @update("valueAxis.nullLabel"), placeholder: "Blank"

  renderFilter: ->
    R ui.FormGroup, 
      labelMuted: true
      label: [R(ui.Icon, id: "glyphicon-filter"), " Filters"],
        R FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.table
          value: @props.intersection.filter

  renderStyling: ->
    R ui.FormGroup, 
      labelMuted: true
      key: "styling"
      label: "Styling",
        R ui.Checkbox, key: "bold", inline: true, value: @props.intersection.bold, onChange: @update("bold"), "Bold"
        R ui.Checkbox, key: "italic", inline: true, value: @props.intersection.italic, onChange: @update("italic"), "Italic"

  renderBackgroundColorConditions: ->
    R BackgroundColorConditionsComponent,
      schema: @props.schema
      dataSource: @props.dataSource
      table: @props.table
      colorConditions: @props.intersection.backgroundColorConditions
      onChange: @handleBackgroundColorConditionsChange

  renderBackgroundColorAxis: ->
    return R ui.FormGroup, 
      labelMuted: true
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
      labelMuted: true
      label: "Background Color"
      help: "This is an optional background color to set on all cells",
        R ColorComponent,
          color: @props.intersection.backgroundColor
          onChange: @handleBackgroundColorChange

  renderBackgroundColorOpacityControl: ->
    if not @props.intersection.backgroundColorAxis and not @props.intersection.backgroundColor and not @props.intersection.backgroundColorConditions?[0]
      return

    R ui.FormGroup, 
      labelMuted: true
      label: "Background Opacity: #{Math.round(@props.intersection.backgroundColorOpacity * 100) }%",
        R Rcslider,
          min: 0
          max: 100
          step: 1
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: @props.intersection.backgroundColorOpacity * 100,
          onChange: @handleBackgroundColorOpacityChange

  renderAdvanced: ->
    R ui.CollapsibleSection,
      label: "Advanced"
      labelMuted: true,
        R ui.FormGroup, 
          labelMuted: true
          label: "When cell is clicked:",
            R ui.Select,
              value: @props.intersection.clickAction or null
              onChange: @update("clickAction")
              options: [
                { value: null, label: "Do nothing"}
                { value: "scope", label: "Filter other widgets"}
                { value: "popup", label: "Open popup"}
              ]

        if @props.intersection.clickAction == "popup"
          R DashboardPopupSelectorComponent,
            popups: @props.popups
            onPopupsChange: @props.onPopupsChange
            schema: @props.schema
            dataSource: @props.dataSource
            widgetDataSource: @props.widgetDataSource
            onSystemAction: @props.onSystemAction
            namedStrings: @props.namedStrings
            filters: @props.filters
            popupId: @props.intersection.clickActionPopup
            onPopupIdChange: @update("clickActionPopup")

  render: ->
    H.div null,
      @renderValueAxis()
      @renderNullValue()
      @renderFilter()
      @renderStyling()
      @renderBackgroundColorAxis()
      @renderBackgroundColorConditions()
      @renderBackgroundColor()
      @renderBackgroundColorOpacityControl()
      @renderAdvanced()

# Displays background color conditions
class BackgroundColorConditionsComponent extends React.Component
  @propTypes: 
    colorConditions: React.PropTypes.array
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  handleAdd: =>
    colorConditions = (@props.colorConditions or []).slice()
    colorConditions.push({})
    @props.onChange(colorConditions)

  handleChange: (index, colorCondition) =>
    colorConditions = @props.colorConditions.slice()
    colorConditions[index] = colorCondition
    @props.onChange(colorConditions)

  handleRemove: (index) =>
    colorConditions = @props.colorConditions.slice()
    colorConditions.splice(index, 1)
    @props.onChange(colorConditions)

  render: ->
    # List conditions
    R ui.FormGroup, 
      label: "Color Conditions"
      labelMuted: true
      help: "Add conditions that, if met, set the color of the cell. Useful for flagging certain values",
        _.map @props.colorConditions, (colorCondition, i) => 
          R BackgroundColorConditionComponent,
            key: i
            colorCondition: colorCondition
            table: @props.table
            schema: @props.schema
            dataSource: @props.dataSource
            onChange: @handleChange.bind(null, i)
            onRemove: @handleRemove.bind(null, i)
        R ui.Button, type: "link", size: "sm", onClick: @handleAdd,
          R ui.Icon, id: "fa-plus"
          " Add Condition"

# Displays single background color condition
class BackgroundColorConditionComponent extends React.Component
  @propTypes: 
    colorCondition: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  # Updates intersection with the specified changes
  update: => update(@props.colorCondition, @props.onChange, arguments)

  render: ->
    H.div className: "panel panel-default",
      H.div className: "panel-body",
        R ui.FormGroup, 
          labelMuted: true
          label: "Condition",
            R ExprComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              onChange: @update("condition")
              types: ['boolean']
              aggrStatuses: ["aggregate", "literal"]
              table: @props.table
              value: @props.colorCondition.condition

        R ui.FormGroup, 
          labelMuted: true
          label: "Color"
          hint: "Color to display when condition is met",
            R ColorComponent,
              color: @props.colorCondition.color
              onChange: @update("color")

