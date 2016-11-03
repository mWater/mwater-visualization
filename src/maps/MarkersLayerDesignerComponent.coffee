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
ColorAxisComponent = require '../axes/ColorAxisComponent'
ZoomLevelsComponent = require './ZoomLevelsComponent'
MarkerSymbolSelectComponent = require './MarkerSymbolSelectComponent'

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
      H.div style: { marginLeft: 10 }, 
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

  renderColor: ->
    if not @props.design.axes.geometry
      return

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span className: "glyphicon glyphicon glyphicon-tint"
        "Color"
      H.div style: {marginLeft: 8},
        R ColorAxisComponent,
          defaultColor: @props.design.color
          schema: @props.schema
          dataSource: @props.dataSource
          axis: @props.design.axes.color
          table: @props.design.table
          onColorChange: @handleColorChange
          onColorAxisChange: @handleColorAxisChange
          table: @props.design.table
          showColorMap: true
          types: ["text", "enum", "boolean",'date']
          aggrNeed: "none"
          allowExcludedValues: true

  renderSymbol: ->
    if not @props.design.axes.geometry
      return

    R MarkerSymbolSelectComponent, symbol: @props.design.symbol, onChange: @handleSymbolChange

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
      @renderSymbol()
      @renderFilter()
      @renderPopup()
      if @props.design.table
        R ZoomLevelsComponent, design: @props.design, onDesignChange: @props.onDesignChange


