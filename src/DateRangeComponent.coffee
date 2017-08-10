PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
ReactSelect = require 'react-select'
moment = require 'moment'

ClickOutHandler = require('react-onclickout')
DatePicker = require('react-datepicker').default

# Allows selection of a date range
module.exports = class DateRangeComponent extends React.Component
  @propTypes:
    value: PropTypes.array              # Array of [start date, end date] in iso 8601 format
    onChange: PropTypes.func.isRequired # Array of [start date, end date] in iso 8601 format
    datetime: PropTypes.bool            # true if for datetime, not date

  constructor: ->
    super

    @state = {
      dropdownOpen: false
    }

  toMoment: (value) ->
    if not value
      return null

    if @props.datetime
      return moment(value, moment.ISO_8601)
    else
      return moment(value, "YYYY-MM-DD")

  fromMoment: (value) ->
    if not value
      return null

    if @props.datetime
      return value.toISOString()
    else
      return value.format("YYYY-MM-DD")

  handleClickOut: =>
    @setState(dropdownOpen: false)

  handleStartChange: (value) =>
    # Clear end if after
    if @props.value?[1] and @fromMoment(value) > @props.value[1]
      @props.onChange([@fromMoment(value), null])
    else
      @props.onChange([@fromMoment(value), @props.value?[1]])

  handleEndChange: (value) =>
    # Go to end of day if datetime
    if @props.datetime
      value = moment(value)
      value.endOf("day")

    # Clear start if before
    if @props.value?[0] and @fromMoment(value) < @props.value[0]
      @props.onChange([null, @fromMoment(value)])
    else
      @props.onChange([@props.value?[0], @fromMoment(value)])

    @setState(dropdownOpen: false)

  handlePreset: (preset) =>
    @props.onChange([@fromMoment(preset.value[0]), @fromMoment(preset.value[1])])
    @setState(dropdownOpen: false)

  getPresets: ->
    presets = [
      { label: 'Today', value: [moment(), moment()] }
      { label: 'Yesterday', value: [moment().subtract(1, 'days'), moment().subtract(1, 'days')] }
      { label: 'Last 7 Days', value: [moment().subtract(6, 'days'), moment()] }
      { label: 'Last 30 Days', value: [moment().subtract(29, 'days'), moment()] }
      { label: 'This Month', value: [moment().startOf('month'), moment().endOf('month')] }
      { label: 'Last Month', value: [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')] }
      { label: 'This Year', value: [moment().startOf('year'), moment().endOf('year')] }
      { label: 'Last Year', value: [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')] }
    ]
    return presets

  renderClear: =>
    H.div 
      style: { position: "absolute", right: 10, top: 7, color: "#AAA" }
      onClick: (=> @props.onChange(null)),
        H.i className: "fa fa-remove"

  renderSummary: ->
    if not @props.value
      return H.span className: "text-muted", "All"

    startDate = @toMoment(@props.value[0])
    endDate = @toMoment(@props.value[1])
    return (if startDate then startDate.format("ll") else "") + " - " + (if endDate then endDate.format("ll") else "")

  renderPresets: ->
    H.div null,
      _.map @getPresets(), (preset) =>
        H.a className: "btn btn-xs btn-link", onClick: @handlePreset.bind(null, preset),
          preset.label

  renderDropdown: ->
    startDate = @toMoment(@props.value?[0])
    endDate = @toMoment(@props.value?[1])

    H.div style: { position: "absolute", top: "100%", left: 0, zIndex: 1000, padding: 5, border: "solid 1px #AAA", backgroundColor: "white" },
      H.div style: { whiteSpace: "nowrap" },
        R DatePicker, 
          inline: true
          selectsStart: true
          selected: startDate
          startDate: startDate
          endDate: endDate
          showYearDropdown: true
          onChange: @handleStartChange
        R DatePicker, 
          inline: true
          selectsEnd: true
          selected: endDate
          startDate: startDate
          endDate: endDate
          showYearDropdown: true
          onChange: @handleEndChange
      @renderPresets()

  render: ->
    R ClickOutHandler, onClickOut: @handleClickOut,
      H.div 
        style: { display: "inline-block", position: "relative" },
          H.div
            className: "form-control"
            style: { width: 220 }
            onClick: (=> @setState(dropdownOpen: true)),
              @renderSummary()

          # Clear button
          if @props.value and @props.onChange?
            @renderClear()

          if @state.dropdownOpen
            @renderDropdown()


