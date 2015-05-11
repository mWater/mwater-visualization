H = React.DOM

exports.TextComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  handleChange: (ev) ->
    @props.onChange({ type: "text", value: ev.target.value })

  render: ->
    H.input 
      className: "form-control input-sm",
      style: { width: "20em", display: "inline-block" },
      type: "text", 
      onChange: @handleChange
      value: if @props.expr then @props.expr.value
}

exports.DecimalComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object
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
    @props.onChange({ type: "decimal", value: val })
    
  render: ->
    H.div 
      className: (if @state.invalid then "has-error")
      style: { width: "6em", display: "inline-block" },
        H.input 
          className: "form-control input-sm",
          type: "text", 
          style: { width: "6em", display: "inline-block" },
          onChange: @handleChange,
          value: (if @state.invalid then @state.invalidText) or (if @props.expr then @props.expr.value)
}

exports.IntegerComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object
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
    @props.onChange({ type: "integer", value: val })
    
  render: ->
    H.div 
      className: (if @state.invalid then "has-error")
      style: { width: "6em", display: "inline-block" },
        H.input 
          className: "form-control input-sm",
          type: "text", 
          onChange: @handleChange,
          value: (if @state.invalid then @state.invalidText) or (if @props.expr then @props.expr.value)
}

exports.EnumComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
    enumValues: React.PropTypes.array.isRequired
  }

  handleChange: (ev) ->
    @props.onChange({ type: "enum", value: ev.target.value })

  render: ->
    H.select 
      className: "form-control input-sm",
      style: { width: "auto", display: "inline-block" }
      value: if @props.expr then @props.expr.value
      onChange: @handleChange,
        _.map(@props.enumValues, (val) -> H.option(key: val.id, value: val.id, val.name))
}