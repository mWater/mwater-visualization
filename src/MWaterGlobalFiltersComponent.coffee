PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

querystring = require 'querystring'
ExprUtils = require('mwater-expressions').ExprUtils
ui = require './UIComponents'
formUtils = require('mwater-forms/lib/formUtils') # TODO requireing this directly because of bizarre backbone issue

IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent

# Control to edit the global filters (_managed_by and admin_region)
module.exports = class MWaterGlobalFiltersComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema of the database
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    filterableTables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
    globalFilters: PropTypes.object.array
    onChange: PropTypes.func.isRequired

  handleRegionChange: (region) =>
    alert("TODO: " + JSON.stringify(region))

  render: ->
    R IdLiteralComponent,
      value: @props.region
      onChange: @handleRegionChange
      idTable: "admin_regions"
      schema: @props.schema
      dataSource: @props.dataSource
      placeholder: "All Regions"
      orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }]

