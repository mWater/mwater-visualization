_ = require 'lodash'
React = require 'react'
H = React.DOM

updt = require '../updt'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
AxisComponent = require './../axes/AxisComponent'
TableSelectComponent = require '../TableSelectComponent'
ReactSelect = require 'react-select'
ColorComponent = require '../ColorComponent'
Rcslider = require 'rc-slider'


# Designer for a choropleth layer
module.exports = class AdminChoroplethLayerDesigner extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  handleScopeAndDetailLevelChange: (scope, detailLevel) => 
    @props.onDesignChange(_.extend({}, @props.design, { scope: scope, detailLevel: detailLevel }))
  
  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      React.createElement(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: updt(@props.onDesignChange, @props.design, "table") })
  
  renderAdminRegionExpr: ->
    # If no data, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-map-marker")
        " Location"
      H.div style: { marginLeft: 8 }, 
        React.createElement(ExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: updt(@props.onDesignChange, @props.design, "adminRegionExpr")
          table: @props.design.table
          types: ["id"]
          idTable: "admin_regions"
          value: @props.design.adminRegionExpr)

  renderRegionAndDetailLevel: ->
    getOptions = (input, cb) =>
      query = {
        type: "query"
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "country_id" }, alias: "country_id" }
          { type: "select", expr: { type: "field", tableAlias: "main", column: "country" }, alias: "country" }
          { type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" }
          { type: "select", expr: { type: "field", tableAlias: "main", column: "name" }, alias: "name" }
        ]
        from: { type: "table", table: "admin_region_levels", alias: "main" }
      }

      # Execute query
      @props.dataSource.performQuery query, (err, rows) =>
        if err
          cb(err)
          return 

        cb(null, {
          options: [{ value: ":0", label: "Countries" }].concat(_.map(rows, (r) -> { value: r.country_id + ":" + r.level, label: "#{r.name} (#{r.country})" }))
          complete: true
        })

      return

    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Detail Level"
      React.createElement ReactSelect, {
        placeholder: "Select..."
        value: if @props.design.detailLevel? then (@props.design.scope or "") + ":" + @props.design.detailLevel else ""
        asyncOptions: getOptions
        clearable: false
        onChange: (value) => @handleScopeAndDetailLevelChange(value.split(":")[0] or null, parseInt(value.split(":")[1]))
      }

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
        if @props.design.axes.color then " Default Color" else " Color"
      H.div style: { marginLeft: 8 }, 
        React.createElement(ColorComponent, color: @props.design.color, onChange: updt(@props.onDesignChange, @props.design, "color"))

  renderColorAxis: ->
    if not @props.design.table
      return

    title = H.span null,
      H.span className: "glyphicon glyphicon glyphicon-tint"
      " Color By"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        React.createElement(AxisComponent, 
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
  #       React.createElement(AxisComponent, 
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
      React.createElement(Rcslider,
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
        React.createElement(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: updt(@props.onDesignChange, @props.design, "filter")
          table: @props.design.table
          value: @props.design.filter)

  render: ->
    H.div null,
      @renderRegionAndDetailLevel()
      @renderTable()
      @renderAdminRegionExpr()
      @renderDisplayNames()
      @renderColor()
      @renderColorAxis()
      @renderFillOpacity()
      @renderFilter()


