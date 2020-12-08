PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ExprUtils = require('mwater-expressions').ExprUtils

RegionSelectComponent = require './RegionSelectComponent'
DetailLevelSelectComponent = require './DetailLevelSelectComponent'
ui = require 'react-library/lib/bootstrap'

# Generic scope and detail level setter for AdminChoropleth layers 
module.exports = class ScopeAndDetailLevelComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    scope: PropTypes.string     # admin region that is outside bounds. null for whole world
    scopeLevel: PropTypes.number # level of scope region. null for whole world
    detailLevel: PropTypes.number # Detail level within scope region
    onScopeAndDetailLevelChange: PropTypes.func.isRequired # Called with (scope, scopeLevel, detailLevel)
    regionsTable: PropTypes.string.isRequired # Table name of regions

  handleScopeChange: (scope, scopeLevel) =>
    if scope
      @props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1)
    else
      @props.onScopeAndDetailLevelChange(null, null, 0)

  handleDetailLevelChange: (detailLevel) =>
    @props.onScopeAndDetailLevelChange(@props.scope, @props.scopeLevel, detailLevel)

  render: ->
    # Determine number of levels by looking for levelN field
    maxLevel = 0
    detailLevelOptions = []

    for level in [0..9]
      levelColumn = @props.schema.getColumn(@props.regionsTable, "level#{level}")
      if levelColumn
        maxLevel = level
        # Can't select same detail level as scope
        if level > (if @props.scopeLevel? then @props.scopeLevel else -1)
          detailLevelOptions.push({ value: level, label: ExprUtils.localizeString(levelColumn.name) })

    R 'div', null,
      R 'div', className: "form-group",
        R 'label', className: "text-muted", 
          "Region to Map"
        R RegionSelectComponent, 
          region: @props.scope, 
          onChange: @handleScopeChange, 
          schema: @props.schema, 
          dataSource: @props.dataSource,
          regionsTable: @props.regionsTable
          maxLevel: maxLevel - 1
          placeholder: "All Regions"
      R 'div', className: "form-group",
        R 'label', className: "text-muted", 
          "Detail Level"
        R ui.Select, 
          value: @props.detailLevel
          options: detailLevelOptions
          onChange: @handleDetailLevelChange

