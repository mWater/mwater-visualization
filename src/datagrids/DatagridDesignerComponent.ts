// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let DatagridDesignerComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"
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
import ui from "react-library/lib/bootstrap"
import { getFormatOptions } from "../valueFormatter"
import { getDefaultFormat } from "../valueFormatter"

// Designer for the datagrid. Currenly allows only single-table designs (no subtable rows)
export default DatagridDesignerComponent = (function () {
  DatagridDesignerComponent = class DatagridDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // schema to use
        dataSource: PropTypes.object.isRequired, // dataSource to use
        design: PropTypes.object.isRequired, // Design of datagrid. See README.md of this folder
        onDesignChange: PropTypes.func.isRequired // Called when design changes
      }

      this.contextTypes = { globalFiltersElementFactory: PropTypes.func }
      // Call with props { schema, dataSource, globalFilters, filterableTables, onChange, nullIfIrrelevant }. Displays a component to edit global filters
    }

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
            label: "Columns",
            elem: R(ColumnsDesignerComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.props.design.table,
              columns: this.props.design.columns,
              onColumnsChange: this.handleColumnsChange
            })
          },
          {
            id: "filter",
            label: "Filter",
            // Here because of modal scroll issue
            elem: R(
              "div",
              { style: { marginBottom: 200 } },
              R(FilterExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.design.table,
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
            label: "Sorting",
            elem: R(
              "div",
              { style: { marginBottom: 200 } },
              R(OrderBysDesignerComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.design.table,
                orderBys: this.props.design.orderBys,
                onChange: this.handleOrderBysChange
              })
            )
          },
          {
            id: "quickfilters",
            label: "Quickfilters",
            elem: R(
              "div",
              { style: { marginBottom: 200 } },
              R(QuickfiltersDesignComponent, {
                design: this.props.design.quickfilters,
                onDesignChange: (design: any) => this.props.onDesignChange(update(this.props.design, { quickfilters: { $set: design } })),
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                tables: [this.props.design.table]
              })
            )
          },
          {
            id: "options",
            label: "Options",
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
      });
    }

    render() {
      return R(
        "div",
        null,
        R("label", null, "Data Source:"),
        R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.props.design.table,
          onChange: this.handleTableChange
        }),

        this.props.design.table ? this.renderTabs() : undefined
      )
    }
  }
  DatagridDesignerComponent.initClass()
  return DatagridDesignerComponent
})()

// Datagrid Options
class DatagridOptionsComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      design: PropTypes.object.isRequired, // Datagrid design. See README.md
      onDesignChange: PropTypes.func.isRequired
    }
    // Called when design changes
  }

  render() {
    return R(
      ui.FormGroup,
      { label: "Display Options" },
      R(
        ui.Checkbox,
        {
          value: this.props.design.showRowNumbers,
          onChange: (showRowNumbers) =>
            this.props.onDesignChange(update(this.props.design, { showRowNumbers: { $set: showRowNumbers } }))
        },
        "Show row numbers"
      )
    )
  }
}
DatagridOptionsComponent.initClass()

// Columns list
class ColumnsDesignerComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      schema: PropTypes.object.isRequired, // schema to use
      dataSource: PropTypes.object.isRequired, // dataSource to use
      table: PropTypes.string.isRequired,
      columns: PropTypes.array.isRequired, // Columns list See README.md of this folder
      onColumnsChange: PropTypes.func.isRequired
    }
    // Called when columns changes
  }

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
      label: "Unique Id"
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

  renderColumn = (column: any, columnIndex: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => {
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
            className: "btn btn-link btn-xs",
            onClick: this.handleAddDefaultColumns
          },
          R("span", { className: "glyphicon glyphicon-plus" }),
          " Add Default Columns"
        ),
        R(
          "button",
          {
            key: "removeAll",
            type: "button",
            className: "btn btn-link btn-xs",
            onClick: this.handleRemoveAllColumns
          },
          R("span", { className: "glyphicon glyphicon-remove" }),
          " Remove All Columns"
        )
      ),

      R(ReorderableListComponent, {
        items: this.props.columns,
        onReorder: this.props.onColumnsChange,
        renderItem: this.renderColumn,
        getItemId: (item) => item.id
      }),

      R(
        "button",
        {
          key: "add",
          type: "button",
          className: "btn btn-link",
          onClick: this.handleAddColumn
        },
        R("span", { className: "glyphicon glyphicon-plus" }),
        " Add Column"
      ),

      R(
        "button",
        {
          key: "add-id",
          type: "button",
          className: "btn btn-link",
          onClick: this.handleAddIdColumn
        },
        R("span", { className: "glyphicon glyphicon-plus" }),
        " Add Unique Id (advanced)"
      )
    )
  }
}
ColumnsDesignerComponent.initClass()

// Column item
class ColumnDesignerComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      schema: PropTypes.object.isRequired, // schema to use
      dataSource: PropTypes.object.isRequired, // dataSource to use
      table: PropTypes.string.isRequired,
      column: PropTypes.object.isRequired, // Column See README.md of this folder
      onColumnChange: PropTypes.func.isRequired, // Called when column changes. Null to remove. Array to replace with multiple entries
      connectDragSource: PropTypes.func.isRequired, // Connect drag source (handle) here
      connectDragPreview: PropTypes.func.isRequired, // Connect drag preview here
      connectDropTarget: PropTypes.func.isRequired
    }
    // Connect drop target
  }

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
      _.map(exprUtils.getExprEnumValues(this.props.column.expr), (enumVal) => {
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
          { className: "btn btn-xs btn-link", onClick: this.handleSplitEnumset },
          R("i", { className: "fa fa-chain-broken" }),
          " Split by options"
        )
        break
      case "geometry":
        return R(
          "a",
          { className: "btn btn-xs btn-link", onClick: this.handleSplitGeometry },
          R("i", { className: "fa fa-chain-broken" }),
          " Split by lat/lng"
        )
        break
    }

    return null
  }

  renderFormat() {
    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(this.props.column.expr)

    const formats = getFormatOptions(exprType)
    if (!formats) {
      return null
    }

    return R(
      "div",
      { className: "form-group" },
      R("label", { className: "text-muted" }, "Format"),
      ": ",
      R(
        "select",
        {
          value: this.props.column.format != null ? this.props.column.format : getDefaultFormat(exprType),
          className: "form-control",
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
    const allowedTypes = [
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
      R(
        "div",
        { className: "col-xs-1" },
        this.props.connectDragSource(R("span", { className: "text-muted fa fa-bars" }))
      ),

      R(
        "div",
        { className: "col-xs-6" }, // style: { border: "solid 1px #DDD", padding: 4 },
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
        { className: "col-xs-4" },
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
        { className: "col-xs-1" },
        R(
          "a",
          { onClick: this.props.onColumnChange.bind(null, null) },
          R("span", { className: "glyphicon glyphicon-remove" })
        )
      )
    )

    return this.props.connectDropTarget(this.props.connectDragPreview(elem))
  }
}
ColumnDesignerComponent.initClass()
