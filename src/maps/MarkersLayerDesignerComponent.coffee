_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
AxisComponent = require './../axes/AxisComponent'
ColorComponent = require '../ColorComponent'
TableSelectComponent = require '../TableSelectComponent'
ReactSelect = require 'react-select'
EditPopupComponent = require './EditPopupComponent'

# Designer for a markers layer
module.exports = class MarkersLayerDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  # Apply updates to design
  update: (updates) ->
    @props.onDesignChange(_.extend({}, @props.design, updates))

  # Update axes with specified changes
  updateAxes: (changes) ->
    axes = _.extend({}, @props.design.axes, changes)
    @update(axes: axes)

  handleTableChange: (table) => @update(table: table)
  handleGeometryAxisChange: (axis) => @updateAxes(geometry: axis)
  handleColorAxisChange: (axis) => @updateAxes(color: axis)
  handleFilterChange: (expr) => @update(filter: expr)
  handleColorChange: (color) => @update(color: color)
  handleSymbolChange: (symbol) => @update(symbol: symbol)
  handleNameChange: (e) => @update(name: e.target.value)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })
  
  renderGeometryAxis: ->
    if not @props.design.table
      return

    title = H.span null,
      H.span className: "glyphicon glyphicon-map-marker"
      " Marker Position"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          types: ["geometry"]
          aggrNeed: "none"
          value: @props.design.axes.geometry
          onChange: @handleGeometryAxisChange)

  renderColorAxis: ->
    if not @props.design.axes.geometry
      return

    title = H.span null,
      H.span className: "glyphicon glyphicon glyphicon-tint"
      " Color By"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          types: ["text", "enum", "boolean"]
          aggrNeed: "none"
          value: @props.design.axes.color
          showColorMap: true
          onChange: @handleColorAxisChange)

  renderColor: ->
    if not @props.design.axes.geometry
      return

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span className: "glyphicon glyphicon glyphicon-tint"
        if @props.design.axes.color then " Default Color" else " Color"
      H.div style: { marginLeft: 8 }, 
        R(ColorComponent, color: @props.design.color, onChange: @handleColorChange)

  renderSymbol: ->
    if not @props.design.axes.geometry
      return

    # Create options
    options = [
      { value: "font-awesome/star", label: "Star" }
      { value: "font-awesome/square", label: "Square" }
      { value: "font-awesome/check", label: "Check" }
      { value: "font-awesome/check-circle", label: "Check Circle" }
      { value: "font-awesome/times", label: "Removed" }
      { value: "font-awesome/ban", label: "Ban" }
      { value: "font-awesome/crosshairs", label: "Crosshairs" }
      { value: "font-awesome/flask", label: "Flask" }
      { value: "font-awesome/info-circle", label: "Info Circle" }
      { value: "font-awesome/male", label: "Male" }
      { value: "font-awesome/female", label: "Female" }
      { value: "font-awesome/user", label: "Person" }
      { value: "font-awesome/users", label: "Group" }
      { value: "font-awesome/home", label: "Home" }
      { value: "font-awesome/wheelchair", label: "Wheelchair" }
      { value: "font-awesome/h-square", label: "Hospital Symbol" }
    ]

    optionRenderer = (option) ->
      return H.span null,
        H.i className: "fa fa-#{option.value.substr(13)}" # Trim "font-awesome/"
        " #{option.label}"

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "fa fa-star")
        " "
        "Symbol"
      R ReactSelect, {
        placeholder: "Circle"
        value: @props.design.symbol
        options: options
        optionRenderer: optionRenderer
        valueRenderer: optionRenderer
        onChange: @handleSymbolChange
      }

  renderFilter: ->
    # If no data, hide
    if not @props.design.axes.geometry
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Filters"
      H.div style: { marginLeft: 8 }, 
        R(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  renderPopup: ->
    if not @props.design.table
      return null

    return R EditPopupComponent, 
      design: @props.design
      onDesignChange: @props.onDesignChange
      schema: @props.schema
      dataSource: @props.dataSource
      table: @props.design.table

  render: ->
    H.div null,
      @renderTable()
      @renderGeometryAxis()
      @renderColor()
      @renderColorAxis()
      @renderSymbol()
      @renderFilter()
      @renderPopup()


