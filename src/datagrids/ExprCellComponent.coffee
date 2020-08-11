PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
moment = require 'moment'

ExprUtils = require("mwater-expressions").ExprUtils

Cell = require('fixed-data-table-2').Cell

canFormatType = require('../valueFormatter').canFormatType
formatValue = require('../valueFormatter').formatValue

# Cell that displays an expression column cell
module.exports = class ExprCellComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired     # schema to use
    dataSource: PropTypes.object.isRequired # dataSource to use

    locale: PropTypes.string      # Locale to use

    exprType: PropTypes.string

    format: PropTypes.string      # Optional format

    width: PropTypes.number.isRequired
    height: PropTypes.number.isRequired

    value: PropTypes.any
    expr: PropTypes.object

    muted: PropTypes.bool       # True to show muted

    onClick: PropTypes.func

  handleClick: =>
    @setState(editing: true)

  renderImage: (id) ->
    url = @props.dataSource.getImageUrl(id)
    return R('a', href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 }, "Image")

  render: ->
    exprUtils = new ExprUtils(@props.schema)
    value = @props.value

    if not value? or not @props.expr
      node = null
    else
      # Parse if should be JSON
      if @props.exprType in ['image', 'imagelist', 'geometry', 'text[]'] and _.isString(value)
        value = JSON.parse(value)

      # Format if possible
      if canFormatType(@props.exprType)
        node = formatValue(@props.exprType, value, @props.format)
      else 
        # Convert to node based on type
        switch @props.exprType
          when "text"
            node = value
          when "boolean", "enum", "enumset", "text[]"
            node = exprUtils.stringifyExprLiteral(@props.expr, value, @props.locale)
          when "date"
            node = moment(value, "YYYY-MM-DD").format("ll")
          when "datetime"
            node = moment(value, moment.ISO_8601).format("lll")
          when "image"
            node = @renderImage(value.id)
          when "imagelist"
            node = _.map(value, (v) => @renderImage(v.id))
          else
            node = "" + value

    return R Cell, 
      width: @props.width
      height: @props.height
      onClick: @props.onClick
      style: { 
        whiteSpace: "nowrap" 
        textAlign: if @props.exprType in ['number'] then "right" else "left"
        opacity: if @props.muted then 0.4 
      }, 
        node
