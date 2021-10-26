import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { FilterExprComponent } from "mwater-expressions-ui"
import { DataSource, Expr, ExprCleaner, Schema } from "mwater-expressions"
import { ExprUtils } from "mwater-expressions"

export interface FiltersDesignerComponentProps {
  /** Schema to use */
  schema: Schema
  /** Data source to use */
  dataSource: DataSource
  /** Tables that can be filtered on. Should only include tables that actually exist */
  filterableTables?: string[]
  filters?: { [tableId: string]: Expr }
  onFiltersChange: (filters: { [tableId: string]: Expr }) => void
}

// Designer for filters of multiple tables. Used for maps and dashboards
// Filters are in format mwater-expression filter expression indexed by table. e.g. { sometable: logical expression, etc. }
export default class FiltersDesignerComponent extends React.Component<FiltersDesignerComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  handleFilterChange = (table: any, expr: any) => {
    // Clean filter
    expr = new ExprCleaner(this.props.schema).cleanExpr(expr, { table })

    const filters = _.clone(this.props.filters || {})
    filters[table] = expr

    return this.props.onFiltersChange(filters)
  }

  renderFilterableTable = (table: any) => {
    const name = ExprUtils.localizeString(this.props.schema.getTable(table)!.name, this.context.locale)

    return R(
      "div",
      { key: table },
      R("label", null, name),
      React.createElement(FilterExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: this.handleFilterChange.bind(null, table),
        table,
        value: this.props.filters?.[table]
      })
    )
  }

  render() {
    return R("div", null, _.map(this.props.filterableTables || [], this.renderFilterableTable))
  }
}
