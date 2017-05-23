_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
AxisComponent = require './../axes/AxisComponent'
TableSelectComponent = require '../TableSelectComponent'
ColorComponent = require '../ColorComponent'
Rcslider = require 'rc-slider'
EditPopupComponent = require './EditPopupComponent'
ZoomLevelsComponent = require './ZoomLevelsComponent'

AdminScopeAndDetailLevelComponent = require './AdminScopeAndDetailLevelComponent'

# Designer for a choropleth layer
module.exports = class AdminChoroplethLayerDesigner extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design
    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  # Apply updates to design
  update: (updates) ->
    @props.onDesignChange(_.extend({}, @props.design, updates))

  # Update axes with specified changes
  updateAxes: (changes) ->
    axes = _.extend({}, @props.design.axes, changes)
    @update(axes: axes)

  handleScopeAndDetailLevelChange: (scope, scopeLevel, detailLevel) => 
    @props.onDesignChange(_.extend({}, @props.design, { scope: scope, scopeLevel: scopeLevel, detailLevel: detailLevel }))
  
  handleTableChange: (table) =>
    # Autoselect admin region if present
    adminRegionExpr = null

    if table
      for column in @props.schema.getColumns(table)
        if column.type == "join" and column.join.type == "n-1" and column.join.toTable == "admin_regions"
          adminRegionExpr = { type: "field", table: table, column: column.id }
          break
    
    @props.onDesignChange(_.extend({}, @props.design, { table: table, adminRegionExpr: adminRegionExpr }))

  handleColorChange: (color) => @update(color: color)
  handleColorAxisChange: (axis) => @updateAxes(color: axis)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      H.div style: { marginLeft: 10 }, 
        R(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })
  
  renderAdminRegionExpr: ->
    # If no data, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-map-marker")
        " Location"
      H.div style: { marginLeft: 8 }, 
        R(ExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: (expr) => @update(adminRegionExpr: expr)
          table: @props.design.table
          types: ["id"]
          idTable: "admin_regions"
          value: @props.design.adminRegionExpr)

  renderScopeAndDetailLevel: ->
    R AdminScopeAndDetailLevelComponent,
      schema: @props.schema
      dataSource: @props.dataSource
      scope: @props.design.scope
      scopeLevel: @props.design.scopeLevel or 0
      detailLevel: @props.design.detailLevel
      onScopeAndDetailLevelChange: @handleScopeAndDetailLevelChange

  renderDisplayNames: ->
    H.div className: "form-group",
      H.div className: "checkbox",
        H.label null,
          H.input type: "checkbox", checked: @props.design.displayNames, onChange: (ev) => @update({ displayNames: ev.target.checked })
          "Display Region Names"

  renderColor: ->
    if not @props.design.table
      return

    return H.div null,
      if not @props.design.axes.color
        H.div className: "form-group",
          H.label className: "text-muted", 
            H.span className: "glyphicon glyphicon glyphicon-tint"
            "Fill Color"

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
          aggrNeed: "required"
          value: @props.design.axes.color
          defaultColor: @props.design.color
          showColorMap: true
          onChange: @handleColorAxisChange
          allowExcludedValues: true
          filters: @props.filters

  # renderLabelAxis: ->
  #   if not @props.design.table
  #     return

  #   title = H.span null,
  #     H.span className: "glyphicon glyphicon glyphicon-tint"
  #     " Color By"

  #   H.div className: "form-group",
  #     H.label className: "text-muted", title
  #     H.div style: { marginLeft: 10 }, 
  #       R(AxisComponent, 
  #         schema: @props.schema
  #         dataSource: @props.dataSource
  #         table: @props.design.table
  #         types: ["text", "enum", "boolean"]
  #         aggrNeed: "none"
  #         value: @props.design.axes.color
  #         showColorMap: true
  #         onChange: @handleColorAxisChange)

  renderFillOpacity: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Fill Opacity (%)"
      ": "
      R(Rcslider,
        min: 0
        max: 100
        step: 1
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: @props.design.fillOpacity * 100,
        onChange: (val) => @update(fillOpacity: val/100)
      )

  renderFilter: ->
    # If no data, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Filters"
      H.div style: { marginLeft: 8 }, 
        R(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: (filter) => @update(filter: filter)
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
      @renderAdminRegionExpr()
      @renderScopeAndDetailLevel()
      @renderDisplayNames()
      @renderColor()
      @renderFillOpacity()
      @renderFilter()
      @renderPopup()
      if @props.design.table
        R ZoomLevelsComponent, design: @props.design, onDesignChange: @props.onDesignChange


