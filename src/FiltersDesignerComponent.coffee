React = require 'react'
H = React.DOM
R = React.createElement
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
PopoverHelpComponent = require 'react-library/lib/PopoverHelpComponent'

# Designer for filters of multiple tables. Used for maps and dashboards
# Filters are in format mwater-expression filter expression indexed by table. e.g. { sometable: logical expression, etc. }
module.exports = class FiltersDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    filterableTables: React.PropTypes.arrayOf(React.PropTypes.string) # Tables that can be filtered on. Should only include tables that actually exist
    filters: React.PropTypes.object
    onFiltersChange: React.PropTypes.func.isRequired # Called with new filters

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  handleFilterChange: (table, expr) =>
    # Clean filter
    expr = new ExprCleaner(@props.schema).cleanExpr(expr, { table: table })

    filters = _.clone(@props.filters or {})
    filters[table] = expr

    @props.onFiltersChange(filters)

  renderFilterableTable: (table) =>
    name = ExprUtils.localizeString(@props.schema.getTable(table).name, @context.locale)

    H.div key: table, 
      H.label null, name
      React.createElement(FilterExprComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        onChange: @handleFilterChange.bind(null, table)
        table: table
        value: @props.filters?[table])

  render: ->
    return H.div null,
      _.map(@props.filterableTables, @renderFilterableTable)
