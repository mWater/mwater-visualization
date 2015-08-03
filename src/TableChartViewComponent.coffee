_ = require 'lodash'
React = require 'react'
H = React.DOM

ExpressionBuilder = require './ExpressionBuilder'

module.exports = class TableChartViewComponent extends React.Component
  renderHeaderCell: (index) ->
    exprBuilder = new ExpressionBuilder(@props.schema)
    column = @props.design.columns[index]

    text = column.headerText or exprBuilder.summarizeAggrExpr(column.expr, column.aggr)
    H.th null,
      text

  renderHeader: ->
    H.thead null,
      H.tr null,
        _.map(@props.design.columns, (column, i) => @renderHeaderCell(i))

  renderCell: (rowIndex, columnIndex) ->
    row = @props.data.main[rowIndex]  
    column = @props.design.columns[columnIndex]

    # Get value
    value = row["c#{columnIndex}"]

    # Convert to string
    exprBuilder = new ExpressionBuilder(@props.schema)
    str = exprBuilder.stringifyExprLiteral(column.expr, value)
    return H.td(null, str)

  renderRow: (index) ->
    H.tr null,
      _.map(@props.design.columns, (column, i) => @renderCell(index, i))

  renderBody: ->
    H.tbody null,
      _.map(@props.data.main, (row, i) => @renderRow(i))

  render: ->
    style = {
      height: @props.height
      overflow: "auto"
      width: @props.width
    }
    return H.div style: style, 
      H.div style: { fontWeight: "bold", textAlign: "center" }, @props.design.titleText
      H.table className: "table table-condensed table-hover", style: { fontSize: "10pt" }, 
        @renderHeader()
        @renderBody()


