import $ from "jquery"
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import { default as Linkify } from "react-linkify"
import AxisBuilder from "../../../axes/AxisBuilder"
import { ExprUtils } from "mwater-expressions"
import { formatValue } from "../../../valueFormatter"

interface TableChartViewComponentProps {
  /** Design of chart */
  design: any
  /** Data that the table has requested */
  data: any
  /** Schema to use */
  schema: any
  width?: number
  height?: number
  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: any
  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: any
  onRowClick?: any
}

export default class TableChartViewComponent extends React.Component<TableChartViewComponentProps> {
  shouldComponentUpdate(prevProps: any) {
    return !_.isEqual(prevProps, this.props)
  }

  render() {
    const style = {
      width: this.props.width,
      height: this.props.height
    }

    return R(
      "div",
      { style, className: "overflow-auto-except-print" },
      R("div", { style: { fontWeight: "bold", textAlign: "center" } }, this.props.design.titleText),
      R(TableContentsComponent, {
        columns: this.props.design.columns,
        table: this.props.design.table,
        data: this.props.data,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onRowClick: this.props.onRowClick
      })
    )
  }
}

interface TableContentsComponentProps {
  /** Columns of chart */
  columns: any
  /** Data that the table has requested */
  data: any
  /** Schema to use */
  schema: any
  /** Data source to use */
  dataSource: any
  table: string
  /** Called with (tableId, rowId) when item is clicked */
  onRowClick?: any
}

class TableContentsComponent extends React.Component<TableContentsComponentProps> {
  static initClass() {
    this.contextTypes = { locale: PropTypes.string }
    // e.g. "en"
  }

  shouldComponentUpdate(prevProps: any) {
    if (prevProps.columns !== this.props.columns && !_.isEqual(prevProps.columns, this.props.columns)) {
      return true
    }

    if (prevProps.data !== this.props.data && !_.isEqual(prevProps.data, this.props.data)) {
      return true
    }

    if (prevProps.schema !== this.props.schema) {
      return true
    }

    return false
  }

  handleRowClick = (rowIndex: any) => {
    const row = this.props.data.main[rowIndex]

    if (row && row.id && this.props.onRowClick) {
      return this.props.onRowClick(this.props.table, row.id)
    }
  }

  renderHeaderCell(index: any) {
    const axisBuilder = new AxisBuilder({ schema: this.props.schema })
    const column = this.props.columns[index]

    const text = column.headerText || axisBuilder.summarizeAxis(column.textAxis, this.context.locale)
    return R("th", { key: index }, text)
  }

  renderHeader() {
    return R(
      "thead",
      { key: "head" },
      R(
        "tr",
        { key: "head" },
        _.map(this.props.columns, (column, i) => this.renderHeaderCell(i))
      )
    )
  }

  renderImage(id: any) {
    const url = this.props.dataSource.getImageUrl(id)
    return R("a", { href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 } }, "Image")
  }

  renderCell(rowIndex: any, columnIndex: any) {
    let node
    const row = this.props.data.main[rowIndex]
    const column = this.props.columns[columnIndex]

    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(column.textAxis?.expr)

    // Get value
    let value = row[`c${columnIndex}`]

    if (value == null) {
      node = null
    } else {
      // Parse if should be JSON
      if (["image", "imagelist", "geometry", "text[]"].includes(exprType) && _.isString(value)) {
        value = JSON.parse(value)
      }

      // Convert to node based on type
      switch (exprType) {
        case "text":
          node = R(Linkify, { properties: { target: "_blank" } }, value)
          break
        case "number":
        case "geometry":
          node = formatValue(exprType, value, column.format)
          break
        case "boolean":
        case "enum":
        case "enumset":
        case "text[]":
          node = exprUtils.stringifyExprLiteral(column.textAxis?.expr, value, this.context.locale)
          break
        case "date":
          node = moment(value, "YYYY-MM-DD").format("ll")
          break
        case "datetime":
          node = moment(value, moment.ISO_8601).format("lll")
          break
        case "image":
          node = this.renderImage(value.id)
          break
        case "imagelist":
          node = _.map(value, (v) => this.renderImage(v.id))
          break
        default:
          node = "" + value
      }
    }

    return R("td", { key: columnIndex }, node)
  }

  renderRow(index: any) {
    return R(
      "tr",
      { key: index, onClick: this.handleRowClick.bind(null, index) },
      _.map(this.props.columns, (column, i) => this.renderCell(index, i))
    )
  }

  renderBody() {
    return R(
      "tbody",
      { key: "body" },
      _.map(this.props.data.main, (row, i) => this.renderRow(i))
    )
  }

  render() {
    return R(
      "table",
      { className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 } },
      this.renderHeader(),
      this.renderBody()
    )
  }
}
TableContentsComponent.initClass()

//   renderHeaderCell: (index) ->
//     axisBuilder = new AxisBuilder(schema: @props.schema)
//     column = @props.design.columns[index]

//     text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
//     R 'th', {key: index},
//       text

//   renderHeader: ->
//     R 'thead', null,
//       R 'tr', { style: { position: "relative"}, ref: "tableHeader"},
//         _.map(@props.design.columns, (column, i) => @renderHeaderCell(i))

//   renderCell: (rowIndex, columnIndex) ->
//     row = @props.data.main[rowIndex]
//     column = @props.design.columns[columnIndex]

//     # Get value
//     value = row["c#{columnIndex}"]

//     # Convert to string
//     axisBuilder = new AxisBuilder(schema: @props.schema)
//     str = axisBuilder.formatValue(column.textAxis, value, @context.locale)
//     return R('td', key: columnIndex, str)

//   renderRow: (index) ->
//     R 'tr', key: index,
//       _.map(@props.design.columns, (column, i) => @renderCell(index, i))

//   componentDidUpdate: (prevProps, prevState) ->
//     @calculateHeadersWidth()

//   componentDidMount: ->
//     @calculateHeadersWidth()

//   calculateHeadersWidth: ->
//     tr = $(@refs.tableBody).find("tr").first()
//     headers = $(@refs.tableHeader).find("th")
//     body = $(@refs.tableBody)
//     bodyContainer = $(@refs.tableBodyContainer)

//     tr.find("td").each (i, el) =>
//       cellWIdth = $(el).width()
//       headers.eq(i).width(cellWIdth)

//       if headers.eq(i).width() != cellWIdth
//         @setColumnWidth(i, headers.eq(i).width())

//     height = @props.height - $(@refs.title).outerHeight() - $(@refs.tableHeader).outerHeight()
//     bodyContainer.height(height)

//   setColumnWidth: (column,width) ->
//     body = $(@refs.tableBody)
//     body.find('tr').each (i, el) ->
//       $(el).find('td').eq(column).width(width)

//   renderBody: ->
// #    height = @props.height - $(@refs.title).outerHeight()
// #    tbodyStyle =

//     R 'tbody', { ref: "tableBody"},
//       _.map(@props.data.main, (row, i) => @renderRow(i))

//   shouldComponentUpdate: (prevProps) ->
//     not _.isEqual(prevProps, @props)

//   render: ->
//     style = {
//       width: @props.width
//       height: @props.height
//     }

//     containerStyle =
//       overflow: "auto"
//       height: height

//     height = @props.height - $(@refs.title).outerHeight() - 25

//     return R 'div', style: style, className: "overflow-auto-except-print",
//       R 'div', {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
//       R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
//         @renderHeader()
//       R 'div', {ref: "tableBodyContainer", style: containerStyle},
//         R 'table', className: "table table-condensed table-hover", style: { fontSize: "10pt" },
//           @renderBody()
