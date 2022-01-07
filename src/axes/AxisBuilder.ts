import _ from "lodash"
import uuid from "uuid"
import { AggrStatus, Expr, ExprCompiler, FieldExpr, LiteralType, Schema } from "mwater-expressions"
import { ExprValidator } from "mwater-expressions"
import { ExprUtils } from "mwater-expressions"
import { ExprCleaner } from "mwater-expressions"
import * as d3Format from "d3-format"
import moment from "moment"
import React from "react"
const R = React.createElement
import { default as produce } from "immer"
import { formatValue } from "../valueFormatter"
import { Axis, AxisCategory } from "./Axis"
import { JsonQLExpr, JsonQLSelectQuery } from "jsonql"

const xforms: { type: string; input: LiteralType; output: LiteralType }[] = [
  { type: "bin", input: "number", output: "enum" },
  { type: "ranges", input: "number", output: "enum" },
  { type: "floor", input: "number", output: "enum" },
  { type: "date", input: "datetime", output: "date" },
  { type: "year", input: "date", output: "date" },
  { type: "year", input: "datetime", output: "date" },
  { type: "yearmonth", input: "date", output: "date" },
  { type: "yearmonth", input: "datetime", output: "date" },
  { type: "yearquarter", input: "date", output: "enum" },
  { type: "yearquarter", input: "datetime", output: "enum" },
  { type: "yearweek", input: "date", output: "enum" },
  { type: "yearweek", input: "datetime", output: "enum" },
  { type: "month", input: "date", output: "enum" },
  { type: "month", input: "datetime", output: "enum" },
  { type: "week", input: "date", output: "enum" },
  { type: "week", input: "datetime", output: "enum" }
]

export type AggrNeed = "none" | "optional" | "required"

// Small number to prevent width_bucket errors on auto binning with only one value
const epsilon = 0.000000001

// Understands axes. Contains methods to clean/validate etc. an axis of any type.
export default class AxisBuilder {
  schema: Schema
  exprUtils: ExprUtils
  exprCleaner: ExprCleaner
  exprValidator: ExprValidator

  // Options are: schema
  constructor(options: { schema: Schema }) {
    this.schema = options.schema
    this.exprUtils = new ExprUtils(this.schema)
    this.exprCleaner = new ExprCleaner(this.schema)
    this.exprValidator = new ExprValidator(this.schema)
  }

