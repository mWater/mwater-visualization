React = require 'react'
H = React.DOM

ExpressionCompiler = require './ExpressionCompiler'
ExpressionBuilder = require './ExpressionBuilder'
DateRangeComponent = require '../DateRangeComponent'

# Displays a date range
module.exports = class DateRangeLiteralComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object             # Literal expression (e.g. { type: "literal", valueType: "daterange", value: ['2014-01-01', '2014-02-04']})
    onChange: React.PropTypes.func.isRequired 
    datetime: React.PropTypes.bool.isRequired # true if for datetime, not date

  handleChange: (value) =>
    if not value
      @props.onChange(null)
    else
      if @props.datetime
        @props.onChange({ type: "literal", valueType: "datetimerange", value: value })
      else
        @props.onChange({ type: "literal", valueType: "daterange", value: value })

  render: ->
    React.createElement(DateRangeComponent, 
      value: if @props.value then @props.value.value
      onChange: @handleChange
      datetime: @props.datetime
    )
