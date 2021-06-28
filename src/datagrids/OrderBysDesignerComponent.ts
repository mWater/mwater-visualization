// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let OrderBysDesignerComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"
import { ExprComponent } from "mwater-expressions-ui"

// Edits an orderBys which is a list of expressions and directions. See README.md
export default OrderBysDesignerComponent = (function () {
  OrderBysDesignerComponent = class OrderBysDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // schema to use
        dataSource: PropTypes.object.isRequired, // dataSource to use
        table: PropTypes.string.isRequired,
        orderBys: PropTypes.array.isRequired, // Columns list See README.md of this folder
        onChange: PropTypes.func.isRequired // Called when columns changes
      }

      this.defaultProps = { orderBys: [] }
    }

    handleChange = (index, orderBy) => {
      const orderBys = this.props.orderBys.slice()
      orderBys[index] = orderBy
      return this.props.onChange(orderBys)
    }

    handleRemove = (index) => {
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
  OrderBysDesignerComponent.initClass()
  return OrderBysDesignerComponent
})()

class OrderByDesignerComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      orderBy: PropTypes.array.isRequired,
      onChange: PropTypes.func.isRequired,
      onRemove: PropTypes.func.isRequired,
      schema: PropTypes.object.isRequired,
      dataSource: PropTypes.object.isRequired,
      table: PropTypes.string
    }
    // Current table
  }

  handleExprChange = (expr) => {
    return this.props.onChange(_.extend({}, this.props.orderBy, { expr }))
  }

  handleDirectionChange = (ev) => {
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
OrderByDesignerComponent.initClass()
