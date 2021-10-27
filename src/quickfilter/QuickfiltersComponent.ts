import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { default as ReactSelect } from "react-select"
import { DataSource, ExprUtils, LocalizedString, Schema } from "mwater-expressions"
import { ExprCleaner } from "mwater-expressions"
import TextLiteralComponent from "./TextLiteralComponent"
import DateExprComponent from "./DateExprComponent"
import QuickfilterCompiler from "./QuickfilterCompiler"
import IdArrayQuickfilterComponent from "./IdArrayQuickfilterComponent"
import { Quickfilter, QuickfilterLock } from "./Quickfilter"
import { QuickfiltersDataSource } from "./QuickfiltersDataSource"
import { JsonQLFilter } from ".."

export interface QuickfiltersComponentProps {
  /** Design of quickfilters. See README.md */
  design: Quickfilter[]

  /** Current values of quickfilters (state of filters selected) */
  values?: any[]

  /** Called when value changes */
  onValuesChange: (values: any[]) => void

  // Locked quickfilters. Locked ones cannot be changed and are shown with a lock
  locks?: QuickfilterLock[]

  schema: Schema
  dataSource: DataSource
  quickfiltersDataSource: QuickfiltersDataSource

  /** Filters to add to restrict quick filter data to */
  filters?: JsonQLFilter[]

  /** True to hide top border */
  hideTopBorder?: boolean

  /** Called when user hides the quickfilter bar */
  onHide?: () => void
}

/** Displays quick filters and allows their value to be modified */
export default class QuickfiltersComponent extends React.Component<QuickfiltersComponentProps> {
  renderQuickfilter(item: any, index: any) {
    // Skip if merged
    let onValueChange
    if (item.merged) {
      return null
    }

    let values = this.props.values || []
    let itemValue = values[index]

    // Clean expression first
    const expr = new ExprCleaner(this.props.schema).cleanExpr(item.expr)

    // Do not render if nothing
    if (!expr) {
      return null
    }

    // Get type of expr
    const type = new ExprUtils(this.props.schema).getExprType(expr)
    if (!type) {
      return null
    }

    // Determine if locked
    const lock = _.find(this.props.locks || [], (lock) => _.isEqual(lock.expr, expr))

    if (lock) {
      // Overrides item value
      itemValue = lock.value
      onValueChange = null
    } else {
      // Can change value if not locked
      onValueChange = (v: any) => {
        values = (this.props.values || []).slice()
        values[index] = v

        // Also set any subsequent merged ones
        for (
          let start = index + 1, i = start, end = this.props.design.length, asc = start <= end;
          asc ? i < end : i > end;
          asc ? i++ : i--
        ) {
          if (this.props.design[i].merged) {
            values[i] = v
          } else {
            break
          }
        }

        return this.props.onValuesChange(values)
      }
    }

    // Determine additional filters that come from other quickfilters. This is to make sure that each quickfilter is filtered
    // by any other active quickfilters (excluding self)
    const compiler = new QuickfilterCompiler(this.props.schema)
    const otherDesign = (this.props.design || []).slice()
    const otherValues = (this.props.values || []).slice()
    const otherLocks = (this.props.locks || []).slice()
    otherDesign.splice(index, 1)
    otherValues.splice(index, 1)
    otherLocks.splice(index, 1)
    const otherQuickFilterFilters = compiler.compile(otherDesign, otherValues, otherLocks)
    const filters = (this.props.filters || []).concat(otherQuickFilterFilters)

    if (["enum", "enumset"].includes(type)) {
      return R(EnumQuickfilterComponent, {
        key: JSON.stringify(item),
        label: item.label,
        expr,
        schema: this.props.schema,
        options: new ExprUtils(this.props.schema).getExprEnumValues(expr),
        value: itemValue,
        onValueChange,
        multi: item.multi
      })
    }

    if (type === "text") {
      return R(TextQuickfilterComponent, {
        key: JSON.stringify(item),
        index,
        label: item.label,
        expr,
        schema: this.props.schema,
        quickfiltersDataSource: this.props.quickfiltersDataSource,
        value: itemValue,
        onValueChange,
        filters,
        multi: item.multi
      })
    }

    if (["date", "datetime"].includes(type)) {
      return R(DateQuickfilterComponent, {
        key: JSON.stringify(item),
        label: item.label,
        expr,
        schema: this.props.schema,
        value: itemValue,
        onValueChange
      })
    }

    if (type === "id[]") {
      return R(IdArrayQuickfilterComponent, {
        key: JSON.stringify(item),
        index,
        label: item.label,
        expr,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        value: itemValue,
        onValueChange,
        filters,
        multi: item.multi
      })
    }

    if (type === "text[]") {
      return R(TextArrayQuickfilterComponent, {
        key: JSON.stringify(item),
        index,
        label: item.label,
        expr,
        schema: this.props.schema,
        quickfiltersDataSource: this.props.quickfiltersDataSource,
        value: itemValue,
        onValueChange,
        filters,
        multi: item.multi
      })
    }

    return null
  }

  render() {
    if (!this.props.design || this.props.design.length === 0) {
      return null
    }

    return R(
      "div",
      {
        style: {
          borderTop: !this.props.hideTopBorder ? "solid 1px #E8E8E8" : undefined,
          borderBottom: "solid 1px #E8E8E8",
          padding: 5
        }
      },
      _.map(this.props.design, (item, i) => this.renderQuickfilter(item, i)),
      this.props.onHide
        ? R(
            "button",
            { className: "btn btn-sm btn-link", onClick: this.props.onHide },
            R("i", { className: "fa fa-angle-double-up" })
          )
        : undefined
    )
  }
}

