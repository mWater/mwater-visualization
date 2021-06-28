// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let FiltersDesignerComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { FilterExprComponent } from "mwater-expressions-ui"
import { ExprCleaner } from "mwater-expressions"
import { ExprUtils } from "mwater-expressions"

// Designer for filters of multiple tables. Used for maps and dashboards
// Filters are in format mwater-expression filter expression indexed by table. e.g. { sometable: logical expression, etc. }
export default FiltersDesignerComponent = (function () {
  FiltersDesignerComponent = class FiltersDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired, // Data source to use
        filterableTables: PropTypes.arrayOf(PropTypes.string), // Tables that can be filtered on. Should only include tables that actually exist
        filters: PropTypes.object,
        onFiltersChange: PropTypes.func.isRequired // Called with new filters
      }

      this.contextTypes = { locale: PropTypes.string }
      // e.g. "en"
    }

    handleFilterChange = (table: any, expr: any) => {
      // Clean filter
      expr = new ExprCleaner(this.props.schema).cleanExpr(expr, { table })

      const filters = _.clone(this.props.filters || {})
      filters[table] = expr

      return this.props.onFiltersChange(filters)
    }

    renderFilterableTable = (table: any) => {
      const name = ExprUtils.localizeString(this.props.schema.getTable(table).name, this.context.locale)

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
      return R("div", null, _.map(this.props.filterableTables, this.renderFilterableTable))
    }
  }
  FiltersDesignerComponent.initClass()
  return FiltersDesignerComponent
})()
