import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import async from "async"
import { default as ReactSelect } from "react-select"
import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import DatagridViewComponent from "./DatagridViewComponent"
import DirectDatagridDataSource from "./DirectDatagridDataSource"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { ExprComponent } from "mwater-expressions-ui"
import { DataSource, Expr, ExprCleaner, ExprUtils, Schema } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"
import { DatagridDesign, JsonQLFilter } from ".."
import { expr } from "jquery"
import { JsonQLQuery, JsonQLSelectQuery } from "jsonql"

export interface FindReplaceModalComponentProps {
  schema: Schema
  dataSource: DataSource

  design: DatagridDesign

  filters?: JsonQLFilter[]

  // Check if expression of table row is editable
  // If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
  canEditValue?: (tableId: string, rowId: any, expr: Expr, callback: (error: any, canEdit?: boolean) => void) => void

  // Update table row expression with a new value
  // Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
  updateValue?: (tableId: string, rowId: any, expr: Expr, value: any, callback: (error: any) => void) => void

  onUpdate: () => void
}

interface FindReplaceModalComponentState {
  /** True if modal is open */
  open: boolean
  /** Column id to replace */
  replaceColumn: string | null
  /** Replace with expression */
  withExpr: Expr
  /** Condition expr */
  conditionExpr: Expr
  /** 0-100 when working */
  progress: null | number
}

