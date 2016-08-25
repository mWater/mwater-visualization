_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ReactSelect = require 'react-select'
IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent

module.exports = class AdminScopeAndDetailLevelComponent extends React.Component
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
