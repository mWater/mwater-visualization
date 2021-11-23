import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import uuid from "uuid"
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent"
import { ExprComponent } from "mwater-expressions-ui"
import { AggrStatus, DataSource, ExprUtils, LiteralType, OpExpr, Schema } from "mwater-expressions"
import AxisBuilder from "./AxisBuilder"
import update from "update-object"
import * as ui from "../UIComponents"
import BinsComponent from "./BinsComponent"
import RangesComponent from "./RangesComponent"
import AxisColorEditorComponent from "./AxisColorEditorComponent"
import CategoryMapComponent from "./CategoryMapComponent"
import { injectTableAlias } from "mwater-expressions"
import { getFormatOptions } from "../valueFormatter"
import { getDefaultFormat } from "../valueFormatter"
import { JsonQLFilter } from "../JsonQLFilter"
import { Axis, AxisXform, AxisXformRange } from "./Axis"
import produce from "immer"
import { JsonQLSelectQuery } from "jsonql"

export interface AxisComponentProps {
  schema: Schema
  dataSource: DataSource
  /** Table to use */
  table: string
  /** Optional types to limit to */
  types?: LiteralType[]
  aggrNeed: "none" | "optional" | "required"
  value?: Axis
  onChange: (axis: Axis | null) => void
  /** Makes this a required value */
  required?: boolean
  /** Shows the color map */
  showColorMap?: boolean
  /** Is the draw order reorderable */
  reorderable?: boolean
  /** Should a color map be automatically created from a default palette */
  autosetColors?: boolean
  /** True to allow excluding of values via checkboxes */
  allowExcludedValues?: boolean
  defaultColor?: string | null
  /** Show format control for numeric values */
  showFormat?: boolean
  /** Filters to apply */
  filters?: JsonQLFilter[]
}

// Axis component that allows designing of an axis
export default class AxisComponent extends AsyncLoadComponent<
  AxisComponentProps,
  { categories: any; loading: boolean }
