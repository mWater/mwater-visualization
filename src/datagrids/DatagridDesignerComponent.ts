import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { DataSource, ExprUtils, LiteralType, Schema } from "mwater-expressions"
import { ExprValidator } from "mwater-expressions"
import TabbedComponent from "react-library/lib/TabbedComponent"
import { ExprComponent } from "mwater-expressions-ui"
import { FilterExprComponent } from "mwater-expressions-ui"
import OrderBysDesignerComponent from "./OrderBysDesignerComponent"
import ReorderableListComponent from "react-library/lib/reorderable/ReorderableListComponent"
import QuickfiltersDesignComponent from "../quickfilter/QuickfiltersDesignComponent"
import LabeledExprGenerator from "./LabeledExprGenerator"
import TableSelectComponent from "../TableSelectComponent"
import uuid from "uuid"
import update from "update-object"
import * as ui from "react-library/lib/bootstrap"
import { getFormatOptions } from "../valueFormatter"
import { getDefaultFormat } from "../valueFormatter"
import { DatagridDesignColumn } from "./DatagridDesign"
import { DatagridDesign } from ".."

export interface DatagridDesignerComponentProps {
  /** schema to use */
  schema: Schema
  /** dataSource to use */
  dataSource: DataSource
  /** Design of datagrid. See README.md of this folder */
  design: DatagridDesign
  /** Called when design changes */
  onDesignChange: (design: DatagridDesign) => void
}

// Designer for the datagrid. Currenly allows only single-table designs (no subtable rows)
export default class DatagridDesignerComponent extends React.Component<DatagridDesignerComponentProps> {
  static contextTypes = { globalFiltersElementFactory: PropTypes.func }

  handleTableChange = (table: any) => {
    const design = {
      table,
      columns: []
    }

    return this.props.onDesignChange(design)
  }

  handleColumnsChange = (columns: any) => {
    return this.props.onDesignChange(update(this.props.design, { columns: { $set: columns } }))
  }

  handleFilterChange = (filter: any) => {
    return this.props.onDesignChange(update(this.props.design, { filter: { $set: filter } }))
  }

  handleGlobalFiltersChange = (globalFilters: any) => {
    return this.props.onDesignChange(update(this.props.design, { globalFilters: { $set: globalFilters } }))
  }

  handleOrderBysChange = (orderBys: any) => {
    return this.props.onDesignChange(update(this.props.design, { orderBys: { $set: orderBys } }))
  }

  // Render the tabs of the designer
  renderTabs() {
    return R(TabbedComponent, {
      initialTabId: "columns",
      tabs: [
        {
          id: "columns",
          label: T("Columns"),
          elem: R(ColumnsDesignerComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table!,
            columns: this.props.design.columns,
            onColumnsChange: this.handleColumnsChange
          })
        },
        {
          id: "filter",
          label: T("Filter"),
          // Here because of modal scroll issue
          elem: R(
            "div",
            { style: { marginBottom: 200 } },
            R(FilterExprComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.design.table!,
              value: this.props.design.filter,
              onChange: this.handleFilterChange
            }),
            this.context.globalFiltersElementFactory
              ? R(
                  "div",
                  { style: { marginTop: 20 } },
                  this.context.globalFiltersElementFactory({
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    filterableTables: [this.props.design.table],
                    globalFilters: this.props.design.globalFilters,
                    onChange: this.handleGlobalFiltersChange,
                    nullIfIrrelevant: true
                  })
                )
              : undefined
          )
        },
        {
          id: "order",
          label: T("Sorting"),
          elem: R(
            "div",
            { style: { marginBottom: 200 } },
            R(OrderBysDesignerComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.design.table!,
              orderBys: this.props.design.orderBys,
              onChange: this.handleOrderBysChange
            })
          )
        },
        {
          id: "quickfilters",
          label: T("Quickfilters"),
          elem: R(
            "div",
            { style: { marginBottom: 200 } },
            R(QuickfiltersDesignComponent, {
              design: this.props.design.quickfilters,
              onDesignChange: (design: any) =>
                this.props.onDesignChange(update(this.props.design, { quickfilters: { $set: design } })),
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              tables: [this.props.design.table]
            })
          )
        },
        {
          id: "options",
          label: T("Options"),
          elem: R(
            "div",
            { style: { marginBottom: 200 } },
            R(DatagridOptionsComponent, {
              design: this.props.design,
              onDesignChange: this.props.onDesignChange
            })
          )
        }
      ]
    })
  }

  render() {
    return R(
      "div",
      null,
      R("label", null, T("Data Source:")),
      R(TableSelectComponent, {
        schema: this.props.schema,
        value: this.props.design.table,
        onChange: this.handleTableChange
      }),

      this.props.design.table ? this.renderTabs() : undefined
    )
  }
}

interface DatagridOptionsComponentProps {
  /** Datagrid design. See README.md */
  design: any
  onDesignChange: any
}

