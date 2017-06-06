PropTypes = require('prop-types')
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
    schema: PropTypes.object.isRequired 
    dataSource: PropTypes.object.isRequired

    expr: PropTypes.object.isRequired   # Expression for computing min/max
    xform: PropTypes.object.isRequired
    onChange: PropTypes.func.isRequired

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
        # Percent is a special case where 0-100
        if @props.expr?.op == "percent where"
          @props.onChange(update(@props.xform, { min: { $set: 0 }, max: { $set: 100 }, excludeLower: { $set: true }, excludeUpper: { $set: true }}))

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
      H.div key: "vals",
        R LabeledInlineComponent, key: "min", label: "Min:",
          R NumberInputComponent, small: true, value: @props.xform.min, onChange: (v) => @props.onChange(update(@props.xform, { min: { $set: v }}))
        " "
        R LabeledInlineComponent, key: "max", label: "Max:",
          R NumberInputComponent, small: true, value: @props.xform.max, onChange: (v) => @props.onChange(update(@props.xform, { max: { $set: v }}))
        " "
        R LabeledInlineComponent, key: "numBins", label: "# of Bins:",
          R NumberInputComponent, small: true, value: @props.xform.numBins, decimal: false, onChange: (v) => @props.onChange(update(@props.xform, { numBins: { $set: v }}))
        if @state.guessing
          H.i className: "fa fa-spinner fa-spin"
        else if not @props.xform.min? or not @props.xform.max? or not @props.xform.numBins
          H.span className: "text-danger", style: { paddingLeft: 10 }, "Min and max are required"
      if @props.xform.min? and @props.xform.max? and @props.xform.numBins
        H.div key: "excludes",
          H.label className: "checkbox-inline", key: "lower",
            H.input type: "checkbox", checked: not @props.xform.excludeLower, onChange: (ev) => @props.onChange(update(@props.xform, { excludeLower: { $set: not ev.target.checked }}))
            "Include < #{@props.xform.min}"
          H.label className: "checkbox-inline", key: "upper",
            H.input type: "checkbox", checked: not @props.xform.excludeUpper, onChange: (ev) => @props.onChange(update(@props.xform, { excludeUpper: { $set: not ev.target.checked }}))
            "Include > #{@props.xform.max}"


LabeledInlineComponent = (props) ->
  H.div style: { display: "inline-block" },
    H.label className: "text-muted", props.label
    props.children

