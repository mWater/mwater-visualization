import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"
import { ExprComponent } from "mwater-expressions-ui"
import TableSelectComponent from "../../TableSelectComponent"
import { getFormatOptions } from "../../valueFormatter"
import { getDefaultFormat } from "../../valueFormatter"

interface ExprItemEditorComponentProps {
  /** Schema to use */
  schema: any
  /** Data source to use to get values */
  dataSource: any
  /** Expression item to edit */
  exprItem: any
  /** Called with expr item */
  onChange: any
  singleRowTable?: string
}

interface ExprItemEditorComponentState {
  table: any
}

// Expression editor that allows changing an expression item
export default class ExprItemEditorComponent extends React.Component<
  ExprItemEditorComponentProps,
  ExprItemEditorComponentState
> {
  constructor(props: any) {
    super(props)

    // Keep table in state as it can be set before the expression
    this.state = {
      table: props.exprItem.expr?.table || props.singleRowTable
    }
  }

  handleTableChange = (table: any) => {
    return this.setState({ table })
  }

  handleExprChange = (expr: any) => {
    const exprItem = _.extend({}, this.props.exprItem, { expr })
    return this.props.onChange(exprItem)
  }

  handleIncludeLabelChange = (ev: any) => {
    const exprItem = _.extend({}, this.props.exprItem, {
      includeLabel: ev.target.checked,
      labelText: ev.target.checked ? this.props.exprItem.labelText : undefined
    })
    return this.props.onChange(exprItem)
  }

  handleLabelTextChange = (ev: any) => {
    const exprItem = _.extend({}, this.props.exprItem, { labelText: ev.target.value || null })
    return this.props.onChange(exprItem)
  }

  handleFormatChange = (ev: any) => {
    const exprItem = _.extend({}, this.props.exprItem, { format: ev.target.value || null })
    return this.props.onChange(exprItem)
  }

  renderFormat() {
    const exprUtils = new ExprUtils(this.props.schema)
    const exprType = exprUtils.getExprType(this.props.exprItem.expr)

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
          value: this.props.exprItem.format != null ? this.props.exprItem.format : getDefaultFormat(exprType),
          className: "form-control",
          style: { width: "auto", display: "inline-block" },
          onChange: this.handleFormatChange
        },
        _.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))
      )
    )
  }

  render() {
    return R(
      "div",
      { style: { paddingBottom: 200 } },
      R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"),
        ": ",
        R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.state.table,
          onChange: this.handleTableChange
        }),
        R("br")
      ),

      this.state.table
        ? R(
            "div",
            { className: "form-group" },
            R("label", { className: "text-muted" }, "Field"),
            ": ",
            R(ExprComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              table: this.state.table,
              types: ["text", "number", "enum", "date", "datetime", "boolean", "enumset", "geometry"],
              value: this.props.exprItem.expr,
              aggrStatuses: ["individual", "literal", "aggregate"],
              onChange: this.handleExprChange
            })
          )
        : undefined,

      this.state.table && this.props.exprItem.expr
        ? R(
            "div",
            { className: "form-group" },
            R(
              "label",
              { key: "includeLabel" },
              R("input", {
                type: "checkbox",
                checked: this.props.exprItem.includeLabel,
                onChange: this.handleIncludeLabelChange
              }),
              " Include Label"
            ),

            this.props.exprItem.includeLabel
              ? R("input", {
                  key: "labelText",
                  className: "form-control",
                  type: "text",
                  value: this.props.exprItem.labelText || "",
                  onChange: this.handleLabelTextChange,
                  placeholder: new ExprUtils(this.props.schema).summarizeExpr(this.props.exprItem.expr) + ": "
                })
              : undefined
          )
        : undefined,

      this.renderFormat()
    )
  }
}
