_ = require 'lodash'
React = require 'react'
H = React.DOM

AxisBuilder = require './../../axes/AxisBuilder'

module.exports = class TableChartViewComponent extends React.Component
  @propTypes:
    chart: React.PropTypes.object.isRequired # Chart object to use
    design: React.PropTypes.object.isRequired # Design of chart
    data: React.PropTypes.object.isRequired # Data that the table has requested

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  renderHeaderCell: (index) ->
    axisBuilder = new AxisBuilder(schema: @props.schema)
    column = @props.design.columns[index]

    text = column.headerText or axisBuilder.summarizeAxis(column.textAxis)
    H.th key: index,
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
    axisBuilder = new AxisBuilder(schema: @props.schema)
    str = axisBuilder.formatValue(column.textAxis, value)
    return H.td(key: columnIndex, str)

  renderRow: (index) ->
    H.tr key: index,
      _.map(@props.design.columns, (column, i) => @renderCell(index, i))

  renderBody: ->
    H.tbody null,
      _.map(@props.data.main, (row, i) => @renderRow(i))

  shouldComponentUpdate: (prevProps) ->
    not _.isEqual(prevProps, @props)

  render: ->
    # Render in a standard width container and then scale up to ensure that widget always looks consistent
    style = {
      width: @props.standardWidth
      height: @props.height * (@props.standardWidth / @props.width)
      transform: "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
      transformOrigin: "0 0"
    }

    return H.div style: style, className: "overflow-auto-except-print",
      H.div style: { fontWeight: "bold", textAlign: "center" }, @props.design.titleText
      H.table className: "table table-condensed table-hover", style: { fontSize: "10pt" }, 
        @renderHeader()
        @renderBody()


