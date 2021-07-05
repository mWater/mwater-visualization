// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let IdArrayQuickfilterComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { default as AsyncReactSelect } from "react-select/async"
import { ExprUtils } from "mwater-expressions"
import { IdLiteralComponent } from "mwater-expressions-ui"

// Quickfilter for an id[]
export default IdArrayQuickfilterComponent = (function () {
  IdArrayQuickfilterComponent = class IdArrayQuickfilterComponent extends React.Component {
    static propTypes = {
      label: PropTypes.string.isRequired,
      schema: PropTypes.object.isRequired,
      dataSource: PropTypes.object.isRequired,

      expr: PropTypes.object.isRequired,
      index: PropTypes.number.isRequired,

      value: PropTypes.any, // Current value of quickfilter (state of filter selected)
      onValueChange: PropTypes.func, // Called when value changes

      multi: PropTypes.bool, // true to display multiple values

      // Filters to add to the quickfilter to restrict values
      filters: PropTypes.arrayOf(
        PropTypes.shape({
          table: PropTypes.string.isRequired, // id table to filter
          jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias
        })
      )
    }

    render() {
      // Determine table
      const exprUtils = new ExprUtils(this.props.schema)
      const idTable = exprUtils.getExprIdTable(this.props.expr)

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
            onChange: this.props.onValueChange,
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
  return IdArrayQuickfilterComponent
})()