// Datagrid Options
class DatagridOptionsComponent extends React.Component<DatagridOptionsComponentProps> {
  render() {
    return R(
      ui.FormGroup,
      { label: T("Display Options") },
      R(
        ui.Checkbox,
        {
          value: this.props.design.showRowNumbers,
          onChange: (showRowNumbers) =>
            this.props.onDesignChange(update(this.props.design, { showRowNumbers: { $set: showRowNumbers } }))
        },
        T("Show row numbers")
      )
    )
  }
}
interface ColumnsDesignerComponentProps {
  /** schema to use */
  schema: Schema
  /** dataSource to use */
  dataSource: DataSource
  table: string
  /** Columns list See README.md of this folder */
  columns: any
  onColumnsChange: any
}

// Columns list
class ColumnsDesignerComponent extends React.Component<ColumnsDesignerComponentProps> {
  handleColumnChange = (columnIndex: any, column: any) => {
    const columns = this.props.columns.slice()

    // Handle remove
    if (!column) {
      columns.splice(columnIndex, 1)
    } else if (_.isArray(column)) {
      // Handle array case
      Array.prototype.splice.apply(columns, [columnIndex, 1].concat(column))
    } else {
      columns[columnIndex] = column
    }

    return this.props.onColumnsChange(columns)
  }

  handleAddColumn = () => {
    const columns = this.props.columns.slice()
    columns.push({ id: uuid(), type: "expr", width: 150 })
    return this.props.onColumnsChange(columns)
  }

  handleAddIdColumn = () => {
    const columns = this.props.columns.slice()
    // TODO we should display label when available but without breaking Peter's id downloads. Need format field to indicate raw id.
    columns.push({
      id: uuid(),
      type: "expr",
      width: 150,
      expr: { type: "id", table: this.props.table },
      label: T("Unique Id")
    })
    return this.props.onColumnsChange(columns)
  }

  handleAddDefaultColumns = () => {
    // Create labeled expressions
    const labeledExprs = new LabeledExprGenerator(this.props.schema).generate(this.props.table, {
      headerFormat: "text"
    })

    let columns = []
    for (let labeledExpr of labeledExprs) {
      columns.push({
        id: uuid(),
        width: 150,
        type: "expr",
        label: null, // Use default label instead. # labeledExpr.label
        expr: labeledExpr.expr
      })
    }

    columns = this.props.columns.concat(columns)
    return this.props.onColumnsChange(columns)
  }

  handleRemoveAllColumns = () => {
    return this.props.onColumnsChange([])
  }

  renderColumn = (
    column: DatagridDesignColumn,
    columnIndex: any,
    connectDragSource: any,
    connectDragPreview: any,
    connectDropTarget: any
  ) => {
    return R(ColumnDesignerComponent, {
      key: columnIndex,
      schema: this.props.schema,
      table: this.props.table,
      dataSource: this.props.dataSource,
      column,
      onColumnChange: this.handleColumnChange.bind(null, columnIndex),
      connectDragSource,
      connectDragPreview,
      connectDropTarget
    })
  }

  render() {
    return R(
      "div",
      { style: { height: "auto", overflowY: "auto", overflowX: "hidden" } },
      R(
        "div",
        { style: { textAlign: "right" }, key: "options" },
        R(
          "button",
          {
            key: "addAll",
            type: "button",
            className: "btn btn-link btn-sm",
            onClick: this.handleAddDefaultColumns
          },
          R("span", { className: "fas fa-plus" }),
          " " + T("Add Default Columns")
        ),
        R(
          "button",
          {
            key: "removeAll",
            type: "button",
            className: "btn btn-link btn-sm",
            onClick: this.handleRemoveAllColumns
          },
          R("span", { className: "fas fa-times" }),
          " " + T("Remove All Columns")
        )
      ),

      R(ReorderableListComponent, {
        items: this.props.columns,
        onReorder: this.props.onColumnsChange,
        renderItem: this.renderColumn,
        getItemId: (item: DatagridDesignColumn) => item.id
      }),

      R("div", { className: "p-2" },
        R(
          "button",
          {
            key: "add",
            type: "button",
            className: "btn btn-link",
            onClick: this.handleAddColumn
          },
          R("span", { className: "fas fa-plus" }),
          " " + T("Add Column")
        ),

        R(
          "button",
          {
            key: "add-id",
            type: "button",
            className: "btn btn-link",
            onClick: this.handleAddIdColumn
          },
          R("span", { className: "fas fa-plus" }),
          " " + T("Add Unique Id (advanced)")
        )
      )
    )
  }
}
interface ColumnDesignerComponentProps {
  /** schema to use */
  schema: Schema
  /** dataSource to use */
  dataSource: DataSource

  table: string

