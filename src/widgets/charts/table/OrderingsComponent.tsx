import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprComponent } from "mwater-expressions-ui"
import { Checkbox } from "react-library/lib/bootstrap"

interface OrderingsComponentProps {
  orderings: any
  onOrderingsChange: any
  schema: any
  dataSource: any
  table?: string
}

// Edits the orderings of a chart
// Orderings are an array of { axis: axis to order by, direction: "asc"/"desc" }
// NOTE: no longer uses complete axis, just the expr
export default class OrderingsComponent extends React.Component<OrderingsComponentProps> {
  handleAdd = () => {
    const orderings = this.props.orderings.slice()
    orderings.push({ axis: null, direction: "asc" })
    return this.props.onOrderingsChange(orderings)
  }

  handleOrderingRemove = (index: any) => {
    const orderings = this.props.orderings.slice()
    orderings.splice(index, 1)
    return this.props.onOrderingsChange(orderings)
  }

  handleOrderingChange = (index: any, ordering: any) => {
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
        { type: "button", className: "btn btn-sm btn-secondary", onClick: this.handleAdd, key: "add" },
        R("span", { className: "fas fa-plus" }),
        " Add Ordering"
      )
    )
  }
}

interface OrderingComponentProps {
  ordering: any
  onOrderingChange: any
  onOrderingRemove: any
  schema: any
  dataSource: any
  table?: string
}

class OrderingComponent extends React.Component<OrderingComponentProps> {
  handleAxisChange = (axis: any) => {
    return this.props.onOrderingChange(_.extend({}, this.props.ordering, { axis }))
  }

  handleExprChange = (expr: any) => {
    const axis = _.extend({}, this.props.ordering.axis || {}, { expr })
    return this.handleAxisChange(axis)
  }

  handleDirectionChange = (value: any) => {
    return this.props.onOrderingChange(_.extend({}, this.props.ordering, { direction: value ? "desc" : "asc" }))
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
          { className: "btn btn-sm btn-link", type: "button", onClick: this.props.onOrderingRemove },
          R("span", { className: "fas fa-times" })
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
        <Checkbox inline value={this.props.ordering.direction === "desc"} onChange={this.handleDirectionChange}>
          Reverse
        </Checkbox>
      )
    )
  }
}
