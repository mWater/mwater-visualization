PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent

# Allows selecting of a single region
module.exports = class RegionSelectComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    region: PropTypes.number    # _id of region
    onChange: PropTypes.func.isRequired # Called with (_id, level)
    placeholder: PropTypes.string
    regionsTable: PropTypes.string.isRequired # e.g. "admin_regions"
    maxLevel: PropTypes.number  # Maximum region level allowed

  @defaultProps:
    placeholder: "All Countries"
    regionsTable: "admin_regions"  # Default for existing code

  handleChange: (id) =>
    if not id
      @props.onChange(null, null)
      return

    # Look up level
    query = {
      type: "query"
      selects: [{ type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" }]
      from: { type: "table", table: @props.regionsTable, alias: "main" }
      where: {
        type: "op", op: "=", exprs: [{ type: "field", tableAlias: "main", column: "_id" }, id]
      }
    }

    # Execute query
    @props.dataSource.performQuery query, (err, rows) =>
      if err
        console.log "Error getting regions: " + err?.message
        return 

      @props.onChange(id, rows[0].level)

  render: ->
    filter = null
    if @props.maxLevel?
      filter = {
        type: "op"
        op: "<="
        exprs: [
          { type: "field", tableAlias: "main", column: "level" }
          @props.maxLevel
        ]
      }

    R IdLiteralComponent,
      value: @props.region
      onChange: @handleChange
      idTable: @props.regionsTable
      schema: @props.schema
      dataSource: @props.dataSource
      placeholder: @props.placeholder
      orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }]
      filter: filter

