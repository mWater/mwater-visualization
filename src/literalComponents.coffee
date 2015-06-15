H = React.DOM

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
      @props.onChange({ type: "literal", valueType: "enum", value: ev.target.value })
    else
      @props.onChange(null)

  render: ->
    H.select 
      className: "form-control input-sm",
      style: { width: "auto", display: "inline-block" }
      value: if @props.value then @props.value.value
      onChange: @handleChange,
        H.option(key: "null", value: "", "")
        _.map(@props.enumValues, (val) -> H.option(key: val.id, value: val.id, val.name))
}

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