  /** Clean an axis with respect to a specific table
    options:
     axis: axis to clean
     table: table that axis is to be for
     aggrNeed is "none", "optional" or "required"
     types: optional list of types to require it to be one of
  */
  cleanAxis(options: { axis: Axis | null; table?: string | null; aggrNeed?: AggrNeed; types?: string[] }): Axis | null {
    let aggrStatuses: AggrStatus[] | undefined = undefined
    let { axis } = options

    if (!axis) {
      return null
    }

    let { expr } = axis

    // Move aggr inside since aggr is deprecated at axis level DEPRECATED
    if (axis.aggr && axis.expr) {
      // @ts-ignore
      expr = { type: "op", op: axis.aggr, table: axis.expr.table, exprs: axis.aggr !== "count" ? [axis.expr] : [] }
    }

    // Determine aggrStatuses that are possible
    switch (options.aggrNeed) {
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

    // Clean expression
    expr = this.exprCleaner.cleanExpr(expr, { table: options.table || undefined, aggrStatuses })
    if (!expr) {
      return null
    }

    const type = this.exprUtils.getExprType(expr)

    // Validate xform type
    let xform: any = null

    if (axis.xform) {
      // Find valid xform
      xform = _.find(xforms, function (xf) {
        // xform type must match
        if (xf.type !== axis!.xform!.type) {
          return false
        }

        // Input type must match
        if (xf.input !== type) {
          return false
        }

        // Output type must match
        if (options.types && !options.types.includes(xf.output)) {
          return false
        }
        return true
      })
    }

    // If no xform and using an xform would allow satisfying output types, pick first
    if (!xform && options.types && type && !options.types.includes(type)) {
      xform = _.find(xforms, (xf) => xf.input === type && options.types!.includes(xf.output))
      if (!xform) {
        // Unredeemable if no xform possible and cannot use count to get number
        if (options.aggrNeed === "none") {
          return null
        }
        if (!options.types.includes("number") || type !== "id") {
          return null
        }
      }
    }

    axis = produce(axis, (draft: any) => {
      draft.expr = expr

      if (axis!.aggr) {
        delete draft.aggr
      }

      if (!xform && axis!.xform) {
        delete draft.xform
      } else if (xform && (!axis!.xform || axis!.xform.type !== xform.type)) {
        draft.xform = { type: xform.type }
      }

      if (draft.xform && draft.xform.type === "bin") {
        // Add number of bins
        if (!draft.xform.numBins) {
          draft.xform.numBins = 5
        }
      }

      if (draft.xform && draft.xform.type === "ranges") {
        // Add ranges
        if (!draft.xform.ranges) {
          draft.xform.ranges = [{ id: uuid(), minOpen: false, maxOpen: true }]
        }
      }
    })

    return axis
  }

  /** Checks whether an axis is valid 
    options:
     axis: axis to validate
  */
  validateAxis(options: { axis: Axis | null | undefined }): string | null {
    // Nothing is ok
    if (!options.axis) {
      return null
    }

    // Validate expression (allow all statuses since we don't know aggregation)
    const error = this.exprValidator.validateExpr(options.axis.expr, {
      aggrStatuses: ["individual", "literal", "aggregate"]
    })
    if (error) {
      return error
    }

    // xform validation
    if (options.axis.xform && options.axis.xform.type === "bin") {
      if (!options.axis.xform.numBins) {
        return "Missing numBins"
      }
      if (options.axis.xform.min == null) {
        return "Missing min"
      }
      if (options.axis.xform.max == null) {
        return "Missing max"
      }
      if (options.axis.xform.max < options.axis.xform.min) {
        return "Max < min"
      }
    }

    // xform validation
    if (options.axis.xform && options.axis.xform.type === "ranges") {
      if (!options.axis.xform.ranges || !_.isArray(options.axis.xform.ranges)) {
        return "Missing ranges"
      }
      for (let range of options.axis.xform.ranges) {
        if (range.minValue != null && range.maxValue != null && range.minValue > range.maxValue) {
          return "Max < min"
        }
      }
    }
    return null
  }

  /**
   * Compile an axis to JsonQL
   */
  compileAxis(options: { axis: Axis; tableAlias: string }): JsonQLExpr {
    if (!options.axis) {
      return null
    }

    // Legacy support of aggr
    let { expr } = options.axis
    if (options.axis.aggr) {
      expr = {
        type: "op",
        op: options.axis.aggr,
        table: (expr as FieldExpr).table,
        exprs: options.axis.aggr !== "count" ? [expr] : []
      }
    }

    const exprCompiler = new ExprCompiler(this.schema)
    let compiledExpr = exprCompiler.compileExpr({ expr, tableAlias: options.tableAlias })

    // Bin
    if (options.axis.xform) {
      if (options.axis.xform.type === "bin") {
        const min = options.axis.xform.min!
        let max = options.axis.xform.max!
        // Add epsilon to prevent width_bucket from crashing
        if (max === min) {
          max += epsilon
        }
        if (max === min) {
          // If was too big to add epsilon
          max = min * 1.00001
        }

        // Special case for excludeUpper as we need to include upper bound (e.g. 100 for percentages) in the lower bin. Do it by adding epsilon
        if (options.axis.xform.excludeUpper) {
          const thresholds = _.map(
            _.range(0, options.axis.xform.numBins),
            (bin) => min + ((max - min) * bin) / options.axis.xform!.numBins!
          )
          thresholds.push(max + epsilon)
          compiledExpr = {
            type: "op",
            op: "width_bucket",
            exprs: [
              { type: "op", op: "::decimal", exprs: [compiledExpr] },
              { type: "literal", value: thresholds }
            ]
          }
        } else {
          compiledExpr = {
            type: "op",
            op: "width_bucket",
            exprs: [compiledExpr, min, max, options.axis.xform.numBins!]
          }
        }
      }

      if (options.axis.xform.type === "date") {
        compiledExpr = {
          type: "op",
          op: "substr",
          exprs: [compiledExpr, 1, 10]
        }
      }

      if (options.axis.xform.type === "year") {
        compiledExpr = {
          type: "op",
          op: "rpad",
          exprs: [{ type: "op", op: "substr", exprs: [compiledExpr, 1, 4] }, 10, "-01-01"]
        }
      }

      if (options.axis.xform.type === "yearmonth") {
        compiledExpr = {
          type: "op",
          op: "rpad",
          exprs: [{ type: "op", op: "substr", exprs: [compiledExpr, 1, 7] }, 10, "-01"]
        }
      }

      if (options.axis.xform.type === "month") {
        compiledExpr = {
          type: "op",
          op: "substr",
          exprs: [compiledExpr, 6, 2]
        }
      }

      if (options.axis.xform.type === "week") {
        compiledExpr = {
          type: "op",
          op: "to_char",
          exprs: [{ type: "op", op: "::date", exprs: [compiledExpr] }, "IW"]
        }
      }

      if (options.axis.xform.type === "yearquarter") {
        compiledExpr = {
          type: "op",
          op: "to_char",
          exprs: [{ type: "op", op: "::date", exprs: [compiledExpr] }, "YYYY-Q"]
        }
      }

      if (options.axis.xform.type === "yearweek") {
        compiledExpr = {
          type: "op",
          op: "to_char",
          exprs: [{ type: "op", op: "::date", exprs: [compiledExpr] }, "IYYY-IW"]
        }
      }

      // Ranges
      if (options.axis.xform.type === "ranges") {
        const cases: { when: JsonQLExpr; then: JsonQLExpr }[] = []
        for (let range of options.axis.xform.ranges!) {
          const whens: JsonQLExpr[] = []
          if (range.minValue != null) {
            if (range.minOpen) {
              whens.push({ type: "op", op: ">", exprs: [compiledExpr, range.minValue] })
            } else {
              whens.push({ type: "op", op: ">=", exprs: [compiledExpr, range.minValue] })
            }
          }

          if (range.maxValue != null) {
            if (range.maxOpen) {
              whens.push({ type: "op", op: "<", exprs: [compiledExpr, range.maxValue] })
            } else {
              whens.push({ type: "op", op: "<=", exprs: [compiledExpr, range.maxValue] })
            }
          }

          if (whens.length > 1) {
            cases.push({
              when: {
                type: "op",
                op: "and",
                exprs: whens
              },
              then: range.id
            })
          } else if (whens.length === 1) {
            cases.push({
              when: whens[0],
              then: range.id
            })
          }
        }

        if (cases.length > 0) {
          compiledExpr = {
            type: "case",
            cases
          }
        } else {
          compiledExpr = null
        }
      }

      if (options.axis.xform.type === "floor") {
        compiledExpr = {
          type: "op",
          op: "floor",
          exprs: [compiledExpr]
        }
      }
    }

    return compiledExpr
  }

  // Create query to get min and max for a nice binning. Returns one row with "min" and "max" fields
  // To do so, split into numBins + 2 percentile sections and exclude first and last
  // That will give a nice distribution when using width_bucket so that all are used
  // select max(inner.val), min(inner.val) f
  // from (select expression as val, ntile(numBins + 2) over (order by expression asc) as ntilenum
  // from the_table where exprssion is not null)
  // where inner.ntilenum > 1 and inner.ntilenum < numBins + 2
  // Inspired by: http://dba.stackexchange.com/questions/17086/fast-general-method-to-calculate-percentiles
  // expr is mwater expression on table
  // filterExpr is optional filter on values to include
  // Result can be null if no query could be computed
  compileBinMinMax(expr: any, table: any, filterExpr: any, numBins: any) {
    const exprCompiler = new ExprCompiler(this.schema)
    const compiledExpr = exprCompiler.compileExpr({ expr, tableAlias: "binrange" })

    if (!compiledExpr) {
      return null
    }

    // Create expression that selects the min or max
    const minExpr: JsonQLExpr = {
      type: "op",
      op: "min",
      exprs: [{ type: "field", tableAlias: "inner", column: "val" }]
    }
    const maxExpr: JsonQLExpr = {
      type: "op",
      op: "max",
      exprs: [{ type: "field", tableAlias: "inner", column: "val" }]
    }

    // Only include not null values
    let where: JsonQLExpr = {
      type: "op",
      op: "is not null",
      exprs: [compiledExpr]
    }

    // If filtering, compile and add to inner where
    if (filterExpr) {
      const compiledFilterExpr = exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "binrange" })
      if (compiledFilterExpr) {
        where = { type: "op", op: "and", exprs: [where, compiledFilterExpr] }
      }
    }

