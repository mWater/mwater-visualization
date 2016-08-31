_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AxisBuilder = require './../../axes/AxisBuilder'

module.exports = class TableChartViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    data: React.PropTypes.object.isRequired # Data that the table has requested

    schema: React.PropTypes.object.isRequired # Schema to use
    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  
    onRowClick: React.PropTypes.func # Called with (tableId, rowId) when item is clicked

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

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
      H.div {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
      R TableContentsComponent, columns: @props.design.columns, table: @props.design.table, data: @props.data, schema: @props.schema, onRowClick: @props.onRowClick

class TableContentsComponent extends React.Component
  @propTypes:
    columns: React.PropTypes.array.isRequired # Columns of chart
    data: React.PropTypes.object.isRequired # Data that the table has requested
    schema: React.PropTypes.object.isRequired # Schema to use
    table: React.PropTypes.string.isRequired

    onRowClick: React.PropTypes.func # Called with (tableId, rowId) when item is clicked

  shouldComponentUpdate: (prevProps) ->
    if prevProps.columns != @props.columns and not _.isEqual(prevProps.columns, @props.columns)
      return true

    if prevProps.data != @props.data and not _.isEqual(prevProps.data, @props.data)
      return true

    if prevProps.schema != @props.schema
      return true

    return false

  handleRowClick: (rowIndex) =>
    row = @props.data.main[rowIndex]  

    # If there is only one id (num_ids = 1)
    if row and row.id and row.num_ids == 1 and @props.onRowClick
      @props.onRowClick(@props.table, row.id)

  renderHeaderCell: (index) ->
    axisBuilder = new AxisBuilder(schema: @props.schema)
    column = @props.columns[index]

    text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
    H.th { key: index },
      text

  renderHeader: ->
    H.thead key: "head",
      H.tr key: "head",
        _.map(@props.columns, (column, i) => @renderHeaderCell(i))

  renderCell: (rowIndex, columnIndex) ->
    row = @props.data.main[rowIndex]  
    column = @props.columns[columnIndex]

    # Get value
    value = row["c#{columnIndex}"]

    # Convert to string
    axisBuilder = new AxisBuilder(schema: @props.schema)
    str = axisBuilder.formatValue(column.textAxis, value, @context.locale)
    return H.td(key: columnIndex, str)

  renderRow: (index) ->
    H.tr key: index, onClick: @handleRowClick.bind(null, index),
      _.map(@props.columns, (column, i) => @renderCell(index, i))

  renderBody: ->
    H.tbody key: "body",
      _.map(@props.data.main, (row, i) => @renderRow(i))

  render: ->
    H.table className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
      @renderHeader()
      @renderBody()


#   renderHeaderCell: (index) ->
#     axisBuilder = new AxisBuilder(schema: @props.schema)
#     column = @props.design.columns[index]

#     text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
#     H.th {key: index},
#       text

#   renderHeader: ->
#     H.thead null,
#       H.tr { style: { position: "relative"}, ref: "tableHeader"},
#         _.map(@props.design.columns, (column, i) => @renderHeaderCell(i))

#   renderCell: (rowIndex, columnIndex) ->
#     row = @props.data.main[rowIndex]  
#     column = @props.design.columns[columnIndex]

#     # Get value
#     value = row["c#{columnIndex}"]

#     # Convert to string
#     axisBuilder = new AxisBuilder(schema: @props.schema)
#     str = axisBuilder.formatValue(column.textAxis, value, @context.locale)
#     return H.td(key: columnIndex, str)

#   renderRow: (index) ->
#     H.tr key: index,
#       _.map(@props.design.columns, (column, i) => @renderCell(index, i))

#   componentDidUpdate: (prevProps, prevState) ->
#     @calculateHeadersWidth()

#   componentDidMount: ->
#     @calculateHeadersWidth()

#   calculateHeadersWidth: ->
#     tr = $(@refs.tableBody).find("tr").first()
#     headers = $(@refs.tableHeader).find("th")
#     body = $(@refs.tableBody)
#     bodyContainer = $(@refs.tableBodyContainer)

#     tr.find("td").each (i, el) =>
#       cellWIdth = $(el).width()
#       headers.eq(i).width(cellWIdth)

#       if headers.eq(i).width() != cellWIdth
#         @setColumnWidth(i, headers.eq(i).width())

#     height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight() - $(@refs.tableHeader).outerHeight()
#     bodyContainer.height(height)

#   setColumnWidth: (column,width) ->
#     body = $(@refs.tableBody)
#     body.find('tr').each (i, el) ->
#       $(el).find('td').eq(column).width(width)

#   renderBody: ->
# #    height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight()
# #    tbodyStyle =


#     H.tbody { ref: "tableBody"},
#       _.map(@props.data.main, (row, i) => @renderRow(i))

#   shouldComponentUpdate: (prevProps) ->
#     not _.isEqual(prevProps, @props)

#   render: ->
#     # Render in a standard width container and then scale up to ensure that widget always looks consistent
#     style = {
#       width: @props.standardWidth
#       height: @props.height * (@props.standardWidth / @props.width)
#       transform: "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
#       transformOrigin: "0 0"
#       overflow: 'hidden'
#     }

#     containerStyle =
#       overflow: "auto"
#       height: height

#     height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight() - 25

#     return H.div style: style, className: "overflow-auto-except-print",
#       H.div {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
#       H.table className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
#         @renderHeader()
#       H.div {ref: "tableBodyContainer", style: containerStyle},
#         H.table className: "table table-condensed table-hover", style: { fontSize: "10pt" },
#           @renderBody()

