_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AxisComponent = require '../../../axes/AxisComponent'

# Design an intersection of a pivot table
module.exports = class IntersectionDesignerComponent extends React.Component
  @propTypes: 
    intersection: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  # Updates intersection with the specified changes
  update: (changes) ->
    intersection = _.extend({}, @props.intersection, changes)
    @props.onChange(intersection)

  handleValueAxisChange: (valueAxis) => @update(valueAxis: valueAxis)

  renderValueAxis: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Calculation"
      H.div style: { marginLeft: 8 }, 
        R AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ["enum", "text", "boolean", "date", "number"]
          aggrNeed: "required"
          value: @props.intersection.valueAxis
          onChange: @handleValueAxisChange

      H.p className: "help-block",
        "This is the calculated value that is displayed. Leave as blank to make an empty section"

  render: ->
    H.div null,
      @renderValueAxis()
