PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ui = require '../../../UIComponents'
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
AxisComponent = require '../../../axes/AxisComponent'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
TableSelectComponent = require '../../../TableSelectComponent'

module.exports = class CalendarChartDesignerComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTitleTextChange: (ev) =>  @updateDesign(titleText: ev.target.value)
  handleTableChange: (table) => @updateDesign(table: table)
  handleFilterChange: (filter) => @updateDesign(filter: filter)
  
  handleDateAxisChange: (dateAxis) => 
    # Default value axis to count if date axis present
    if not @props.design.valueAxis and dateAxis
      # Create count expr
      valueAxis = { expr: { type: "op", op: "count", table: @props.design.table, exprs: [] }, xform: null }
      @updateDesign(dateAxis: dateAxis, valueAxis: valueAxis)
    else
      @updateDesign(dateAxis: dateAxis)
  handleValueAxisChange: (valueAxis) => @updateDesign(valueAxis: valueAxis)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      React.createElement(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })

  renderTitle: ->
    H.div className: "form-group",
      H.label className: "text-muted", "Title"
      H.input type: "text", className: "form-control input-sm", value: @props.design.titleText, onChange: @handleTitleTextChange, placeholder: "Untitled"

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " "
        "Filters"
      H.div style: { marginLeft: 8 }, 
        React.createElement(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  renderDateAxis: ->
    if not @props.design.table
      return

    R ui.SectionComponent, label: "Date Axis",
      R(AxisComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.design.table
        types: ["date"]
        aggrNeed: "none"
        required: true
        value: @props.design.dateAxis 
        onChange: @handleDateAxisChange
        filters: @props.filter)

  renderValueAxis: ->
    if not @props.design.table or not @props.design.dateAxis
      return

    R ui.SectionComponent, label: "Value Axis",
      R(AxisComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.design.table
        types: ["number"]
        aggrNeed: "required"
        required: true
        value: @props.design.valueAxis 
        onChange: @handleValueAxisChange
        filters: @props.filter)


  render: ->
    H.div null,
      @renderTable()
      @renderDateAxis()
      @renderValueAxis()
      @renderFilter()
      H.hr()
      @renderTitle()
