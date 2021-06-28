PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

querystring = require 'querystring'
ui = require 'react-library/lib/bootstrap'

IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent

# Control to edit the global filters (_managed_by and admin_region)
module.exports = class MWaterGlobalFiltersComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema of the database
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    filterableTables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
    globalFilters: PropTypes.array
    onChange: PropTypes.func.isRequired

  handleRegionsChange: (regions) =>
    # Remove existing filter
    globalFilters = _.filter(@props.globalFilters or [], (gf) -> not (gf.op == "within any" and gf.columnId == "admin_region"))

    # Add new filter if present
    if regions and regions.length > 0
      globalFilters.push({ columnId: "admin_region", columnType: "id", op: "within any", exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: regions }] })

    @props.onChange(globalFilters)

  handleManagedByChange: (managedBy) =>
    # Remove existing filter
    globalFilters = _.filter(@props.globalFilters or [], (gf) -> not (gf.op == "within" and gf.columnId == "_managed_by"))

    # Add new filter if present
    if managedBy
      globalFilters.push({ columnId: "_managed_by", columnType: "id", op: "within", exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:" + managedBy }] })

    @props.onChange(globalFilters)

  render: ->
    # Find managed by
    managedByEntry = _.find(@props.globalFilters, (gf) -> gf.op == "within" and gf.columnId == "_managed_by")
    if managedByEntry
      managedBy = managedByEntry.exprs[0].value.split(":")[1]
    else
      managedBy = null

    # Find admin region
    adminRegionEntry = _.find(@props.globalFilters, (gf) -> gf.op == "within any" and gf.columnId == "admin_region")
    if adminRegionEntry
      adminRegions = adminRegionEntry.exprs[0].value
    else
      adminRegions = null

    R 'div', null,
      R ui.FormGroup, label: "Only sites managed by", labelMuted: true, 
        R IdLiteralComponent,
          value: managedBy
          onChange: @handleManagedByChange
          idTable: "groups"
          schema: @props.schema
          dataSource: @props.dataSource
          placeholder: "All Organizations"
          multi: false
          filter: { type: "field", tableAlias: "main", column: "canManageEntities" }

      R ui.FormGroup, label: "Only sites located in", labelMuted: true, 
        R IdLiteralComponent,
          value: adminRegions
          onChange: @handleRegionsChange
          idTable: "admin_regions"
          schema: @props.schema
          dataSource: @props.dataSource
          placeholder: "All Regions"
          multi: true
          orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }]

