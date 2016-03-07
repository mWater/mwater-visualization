_ = require 'lodash'
React = require 'react'
H = React.DOM

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils

TableSelectComponent = require '../TableSelectComponent'
ReactSelect = require 'react-select'

# Designer for a markers layer
module.exports = class AdminIndicatorChoroplethLayerDesigner extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  # Apply updates to design
  update: (updates) ->
    @props.onDesignChange(_.extend({}, @props.design, updates))

  handleScopeAndDetailLevelChange: (scope, detailLevel) => @update(scope: scope, detailLevel: detailLevel)
  handleTableChange: (table) => @update(table: table)
  handleAdminRegionExprChange: (expr) => @update(adminRegionExpr: expr)
  handleConditionChange: (expr) => @update(condition: expr)
  handleBasisChange: (expr) => @update(basis: expr)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-file")
        " "
        "Data Source"
      ": "
      React.createElement(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })
  
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
          onChange: @handleAdminRegionExprChange
          table: @props.design.table
          types: ["id"]
          idTable: "admin_regions"
          value: @props.design.adminRegionExpr)

  renderCondition: ->
    # If no data, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-scale")
        " Condition (numerator)"
      H.div style: { marginLeft: 8 }, 
        React.createElement(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleConditionChange
          table: @props.design.table
          value: @props.design.condition)

  renderBasis: ->
    # If no data, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Basis (denominator)"
      H.div style: { marginLeft: 8 }, 
        React.createElement(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleBasisChange
          table: @props.design.table
          value: @props.design.basis)

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

  render: ->
    H.div null,
      @renderRegionAndDetailLevel()
      @renderTable()
      @renderAdminRegionExpr()
      @renderCondition()
      @renderBasis()

