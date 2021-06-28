PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler

AxisComponent = require './../axes/AxisComponent'
ColorComponent = require '../ColorComponent'
TableSelectComponent = require '../TableSelectComponent'
ZoomLevelsComponent = require './ZoomLevelsComponent'

module.exports = class ClusterLayerDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    design: PropTypes.object.isRequired  # Design of the design
    onDesignChange: PropTypes.func.isRequired # Called with new design
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  # Apply updates to design
  update: (updates) ->
    @props.onDesignChange(_.extend({}, @props.design, updates))

  # Update axes with specified changes
  updateAxes: (changes) ->
    axes = _.extend({}, @props.design.axes, changes)
    @update(axes: axes)

  handleTableChange: (table) => @update(table: table)
  handleGeometryAxisChange: (axis) => @updateAxes(geometry: axis)
  handleFilterChange: (expr) => @update(filter: expr)
  handleTextColorChange: (color) => @update(textColor: color)
  handleFillColorChange: (color) => @update(fillColor: color)

  renderTable: ->
    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R('i', className: "fa fa-database")
        " "
        "Data Source"
      R 'div', style: { marginLeft: 10 }, 
        R TableSelectComponent, { 
          schema: @props.schema
          value: @props.design.table
          onChange: @handleTableChange 
          filter: @props.design.filter
          onFilterChange: @handleFilterChange
        }
  
  renderGeometryAxis: ->
    if not @props.design.table
      return

    title = R 'span', null,
      R 'span', className: "glyphicon glyphicon-map-marker"
      " Locations to Cluster"
    
    filters = _.clone(@props.filters) or []

    if @props.design.filter?
      exprCompiler = new ExprCompiler(@props.schema)
      jsonql = exprCompiler.compileExpr(expr: @props.design.filter, tableAlias: "{alias}")
      if jsonql
        filters.push({ table: @props.design.filter.table, jsonql: jsonql })

    R 'div', className: "form-group",
      R 'label', className: "text-muted", title
      R 'div', style: { marginLeft: 10 }, 
        React.createElement(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          types: ["geometry"]
          aggrNeed: "none"
          value: @props.design.axes.geometry
          onChange: @handleGeometryAxisChange
          filters: filters)


  renderTextColor: ->
    if not @props.design.axes.geometry
      return

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R 'span', className: "glyphicon glyphicon glyphicon-tint"
        "Text Color"

      R 'div', null, 
        R ColorComponent,
          color: @props.design.textColor
          onChange: @handleTextColorChange


  renderFillColor: ->
    if not @props.design.axes.geometry
      return

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R 'span', className: "glyphicon glyphicon glyphicon-tint"
        "Marker Color"

      R 'div', null, 
        R ColorComponent,
          color: @props.design.fillColor
          onChange: @handleFillColorChange

  renderFilter: ->
    # If no data, hide
    if not @props.design.axes.geometry
      return null

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R('span', className: "glyphicon glyphicon-filter")
        " Filters"
      R 'div', style: { marginLeft: 8 }, 
        React.createElement(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  render: ->
    R 'div', null,
      @renderTable()
      @renderGeometryAxis()
      @renderTextColor()
      @renderFillColor()
      @renderFilter()
      if @props.design.table
        R ZoomLevelsComponent, design: @props.design, onDesignChange: @props.onDesignChange

