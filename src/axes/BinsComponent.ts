import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import update from "update-object"
import { ExprUtils } from "mwater-expressions"
import AxisBuilder from "./AxisBuilder"
import NumberInputComponent from "react-library/lib/NumberInputComponent"

interface BinsComponentProps {
  schema: any
  dataSource: any
  /** Expression for computing min/max */
  expr: any
  xform: any
  onChange: any
}

interface BinsComponentState {
  guessing: any
}

// Allows setting of bins (min, max and number). Computes defaults if not present
export default class BinsComponent extends React.Component<BinsComponentProps, BinsComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      guessing: false // True when guessing ranges
    }
  }

  componentDidMount() {
    // Check if computing is needed
    if (this.props.xform.min == null || this.props.xform.max == null) {
      // Only do for individual (not aggregate) expressions
      const exprUtils = new ExprUtils(this.props.schema)
      if (exprUtils.getExprAggrStatus(this.props.expr) !== "individual") {
        // Percent is a special case where 0-100
        if (this.props.expr?.op === "percent where") {
          this.props.onChange(
            update(this.props.xform, {
              min: { $set: 0 },
              max: { $set: 100 },
              excludeLower: { $set: true },
              excludeUpper: { $set: true }
            })
          )
        }

        return
      }

      const axisBuilder = new AxisBuilder({ schema: this.props.schema })

      // Get min and max from a query
      const minMaxQuery = axisBuilder.compileBinMinMax(
        this.props.expr,
        this.props.expr.table,
        null,
        this.props.xform.numBins
      )
      if (!minMaxQuery) {
        return
      }

      this.setState({ guessing: true })
      return this.props.dataSource.performQuery(minMaxQuery, (error: any, rows: any) => {
        let max, min
        if (this.unmounted) {
          return
        }

        this.setState({ guessing: false })

        if (error) {
          return // Ignore
        }

        if (rows[0].min != null) {
          min = parseFloat(rows[0].min)
          max = parseFloat(rows[0].max)
        }

        return this.props.onChange(update(this.props.xform, { min: { $set: min }, max: { $set: max } }))
      })
    }
  }

  componentWillUnmount() {
    return (this.unmounted = true)
  }

  render() {
    return R(
      "div",
      null,
      R(
        "div",
        { key: "vals" },
        R(
          LabeledInlineComponent,
          { key: "min", label: "Min:" },
          R(NumberInputComponent, {
            small: true,
            value: this.props.xform.min,
            onChange: (v: any) => this.props.onChange(update(this.props.xform, { min: { $set: v } }))
          })
        ),
        " ",
        R(
          LabeledInlineComponent,
          { key: "max", label: "Max:" },
          R(NumberInputComponent, {
            small: true,
            value: this.props.xform.max,
            onChange: (v: any) => this.props.onChange(update(this.props.xform, { max: { $set: v } }))
          })
        ),
        " ",
        R(
          LabeledInlineComponent,
          { key: "numBins", label: "# of Bins:" },
          R(NumberInputComponent, {
            small: true,
            value: this.props.xform.numBins,
            decimal: false,
            onChange: (v: any) => this.props.onChange(update(this.props.xform, { numBins: { $set: v } }))
          })
        ),
        (() => {
          if (this.state.guessing) {
            return R("i", { className: "fa fa-spinner fa-spin" })
          } else if (this.props.xform.min == null || this.props.xform.max == null || !this.props.xform.numBins) {
            return R("span", { className: "text-danger", style: { paddingLeft: 10 } }, "Min and max are required")
          }
        })()
      ),
      this.props.xform.min != null && this.props.xform.max != null && this.props.xform.numBins
        ? R(
            "div",
            { key: "excludes" },
            R(
              "label",
              { className: "checkbox-inline", key: "lower" },
              R("input", {
                type: "checkbox",
                checked: !this.props.xform.excludeLower,
                onChange: (ev) =>
                  this.props.onChange(update(this.props.xform, { excludeLower: { $set: !ev.target.checked } }))
              }),
              `Include < ${this.props.xform.min}`
            ),
            R(
              "label",
              { className: "checkbox-inline", key: "upper" },
              R("input", {
                type: "checkbox",
                checked: !this.props.xform.excludeUpper,
                onChange: (ev) =>
                  this.props.onChange(update(this.props.xform, { excludeUpper: { $set: !ev.target.checked } }))
              }),
              `Include > ${this.props.xform.max}`
            )
          )
        : undefined
    )
  }
}

function LabeledInlineComponent(props: any) {
  return R(
    "div",
    { style: { display: "inline-block" } },
    R("label", { className: "text-muted" }, props.label),
    props.children
  )
}
