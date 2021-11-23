import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import update from "update-object"
import TableSelectComponent from "../TableSelectComponent"
import { ExprComponent } from "mwater-expressions-ui"
import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import * as ui from "react-library/lib/bootstrap"

export interface QuickfiltersDesignComponentProps {
  /** Design of quickfilters. See README.md */
  design: any
  /** Called when design changes */
  onDesignChange: any
  schema: Schema
  dataSource: DataSource
  /** List of possible table ids to use */
  tables: any
}

// Displays quick filters and allows their value to be modified
export default class QuickfiltersDesignComponent extends React.Component<QuickfiltersDesignComponentProps> {
  static defaultProps = { design: [] }

  handleDesignChange = (design: any) => {
    design = design.slice()

    // Update merged, clearing if not mergeable
    for (let index = 0, end = design.length, asc = 0 <= end; asc ? index < end : index > end; asc ? index++ : index--) {
      if (design[index].merged && !this.isMergeable(design, index)) {
        design[index] = _.extend({}, design[index], { merged: false })
      }
    }

    return this.props.onDesignChange(design)
  }

  // Determine if quickfilter at index is mergeable with previous (same type, id table and enum values)
  isMergeable(design: any, index: any) {
    if (index === 0) {
      return false
    }

    const exprUtils = new ExprUtils(this.props.schema)

    const type = exprUtils.getExprType(design[index].expr)
    const prevType = exprUtils.getExprType(design[index - 1].expr)

    const idTable = exprUtils.getExprIdTable(design[index].expr)
    const prevIdTable = exprUtils.getExprIdTable(design[index - 1].expr)

    const enumValues = exprUtils.getExprEnumValues(design[index].expr)
    const prevEnumValues = exprUtils.getExprEnumValues(design[index - 1].expr)

    const multi = design[index].multi || false
    const prevMulti = design[index - 1].multi || false

    if (multi !== prevMulti) {
      return false
    }

    if (!type || type !== prevType) {
      return false
    }

    if (idTable !== prevIdTable) {
      return false
    }

    if (enumValues && !_.isEqual(_.pluck(enumValues, "id"), _.pluck(prevEnumValues, "id"))) {
      return false
    }

    return true
  }

  renderQuickfilter(item: any, index: any) {
    return R(QuickfilterDesignComponent, {
      key: index,
      design: item,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      tables: this.props.tables,
      mergeable: this.isMergeable(this.props.design, index),
      onChange: (newItem: any) => {
        const design = this.props.design.slice()
        design[index] = newItem
        return this.handleDesignChange(design)
      },

      onRemove: this.handleRemove.bind(null, index)
    })
  }

  handleAdd = () => {
    // Add blank to end
    const design = this.props.design.concat([{}])
    return this.props.onDesignChange(design)
  }

  handleRemove = (index: any) => {
    const design = this.props.design.slice()
    design.splice(index, 1)
    return this.props.onDesignChange(design)
  }

  render() {
    return R(
      "div",
      null,
      _.map(this.props.design, (item, index) => this.renderQuickfilter(item, index)),

      this.props.tables.length > 0
        ? R(
            "button",
            { type: "button", className: "btn btn-sm btn-link", onClick: this.handleAdd },
            R("span", { className: "fas fa-plus" }),
            " Add Quick Filter"
          )
        : undefined
    )
  }
}

interface QuickfilterDesignComponentProps {
  /** Design of a single quickfilters. See README.md */
  design: any
  onChange: any
  onRemove: any
  /** True if can be merged */
  mergeable?: boolean
  schema: Schema
  dataSource: DataSource
  tables: any
}

interface QuickfilterDesignComponentState {
  table: any
}

class QuickfilterDesignComponent extends React.Component<
  QuickfilterDesignComponentProps,
  QuickfilterDesignComponentState
> {
  constructor(props: any) {
    super(props)

    // Store table to allow selecting table first, then expression
    this.state = {
      table: props.design.expr?.table || props.tables[0]
    }
  }

  handleTableChange = (table: any) => {
    this.setState({ table })
    const design = {
      expr: null,
      label: null
    }
    return this.props.onChange(design)
  }

  handleExprChange = (expr: any) => {
    return this.props.onChange(update(this.props.design, { expr: { $set: expr } }))
  }
  handleLabelChange = (ev: any) => {
    return this.props.onChange(update(this.props.design, { label: { $set: ev.target.value } }))
  }
  handleMergedChange = (merged: any) => {
    return this.props.onChange(update(this.props.design, { merged: { $set: merged } }))
  }
  handleMultiChange = (multi: any) => {
    return this.props.onChange(update(this.props.design, { multi: { $set: multi } }))
  }

  render() {
    // Determine type of expression
    const exprType = new ExprUtils(this.props.schema).getExprType(this.props.design.expr)

    return R(
      RemovableComponent,
      { onRemove: this.props.onRemove },
      R(
        "div",
        { className: "card" },
        R(
          "div",
          { className: "card-body" },
          R(
            "div",
            { className: "mb-3", key: "table" },
            R("label", { className: "text-muted" }, "Data Source"),
            R(ui.Select, {
              value: this.state.table,
              options: _.map(this.props.tables, (table) => ({
                value: table,
                label: ExprUtils.localizeString(this.props.schema.getTable(table).name)
              })),
              onChange: this.handleTableChange,
              nullLabel: "Select..."
            })
          ),

          R(
            "div",
            { className: "mb-3", key: "expr" },
            R("label", { className: "text-muted" }, "Filter By"),
            R(
              "div",
              null,
              R(ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.state.table,
                value: this.props.design.expr,
                onChange: this.handleExprChange,
                types: ["enum", "text", "enumset", "date", "datetime", "id[]", "text[]"]
              })
            )
          ),

          this.props.design.expr
            ? R(
                "div",
                { className: "mb-3", key: "label" },
                R("label", { className: "text-muted" }, "Label"),
                R("input", {
                  type: "text",
                  className: "form-control form-control-sm",
                  value: this.props.design.label || "",
                  onChange: this.handleLabelChange,
                  placeholder: "Optional Label"
                })
              )
            : undefined,

          this.props.mergeable
            ? R(
                ui.Checkbox,
                {
                  value: this.props.design.merged,
                  onChange: this.handleMergedChange
                },
                "Merge with previous quickfilter ",
                R("span", { className: "text-muted" }, "- displays as one single control that filters both")
              )
            : undefined,

          ["enum", "text", "enumset", "id[]", "text[]"].includes(exprType)
            ? R(
                ui.Checkbox,
                {
                  value: this.props.design.multi,
                  onChange: this.handleMultiChange
                },
                "Allow multiple selections"
              )
            : undefined
        )
      )
    )
  }
}

interface RemovableComponentProps {
  onRemove: any
}

// Floats an x to the right on hover
class RemovableComponent extends React.Component<RemovableComponentProps> {
  render() {
    return R(
      "div",
      { style: { display: "flex" }, className: "hover-display-parent" },
      R("div", { style: { flex: "1 1 auto" }, key: "main" }, this.props.children),
      R(
        "div",
        { style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child", key: "remove" },
        R(
          "a",
          { className: "link-plain", onClick: this.props.onRemove, style: { fontSize: "80%", marginLeft: 5 } },
          R("span", { className: "fas fa-times" })
        )
      )
    )
  }
}
