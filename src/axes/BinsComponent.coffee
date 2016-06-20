React = require 'react'
H = React.DOM
R = React.createElement
update = require 'update-object'

ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require './AxisBuilder'
NumberInputComponent = require('react-library/lib/NumberInputComponent')

# Allows setting of bins (min, max and number). Computes defaults if not present
module.exports = class BinsComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired 
    dataSource: React.PropTypes.object.isRequired

    expr: React.PropTypes.object.isRequired   # Expression for computing min/max
    xform: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  constructor: (props) ->
    super

    @state = {
      guessing: false   # True when guessing ranges
    }

  componentDidMount: ->
    # Check if computing is needed
    if not @props.xform.min? or not @props.xform.max?
      # Only do for individual (not aggregate) expressions
      exprUtils = new ExprUtils(@props.schema)
      if exprUtils.getExprAggrStatus(@props.expr) != "individual"
        return

      axisBuilder = new AxisBuilder(schema: @props.schema)

      # Get min and max from a query
      minMaxQuery = axisBuilder.compileBinMinMax(@props.expr, @props.expr.table, null, @props.xform.numBins)

      @setState(guessing: true)
      @props.dataSource.performQuery(minMaxQuery, (error, rows) =>
        if @unmounted
          return
    
        @setState(guessing: false)

        if error
          return # Ignore

        if rows[0].min?
          min = parseFloat(rows[0].min)
          max = parseFloat(rows[0].max)

        @props.onChange(update(@props.xform, { min: { $set: min }, max: { $set: max }}))
      )

  componentWillUnmount: ->
    @unmounted = true

  render: ->
    H.div null,
      R LabeledInlineComponent, key: "min", label: "Min:",
        R NumberInputComponent, value: @props.xform.min, onChange: (v) => @props.onChange(update(@props.xform, { min: { $set: v }}))
      " "
      R LabeledInlineComponent, key: "max", label: "Max:",
        R NumberInputComponent, value: @props.xform.max, onChange: (v) => @props.onChange(update(@props.xform, { max: { $set: v }}))
      " "
      R LabeledInlineComponent, key: "numBins", label: "# of Bins:",
        R NumberInputComponent, value: @props.xform.numBins, decimal: false, onChange: (v) => @props.onChange(update(@props.xform, { numBins: { $set: v }}))
      if @state.guessing
        H.i className: "fa fa-spinner fa-spin"

LabeledInlineComponent = (props) ->
  H.div style: { display: "inline-block" },
    H.label className: "text-muted", props.label
    props.children

