React = require 'react'
H = React.DOM
moment = require 'moment'
DateRangePicker = require 'react-bootstrap-daterangepicker'

# Displays a date range
module.exports = class DateRangeComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object             # Array of [start date, end date] in iso 8601 format
    onChange: React.PropTypes.func.isRequired # Array of [start date, end date] in iso 8601 format
    datetime: React.PropTypes.bool.isRequired # true if for datetime, not date

  handleClear: (ev) =>
    ev.stopPropagation()
    @props.onChange(null)

  handleApply: (event, picker) =>
    if @props.datetime
      value = [picker.startDate.endOf('day').toISOString(), picker.endDate.endOf('day').toISOString()]
      @props.onChange(value)
    else
      value = [picker.startDate.format("YYYY-MM-DD"), picker.endDate.format("YYYY-MM-DD")]
      @props.onChange(value)

  render: ->
    hasValue = _.isArray(@props.value)
    if hasValue
      startDate = moment(@props.value[0], moment.ISO_8601)
      endDate = moment(@props.value[1], moment.ISO_8601)
  
      startStr = startDate.format('ll')
      endStr = endDate.format('ll')

      if startStr == endStr
        label = startStr
      else
        label = startStr + " - " + endStr
    else
      label = "Select..."

    style = {
      height: 34
      padding: "6px 12px"
      fontSize: 14
      lineHeight: 1.42857143
      color: "#555"
      border: "1px solid #ccc"
      borderRadius: 4
      width: "100%"
    }

    if not hasValue
      style.color = "#aaaaaa"

    # Get predefined ranges
    ranges = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')]
      'This Year': [moment().startOf('year'), moment().endOf('year')],
      'Last Year': [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')],
    }

    React.createElement(DateRangePicker, 
      startDate: startDate or moment() # Requires a value
      endDate: endDate or moment() # Requires a value
      onApply: @handleApply
      autoApply: true
      ranges: ranges,
          H.div style: style,
            if hasValue
              H.a style: { color: "#ccc", cursor: "pointer", float: "right" }, onClick: @handleClear,
                H.span className: "glyphicon glyphicon-remove"
            label
    )
