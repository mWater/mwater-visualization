import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import { ExprUtils } from "mwater-expressions"
import * as ui from "react-library/lib/bootstrap"

interface MWaterResponsesFilterComponentProps {
  schema: any
  /** responses:xyz */
  table: string
  filter?: any
  onFilterChange: any
}

// Implements common filters for responses tables. Allows filtering by final responses only and also
// by latest for each site type linked to responses.
export default class MWaterResponsesFilterComponent extends React.Component<MWaterResponsesFilterComponentProps> {
  // Expand "and" and null filters into a list of filters
  getFilters() {
    if (!this.props.filter) {
      return []
    }

    if (this.props.filter.type === "op" && this.props.filter.op === "and") {
      return this.props.filter.exprs
    }

    return [this.props.filter]
  }

  // Set filters in most compact way possible
  setFilters(filters: any) {
    if (filters.length === 0) {
      return this.props.onFilterChange(null)
    } else if (filters.length === 1) {
      return this.props.onFilterChange(filters[0])
    } else {
      return this.props.onFilterChange({
        type: "op",
        op: "and",
        table: this.props.table,
        exprs: filters
      })
    }
  }

  getFinalFilter() {
    return {
      type: "op",
      op: "= any",
      table: this.props.table,
      exprs: [
        { type: "field", table: this.props.table, column: "status" },
        { type: "literal", valueType: "enumset", value: ["final"] }
      ]
    }
  }

  isFinal() {
    // Determine if final
    return _.any(this.getFilters(), (f) => {
      return (
        _.isEqual(f, this.getFinalFilter()) || (f?.op === "is latest" && _.isEqual(f.exprs[1], this.getFinalFilter()))
      )
    })
  }

  // Get column id of site filtering on latest
  getSiteValue() {
    const filters = this.getFilters()

    // Get site columns
    for (var column of this.props.schema.getColumns(this.props.table)) {
      if (
        column.type === "join" &&
        column.join.type === "n-1" &&
        column.join.toTable.startsWith("entities.") &&
        column.id.match(/^data:/)
      ) {
        // Check for match
        if (
          _.any(
            filters,
            (f) =>
              f?.op === "is latest" &&
              _.isEqual(f.exprs[0], { type: "field", table: this.props.table, column: column.id })
          )
        ) {
          return column.id
        }
      }
    }

    return null
  }

  handleSiteChange = (site: any) => {
    return this.handleChange(this.isFinal(), site)
  }

  handleFinalChange = (final: any) => {
    return this.handleChange(final, this.getSiteValue())
  }

  // Recreate all filters
  handleChange = (final: any, site: any) => {
    // Strip all filters
    let filters = this.getFilters()

    // Strip simple
    filters = _.filter(filters, (f) => !_.isEqual(f, this.getFinalFilter()))

    // Strip "is latest" (simplified. just removes all "is latest" from the filter since is a rare op)
    filters = _.filter(filters, (f) => f?.op !== "is latest")

    // If site, create is latest
    if (site) {
      const filter = {
        type: "op",
        op: "is latest",
        table: this.props.table,
        exprs: [{ type: "field", table: this.props.table, column: site }]
      }
      if (final) {
        filter.exprs.push(this.getFinalFilter())
      }

      filters.push(filter)
    } else if (final) {
      filters.push(this.getFinalFilter())
    }

    return this.setFilters(filters)
  }

  render() {
    // Get site columns
    const siteColumns = _.filter(
      this.props.schema.getColumns(this.props.table),
      (col) =>
        col.type === "join" &&
        col.join.type === "n-1" &&
        col.join.toTable.startsWith("entities.") &&
        col.id.match(/^data:/)
    )

    const siteColumnId = this.getSiteValue()

    return R(
      "div",
      { style: { paddingLeft: 5, paddingTop: 5 } },
      R("div", { style: { paddingBottom: 5 } }, "Data Source Options:"),

      R(
        "div",
        { style: { paddingLeft: 5 } },
        siteColumns.length > 0
          ? R(
              "div",
              null,
              R("i", null, "This data source contains links to monitoring sites. Would you like to:"),
              R(
                "div",
                { style: { paddingLeft: 8 } },
                R(
                  ui.Radio,
                  { key: "all", value: siteColumnId, radioValue: null, onChange: this.handleSiteChange },
                  "Show all survey responses (even if there are more than one per site)"
                ),
                _.map(siteColumns, (column) => {
                  return R(
                    ui.Radio,
                    { key: column.id, value: siteColumnId, radioValue: column.id, onChange: this.handleSiteChange },
                    "Show only the latest response for each ",
                    R("i", null, `${ExprUtils.localizeString(this.props.schema.getTable(column.join.toTable)?.name)}`),
                    " in the question ",
                    R("i", null, `'${ExprUtils.localizeString(column.name)}'`)
                  )
                })
              )
            )
          : undefined,

        R(
          ui.Checkbox,
          { value: this.isFinal(), onChange: this.handleFinalChange },
          "Only include final responses (recommended)"
        )
      )
    )
  }
}
