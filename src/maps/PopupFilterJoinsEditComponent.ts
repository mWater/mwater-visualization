import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprComponent } from "mwater-expressions-ui"
import { ExprUtils } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import DashboardUtils from "../dashboards/DashboardUtils"

interface PopupFilterJoinsEditComponentProps {
  /** Schema to use */
  schema: any
  dataSource: any
  /** table of the row that the popup will be for */
  table: string
  /** table of the row that join is to. Usually same as table except for choropleth maps */
  idTable: string
  /** Default popup filter joins */
  defaultPopupFilterJoins: any
  /** Design of the popup this is for */
  popup: any
  /** popup filter joins object */
  design?: any
  onDesignChange: any
}

interface PopupFilterJoinsEditComponentState {
  expanded: any
}

// Designer for popup filter joins (see PopupFilterJoins.md)
export default class PopupFilterJoinsEditComponent extends React.Component<
  PopupFilterJoinsEditComponentProps,
  PopupFilterJoinsEditComponentState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  handleExprChange = (table: any, expr: any) => {
    let design = this.props.design || this.props.defaultPopupFilterJoins

    design = _.clone(design)
    design[table] = expr
    return this.props.onDesignChange(design)
  }

  render() {
    if (!this.state.expanded) {
      return R(
        "a",
        { className: "btn btn-link", onClick: () => this.setState({ expanded: true }) },
        "Advanced Popup Options"
      )
    }

    // Get filterable tables of popup
    const popupDashboard = { items: this.props.popup.items, layout: "blocks" }
    let filterableTables = DashboardUtils.getFilterableTables(popupDashboard, this.props.schema)

    // Always include self as first
    filterableTables = [this.props.table].concat(_.without(filterableTables, this.props.table))

    // Get popupFilterJoins
    const popupFilterJoins = this.props.design || this.props.defaultPopupFilterJoins

    return R(
      "div",
      null,
      R("div", { className: "text-muted" }, "Optional connections for other tables to filtering the popup"),
      R(
        "table",
        { className: "table table-condensed table-bordered" },
        R("thead", null, R("tr", null, R("th", null, "Data Source"), R("th", null, "Connection"))),
        R(
          "tbody",
          null,
          _.map(filterableTables, (filterableTable) => {
            return R(
              "tr",
              { key: filterableTable },
              R(
                "td",
                { style: { verticalAlign: "middle" } },
                ExprUtils.localizeString(this.props.schema.getTable(filterableTable)?.name)
              ),
              R(
                "td",
                null,
                R(ExprComponent, {
                  schema: this.props.schema,
                  dataSource: this.props.dataSource,
                  table: filterableTable,
                  value: popupFilterJoins[filterableTable],
                  onChange: this.handleExprChange.bind(null, filterableTable),
                  types: this.props.table === this.props.idTable ? ["id", "id[]"] : ["id"], // TODO support id[] some day for admin choropleth maps too
                  idTable: this.props.idTable,
                  preferLiteral: false,
                  placeholder: "None"
                })
              )
            )
          })
        )
      )
    )
  }
}
