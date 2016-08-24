_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

updt = require '../updt'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
AxisComponent = require './../axes/AxisComponent'
TableSelectComponent = require '../TableSelectComponent'
ReactSelect = require 'react-select'
ColorComponent = require '../ColorComponent'
Rcslider = require 'rc-slider'
EditPopupComponent = require './EditPopupComponent'
ColorAxisComponent = require '../axes/ColorAxisComponent'
IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent

# Designer for a choropleth layer
module.exports = class AdminChoroplethLayerDesigner extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  handleScopeAndDetailLevelChange: (scope, scopeLevel, detailLevel) => 
    @props.onDesignChange(_.extend({}, @props.design, { scope: scope, scopeLevel: scopeLevel, detailLevel: detailLevel }))
  
  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: updt(@props.onDesignChange, @props.design, "table") })
  
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
          onChange: updt(@props.onDesignChange, @props.design, "adminRegionExpr")
          table: @props.design.table
          types: ["id"]
          idTable: "admin_regions"
          value: @props.design.adminRegionExpr)

  renderScopeAndDetailLevel: ->
    R ScopeAndDetailLevelComponent,
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
          H.input type: "checkbox", checked: @props.design.displayNames, onChange: (ev) => updt(@props.onDesignChange, @props.design, "displayNames", ev.target.checked)
          "Display Region Names"

  renderColor: ->
    if not @props.design.table
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
          onColorChange: updt(@props.onDesignChange, @props.design, "color")
          onColorAxisChange: updt(@props.onDesignChange, @props.design, ["axes", "color"])
          table: @props.design.table
          showColorMap: true
          types: ["text", "enum", "boolean"]
          aggrNeed: "required"
#        R(ColorComponent, color: @props.design.color, onChange: updt(@props.onDesignChange, @props.design, "color"))

  renderColorAxis: ->
    if not @props.design.table
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
          aggrNeed: "required"
          value: @props.design.axes.color
          showColorMap: true
          onChange: updt(@props.onDesignChange, @props.design, ["axes", "color"]))

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
        onChange: (val) => updt(@props.onDesignChange, @props.design, "fillOpacity", val/100)
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
        R(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: updt(@props.onDesignChange, @props.design, "filter")
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
      @renderScopeAndDetailLevel()
      @renderTable()
      @renderAdminRegionExpr()
      @renderDisplayNames()
      @renderColor()
      @renderFillOpacity()
      @renderFilter()
      @renderPopup()


class ScopeAndDetailLevelComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    scope: React.PropTypes.string     # admin region
    scopeLevel: React.PropTypes.number # Scope level within
    detailLevel: React.PropTypes.number # Detail level within
    onScopeAndDetailLevelChange: React.PropTypes.func.isRequired # Called with (scope, scopeLevel, detailLevel)

  handleScopeChange: (scope, scopeLevel) =>
    if scope
      @props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1)
    else
      @props.onScopeAndDetailLevelChange(null, null, 0)

  handleDetailLevelChange: (detailLevel) =>
    @props.onScopeAndDetailLevelChange(@props.scope, @props.scopeLevel, detailLevel)

  render: ->
    H.div null,
      H.div className: "form-group",
        H.label className: "text-muted", 
          "Region to Map"
        R RegionComponent, region: @props.scope, onChange: @handleScopeChange, schema: @props.schema, dataSource: @props.dataSource
      if @props.scope? and @props.detailLevel?
        H.div className: "form-group",
          H.label className: "text-muted", 
            "Detail Level"
          R DetailLevelComponent, 
            scope: @props.scope
            scopeLevel: @props.scopeLevel
            detailLevel: @props.detailLevel
            onChange: @handleDetailLevelChange
            schema: @props.schema
            dataSource: @props.dataSource

class RegionComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    region: React.PropTypes.string    # _id of region
    onChange: React.PropTypes.func.isRequired # Called with (_id, level)

  handleChange: (id) =>
    if not id
      @props.onChange(null, null)
      return

    # Look up level
    query = {
      type: "query"
      selects: [{ type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" }]
      from: { type: "table", table: "admin_regions", alias: "main" }
      where: {
        type: "op", op: "=", exprs: [{ type: "field", tableAlias: "main", column: "_id" }, id]
      }
    }

    # Execute query
    @props.dataSource.performQuery query, (err, rows) =>
      if err
        cb(err)
        return 

      @props.onChange(id, rows[0].level)

  render: ->
    R IdLiteralComponent,
      value: @props.region
      onChange: @handleChange
      idTable: "admin_regions"
      schema: @props.schema
      dataSource: @props.dataSource
      placeholder: "All Countries"
      orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }]

class DetailLevelComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    scope: React.PropTypes.string.isRequired     # admin region
    scopeLevel: React.PropTypes.number.isRequired    # admin region
    detailLevel: React.PropTypes.number # Detail level within
    onChange: React.PropTypes.func.isRequired # Called with (detailLevel)

  constructor: ->
    super
    @state = { options: null }

  componentWillMount: ->
    @loadLevels(@props)

  componentWillReceiveProps: (nextProps) ->
    if nextProps.scope != @props.scope
      @loadLevels(nextProps)

  loadLevels: (props) ->
    # Get country id of scope
    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "level0" }, alias: "level0" }
      ]
      from: { type: "table", table: "admin_regions", alias: "main" }
      where: {
        type: "op", op: "=", exprs: [{ type: "field", tableAlias: "main", column: "_id" }, props.scope]
      }
    }

    # Execute query
    props.dataSource.performQuery query, (err, rows) =>
      if err
        cb(err)
        return 

      countryId = rows[0].level0

      # Get levels
      query = {
        type: "query"
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" }
          { type: "select", expr: { type: "field", tableAlias: "main", column: "name" }, alias: "name" }
        ]
        from: { type: "table", table: "admin_region_levels", alias: "main" }
        where: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "main", column: "country_id" }, countryId] }
        orderBy: [{ ordinal: 1, direction: "asc" }]
      }

      # Execute query
      props.dataSource.performQuery query, (err, rows) =>
        if err
          cb(err)
          return 
        console.log rows
        options = _.map(_.filter(rows, (r) => r.level > props.scopeLevel), (r) -> { value: r.level, label: r.name })
        @setState(options: options)

  render: ->
    if @state.options
      R ReactSelect, {
        value: @props.detailLevel or ""
        options: @state.options
        clearable: false
        onChange: (value) => @props.onChange(parseInt(value))
      }
    else
      H.div className: "text-muted",
        H.i className: "fa fa-spinner fa-spin"
        " Loading..."
