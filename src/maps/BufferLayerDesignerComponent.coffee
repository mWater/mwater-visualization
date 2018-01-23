PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
NumberInputComponent = require('react-library/lib/NumberInputComponent')

AxisComponent = require './../axes/AxisComponent'
ColorComponent = require '../ColorComponent'
TableSelectComponent = require '../TableSelectComponent'
Rcslider = require 'rc-slider'
EditPopupComponent = require './EditPopupComponent'
ZoomLevelsComponent = require './ZoomLevelsComponent'

module.exports = class BufferLayerDesignerComponent extends React.Component
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
  handleRadiusChange: (radius) => @update(radius: radius)
  handleGeometryAxisChange: (axis) => @updateAxes(geometry: axis)
  handleFilterChange: (expr) => @update(filter: expr)
  handleColorChange: (color) => @update(color: color)
  handleColorAxisChange: (axis) => @updateAxes(color: axis)
  handleFillOpacityChange: (fillOpacity) => @update(fillOpacity: fillOpacity/100)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      H.div style: { marginLeft: 10 }, 
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

    title = H.span null,
      H.span className: "glyphicon glyphicon-map-marker"
      " Circle Centers"
    
    filters = _.clone(@props.filters) or []

    if @props.design.filter?
      exprCompiler = new ExprCompiler(@props.schema)
      jsonql = exprCompiler.compileExpr(expr: @props.design.filter, tableAlias: "{alias}")
      if jsonql
        filters.push({ table: @props.design.filter.table, jsonql: jsonql })

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        React.createElement(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          types: ["geometry"]
          aggrNeed: "none"
          value: @props.design.axes.geometry
          onChange: @handleGeometryAxisChange
          filters: filters)

  renderRadius: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Radius (meters)"
      ": "
      React.createElement(NumberInputComponent, value: @props.design.radius, onChange: @handleRadiusChange)

  renderColor: ->
    if not @props.design.axes.geometry
      return
    
    filters = _.clone(@props.filters) or []

    if @props.design.filter?
      exprCompiler = new ExprCompiler(@props.schema)
      jsonql = exprCompiler.compileExpr(expr: @props.design.filter, tableAlias: "{alias}")
      if jsonql
        filters.push({ table: @props.design.filter.table, jsonql: jsonql })

    return H.div null,
      if not @props.design.axes.color
        H.div className: "form-group",
          H.label className: "text-muted", 
            H.span className: "glyphicon glyphicon glyphicon-tint"
            "Circle Color"

          H.div null, 
            R ColorComponent,
              color: @props.design.color
              onChange: @handleColorChange

      H.div className: "form-group",
        H.label className: "text-muted", 
          H.span className: "glyphicon glyphicon glyphicon-tint"
          "Color By Data"

        R AxisComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          types: ["text", "enum", "boolean",'date']
          aggrNeed: "none"
          value: @props.design.axes.color
          defaultColor: @props.design.color
          showColorMap: true
          onChange: @handleColorAxisChange
          allowExcludedValues: true
          filters: filters

  renderFillOpacity: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Circle Opacity (%)"
      ": "
      React.createElement(Rcslider,
        min: 0
        max: 100
        step: 1
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: @props.design.fillOpacity * 100,
        onChange: @handleFillOpacityChange
      )

  renderFilter: ->
    # If no data, hide
    if not @props.design.axes.geometry
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Filters"
      H.div style: { marginLeft: 8 }, 
        React.createElement(FilterExprComponent, 
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
      @renderRadius()
      @renderColor()
      @renderFillOpacity()
      @renderFilter()
      @renderPopup()
      if @props.design.table
        R ZoomLevelsComponent, design: @props.design, onDesignChange: @props.onDesignChange

