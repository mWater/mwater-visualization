// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let OrderingsComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprComponent } from "mwater-expressions-ui"

// Edits the orderings of a chart
// Orderings are an array of { axis: axis to order by, direction: "asc"/"desc" }
// NOTE: no longer uses complete axis, just the expr
export default OrderingsComponent = (function () {
  OrderingsComponent = class OrderingsComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        orderings: PropTypes.array.isRequired,
        onOrderingsChange: PropTypes.func.isRequired,
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired,
        table: PropTypes.string
      }
      // Current table
    }

    handleAdd = () => {
      const orderings = this.props.orderings.slice()
      orderings.push({ axis: null, direction: "asc" })
      return this.props.onOrderingsChange(orderings)
    }

    handleOrderingRemove = (index) => {
      const orderings = this.props.orderings.slice()
      orderings.splice(index, 1)
      return this.props.onOrderingsChange(orderings)
    }

    handleOrderingChange = (index, ordering) => {
      const orderings = this.props.orderings.slice()
      orderings[index] = ordering
      return this.props.onOrderingsChange(orderings)
    }

    render() {
      return R(
        "div",
        null,
        _.map(this.props.orderings, (ordering, i) => {
          return R(OrderingComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            ordering,
            table: this.props.table,
            onOrderingChange: this.handleOrderingChange.bind(null, i),
            onOrderingRemove: this.handleOrderingRemove.bind(null, i)
          })
        }),

        R(
          "button",
          { type: "button", className: "btn btn-sm btn-default", onClick: this.handleAdd, key: "add" },
          R("span", { className: "glyphicon glyphicon-plus" }),
          " Add Ordering"
        )
      )
    }
  }
  OrderingsComponent.initClass()
  return OrderingsComponent
})()

class OrderingComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      ordering: PropTypes.object.isRequired,
      onOrderingChange: PropTypes.func.isRequired,
      onOrderingRemove: PropTypes.func.isRequired,
      schema: PropTypes.object.isRequired,
      dataSource: PropTypes.object.isRequired,
      table: PropTypes.string
    }
    // Current table
  }

  handleAxisChange = (axis) => {
    return this.props.onOrderingChange(_.extend({}, this.props.ordering, { axis }))
  }

  handleExprChange = (expr) => {
    const axis = _.extend({}, this.props.ordering.axis || {}, { expr })
    return this.handleAxisChange(axis)
  }

  handleDirectionChange = (ev) => {
    return this.props.onOrderingChange(
      _.extend({}, this.props.ordering, { direction: ev.target.checked ? "desc" : "asc" })
    )
  }

  render() {
    return R(
      "div",
      { style: { marginLeft: 5 } },
      R(
        "div",
        { style: { textAlign: "right" } },
        R(
          "button",
          { className: "btn btn-xs btn-link", type: "button", onClick: this.props.onOrderingRemove },
          R("span", { className: "glyphicon glyphicon-remove" })
        )
      ),
      R(ExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        types: ["text", "number", "boolean", "date", "datetime"],
        aggrStatuses: ["individual", "aggregate"],
        value: this.props.ordering.axis?.expr,
        onChange: this.handleExprChange
      }),
      R(
        "div",
        null,
        R(
          "div",
          { className: "checkbox-inline" },
          R(
            "label",
            null,
            R("input", {
              type: "checkbox",
              checked: this.props.ordering.direction === "desc",
              onChange: this.handleDirectionChange
            }),
            "Reverse"
          )
        )
      )
    )
  }
}
OrderingComponent.initClass()
