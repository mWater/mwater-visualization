_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils

# Designer for filters of multiple tables. Used for maps and dashboards
# Filters are in format mwater-expression filter expression indexed by table. e.g. { sometable: logical expression, etc. }
module.exports = class FiltersDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use
    filterableTables: PropTypes.arrayOf(PropTypes.string) # Tables that can be filtered on. Should only include tables that actually exist
    filters: PropTypes.object
    onFiltersChange: PropTypes.func.isRequired # Called with new filters

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  handleFilterChange: (table, expr) =>
    # Clean filter
    expr = new ExprCleaner(@props.schema).cleanExpr(expr, { table: table })

    filters = _.clone(@props.filters or {})
    filters[table] = expr

    @props.onFiltersChange(filters)

  renderFilterableTable: (table) =>
    name = ExprUtils.localizeString(@props.schema.getTable(table).name, @context.locale)

    R 'div', key: table, 
      R 'label', null, name
      React.createElement(FilterExprComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        onChange: @handleFilterChange.bind(null, table)
        table: table
        value: @props.filters?[table])

  render: ->
    return R 'div', null,
      _.map(@props.filterableTables, @renderFilterableTable)
