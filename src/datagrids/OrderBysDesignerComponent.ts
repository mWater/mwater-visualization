import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"
import { ExprComponent } from "mwater-expressions-ui"

interface OrderBysDesignerComponentProps {
  /** schema to use */
  schema: any
  /** dataSource to use */
  dataSource: any
  table: string
  /** Columns list See README.md of this folder */
  orderBys: any
  /** Called when columns changes */
  onChange: any
}

// Edits an orderBys which is a list of expressions and directions. See README.md
export default class OrderBysDesignerComponent extends React.Component<OrderBysDesignerComponentProps> {
  static defaultProps = { orderBys: [] }

  handleChange = (index: any, orderBy: any) => {
    const orderBys = this.props.orderBys.slice()
    orderBys[index] = orderBy
    return this.props.onChange(orderBys)
  }

  handleRemove = (index: any) => {
    const orderBys = this.props.orderBys.slice()
    orderBys.splice(index, 1)
    return this.props.onChange(orderBys)
  }

  handleAdd = () => {
    const orderBys = this.props.orderBys.slice()
    orderBys.push({ expr: null, direction: "asc" })
    return this.props.onChange(orderBys)
  }

  render() {
    return R(
      "div",
      null,
      _.map(this.props.orderBys, (orderBy, index) => {
        return R(OrderByDesignerComponent, {
          key: index,
          schema: this.props.schema,
          table: this.props.table,
          dataSource: this.props.dataSource,
          orderBy,
          onChange: this.handleChange.bind(null, index),
          onRemove: this.handleRemove.bind(null, index)
        })
      }),

      R(
        "button",
        {
          key: "add",
          type: "button",
          className: "btn btn-link",
          onClick: this.handleAdd
        },
        R("span", { className: "glyphicon glyphicon-plus" }),
        " Add Ordering"
      )
    )
  }
}

interface OrderByDesignerComponentProps {
  orderBy: any
  onChange: any
  onRemove: any
  schema: any
  dataSource: any
  table?: string
}

class OrderByDesignerComponent extends React.Component<OrderByDesignerComponentProps> {
  handleExprChange = (expr: any) => {
    return this.props.onChange(_.extend({}, this.props.orderBy, { expr }))
  }

  handleDirectionChange = (ev: any) => {
    return this.props.onChange(_.extend({}, this.props.orderBy, { direction: ev.target.checked ? "desc" : "asc" }))
  }

  render() {
    return R(
      "div",
      { className: "row" },
      R(
        "div",
        { className: "col-xs-7" },
        R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ["text", "number", "boolean", "date", "datetime"],
          aggrStatuses: ["individual", "literal", "aggregate"],
          value: this.props.orderBy.expr,
          onChange: this.handleExprChange
        })
      ),
      R(
        "div",
        { className: "col-xs-3" },
        R(
          "div",
          { className: "checkbox-inline" },
          R(
            "label",
            null,
            R("input", {
              type: "checkbox",
              checked: this.props.orderBy.direction === "desc",
              onChange: this.handleDirectionChange
            }),
            "Reverse"
          )
        )
      ),
      R(
        "div",
        { className: "col-xs-1" },
        R(
          "button",
          { className: "btn btn-xs btn-link", type: "button", onClick: this.props.onRemove },
          R("span", { className: "glyphicon glyphicon-remove" })
        )
      )
    )
  }
}
