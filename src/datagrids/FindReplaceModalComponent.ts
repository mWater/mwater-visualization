import _ from "lodash"
import React from "react"
const R = React.createElement
import { default as ReactSelect } from "react-select"
import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import DatagridViewComponent, { RowUpdate } from "./DatagridViewComponent"
import DirectDatagridDataSource from "./DirectDatagridDataSource"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { ExprComponent } from "mwater-expressions-ui"
import { DataSource, Expr, ExprCleaner, ExprUtils, Schema } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"
import { DatagridDesign, JsonQLFilter } from ".."
import { JsonQLSelectQuery } from "jsonql"
import produce from "immer"

export interface FindReplaceModalComponentProps {
  schema: Schema
  dataSource: DataSource

  design: DatagridDesign

  filters?: JsonQLFilter[]

  /** Update cell values by updating set of expressions and values */
  updateExprValues: (tableId: string, rowUpdates: RowUpdate[]) => Promise<void>
 
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

  /** True when working */
  busy: boolean
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
      busy: false
    }
  }

  show() {
    return this.setState({ open: true, busy: false })
  }

  async performReplace() {
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

    this.setState({ busy: true })
    try {
      const rows = await this.props.dataSource.performQuery(query)

      // Confirm
      if (!confirm(T("Replace {0} values? This cannot be undone.", rows.length))) {
        return
      }

      // Perform updates
      await this.props.updateExprValues(this.props.design.table!, rows.map(row => ({
        primaryKey: row.id,
        expr: replaceExpr,
        value: row.withValue
      })))
      
      alert(T("Successfully replaced {0} values", rows.length))
      this.setState({ open: false })
      this.props.onUpdate()
    } catch(error) {
      alert(`Error: ${error.message}`)
    } finally {
      this.setState({ busy: false })
    }
  }

  renderPreview() {
    const exprUtils = new ExprUtils(this.props.schema)

    // Replace "replace" column with fake case statement to simulate change
    const design = produce(this.props.design, draft => {
      const replaceColumn = draft.columns.find(column => column.id == this.state.replaceColumn)
      if (replaceColumn) {
        replaceColumn.expr = {
          type: "case",
          table: this.props.design.table!,
          cases: [
            {
              when: this.state.conditionExpr || { type: "literal", valueType: "boolean", value: true },
              then: this.state.withExpr
            }
          ],
          // Unchanged
          else: replaceColumn.expr
        }

        replaceColumn.label = replaceColumn.label || exprUtils.summarizeExpr(replaceColumn.expr, this.props.design.locale)
      }

      // Add filter
      if (this.state.conditionExpr) {
        if (draft.filter) {
          draft.filter = {
            type: "op",
            op: "and",
            table: this.props.design.table!,
            exprs: [
              draft.filter,
              this.state.conditionExpr
            ]
          }
        }
        else {
          draft.filter = this.state.conditionExpr
        }
      }
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
    if (this.state.busy) {
      return R(
        "div",
        null,
        R("h3", null, T("Working...")),
        R(
          "div",
          { className: "progress" },
          R("div", { className: "progress-bar progress-bar-striped progress-bar-animated", style: { width: `100%` } })
        )
      )
    }

    return R(
      "div",
      null,
      R(
        "div",
        { key: "replace", className: "mb-3" },
        R("label", null, T("Column with data to replace") + ": "),
        R(ReactSelect, {
          options: replaceColumnOptions,
          value: _.findWhere(replaceColumnOptions, { value: this.state.replaceColumn }) || null,
          onChange: (opt: any) => this.setState({ replaceColumn: opt.value }),
          placeholder: T("Select Column..."),
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
            R("label", null, T("Value to replace data with") + ": "),
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
              placeholder: T("(Blank)"),
              refExpr: replaceExpr
            })
          )
        }
        return null
      })(),

      R(
        "div",
        { key: "condition", className: "mb-3" },
        R("label", null, T("Only in rows that (optional)") + ":"),
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table!,
          value: this.state.conditionExpr,
          onChange: (value) => this.setState({ conditionExpr: value }),
          types: ["boolean"],
          placeholder: T("All Rows")
        })
      ),

      R("div", { key: "preview" }, R("h4", null, T("Preview")), this.renderPreview())
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
        header: T("Find/Replace"),
        footer: [
          R(
            "button",
            {
              key: "cancel",
              type: "button",
              onClick: () => this.setState({ open: false }),
              className: "btn btn-secondary"
            },
            T("Cancel")
          ),
          R(
            "button",
            {
              key: "apply",
              type: "button",
              disabled: !this.state.replaceColumn || this.state.busy,
              onClick: () => this.performReplace(),
              className: "btn btn-primary"
            },
            T("Apply")
          )
        ]
      },
      this.renderContents()
    )
  }
}
