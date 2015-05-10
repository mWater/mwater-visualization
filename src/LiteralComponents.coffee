
exports.TextLiteralComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  onChange: (ev) ->
    @props.onChange({ type: "literal", value: ev.target.value })

  render: ->
    H.input 
      className: "form-control input-sm",
      style: { width: "20em" },
      type: "text", 
      onChange: @handleChange
      value: if @props.expr then @props.expr.value
}

exports.DecimalLiteralComponent = React.createClass {
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
    @props.onChange({ type: "literal", value: val })
    
  render: ->
    console.log @state.invalid
    console.log @state.invalidText

    H.div className: (if @state.invalid then "has-error"),
      H.input 
        className: "form-control input-sm",
        type: "text", 
        style: { width: "6em" },
        onChange: @handleChange,
        value: (if @state.invalid then @state.invalidText) or (if @props.expr then @props.expr.value)
}

exports.IntegerLiteralComponent = React.createClass {
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
    @props.onChange({ type: "literal", value: val })
    
  render: ->
    console.log @state.invalid
    console.log @state.invalidText

    H.div className: (if @state.invalid then "has-error"),
      H.input 
        className: "form-control input-sm",
        type: "text", 
        style: { width: "6em" },
        onChange: @handleChange,
        value: (if @state.invalid then @state.invalidText) or (if @props.expr then @props.expr.value)
}

exports.EnumLiteralComponent = 