  /** Column See README.md of this folder */
  column: DatagridDesignColumn
  /** Called when column changes. Null to remove. Array to replace with multiple entries */
  onColumnChange: (column: DatagridDesignColumn | null | DatagridDesignColumn[]) => void
  /** Connect drag source (handle) here */
  connectDragSource: any
  /** Connect drag preview here */
  connectDragPreview: any
  connectDropTarget: any
}

// Column item
class ColumnDesignerComponent extends React.Component<ColumnDesignerComponentProps> {
  handleExprChange = (expr: any) => {
    return this.props.onColumnChange(update(this.props.column, { expr: { $set: expr } }))
  }

  handleLabelChange = (label: any) => {
    return this.props.onColumnChange(update(this.props.column, { label: { $set: label } }))
  }

  handleFormatChange = (ev: any) => {
    return this.props.onColumnChange(update(this.props.column, { format: { $set: ev.target.value } }))
  }

  handleSplitEnumset = () => {
    const exprUtils = new ExprUtils(this.props.schema)

    return this.props.onColumnChange(
      _.map(exprUtils.getExprEnumValues(this.props.column.expr)!, (enumVal) => {
        return {
          id: uuid(),
          type: "expr",
          width: 150,
          expr: {
            type: "op",
            op: "contains",
            table: this.props.table,
            exprs: [this.props.column.expr, { type: "literal", valueType: "enumset", value: [enumVal.id] }]
          }
        }
      })
    )
  }

  handleSplitGeometry = () => {
    return this.props.onColumnChange([
      {
        id: uuid(),
        type: "expr",
        width: 150,
        expr: {
          type: "op",
          op: "latitude",
          table: this.props.table,
          exprs: [this.props.column.expr]
        }
      },
      {
        id: uuid(),
        type: "expr",
        width: 150,
        expr: {
          type: "op",
          op: "longitude",
          table: this.props.table,
          exprs: [this.props.column.expr]
        }
      }
    ])
  }

  // Render options to split a column, such as an enumset to booleans or geometry to lat/lng
  renderSplit() {
    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(this.props.column.expr)

    switch (exprType) {
      case "enumset":
        return R(
          "a",
          { className: "btn btn-sm btn-link", onClick: this.handleSplitEnumset },
          R("i", { className: "fa fa-chain-broken" }),
          " " + T("Split by options")
        )
        break
      case "geometry":
        return R(
          "a",
          { className: "btn btn-sm btn-link", onClick: this.handleSplitGeometry },
          R("i", { className: "fa fa-chain-broken" }),
          " " + T("Split by lat/lng")
        )
        break
    }

    return null
  }

  renderFormat() {
    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(this.props.column.expr)
    if (!exprType) {
      return null
    }

    const formats = getFormatOptions(exprType)
    if (!formats) {
      return null
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, T("Format")),
      ": ",
      R(
        "select",
        {
          value: this.props.column.format != null ? this.props.column.format : getDefaultFormat(exprType),
          className: "form-select",
          style: { width: "auto", display: "inline-block" },
          onChange: this.handleFormatChange
        },
        _.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))
      )
    )
  }

  render = () => {
    const exprUtils = new ExprUtils(this.props.schema)
    const exprValidator = new ExprValidator(this.props.schema)

    // Get type of current expression
    const type = exprUtils.getExprType(this.props.column.expr)

    // Determine allowed types
    const allowedTypes: LiteralType[] = [
      "text",
      "number",
      "enum",
      "enumset",
      "boolean",
      "date",
      "datetime",
      "image",
      "imagelist",
      "text[]",
      "geometry"
    ]

    // If type id, allow id (e.g. don't allow to be added directly, but keep if present)
    if (type === "id") {
      allowedTypes.push("id")
    }

    const error = exprValidator.validateExpr(this.props.column.expr, {
      aggrStatuses: ["individual", "literal", "aggregate"]
    })

    const elem = R(
      "div",
      { className: "row" },
      R("div", { className: "col-1" }, this.props.connectDragSource(R("span", { className: "text-muted fa fa-bars" }))),

      R(
        "div",
        { className: "col-6" }, // style: { border: "solid 1px #DDD", padding: 4 },
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          value: this.props.column.expr,
          aggrStatuses: ["literal", "individual", "aggregate"],
          types: allowedTypes,
          onChange: this.handleExprChange
        }),
        this.renderSplit(),
        this.renderFormat(),
        error ? R("i", { className: "fa fa-exclamation-circle text-danger" }) : undefined
      ),

      R(
        "div",
        { className: "col-4" },
        R("input", {
          type: "text",
          className: "form-control",
          placeholder: exprUtils.summarizeExpr(this.props.column.expr),
          value: this.props.column.label,
          onChange: (ev: any) => this.handleLabelChange(ev.target.value)
        })
      ),

      R(
        "div",
        { className: "col-1" },
        R(
          "a",
          { className: "link-plain", onClick: this.props.onColumnChange.bind(null, null) },
          R("span", { className: "fas fa-times" })
        )
      )
    )

    return this.props.connectDropTarget(this.props.connectDragPreview(elem))
  }
}
