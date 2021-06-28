// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let TableChartDesignerComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import uuid from "uuid"
import { ExprUtils } from "mwater-expressions"
import AxisBuilder from "../../../axes/AxisBuilder"
import { LinkComponent } from "mwater-expressions-ui"
import { ExprComponent } from "mwater-expressions-ui"
import { FilterExprComponent } from "mwater-expressions-ui"
import OrderingsComponent from "./OrderingsComponent"
import TableSelectComponent from "../../../TableSelectComponent"
import ReorderableListComponent from "react-library/lib/reorderable/ReorderableListComponent"
import ui from "react-library/lib/bootstrap"
import { getFormatOptions } from "../../../valueFormatter"
import { getDefaultFormat } from "../../../valueFormatter"

export default TableChartDesignerComponent = (function () {
  TableChartDesignerComponent = class TableChartDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired,
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired,
        onDesignChange: PropTypes.func.isRequired
      }
    }

    // Updates design with the specified changes
    updateDesign(changes) {
      const design = _.extend({}, this.props.design, changes)
      return this.props.onDesignChange(design)
    }

    handleTitleTextChange = (ev) => {
      return this.updateDesign({ titleText: ev.target.value })
    }
    handleTableChange = (table) => {
      return this.updateDesign({ table })
    }
    handleFilterChange = (filter) => {
      return this.updateDesign({ filter })
    }
    handleOrderingsChange = (orderings) => {
      return this.updateDesign({ orderings })
    }
    handleLimitChange = (limit) => {
      return this.updateDesign({ limit })
    }

    handleColumnChange = (index, column) => {
      const columns = this.props.design.columns.slice()
      columns[index] = column
      return this.updateDesign({ columns })
    }

    handleRemoveColumn = (index) => {
      const columns = this.props.design.columns.slice()
      columns.splice(index, 1)
      return this.updateDesign({ columns })
    }

    handleAddColumn = () => {
      const columns = this.props.design.columns.slice()
      columns.push({ id: uuid() })
      return this.updateDesign({ columns })
    }

    renderTable() {
      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"),
        ": ",
        R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.props.design.table,
          onChange: this.handleTableChange,
          filter: this.props.design.filter,
          onFilterChange: this.handleFilterChange
        })
      )
    }

    renderTitle() {
      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, "Title"),
        R("input", {
          type: "text",
          className: "form-control input-sm",
          value: this.props.design.titleText,
          onChange: this.handleTitleTextChange,
          placeholder: "Untitled"
        })
      )
    }

    renderColumn = (column, index, connectDragSource, connectDragPreview, connectDropTarget) => {
      const style = {
        borderTop: "solid 1px #EEE",
        paddingTop: 10,
        paddingBottom: 10
      }

      return connectDragPreview(
        connectDropTarget(
          R(
            "div",
            { key: index, style },
            React.createElement(TableChartColumnDesignerComponent, {
              design: this.props.design,
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              index,
              onChange: this.handleColumnChange.bind(null, index),
              onRemove: this.handleRemoveColumn.bind(null, index),
              connectDragSource
            })
          )
        )
      )
    }

    handleReorder = (map) => {
      return this.updateDesign({ columns: map })
    }

    renderColumns() {
      if (!this.props.design.table) {
        return
      }

      return R(
        "div",
        null,
        R(ReorderableListComponent, {
          items: this.props.design.columns,
          onReorder: this.handleReorder,
          renderItem: this.renderColumn,
          getItemId: (item) => item.id
        }),
        R(
          "button",
          { className: "btn btn-default btn-sm", type: "button", onClick: this.handleAddColumn },
          R("span", { className: "glyphicon glyphicon-plus" }),
          " Add Column"
        )
      )
    }
    // return R 'div', className: "form-group",
    //   _.map(@props.design.columns, (column, i) => @renderColumn(i))
    //

    renderOrderings() {
      // If no table, hide
      if (!this.props.design.table) {
        return null
      }

      return R(
        "div",
        { className: "form-group" },
        R(
          "label",
          { className: "text-muted" },
          R("span", { className: "glyphicon glyphicon-sort-by-attributes" }),
          " ",
          "Ordering"
        ),
        R(
          "div",
          { style: { marginLeft: 8 } },
          React.createElement(OrderingsComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            orderings: this.props.design.orderings,
            onOrderingsChange: this.handleOrderingsChange,
            table: this.props.design.table
          })
        )
      )
    }

    renderFilter() {
      // If no table, hide
      if (!this.props.design.table) {
        return null
      }

      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon-filter" }), " ", "Filters"),
        R(
          "div",
          { style: { marginLeft: 8 } },
          React.createElement(FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
          })
        )
      )
    }

    renderLimit() {
      // If no table, hide
      if (!this.props.design.table) {
        return null
      }

      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, "Maximum Number of Rows (up to 1000)"),
        R(
          "div",
          { style: { marginLeft: 8 } },
          R(ui.NumberInput, {
            value: this.props.design.limit,
            onChange: this.handleLimitChange,
            decimal: false,
            placeholder: "1000"
          })
        )
      )
    }

    render() {
      return R(
        "div",
        null,
        this.renderTable(),
        this.renderColumns(),
        this.props.design.table ? R("hr") : undefined,
        this.renderOrderings(),
        this.renderFilter(),
        this.renderLimit(),
        R("hr"),
        this.renderTitle()
      )
    }
  }
  TableChartDesignerComponent.initClass()
  return TableChartDesignerComponent
})()

class TableChartColumnDesignerComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      design: PropTypes.object.isRequired,
      schema: PropTypes.object.isRequired,
      dataSource: PropTypes.object.isRequired,
      index: PropTypes.number.isRequired,
      onChange: PropTypes.func.isRequired,
      onRemove: PropTypes.func.isRequired
    }

    this.contextTypes = { locale: PropTypes.string }
    // e.g. "en"
  }

  // Updates column with the specified changes
  updateColumn(changes) {
    const column = _.extend({}, this.props.design.columns[this.props.index], changes)
    return this.props.onChange(column)
  }

  updateTextAxis(changes) {
    const textAxis = _.extend({}, this.props.design.columns[this.props.index].textAxis, changes)
    return this.updateColumn({ textAxis })
  }

  handleExprChange = (expr) => {
    return this.updateTextAxis({ expr })
  }
  handleHeaderTextChange = (ev) => {
    return this.updateColumn({ headerText: ev.target.value })
  }
  handleAggrChange = (aggr) => {
    return this.updateTextAxis({ aggr })
  }
  handleFormatChange = (ev) => {
    return this.updateColumn({ format: ev.target.value })
  }

  renderRemove() {
    if (this.props.design.columns.length > 1) {
      return R(
        "button",
        { className: "btn btn-xs btn-link pull-right", type: "button", onClick: this.props.onRemove },
        R("span", { className: "glyphicon glyphicon-remove" })
      )
    }
  }

  renderExpr() {
    const column = this.props.design.columns[this.props.index]

    const title = "Value"

    return R(
      "div",
      null,
      R("label", { className: "text-muted" }, title),
      ": ",
      React.createElement(ExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.design.table,
        value: column.textAxis ? column.textAxis.expr : undefined,
        onChange: this.handleExprChange,
        aggrStatuses: ["literal", "individual", "aggregate"]
      })
    )
  }

  renderFormat() {
    const column = this.props.design.columns[this.props.index]

    // Get type
    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(column.textAxis?.expr)

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
          value: column.format != null ? column.format : getDefaultFormat(exprType),
          className: "form-control",
          style: { width: "auto", display: "inline-block" },
          onChange: this.handleFormatChange
        },
        _.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))
      )
    )
  }

  renderHeader() {
    const column = this.props.design.columns[this.props.index]

    const axisBuilder = new AxisBuilder({ schema: this.props.schema })
    const placeholder = axisBuilder.summarizeAxis(column.textAxis, this.context.locale)

    return R(
      "div",
      null,
      R("label", { className: "text-muted" }, "Header"),
      ": ",
      R("input", {
        type: "text",
        className: "form-control input-sm",
        style: { display: "inline-block", width: "15em" },
        value: column.headerText,
        onChange: this.handleHeaderTextChange,
        placeholder
      })
    )
  }

  render() {
    const iconStyle = {
      cursor: "move",
      marginRight: 8,
      opacity: 0.5,
      fontSize: 12,
      height: 20
    }
    return R(
      "div",
      null,
      this.props.connectDragSource(R("i", { className: "fa fa-bars", style: iconStyle })),
      this.renderRemove(),
      R("label", null, `Column ${this.props.index + 1}`),
      R("div", { style: { marginLeft: 5 } }, this.renderExpr(), this.renderFormat(), this.renderHeader())
    )
  }
}
TableChartColumnDesignerComponent.initClass()
