import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { default as AsyncReactSelect } from "react-select/async"
import { DataSource, Expr, ExprUtils, Schema } from "mwater-expressions"
import { IdLiteralComponent } from "mwater-expressions-ui"
import { JsonQLFilter } from ".."

export interface IdArrayQuickfilterComponentProps {
  label: string
  schema: Schema
  dataSource: DataSource

  expr: Expr
  index: number

  /** Current value of quickfilter (state of filter selected) */
  value: any
  onValueChange?: (value: any) => void

  /** true to display multiple values */
  multi?: boolean 

  // Filters to add to the quickfilter to restrict values
  filters?: JsonQLFilter[]
}

// Quickfilter for an id[]
export default class IdArrayQuickfilterComponent extends React.Component<IdArrayQuickfilterComponentProps> {
  render() {
    // Determine table
    const exprUtils = new ExprUtils(this.props.schema)
    const idTable = exprUtils.getExprIdTable(this.props.expr)!

    return R(
      "div",
      { style: { display: "inline-block", paddingRight: 10 } },
      this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined,
      R(
        "div",
        { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } },
        // TODO should use quickfilter data source, but is complicated
        R(IdLiteralComponent, {
          value: this.props.value,
          onChange: this.props.onValueChange || (() => {}),
          idTable,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          placeholder: "All",
          multi: this.props.multi
          // TODO Does not use filters that are passed in
        })
      ),
      !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined
    )
  }
}
