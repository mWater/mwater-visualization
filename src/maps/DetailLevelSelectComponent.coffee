PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ReactSelect = require 'react-select'

# Select detail level within an admin region
module.exports = class DetailLevelSelectComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    scope: PropTypes.string.isRequired     # admin region
    scopeLevel: PropTypes.number.isRequired    # admin region
    detailLevel: PropTypes.number # Detail level within
    onChange: PropTypes.func.isRequired # Called with (detailLevel)

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
        alert("Error loading detail levels")
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
          alert("Error loading detail levels")
          return 

        # Only greater than current scope level
        rows = _.filter(rows, (r) => r.level > props.scopeLevel)

        # If detail level set (defaults to zero), and has an option, auto-select
        if @props.detailLevel <= @props.scopeLevel and rows.length > 0
          @props.onChange(rows[0].level)

        options = _.map(rows, (r) -> { value: r.level, label: r.name })
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
      R 'div', className: "text-muted",
        R 'i', className: "fa fa-spinner fa-spin"
        " Loading..."