// Modal to perform find/replace on datagrid
export default class FindReplaceModalComponent extends React.Component<
  FindReplaceModalComponentProps,
  FindReplaceModalComponentState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      open: false, // True if modal is open
      replaceColumn: null, // Column id to replace
      withExpr: null, // Replace with expression
      conditionExpr: null, // Condition expr
      progress: null // 0-100 when working
    }
  }

  show() {
    return this.setState({ open: true, progress: null })
  }

  performReplace() {
    const exprUtils = new ExprUtils(this.props.schema)
    const exprCompiler = new ExprCompiler(this.props.schema)
    const exprCleaner = new ExprCleaner(this.props.schema)

    const design = this.props.design

    // Get expr of replace column
    const replaceExpr = _.findWhere(this.props.design.columns, { id: this.state.replaceColumn })!.expr

    // Get ids and with value, filtered by filters, design.filter and conditionExpr (if present)
    const query: JsonQLSelectQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "main",
            column: this.props.schema.getTable(this.props.design.table!)!.primaryKey
          },
          alias: "id"
        },
        {
          type: "select",
          expr: exprCompiler.compileExpr({ expr: this.state.withExpr, tableAlias: "main" }),
          alias: "withValue"
        }
      ],
      from: { type: "table", table: this.props.design.table!, alias: "main" }
    }

    // Filter by filter
    const wheres = []
    if (this.props.design.filter) {
      wheres.push(exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "main" }))
    }

    // Filter by conditionExpr
    if (this.state.conditionExpr) {
      wheres.push(exprCompiler.compileExpr({ expr: this.state.conditionExpr, tableAlias: "main" }))
    }

    // Add global filters
    for (let filter of design.globalFilters || []) {
      // Check if exists and is correct type
      const column = this.props.schema.getColumn(design.table!, filter.columnId)
      if (!column) {
        continue
      }

      const columnExpr: Expr = { type: "field", table: design.table!, column: column.id }
      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue
      }

      // Create expr
      let expr: Expr = { type: "op", op: filter.op, table: design.table!, exprs: [columnExpr as Expr].concat(filter.exprs) }

      // Clean expr
      expr = exprCleaner.cleanExpr(expr, { table: design.table! })

      wheres.push(exprCompiler.compileExpr({ expr, tableAlias: "main" }))
    }

    // Add extra filters
    for (let extraFilter of this.props.filters || []) {
      if (extraFilter.table === this.props.design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))
      }
    }

    query.where = { type: "op", op: "and", exprs: _.compact(wheres) }

    this.setState({ progress: 0 })
    // Number completed (twice for each row, once to check can edit and other to perform)
    let completed = 0
    return this.props.dataSource.performQuery(query, (error, rows) => {
      if (error) {
        this.setState({ progress: null })
        alert(`Error: ${error.message}`)
        return
      }

      // Check canEditValue on each one
      return async.mapLimit(
        rows,
        10,
        (row, cb) => {
          // Abort if closed
          if (!this.state.open) {
            return
          }

          // Prevent stack overflow
          _.defer(() => {
            // First half
            completed += 1
            this.setState({ progress: (completed * 50) / rows.length })

            this.props.canEditValue!(this.props.design.table!, row.id, replaceExpr, cb)
          })
        },
        (error, canEdits?: boolean[]) => {
          if (error) {
            this.setState({ progress: null })
            alert(`Error: ${error.message}`)
            return
          }

          if (!_.all(canEdits!)) {
            this.setState({ progress: null })
            alert("You do not have permission to replace all values")
            return
          }

          // Confirm
          if (!confirm(`Replace ${canEdits!.length} values? This cannot be undone.`)) {
            this.setState({ progress: null })
            return
          }

          // Perform updateValue on each one
          // Do one at a time to prevent conflicts. TODO should do all at once in a transaction.
          return async.eachLimit(
            rows,
            1,
            (row, cb) => {
              // Abort if closed
              if (!this.state.open) {
                return
              }

              // Prevent stack overflow
              _.defer(() => {
                // First half
                completed += 1
                this.setState({ progress: (completed * 50) / rows.length })

                this.props.updateValue!(this.props.design.table!, row.id, replaceExpr, row.withValue, cb)
              })
            },
            (error) => {
              if (error) {
                this.setState({ progress: null })
                alert(`Error: ${error.message}`)
                return
              }

              alert("Success")
              this.setState({ progress: null, open: false })
              return this.props.onUpdate?.()
            }
          )
        }
      )
    })
  }

  renderPreview() {
    const exprUtils = new ExprUtils(this.props.schema)

    // Replace "replace" column with fake case statement to simulate change
    const design = _.clone(this.props.design)
    design.columns = _.map(design.columns, (column) => {
      // Unchanged if not replace column
      if (column.id !== this.state.replaceColumn) {
        return column
      }

      const expr = {
        type: "case",
        table: this.props.design.table,
        cases: [
          {
            when: this.state.conditionExpr || { type: "literal", valueType: "boolean", value: true },
            then: this.state.withExpr
          }
        ],
        // Unchanged
        else: column.expr
      }

      // Specify label to prevent strange titles
      return _.extend({}, column, {
        expr,
        label: column.label || exprUtils.summarizeExpr(column.expr, this.props.design.locale)
      })
    })

    return R(AutoSizeComponent, { injectWidth: true } as any, (size: any) => {
      return R(DatagridViewComponent, {
        width: size.width,
        height: 400,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        datagridDataSource: new DirectDatagridDataSource({
          schema: this.props.schema,
          dataSource: this.props.dataSource
        }),
        design,
        filters: this.props.filters
      })
    })
  }

  renderContents() {
    let value
    const exprUtils = new ExprUtils(this.props.schema)

    // Determine which columns are replace-able. Excludes subtables and aggregates
    const replaceColumns = _.filter(
      this.props.design.columns,
      (column) => !column.subtable && exprUtils.getExprAggrStatus(column.expr) === "individual"
    )
    const replaceColumnOptions = _.map(replaceColumns, (column) => ({
      value: column.id,
      label: column.label || exprUtils.summarizeExpr(column.expr, this.props.design.locale)
    }))

    // Show progress
    if (this.state.progress != null) {
      return R(
        "div",
        null,
        R("h3", null, "Working..."),
        R(
          "div",
          { className: "progress" },
          R("div", { className: "progress-bar", style: { width: `${this.state.progress}%` } })
        )
      )
    }

    return R(
      "div",
      null,
      R(
        "div",
        { key: "replace", className: "mb-3" },
        R("label", null, "Column with data to replace: "),
        R(ReactSelect, {
          options: replaceColumnOptions,
          value: _.findWhere(replaceColumnOptions, { value: this.state.replaceColumn }) || null,
          onChange: (opt: any) => this.setState({ replaceColumn: opt.value }),
          placeholder: "Select Column...",
          styles: {
            // Keep menu above fixed data table headers
            menu: (style) => _.extend({}, style, { zIndex: 2 })
          }
        })
      ),

      (() => {
        if (this.state.replaceColumn) {
          // Get expr of replace column
          const replaceExpr = _.findWhere(this.props.design.columns, { id: this.state.replaceColumn })!.expr

          return R(
            "div",
            { key: "with", className: "mb-3" },
            R("label", null, "Value to replace data with: "),
            R(ExprComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.design.table!,
              value: this.state.withExpr,
              onChange: (value) => this.setState({ withExpr: value }),
              types: [exprUtils.getExprType(replaceExpr)!],
              enumValues: exprUtils.getExprEnumValues(replaceExpr) || undefined,
              idTable: exprUtils.getExprIdTable(replaceExpr) || undefined,
              preferLiteral: true,
              placeholder: "(Blank)"
            })
          )
        }
        return null
      })(),

      R(
        "div",
        { key: "condition", className: "mb-3" },
        R("label", null, "Only in rows that (optional):"),
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table!,
          value: this.state.conditionExpr,
          onChange: (value) => this.setState({ conditionExpr: value }),
          types: ["boolean"],
          placeholder: "All Rows"
        })
      ),

      R("div", { key: "preview" }, R("h4", null, "Preview"), this.renderPreview())
    )
  }

  render() {
    if (!this.state.open) {
      return null
    }

    return R(
      ModalPopupComponent,
      {
        size: "large",
        header: "Find/Replace",
        footer: [
          R(
            "button",
            {
              key: "cancel",
              type: "button",
              onClick: () => this.setState({ open: false }),
              className: "btn btn-secondary"
            },
            "Cancel"
          ),
          R(
            "button",
            {
              key: "apply",
              type: "button",
              disabled: !this.state.replaceColumn || this.state.progress != null,
              onClick: () => this.performReplace(),
              className: "btn btn-primary"
            },
            "Apply"
          )
        ]
      },
      this.renderContents()
    )
  }
}