> {
  static defaultProps = {
    reorderable: false,
    allowExcludedValues: false,
    autosetColors: true
  }

  static contextTypes = { locale: PropTypes.string }

  constructor(props: any) {
    super(props)

    this.state = {
      loading: false,
      categories: null // Categories of the axis. Loaded whenever axis is changed
    }
  }

  isLoadNeeded(newProps: any, oldProps: any) {
    const hasColorChanged = !_.isEqual(
      _.omit(newProps.value, ["colorMap", "drawOrder"]),
      _.omit(oldProps.value, ["colorMap", "drawOrder"])
    )
    const filtersChanged = !_.isEqual(newProps.filters, oldProps.filters)
    return hasColorChanged || filtersChanged
  }

  // Asynchronously get the categories of the axis, which requires a query when the field is a text field or other non-enum type
  load(props: any, prevProps: any, callback: any) {
    const axisBuilder = new AxisBuilder({ schema: props.schema })

    // Clean axis first
    const axis = axisBuilder.cleanAxis({
      axis: props.value,
      table: props.table,
      types: props.types,
      aggrNeed: props.aggrNeed
    })

    // Ignore if error
    if (!axis || axisBuilder.validateAxis({ axis })) {
      return
    }

    // Handle literal expression
    const values = []
    if (axis.expr?.type === "literal") {
      values.push(axis.expr.value)
    }

    // Get categories (value + label)
    let categories = axisBuilder.getCategories(axis, values)

    // Just "None" and so doesn't count
    if (_.any(categories, (category) => category.value != null)) {
      callback({ categories })
      return
    }

    // Can't get values of aggregate axis
    if (axisBuilder.isAxisAggr(axis)) {
      callback({ categories: [] })
      return
    }

    // If no table, cannot query
    if (!axis.expr || !(axis.expr as OpExpr)!.table) {
      callback({ categories: [] })
      return
    }

    // If no categories, we need values as input
    const valuesQuery: JsonQLSelectQuery = {
      type: "query",
      selects: [{ type: "select", expr: axisBuilder.compileAxis({ axis, tableAlias: "main" }), alias: "val" }],
      from: { type: "table", table: (axis.expr as OpExpr)!.table!, alias: "main" },
      groupBy: [1],
      limit: 50
    }

    const filters = _.where(this.props.filters || [], { table: (axis.expr as OpExpr)!.table })
    let whereClauses = _.map(filters, (f) => injectTableAlias(f.jsonql, "main"))
    whereClauses = _.compact(whereClauses)

    // Wrap if multiple
    if (whereClauses.length > 1) {
      valuesQuery.where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      valuesQuery.where = whereClauses[0]
    }

    return props.dataSource.performQuery(valuesQuery, (error: any, rows: any) => {
      if (error) {
        return // Ignore errors
      }

      // Get categories (value + label)
      categories = axisBuilder.getCategories(axis, _.pluck(rows, "val"))
      return callback({ categories })
    })
  }

  handleExprChange = (expr: any) => {
    // If no expression, reset
    if (!expr) {
      this.props.onChange(null)
      return
    }

    // Set expression and clear xform
    return this.props.onChange(this.cleanAxis(_.extend({}, _.omit(this.props.value || {}, ["drawOrder"]), { expr })))
  }

  handleFormatChange = (ev: any) => {
    return this.props.onChange(
      produce(this.props.value!, (draft) => {
        draft.format = ev.target.value
      })
    )
  }

  handleXformTypeChange = (type: any) => {
    // Remove
    let xform: AxisXform
    if (!type) {
      this.props.onChange(
        produce(this.props.value!, (draft) => {
          delete draft.xform
          delete draft.colorMap
          delete draft.drawOrder
        })
      )
      return
    }

    // Save bins if going from bins to custom ranges and has ranges
    if (
      type === "ranges" &&
      this.props.value!.xform?.type === "bin" &&
      this.props.value!.xform.min != null &&
      this.props.value!.xform.max != null &&
      this.props.value!.xform.min !== this.props.value!.xform.max &&
      this.props.value!.xform.numBins
    ) {
      const { min } = this.props.value!.xform
      const { max } = this.props.value!.xform
      const { numBins } = this.props.value!.xform

      const ranges: AxisXformRange[] = [{ id: uuid(), maxValue: min, minOpen: false, maxOpen: true }]
      for (let i = 1, end1 = numBins, asc = 1 <= end1; asc ? i <= end1 : i >= end1; asc ? i++ : i--) {
        const start = ((i - 1) / numBins) * (max - min) + min
        const end = (i / numBins) * (max - min) + min
        ranges.push({ id: uuid(), minValue: start, minOpen: false, maxValue: end, maxOpen: true })
      }
      ranges.push({ id: uuid(), minValue: max, minOpen: true, maxOpen: true })

      xform = {
        type: "ranges",
        ranges
      }
    } else {
      xform = {
        type
      }
    }

    return this.props.onChange(
      produce(this.props.value!, (draft) => {
        delete draft.colorMap
        delete draft.drawOrder
        draft.xform = xform
      })
    )
  }

  handleXformChange = (xform: any) => {
    return this.props.onChange(
      this.cleanAxis(update(_.omit(this.props.value!, ["drawOrder"]), { xform: { $set: xform } }))
    )
  }

  cleanAxis(axis: any) {
    const axisBuilder = new AxisBuilder({ schema: this.props.schema })
    return axisBuilder.cleanAxis({
      axis,
      table: this.props.table,
      aggrNeed: this.props.aggrNeed,
      types: this.props.types
    })
  }

  renderXform(axis: any) {
    if (!axis) {
      return null
    }

    if (axis.xform && ["bin", "ranges", "floor"].includes(axis.xform.type)) {
      let comp
      if (axis.xform.type === "ranges") {
        comp = R(RangesComponent, {
          schema: this.props.schema,
          expr: axis.expr,
          xform: axis.xform,
          onChange: this.handleXformChange
        })
      } else if (axis.xform.type === "bin") {
        comp = R(BinsComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          expr: axis.expr,
          xform: axis.xform,
          onChange: this.handleXformChange
        })
      } else {
        comp = null
      }

      return R(
        "div",
        null,
        R(ui.ButtonToggleComponent, {
          value: axis.xform ? axis.xform.type : null,
          options: [
            { value: "bin", label: "Equal Bins" },
            { value: "ranges", label: "Custom Ranges" },
            { value: "floor", label: "Whole Numbers" }
          ],
          onChange: this.handleXformTypeChange
        }),
        comp
      )
    }

    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(axis.expr)

    switch (exprType) {
      case "date":
        return R(ui.ButtonToggleComponent, {
          value: axis.xform ? axis.xform.type : null,
          options: [
            { value: null, label: "Exact Date" },
            { value: "year", label: "Year" },
            { value: "yearmonth", label: "Year/Month" },
            { value: "month", label: "Month" },
            { value: "week", label: "Week" },
            { value: "yearweek", label: "Year/Week" },
            { value: "yearquarter", label: "Year/Quarter" }
          ],
          onChange: this.handleXformTypeChange
        })
      case "datetime":
        return R(ui.ButtonToggleComponent, {
          value: axis.xform ? axis.xform.type : null,
          options: [
            { value: "date", label: "Date" },
            { value: "year", label: "Year" },
            { value: "yearmonth", label: "Year/Month" },
            { value: "month", label: "Month" },
            { value: "week", label: "Week" },
            { value: "yearweek", label: "Year/Week" },
            { value: "yearquarter", label: "Year/Quarter" }
          ],
          onChange: this.handleXformTypeChange
        })
    }
    return null
  }

  renderColorMap(axis: any) {
    if (!this.props.showColorMap || !axis || !axis.expr) {
      return null
    }

    return [
      R("br"),
      R(AxisColorEditorComponent, {
        schema: this.props.schema,
        axis,
        categories: this.state.categories,
        onChange: this.props.onChange,
        reorderable: this.props.reorderable,
        defaultColor: this.props.defaultColor,
        allowExcludedValues: this.props.allowExcludedValues,
        autosetColors: this.props.autosetColors,
        initiallyExpanded: true
      })
    ]
  }

  renderExcludedValues(axis: any) {
    // Only if no color map and allows excluded values
    if (this.props.showColorMap || !axis || !axis.expr || !this.props.allowExcludedValues) {
      return null
    }

    // Use categories
    if (!this.state.categories || this.state.categories.length < 1) {
      return null
    }

    return [
      R("br"),
      R(CategoryMapComponent, {
        schema: this.props.schema,
        axis,
        onChange: this.props.onChange,
        categories: this.state.categories,
        reorderable: false,
        showColorMap: false,
        allowExcludedValues: true,
        initiallyExpanded: true
      })
    ]
  }

  renderFormat(axis: any) {
    const axisBuilder = new AxisBuilder({ schema: this.props.schema })

    const valueType = axisBuilder.getAxisType(axis)
    if (!valueType) {
      return null
    }

    const formats = getFormatOptions(valueType)
    if (!formats) {
      return null
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, "Format"),
      ": ",
      R(
        "select",
        {
          value: axis.format != null ? axis.format : getDefaultFormat(valueType),
          className: "form-select",
          style: { width: "auto", display: "inline-block" },
          onChange: this.handleFormatChange
        },
        _.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))
      )
    )
  }

  render() {
    let aggrStatuses: AggrStatus[]
    const axisBuilder = new AxisBuilder({ schema: this.props.schema })

    // Clean before render
    const axis = this.cleanAxis(this.props.value)

    // Determine aggrStatuses that are possible
    switch (this.props.aggrNeed) {
      case "none":
        aggrStatuses = ["literal", "individual"]
        break
      case "optional":
        aggrStatuses = ["literal", "individual", "aggregate"]
        break
      case "required":
        aggrStatuses = ["literal", "aggregate"]
        break
    }

    return R(
      "div",
      null,
      R(
        "div",
        null,
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: axisBuilder.getExprTypes(this.props.types),
          // preventRemove: @props.required
          onChange: this.handleExprChange,
          value: this.props.value ? this.props.value.expr : null,
          aggrStatuses
        })
      ),
      this.renderXform(axis),
      this.props.showFormat ? this.renderFormat(axis) : undefined,
      this.renderColorMap(axis),
      this.renderExcludedValues(axis)
    )
  }
}
