import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import { DataSource, ExprUtils, LiteralType, Schema } from "mwater-expressions"
import { default as Linkify } from "react-linkify"
import { Cell } from "fixed-data-table-2"
import { canFormatType } from "../valueFormatter"
import { formatValue } from "../valueFormatter"

export interface ExprCellComponentProps {
  /** schema to use */
  schema: Schema
  /** dataSource to use */
  dataSource: DataSource
  /** Locale to use */
  locale?: string

  exprType: LiteralType
  /** Optional format */
  format?: string
  width: number
  height: number
  value?: any
  expr?: any
  /** True to show muted */
  muted?: boolean
  onClick?: any
}

// Cell that displays an expression column cell
export default class ExprCellComponent extends React.Component<ExprCellComponentProps> {
  handleClick = () => {
    return this.setState({ editing: true })
  }

  renderImage(id: any) {
    const url = this.props.dataSource.getImageUrl(id)
    return R("a", { href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 } }, "Image")
  }

  render() {
    let node
    const exprUtils = new ExprUtils(this.props.schema)
    let { value } = this.props

    if (value == null || !this.props.expr) {
      node = null
    } else {
      // Parse if should be JSON
      if (["image", "imagelist", "geometry", "text[]"].includes(this.props.exprType) && _.isString(value)) {
        value = JSON.parse(value)
      }

      // Format if possible
      if (canFormatType(this.props.exprType)) {
        node = formatValue(this.props.exprType, value, this.props.format)
      } else {
        // Convert to node based on type
        switch (this.props.exprType) {
          case "text":
            node = R(Linkify, { properties: { target: "_blank" } }, value)
            break
          case "boolean":
          case "enum":
          case "enumset":
          case "text[]":
            node = exprUtils.stringifyExprLiteral(this.props.expr, value, this.props.locale)
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
            node = _.map(value, (v: any) => this.renderImage(v.id))
            break
          default:
            node = "" + value
        }
      }
    }

    return R(
      Cell,
      {
        width: this.props.width,
        height: this.props.height,
        onClick: this.props.onClick,
        style: {
          whiteSpace: "nowrap",
          textAlign: ["number"].includes(this.props.exprType) ? "right" : "left",
          opacity: this.props.muted ? 0.4 : undefined
        }
      },
      node
    )
  }
}