interface EnumQuickfilterComponentProps {
  label?: string
  schema: any
  /** true to display multiple values */
  multi?: boolean
  /** Current value of quickfilter (state of filter selected) */
  value?: any
  /** Called when value changes */
  onValueChange?: any
  options: {
    /** id of option */
    id: string
    /** localized name */
    name: LocalizedString
  }[]
}

/** Quickfilter for an enum */
class EnumQuickfilterComponent extends React.Component<EnumQuickfilterComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  handleSingleChange = (val: any) => {
    if (val) {
      return this.props.onValueChange(val)
    } else {
      return this.props.onValueChange(null)
    }
  }

  handleMultiChange = (val: any) => {
    if (val?.length > 0) {
      return this.props.onValueChange(_.pluck(val, "value"))
    } else {
      return this.props.onValueChange(null)
    }
  }

  renderSingleSelect(options: any) {
    return R(ReactSelect, {
      placeholder: "All",
      value: _.findWhere(options, { value: this.props.value }) || null,
      options,
      isClearable: true,
      onChange: (value) => {
        if (this.props.onValueChange) {
          return this.handleSingleChange(value?.value)
        }
      },
      isDisabled: this.props.onValueChange == null,
      styles: {
        // Keep menu above fixed data table headers
        menu: (style) => _.extend({}, style, { zIndex: 2000 })
      }
    })
  }

  renderMultiSelect(options: any) {
    return R(ReactSelect, {
      placeholder: "All",
      value: _.map(this.props.value, (v) => _.find(options, (o) => o.value === v)),
      isClearable: true,
      isMulti: true,
      options,
      onChange: this.props.onValueChange ? this.handleMultiChange : undefined,
      isDisabled: this.props.onValueChange == null,
      styles: {
        // Keep menu above fixed data table headers
        menu: (style) => _.extend({}, style, { zIndex: 2000 })
      }
    })
  }

  render() {
    const options = _.map(this.props.options, (opt) => ({
      value: opt.id,
      label: ExprUtils.localizeString(opt.name, this.context.locale)
    }))

    // Determine width, estimating about 8 px per letter with 120px padding
    let width = _.max(options, (o) => o.label.length)?.label?.length
    width = width ? width * 8 + 120 : 280
    const minWidth = width > 280 || this.props.multi ? "280px" : `${width}px`

    return R(
      "div",
      { style: { display: "inline-block", paddingRight: 10 } },
      this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined,
      R(
        "div",
        { style: { display: "inline-block", minWidth, verticalAlign: "middle" } },
        this.props.multi ? this.renderMultiSelect(options) : this.renderSingleSelect(options)
      ),
      !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined
    )
  }
}

interface TextQuickfilterComponentProps {
  label: string
  schema: any
  /** See QuickfiltersDataSource */
  quickfiltersDataSource: any
  expr: any
  index: number
  /** Current value of quickfilter (state of filter selected) */
  value?: any
  /** Called when value changes */
  onValueChange?: any
  /** true to display multiple values */
  multi?: boolean

  /** Filters to add to restrict quick filter data to */
  filters?: JsonQLFilter[]
}

// Quickfilter for a text value
class TextQuickfilterComponent extends React.Component<TextQuickfilterComponentProps> {
  render() {
    return R(
      "div",
      { style: { display: "inline-block", paddingRight: 10 } },
      this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined,
      R(
        "div",
        { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } },
        R(TextLiteralComponent, {
          value: this.props.value,
          onChange: this.props.onValueChange,
          schema: this.props.schema,
          expr: this.props.expr,
          index: this.props.index,
          multi: this.props.multi,
          quickfiltersDataSource: this.props.quickfiltersDataSource,
          filters: this.props.filters
        })
      ),
      !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined
    )
  }
}

interface DateQuickfilterComponentProps {
  label?: string
  schema: any
  expr: any
  /** Current value of quickfilter (state of filter selected) */
  value?: any
  onValueChange: any
}

// Quickfilter for a date value
class DateQuickfilterComponent extends React.Component<DateQuickfilterComponentProps> {
  render() {
    return R(
      "div",
      { style: { display: "inline-block", paddingRight: 10 } },
      this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined,
      R(
        "div",
        { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } },
        R(DateExprComponent, {
          datetime: new ExprUtils(this.props.schema).getExprType(this.props.expr) === "datetime",
          value: this.props.value,
          onChange: this.props.onValueChange
        })
      ),
      !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined
    )
  }
}

interface TextArrayQuickfilterComponentProps {
  label: string
  schema: any
  /** See QuickfiltersDataSource */
  quickfiltersDataSource: any
  expr: any
  index: number
  /** Current value of quickfilter (state of filter selected) */
  value?: any
  /** Called when value changes */
  onValueChange?: any
  /** true to display multiple values */
  multi?: boolean

  /** Filters to add to restrict quick filter data to */
  filters?: JsonQLFilter[]
}

/** Quickfilter for a text value */
class TextArrayQuickfilterComponent extends React.Component<TextArrayQuickfilterComponentProps> {
  render() {
    return R(
      "div",
      { style: { display: "inline-block", paddingRight: 10 } },
      this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined,
      R(
        "div",
        { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } },
        R(TextLiteralComponent, {
          value: this.props.value,
          onChange: this.props.onValueChange,
          schema: this.props.schema,
          expr: this.props.expr,
          index: this.props.index,
          multi: this.props.multi,
          quickfiltersDataSource: this.props.quickfiltersDataSource,
          filters: this.props.filters
        })
      ),
      !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined
    )
  }
}
