_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

RegionSelectComponent = require './RegionSelectComponent'
DetailLevelSelectComponent = require './DetailLevelSelectComponent'

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
      # Detail level will be set by DetailLevelSelectComponent
      @props.onScopeAndDetailLevelChange(scope, scopeLevel, null)
    else
      @props.onScopeAndDetailLevelChange(null, null, 0)

  handleDetailLevelChange: (detailLevel) =>
    @props.onScopeAndDetailLevelChange(@props.scope, @props.scopeLevel, detailLevel)

  render: ->
    H.div null,
      H.div className: "form-group",
        H.label className: "text-muted", 
          "Region to Map"
        R RegionSelectComponent, region: @props.scope, onChange: @handleScopeChange, schema: @props.schema, dataSource: @props.dataSource
      if @props.scope? and @props.detailLevel?
        H.div className: "form-group",
          H.label className: "text-muted", 
            "Detail Level"
          R DetailLevelSelectComponent, 
            scope: @props.scope
            scopeLevel: @props.scopeLevel
            detailLevel: @props.detailLevel
            onChange: @handleDetailLevelChange
            schema: @props.schema
            dataSource: @props.dataSource

