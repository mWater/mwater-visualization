React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'

exports.TextComponent = React.createClass {
  propTypes: {
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  handleChange: (ev) ->
    @props.onChange({ type: "literal", valueType: "text", value: ev.target.value })

  render: ->
    H.input 
      className: "form-control input-sm",
      style: { width: "20em", display: "inline-block" },
      type: "text", 
      onChange: @handleChange
      value: if @props.value then @props.value.value
}

exports.DecimalComponent = React.createClass {
  propTypes: {
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  getInitialState: -> { invalid: false, invalidText: null }

  handleChange: (ev) ->
    # If blank, null
    if not ev.target.value
      @setState(invalid: false, invalidText: null)
      return @props.onChange(null)

    # Check if valid number
    val = parseFloat(ev.target.value)
    if not _.isFinite(val) or not ev.target.value.match(/^[0-9]+(\.[0-9]+)?$/)
      return @setState(invalid: true, invalidText: ev.target.value)

    @setState(invalid: false, invalidText: null)
    @props.onChange({ type: "literal", valueType: "decimal", value: val })
    
  render: ->
    H.div 
      className: (if @state.invalid then "has-error")
      style: { width: "6em", display: "inline-block" },
        H.input 
          className: "form-control input-sm",
          type: "text", 
          style: { width: "6em", display: "inline-block" },
          onChange: @handleChange,
          value: (if @state.invalid then @state.invalidText) or (if @props.value then @props.value.value)
}

exports.IntegerComponent = React.createClass {
  propTypes: {
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  getInitialState: -> { invalid: false, invalidText: null }

  handleChange: (ev) ->
    # If blank, null
    if not ev.target.value
      @setState(invalid: false, invalidText: null)
      return @props.onChange(null)

    # Check if valid number
    val = parseInt(ev.target.value)
    if not _.isFinite(val) or not ev.target.value.match(/^[0-9]+$/)
      return @setState(invalid: true, invalidText: ev.target.value)

    @setState(invalid: false, invalidText: null)
    @props.onChange({ type: "literal", valueType: "integer", value: val })
    
  render: ->
    H.div 
      className: (if @state.invalid then "has-error")
      style: { width: "6em", display: "inline-block" },
        H.input 
          className: "form-control input-sm",
          type: "text", 
          onChange: @handleChange,
          value: (if @state.invalid then @state.invalidText) or (if @props.value then @props.value.value)
}

exports.EnumComponent = React.createClass {
  propTypes: {
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
    enumValues: React.PropTypes.array.isRequired
  }

  handleChange: (ev) ->
    if ev.target.value
      @props.onChange({ type: "literal", valueType: "enum", value: JSON.parse(ev.target.value) })
    else
      @props.onChange(null)

  render: ->
    H.select 
      className: "form-control input-sm",
      value: if @props.value and @props.value.value then JSON.stringify(@props.value.value)
      onChange: @handleChange,
        H.option(key: "null", value: "", "")
        # Use JSON to allow non-strings as ids
        _.map(@props.enumValues, (val) -> H.option(key: val.id, value: JSON.stringify(val.id), val.name))
}

# Component which displays an array of enums
exports.EnumArrComponent = class EnumArrComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
    enumValues: React.PropTypes.array.isRequired # Array of id and name

  handleChange: (val) =>
    value = if val then val.split("\n") else []
    value = _.map(value, JSON.parse)
    console.log value
    @props.onChange({ type: "literal", valueType: "enum[]", value: value })

  render: ->
    value = null
    if @props.value and @props.value.value.length > 0 
      value = _.map(@props.value.value, JSON.stringify).join("\n")

    # Use JSON to allow non-strings as ids
    options = _.map(@props.enumValues, (val) -> { value: JSON.stringify(val.id), label: val.name })
    H.div style: { width: "100%" },
      React.createElement(ReactSelect, { 
        value: value
        multi: true
        delimiter: "\n"
        options: options 
        onChange: @handleChange
      })

exports.DateComponent = React.createClass {
  propTypes: {
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  getInitialState: -> { invalid: false, invalidText: null }

  handleChange: (ev) ->
    # If blank, null
    if not ev.target.value
      @setState(invalid: false, invalidText: null)
      return @props.onChange(null)

    # Check if valid date
    if not ev.target.value.match(/^\d\d\d\d(-\d\d(-\d\d)?)?$/)
      return @setState(invalid: true, invalidText: ev.target.value)

    @setState(invalid: false, invalidText: null)
    @props.onChange({ type: "literal", valueType: "date", value: ev.target.value })
    
  render: ->
    H.div 
      className: (if @state.invalid then "has-error")
      style: { width: "9em", display: "inline-block" },
        H.input 
          className: "form-control input-sm",
          placeholder: "YYYY-MM-DD",
          type: "text", 
          onChange: @handleChange,
          value: (if @state.invalid then @state.invalidText) or (if @props.value then @props.value.value)
}

exports.DatetimeComponent = React.createClass {
  propTypes: {
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  getInitialState: -> { invalid: false, invalidText: null }

  handleChange: (ev) ->
    # If blank, null
    if not ev.target.value
      @setState(invalid: false, invalidText: null)
      return @props.onChange(null)

    # Check if valid date
    if not ev.target.value.match(/^\d\d\d\d(-\d\d(-\d\d)?)?$/)
      return @setState(invalid: true, invalidText: ev.target.value)

    @setState(invalid: false, invalidText: null)
    @props.onChange({ type: "literal", valueType: "datetime", value: ev.target.value })
    
  render: ->
    H.div 
      className: (if @state.invalid then "has-error")
      style: { width: "9em", display: "inline-block" },
        H.input 
          className: "form-control input-sm",
          placeholder: "YYYY-MM-DD",
          type: "text", 
          onChange: @handleChange,
          value: (if @state.invalid then @state.invalidText) or (if @props.value then @props.value.value)
}
