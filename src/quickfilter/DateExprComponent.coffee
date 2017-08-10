PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
ReactSelect = require 'react-select'
moment = require 'moment'

ClickOutHandler = require('react-onclickout')
DatePicker = require('react-datepicker').default

# Allows selection of a date expressions for quickfilters
module.exports = class DateExprComponent extends React.Component
  @propTypes:
    value: PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onChange: PropTypes.func            # Called when value changes
    datetime: PropTypes.bool                 # True to use datetime

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

  toLiteral: (value) ->
    if @props.datetime
      return { type: "literal", valueType: "datetime", value: value }
    else
      return { type: "literal", valueType: "date", value: value }

  handleClickOut: =>
    @setState(dropdownOpen: false)

  handleStartChange: (value) =>
    # Clear end if after
    if @props.value?.exprs[1] and @fromMoment(value) > @props.value.exprs[1]?.value
      @props.onChange({ type: "op", op: "between", exprs: [@toLiteral(@fromMoment(value)), null]})
    else
      @props.onChange({ type: "op", op: "between", exprs: [@toLiteral(@fromMoment(value)), @props.value?.exprs[1]]})

  handleEndChange: (value) =>
    # Go to end of day if datetime
    if @props.datetime
      value = moment(value)
      value.endOf("day")

    # Clear start if before
    if @props.value?.exprs[0] and @fromMoment(value) < @props.value.exprs[0]?.value
      @props.onChange({ type: "op", op: "between", exprs: [null, @toLiteral(@fromMoment(value))]})
    else
      @props.onChange({ type: "op", op: "between", exprs: [@props.value?.exprs[0], @toLiteral(@fromMoment(value))]})

    @setState(dropdownOpen: false)

  handlePreset: (preset) =>
    @props.onChange({ type: "op", op: preset.id, exprs: [] })
    @setState(dropdownOpen: false)

  renderClear: =>
    H.div 
      style: { position: "absolute", right: 10, top: 7, color: "#AAA" }
      onClick: (=> @props.onChange(null)),
        H.i className: "fa fa-remove"

  renderSummary: ->
    if not @props.value
      return H.span className: "text-muted", "All"

    preset = _.findWhere(presets, id: @props.value.op)
    if preset
      return preset.name

    if @props.value.op == "between"
      startDate = @toMoment(@props.value.exprs[0]?.value)
      endDate = @toMoment(@props.value.exprs[1]?.value)
      return (if startDate then startDate.format("ll") else "") + " - " + (if endDate then endDate.format("ll") else "")

    return "???"

  renderPresets: ->
    H.div null,
      _.map presets, (preset) =>
        H.a className: "btn btn-xs btn-link", onClick: @handlePreset.bind(null, preset),
          preset.name

  renderDropdown: ->
    startDate = @toMoment(@props.value?.exprs[0]?.value)
    endDate = @toMoment(@props.value?.exprs[1]?.value)

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
            style: { width: 220, height: 36 }
            onClick: (=> @setState(dropdownOpen: true)),
              @renderSummary()

          # Clear button
          if @props.value and @props.onChange?
            @renderClear()

          if @state.dropdownOpen
            @renderDropdown()


presets = [
  { id: "thisyear", name: "This Year" }
  { id: "lastyear", name: "Last Year" }
  { id: "thismonth", name: "This Month" }
  { id: "lastmonth", name: "Last Month" }
  { id: "today", name: "Today" }
  { id: "yesterday", name: "Yesterday" }
  { id: "last24hours", name: "In Last 24 Hours" }
  { id: "last7days", name: "In Last 7 Days" }
  { id: "last30days", name: "In Last 30 Days" }
  { id: "last365days", name: "In Last 365 Days" }
]
