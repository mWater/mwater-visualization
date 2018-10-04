PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
moment = require 'moment'
d3Format = require 'd3-format'

AxisBuilder = require '../../../axes/AxisBuilder'
ExprUtils = require('mwater-expressions').ExprUtils

module.exports = class TableChartViewComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired # Design of chart
    data: PropTypes.object.isRequired # Data that the table has requested

    schema: PropTypes.object.isRequired # Schema to use
    width: PropTypes.number
    height: PropTypes.number
    standardWidth: PropTypes.number

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  
    onRowClick: PropTypes.func # Called with (tableId, rowId) when item is clicked

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

    return R 'div', style: style, className: "overflow-auto-except-print",
      R 'div', {style: { fontWeight: "bold", textAlign: "center" }}, @props.design.titleText
      R TableContentsComponent, 
        columns: @props.design.columns
        table: @props.design.table
        data: @props.data
        schema: @props.schema
        dataSource: @props.dataSource
        onRowClick: @props.onRowClick

class TableContentsComponent extends React.Component
  @propTypes:
    columns: PropTypes.array.isRequired # Columns of chart
    data: PropTypes.object.isRequired # Data that the table has requested
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use
    table: PropTypes.string.isRequired

    onRowClick: PropTypes.func # Called with (tableId, rowId) when item is clicked

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

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

    if row and row.id and @props.onRowClick
      @props.onRowClick(@props.table, row.id)

  renderHeaderCell: (index) ->
    axisBuilder = new AxisBuilder(schema: @props.schema)
    column = @props.columns[index]

    text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
    R 'th', { key: index },
      text

  renderHeader: ->
    R 'thead', key: "head",
      R 'tr', key: "head",
        _.map(@props.columns, (column, i) => @renderHeaderCell(i))

  renderImage: (id) ->
    url = @props.dataSource.getImageUrl(id)
    return R('a', href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 }, "Image")

  renderCell: (rowIndex, columnIndex) ->
    row = @props.data.main[rowIndex]  
    column = @props.columns[columnIndex]

    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(column.textAxis?.expr)

    # Get value
    value = row["c#{columnIndex}"]

    if not value?
      node = null
    else
      # Parse if should be JSON
      if exprType in ['image', 'imagelist', 'geometry', 'text[]'] and _.isString(value)
        value = JSON.parse(value)

      # Convert to node based on type
      switch exprType
        when "text"
          node = value
        when "number"
          # Use d3 format if number
          format = if column.format? then column.format else ","

          # Do not convert % (d3Format multiplies by 100 which is annoying)
          if format.match(/%/)
            value = value / 100.0

          node = d3Format.format(format)(value)
        when "boolean", "enum", "enumset", "text[]"
          node = exprUtils.stringifyExprLiteral(column.textAxis?.expr, value, @context.locale)
        when "date"
          node = moment(value, "YYYY-MM-DD").format("ll")
        when "datetime"
          node = moment(value, moment.ISO_8601).format("lll")
        when "image"
          node = @renderImage(value.id)
        when "imagelist"
          node = _.map(value, (v) => @renderImage(v.id))
        when "geometry"
          if value.type == "Point"
            node = "#{value.coordinates[1].toFixed(6)} #{value.coordinates[0].toFixed(6)}" 
          else
            node = value.type
        else
          node = "" + value

    return R('td', key: columnIndex, node)

  renderRow: (index) ->
    R 'tr', key: index, onClick: @handleRowClick.bind(null, index),
      _.map(@props.columns, (column, i) => @renderCell(index, i))

  renderBody: ->
    R 'tbody', key: "body",
      _.map(@props.data.main, (row, i) => @renderRow(i))

  render: ->
    R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
      @renderHeader()
      @renderBody()


#   renderHeaderCell: (index) ->
#     axisBuilder = new AxisBuilder(schema: @props.schema)
#     column = @props.design.columns[index]

#     text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
#     R 'th', {key: index},
#       text

#   renderHeader: ->
#     R 'thead', null,
#       R 'tr', { style: { position: "relative"}, ref: "tableHeader"},
#         _.map(@props.design.columns, (column, i) => @renderHeaderCell(i))

#   renderCell: (rowIndex, columnIndex) ->
#     row = @props.data.main[rowIndex]  
#     column = @props.design.columns[columnIndex]

#     # Get value
#     value = row["c#{columnIndex}"]

#     # Convert to string
#     axisBuilder = new AxisBuilder(schema: @props.schema)
#     str = axisBuilder.formatValue(column.textAxis, value, @context.locale)
#     return R('td', key: columnIndex, str)

#   renderRow: (index) ->
#     R 'tr', key: index,
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


#     R 'tbody', { ref: "tableBody"},
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

#     return R 'div', style: style, className: "overflow-auto-except-print",
#       R 'div', {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
#       R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
#         @renderHeader()
#       R 'div', {ref: "tableBodyContainer", style: containerStyle},
#         R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt" },
#           @renderBody()