    const query: JsonQLSelectQuery = {
      type: "query",
      selects: [
        { type: "select", expr: minExpr, alias: "min" },
        { type: "select", expr: maxExpr, alias: "max" }
      ],
      from: {
        type: "subquery",
        query: {
          type: "query",
          selects: [
            { type: "select", expr: compiledExpr, alias: "val" },
            {
              type: "select",
              expr: {
                type: "op",
                op: "ntile",
                exprs: [numBins + 2],
                over: {
                  orderBy: [{ expr: compiledExpr, direction: "asc" }]
                }
              },
              alias: "ntilenum"
            }
          ],
          from: { type: "table", table, alias: "binrange" },
          where
        },
        alias: "inner"
      },
      where: {
        type: "op",
        op: "between",
        exprs: [{ type: "field", tableAlias: "inner", column: "ntilenum" }, 2, numBins + 1]
      }
    }
    return query
  }

  // Get underlying expression types that will give specified output expression types
  //  types: array of types
  getExprTypes(types: any) {
    if (!types) {
      return null
    }

    types = types.slice()

    // Add xformed types
    for (let xform of xforms) {
      if (types.includes(xform.output)) {
        types = _.union(types, [xform.input])
      }
    }

    return types
  }

  // Gets the color for a value (if in colorMap)
  getValueColor(axis: Axis, value: any) {
    const item = _.find(axis.colorMap || [], (item) => item.value === value)
    if (item) {
      return item.color
    }
    return null
  }

  /** Get all categories for a given axis type given the known values
   * Returns array of { value, label }
   */
  getCategories(axis: Axis, values?: any[] | null, options: {
    locale?: string
  } = {}): AxisCategory[] {
    let categories: AxisCategory[], current, end, format, hasNone, label, max, min, value, year
    const noneCategory = { value: null, label: axis.nullLabel || "None" }

    // Handle ranges
    if (axis.xform && axis.xform.type === "ranges") {
      return (
        _.map(axis.xform.ranges || [], (range) => {
          let label = range.label || ""
          if (!label) {
            if (range.minValue != null) {
              if (range.minOpen) {
                label = `> ${range.minValue}`
              } else {
                label = `>= ${range.minValue}`
              }
            }

            if (range.maxValue != null) {
              if (label) {
                label += " and "
              }
              if (range.maxOpen) {
                label += `< ${range.maxValue}`
              } else {
                label += `<= ${range.maxValue}`
              }
            }
          }

          return {
            value: range.id,
            label
          }
        }) as AxisCategory[]
      ).concat([noneCategory])
    }

    // Handle binning
    if (axis.xform && axis.xform.type === "bin") {
      ;({ min } = axis.xform)
      ;({ max } = axis.xform)
      const { numBins } = axis.xform

      // If not ready, no categories
      if (min == null || max == null || !numBins) {
        return []
      }

      // Special case of single value (min and max within epsilon or 0.01% of each other since epsilon might be too small to add to a big number)
      if (max - min <= epsilon || Math.abs((max - min) / (max + min)) < 0.0001) {
        return [
          { value: 0, label: `< ${min}` },
          { value: 1, label: `= ${min}` },
          { value: axis.xform.numBins! + 1, label: `> ${min}` },
          noneCategory
        ]
      }

      // Calculate precision
      const precision = d3Format.precisionFixed((max - min) / numBins)
      if (_.isNaN(precision)) {
        throw new Error(`Min/max errors: ${min} ${max} ${numBins}`)
      }

      format = d3Format.format(",." + precision + "f")

      categories = []

      if (!axis.xform.excludeLower) {
        categories.push({ value: 0, label: `< ${format(min)}` })
      }

      for (let i = 1, end1 = numBins, asc = 1 <= end1; asc ? i <= end1 : i >= end1; asc ? i++ : i--) {
        const start = ((i - 1) / numBins) * (max - min) + min
        end = (i / numBins) * (max - min) + min
        categories.push({ value: i, label: `${format(start)} - ${format(end)}` })
      }

      if (!axis.xform.excludeUpper) {
        categories.push({ value: axis.xform.numBins! + 1, label: `> ${format(max)}` })
      }

      categories.push(noneCategory)

      return categories
    }

    // Handle floor
    if (axis.xform && axis.xform.type === "floor") {
      // Get min and max
      min = _.min(_.filter(values || [], (v) => v != null))
      max = _.max(_.filter(values || [], (v) => v != null))
      const hasNull = _.filter(values || [], (v) => v == null).length > 0
      if (!_.isFinite(min) || !_.isFinite(max)) {
        return [noneCategory]
      }

      // Floor and get range
      if (max - min > 50) {
        max = min + 50
      }
      categories = []

      for (value of _.range(Math.floor(min), Math.floor(max) + 1)) {
        categories.push({ value, label: "" + value })
      }
      if (hasNull) {
        categories.push(noneCategory)
      }
      return categories
    }

    if (axis.xform && axis.xform.type === "month") {
      categories = [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" }
      ]

      // Add none if needed
      if (_.any(values || [], (v) => v == null)) {
        categories.push(noneCategory)
      }

      return categories
    }

    if (axis.xform && axis.xform.type === "week") {
      categories = []
      for (let week = 1; week <= 53; week++) {
        value = "" + week
        if (value.length === 1) {
          value = "0" + value
        }
        categories.push({ value, label: value })
      }

      // Add none if needed
      if (_.any(values || [], (v) => v == null)) {
        categories.push(noneCategory)
      }

      return categories
    }

    if (axis.xform && axis.xform.type === "year") {
      let asc1, end2
      hasNone = _.any(values || [], (v) => v == null)
      values = _.compact(values || [])
      if (values.length === 0) {
        return [noneCategory]
      }

      // Get min and max
      min = _.min(_.map(values, (date) => parseInt(date.substr(0, 4))))
      max = _.max(_.map(values, (date) => parseInt(date.substr(0, 4))))
      categories = []
      for (year = min, end2 = max, asc1 = min <= end2; asc1 ? year <= end2 : year >= end2; asc1 ? year++ : year--) {
        categories.push({ value: `${year}-01-01`, label: `${year}` })
        if (categories.length >= 1000) {
          break
        }
      }

      // Add none if needed
      if (hasNone) {
        categories.push(noneCategory)
      }

      return categories
    }

    if (axis.xform && axis.xform.type === "yearmonth") {
      hasNone = _.any(values || [], (v) => v == null)
      values = _.compact(values || [])
      if (values.length === 0) {
        return [noneCategory]
      }

      // Get min and max
      min = values.sort()[0]
      max = values.sort().slice(-1)[0]

      // Use moment to get range
      current = moment(min, "YYYY-MM-DD")
      end = moment(max, "YYYY-MM-DD")
      categories = []
      while (!current.isAfter(end)) {
        categories.push({ value: current.format("YYYY-MM-DD"), label: current.format("MMM YYYY") })
        current.add(1, "months")
        if (categories.length >= 1000) {
          break
        }
      }

      // Add none if needed
      if (hasNone) {
        categories.push(noneCategory)
      }

      return categories
    }

    if (axis.xform && axis.xform.type === "yearweek") {
      hasNone = _.any(values || [], (v) => v == null)
      values = _.compact(values || [])
      if (values.length === 0) {
        return [noneCategory]
      }

      // Get min and max
      min = values.sort()[0]
      max = values.sort().slice(-1)[0]

      // Use moment to get range
      current = moment(min, "GGGG-WW")
      end = moment(max, "GGGG-WW")
      categories = []
      while (!current.isAfter(end)) {
        categories.push({ value: current.format("GGGG-WW"), label: current.format("GGGG-WW") })
        current.add(1, "weeks")
        if (categories.length >= 1000) {
          break
        }
      }

      // Add none if needed
      if (hasNone) {
        categories.push(noneCategory)
      }

      return categories
    }

    if (axis.xform && axis.xform.type === "yearquarter") {
      hasNone = _.any(values || [], (v) => v == null)
      values = _.compact(values || [])
      if (values.length === 0) {
        return [noneCategory]
      }

      // Get min and max
      min = values.sort()[0]
      max = values.sort().slice(-1)[0]

      // Use moment to get range
      current = moment(min, "YYYY-Q")
      end = moment(max, "YYYY-Q")
      categories = []
      while (!current.isAfter(end)) {
        value = current.format("YYYY-Q")
        const quarter = current.format("Q")
        year = current.format("YYYY")
        if (quarter === "1") {
          label = `${year} Jan-Mar`
        } else if (quarter === "2") {
          label = `${year} Apr-Jun`
        } else if (quarter === "3") {
          label = `${year} Jul-Sep`
        } else if (quarter === "4") {
          label = `${year} Oct-Dec`
        } else {
          label = ""
        }
        categories.push({ value, label })
        current.add(1, "quarters")
        if (categories.length >= 1000) {
          break
        }
      }

      // Add none if needed
      if (hasNone) {
        categories.push(noneCategory)
      }

      return categories
    }

    switch (this.getAxisType(axis)) {
      case "enum":
      case "enumset":
        // If enum, return enum values
        return (
          _.map(this.exprUtils.getExprEnumValues(axis.expr)!, (ev) => ({
            value: ev.id,
            label: ExprUtils.localizeString(ev.name, options.locale)
          })) as { value: any; label: string }[]
        ).concat([noneCategory])
      case "text":
        // Return unique values
        hasNone = _.any(values || [], (v) => v == null)
        categories = _.map(_.compact(_.uniq(values || [])).sort(), (v) => ({
          value: v,
          label: v || "None"
        }))
        if (hasNone) {
          categories.push(noneCategory)
        }

        return categories
      case "boolean":
        // Return unique values
        return [{ value: true, label: "True" }, { value: false, label: "False" }, noneCategory]
      case "date":
        values = _.compact(values || [])
        if (values.length === 0) {
          return [noneCategory]
        }

        // Get min and max
        min = values.sort()[0]
        max = values.sort().slice(-1)[0]

        // Use moment to get range
        current = moment(min, "YYYY-MM-DD")
        end = moment(max, "YYYY-MM-DD")
        categories = []
        while (!current.isAfter(end)) {
          categories.push({ value: current.format("YYYY-MM-DD"), label: current.format("ll") })
          current.add(1, "days")
          if (categories.length >= 1000) {
            break
          }
        }
        categories.push(noneCategory)
        return categories
    }

    return []
  }

  // Get type of axis output
  getAxisType(axis: any): LiteralType | null {
    if (!axis) {
      return null
    }

    // DEPRECATED
    if (axis.aggr === "count") {
      return "number"
    }

    const type = this.exprUtils.getExprType(axis.expr)

    if (axis.xform) {
      const xform = _.findWhere(xforms, { type: axis.xform.type, input: type })!
      return xform.output
    }

    return type
  }

  // Determines if axis is aggregate
  isAxisAggr(axis: any) {
    // Legacy support of axis.aggr
    return axis != null && (axis.aggr || this.exprUtils.getExprAggrStatus(axis.expr) === "aggregate")
  }

  // Determines if axis supports cumulative values (number, date or year-quarter)
  doesAxisSupportCumulative(axis: any) {
    const axisType = this.getAxisType(axis)
    return axisType == "date" || axisType == "number" || axis.xform?.type === "yearquarter"
  }

  // Converts a category to a string (uses label or override)
  formatCategory(axis: any, category: any) {
    const categoryLabel = axis.categoryLabels ? axis.categoryLabels[JSON.stringify(category.value)] : undefined
    if (categoryLabel) {
      return categoryLabel
    } else {
      return category.label
    }
  }

  // Summarize axis as a string
  summarizeAxis(axis: any, locale: any) {
    if (!axis) {
      return "None"
    }

    return this.exprUtils.summarizeExpr(axis.expr, locale)
  }
  // TODO add xform support

  // Get a string (or React DOM actually) representation of an axis value
  formatValue(axis: Axis, value: any, locale: string, legacyPercentFormat?: any) {
    if (value == null) {
      return axis?.nullLabel || "None"
    }

    const type = this.getAxisType(axis)

    // If has categories, use those
    const categories = this.getCategories(axis, [value], { locale })
    if (categories.length > 0) {
      if (type === "enumset") {
        // Parse if string
        if (_.isString(value)) {
          value = JSON.parse(value)
        }
        return _.map(value, (v) => {
          const category = _.findWhere(categories, { value: v })
          if (category) {
            return this.formatCategory(axis, category)
          } else {
            return "???"
          }
        }).join(", ")
      } else {
        const category = _.findWhere(categories, { value })
        if (category) {
          return this.formatCategory(axis, category)
        } else {
          return "???"
        }
      }
    }

    switch (type) {
      case "text":
        return value
      case "number":
        var num = parseFloat(value)
        return formatValue(type, num, axis.format, locale, legacyPercentFormat)
      case "geometry":
        return formatValue(type, value, axis.format, locale, legacyPercentFormat)
      case "text[]":
        // Parse if string
        if (_.isString(value)) {
          value = JSON.parse(value)
        }
        return R(
          "div",
          null,
          _.map(value as string[], (v, i) => R("div", { key: i }, v))
        )
      case "date":
        return moment(value, moment.ISO_8601).format("ll")
      case "datetime":
        return moment(value, moment.ISO_8601).format("lll")
    }

    return "" + value
  }

  // Creates a filter (jsonql with {alias} for table name) based on a specific value
  // of the axis. Used to filter by a specific point/bar.
  createValueFilter(axis: any, value: any): JsonQLExpr {
    if (value != null) {
      return {
        type: "op",
        op: "=",
        exprs: [this.compileAxis({ axis, tableAlias: "{alias}" }), { type: "literal", value }]
      }
    } else {
      return {
        type: "op",
        op: "is null",
        exprs: [this.compileAxis({ axis, tableAlias: "{alias}" })]
      }
    }
  }

  // Creates a filter expression (mwater-expression) based on a specific value
  // of the axis. Used to filter by a specific point/bar.
  createValueFilterExpr(axis: any, value: any): Expr {
    const axisExpr = this.convertAxisToExpr(axis)
    const axisExprType = this.exprUtils.getExprType(axisExpr)

    if (value != null) {
      return {
        table: axis.expr.table,
        type: "op",
        op: "=",
        exprs: [axisExpr, { type: "literal", valueType: axisExprType, value }]
      }
    } else {
      return {
        table: axis.expr.table,
        type: "op",
        op: "is null",
        exprs: [axisExpr]
      }
    }
  }

  isCategorical(axis: any) {
    let type
    const nonCategoricalTypes = ["bin", "ranges", "date", "yearmonth", "floor"]
    if (axis.xform) {
      ;({ type } = axis.xform)
    } else {
      type = this.exprUtils.getExprType(axis.expr)
    }

    return nonCategoricalTypes.indexOf(type) === -1
  }

  // Converts an axis to an expression (mwater-expression)
  convertAxisToExpr(axis: any) {
    let { expr } = axis
    const { table } = expr

    // Bin
    if (axis.xform) {
      const { xform } = axis
      if (xform.type === "bin") {
        const { min } = xform
        let { max } = xform
        // Add epsilon to prevent width_bucket from crashing
        if (max === min) {
          max += epsilon
        }
        if (max === min) {
          // If was too big to add epsilon
          max = min * 1.00001
        }

        // if xform.excludeUpper
        // Create op least(greatest(floor((expr - min)/((max - min) / numBins)) - (-1), 0), numBins + 1)
        expr = { table, type: "op", op: "-", exprs: [expr, { type: "literal", valueType: "number", value: min }] }
        expr = {
          table,
          type: "op",
          op: "/",
          exprs: [expr, { type: "literal", valueType: "number", value: (max - min) / xform.numBins }]
        }
        expr = { table, type: "op", op: "floor", exprs: [expr] }
        expr = { table, type: "op", op: "+", exprs: [expr, { type: "literal", valueType: "number", value: 1 }] }
        expr = { table, type: "op", op: "greatest", exprs: [expr, { type: "literal", valueType: "number", value: 0 }] }
        expr = {
          table,
          type: "op",
          op: "least",
          exprs: [expr, { type: "literal", valueType: "number", value: xform.numBins + 1 }]
        }

        // Handle nulls specially
        expr = {
          table,
          type: "case",
          cases: [{ when: { table, type: "op", op: "is null", exprs: [axis.expr] }, then: null }],
          else: expr
        }

        // Special case for excludeUpper as we need to include upper bound (e.g. 100 for percentages) in the lower bin
        if (xform.excludeUpper) {
          expr.cases.push({
            when: {
              table,
              type: "op",
              op: "=",
              exprs: [axis.expr, { type: "literal", valueType: "number", value: max }]
            },
            then: { type: "literal", valueType: "number", value: xform.numBins }
          })
        }
      }

      if (xform.type === "date") {
        expr = {
          table,
          type: "op",
          op: "to date",
          exprs: [expr]
        }
      }

      if (xform.type === "year") {
        expr = {
          table,
          type: "op",
          op: "year",
          exprs: [expr]
        }
      }

      if (xform.type === "yearmonth") {
        expr = {
          table,
          type: "op",
          op: "yearmonth",
          exprs: [expr]
        }
      }

      if (xform.type === "month") {
        expr = {
          table,
          type: "op",
          op: "month",
          exprs: [expr]
        }
      }

      if (xform.type === "week") {
        expr = {
          table,
          type: "op",
          op: "weekofyear",
          exprs: [expr]
        }
      }

      if (xform.type === "yearquarter") {
        expr = {
          table,
          type: "op",
          op: "yearquarter",
          exprs: [expr]
        }
      }

      if (xform.type === "yearweek") {
        expr = {
          table,
          type: "op",
          op: "yearweek",
          exprs: [expr]
        }
      }

      // Ranges
      if (xform.type === "ranges") {
        const cases = []
        for (let range of xform.ranges) {
          const whens = []
          if (range.minValue != null) {
            if (range.minOpen) {
              whens.push({
                table,
                type: "op",
                op: ">",
                exprs: [expr, { type: "literal", valueType: "number", value: range.minValue }]
              })
            } else {
              whens.push({
                table,
                type: "op",
                op: ">=",
                exprs: [expr, { type: "literal", valueType: "number", value: range.minValue }]
              })
            }
          }

          if (range.maxValue != null) {
            if (range.maxOpen) {
              whens.push({
                table,
                type: "op",
                op: "<",
                exprs: [expr, { type: "literal", valueType: "number", value: range.maxValue }]
              })
            } else {
              whens.push({
                table,
                type: "op",
                op: "<=",
                exprs: [expr, { type: "literal", valueType: "number", value: range.maxValue }]
              })
            }
          }

          if (whens.length > 1) {
            cases.push({
              when: {
                table,
                type: "op",
                op: "and",
                exprs: whens
              },
              then: { type: "literal", valueType: "enum", value: range.id }
            })
          } else if (whens.length === 1) {
            cases.push({
              when: whens[0],
              then: { type: "literal", valueType: "enum", value: range.id }
            })
          }
        }

        if (cases.length > 0) {
          expr = {
            table,
            type: "case",
            cases
          }
        } else {
          expr = null
        }
      }

      if (xform.type === "floor") {
        expr = {
          table,
          type: "op",
          op: "floor",
          exprs: [expr]
        }
      }
    }

    return expr
  }
}
