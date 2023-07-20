import PropTypes from "prop-types"
import _, { sortBy } from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import { default as Linkify } from "react-linkify"
import AxisBuilder from "../../../axes/AxisBuilder"
import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import { formatValue } from "../../../valueFormatter"
import { Image } from "mwater-forms/lib/RotationAwareImageComponent"
import { TableChartColumn } from "./TableChart"
import Color from "color"

export interface TableChartViewComponentProps {
  /** Design of chart */
  design: any
  /** Data that the table has requested */
  data: any
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  width?: number
  height?: number
  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: any
  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: any
  onRowClick?: any
}

export default class TableChartViewComponent extends React.Component<TableChartViewComponentProps> {
  shouldComponentUpdate(prevProps: TableChartViewComponentProps) {
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
  columns: TableChartColumn[]
  /** Data that the table has requested */
  data: any
  /** Schema to use */
  schema: Schema
  /** Data source to use */
  dataSource: DataSource
  table: string
  /** Called with (tableId, rowId) when item is clicked */
  onRowClick?: any
}

interface TableContentsComponentState {
  sort: {
    column: number
    direction: "asc" | "desc"
  } | null
  data: any
}

class TableContentsComponent extends React.Component<TableContentsComponentProps, TableContentsComponentState> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: TableContentsComponentProps) {
    super(props)
    this.state = {
      sort: null,
      data: props.data.main
    }
  }

  componentDidUpdate(
    prevProps: Readonly<TableContentsComponentProps>,
    prevState: Readonly<TableContentsComponentState>,
    snapshot?: any
  ): void {
    if (this.state.sort !== prevState.sort) {
      this.setState({ data: this.sortData() })
    }
  }

  sortData = () => {
    if (!this.state.sort) return this.props.data.main
    return _.sortByOrder(this.props.data.main, [`c${this.state.sort.column}`], [this.state.sort.direction])
  }

  shouldComponentUpdate(
    nextProps: Readonly<TableContentsComponentProps>,
    nextState: Readonly<TableContentsComponentState>,
    nextContext: any
  ): boolean {
    if (nextProps.columns !== this.props.columns && !_.isEqual(nextProps.columns, this.props.columns)) {
      return true
    }

    if (nextProps.data !== this.props.data && !_.isEqual(nextProps.data, this.props.data)) {
      return true
    }

    if (nextProps.schema !== this.props.schema) {
      return true
    }

    if (nextProps.schema !== this.props.schema) {
      return true
    }
    if (nextState.sort !== this.state.sort) {
      return true
    }

    if (nextState.data !== this.state.data && !_.isEqual(nextState.data, this.state.data)) {
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

  handleSort = (colIndex: number) => {
    const currentSort = this.state.sort?.column === colIndex ? this.state.sort?.direction : null
    this.setState({
      sort: {
        column: colIndex,
        direction: currentSort === "asc" ? "desc" : "asc"
      }
    })
  }

  renderHeaderCell(index: any) {
    const axisBuilder = new AxisBuilder({ schema: this.props.schema })
    const column = this.props.columns[index]
    //(this.state.sort?.direction === 'asc' ? "":"")
    const text =
      column.headerText ?? (column.textAxis ? axisBuilder.summarizeAxis(column.textAxis, this.context.locale) : "")
    return R(
      "th",
      {
        key: index,
        style: { cursor: "pointer" },
        onClick: () => this.handleSort(index)
      },
      text,
      this.state.sort?.column === index
        ? R("span", {
            style: { marginLeft: 10 },
            className: `fa ${this.state.sort?.direction === "asc" ? "fa-sort-asc" : "fa-sort-desc"}`
          })
        : undefined
    )
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

  renderFooterCell(index: number) {
    const exprUtils = new ExprUtils(this.props.schema)
    const column = this.props.columns[index]

    if (!column.textAxis) return null

    const exprType = exprUtils.getExprType(column.textAxis?.expr)
    let node = null

    if (exprType && exprType == "number") {
      node = `${_.capitalize(column.summaryType)}: ${formatValue(
        exprType,
        this.props.data.summary[`c${index}`],
        column.format
      )}`
    }

    return node
  }

  renderFooter() {
    if (!this.props.data.summary) {
      return null
    }

    return R(
      "tfoot",
      { key: "foot" },
      R(
        "tr",
        { key: "foot" },
        _.map(this.props.columns, (column, i) => R("th", { key: i }, this.renderFooterCell(i)))
      )
    )
  }

  renderImage(id: any) {
    const url = this.props.dataSource.getImageUrl(id)
    return R("a", { href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 } }, "Image")
  }

  renderCell(rowIndex: any, columnIndex: any) {
    const axisBuilder = new AxisBuilder({ schema: this.props.schema })
    let node
    const row = this.state.data[rowIndex]
    const column = this.props.columns[columnIndex]
    // Set background color
    let backgroundColor = "transparent"
    let textColor = "#212529"

    const exprUtils = new ExprUtils(this.props.schema)
    if (!column.textAxis) {
      node = null
    } else {
      const exprType = exprUtils.getExprType(column.textAxis.expr)

      // Get value
      let value = row[`c${columnIndex}`]

      if (value == null) {
        node = null
      } else {
        // Parse if should be JSON
        if (["image", "imagelist", "geometry", "text[]"].includes(exprType || "") && _.isString(value)) {
          value = JSON.parse(value)
        }

        if (column.backgroundColorAxis && row[`bc${columnIndex}`] != null) {
          backgroundColor = axisBuilder.getValueColor(column.backgroundColorAxis, row[`bc${columnIndex}`]) ?? "#fff"
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
            node = _.map(value, (v: Image) => this.renderImage(v.id))
            break
          default:
            node = "" + value
        }
      }
    }

    if (backgroundColor) {
      const c = Color(backgroundColor)
      // Get lightness (taking into account alpha)
      const lightness = 1 - (1 - c.luminosity()) * c.alpha()
      textColor = lightness < 0.3 ? "rgb(204,204,204)" : "#212529"
    }

    return R("td", { key: columnIndex, style: { backgroundColor, color: textColor } }, node)
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
      _.map(this.state.data, (row, i) => this.renderRow(i))
    )
  }

  render() {
    return R(
      "table",
      { className: "mwater-visualization-table", style: { fontSize: "10pt", marginBottom: 0 } },
      this.renderHeader(),
      this.renderBody(),
      this.renderFooter()
    )
  }
}
