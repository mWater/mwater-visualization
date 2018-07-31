_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement

ExprUtils = require('mwater-expressions').ExprUtils
ui = require('react-library/lib/bootstrap')

# Implements common filters for responses tables. Allows filtering by final responses only and also
# by latest for each site type linked to responses.
module.exports = class MWaterResponsesFilterComponent extends React.Component
  @propTypes: 
    schema: PropTypes.object.isRequired
    table: PropTypes.string.isRequired  # responses:xyz
    filter: PropTypes.object
    onFilterChange: PropTypes.func.isRequired

  # Expand "and" and null filters into a list of filters
  getFilters: ->
    if not @props.filter
      return []

    if @props.filter.type == "op" and @props.filter.op == "and"
      return @props.filter.exprs

    return [@props.filter]

  # Set filters in most compact way possible
  setFilters: (filters) ->
    if filters.length == 0
      @props.onFilterChange(null)
    else if filters.length == 1
      @props.onFilterChange(filters[0])
    else
      @props.onFilterChange({
        type: "op"
        op: "and"
        table: @props.table
        exprs: filters
      })

  getFinalFilter: ->
    return { type: "op", op: "= any", table: @props.table, exprs: [
      { type: "field", table: @props.table, column: "status" }
      { type: "literal", valueType: "enumset", value: ["final"] }
    ]}

  isFinal: ->
    # Determine if final
    return _.any(@getFilters(), (f) => 
      _.isEqual(f, @getFinalFilter()) or f?.op == "is latest" and _.isEqual(f.exprs[1], @getFinalFilter())
    )

  # Get column id of site filtering on latest
  getSiteValue: ->
    filters = @getFilters()

    # Get site columns
    for column in @props.schema.getColumns(@props.table)
      if column.type == "join" and column.join.type == "n-1" and column.join.toTable.startsWith("entities.") and column.id.match(/^data:/)
        # Check for match
        if _.any(filters, (f) => f?.op == "is latest" and _.isEqual(f.exprs[0], { type: "field", table: @props.table, column: column.id }))
          return column.id

    return null

  handleSiteChange: (site) =>
    @handleChange(@isFinal(), site)

  handleFinalChange: (final) =>
    @handleChange(final, @getSiteValue())

  # Recreate all filters
  handleChange: (final, site) =>
    # Strip all filters
    filters = @getFilters()

    # Strip simple
    filters = _.filter(filters, (f) => not _.isEqual(f, @getFinalFilter()))

    # Strip "is latest" (simplified. just removes all "is latest" from the filter since is a rare op)
    filters = _.filter(filters, (f) => f?.op != "is latest")

    # If site, create is latest
    if site
      filter = { type: "op", op: "is latest", table: @props.table, exprs: [{ type: "field", table: @props.table, column: site }]}
      if final
        filter.exprs.push(@getFinalFilter())

      filters.push(filter)
    else if final
      filters.push(@getFinalFilter())

    @setFilters(filters)

  render: ->
    # Get site columns
    siteColumns = _.filter(@props.schema.getColumns(@props.table), (col) -> col.type == "join" and col.join.type == "n-1" and col.join.toTable.startsWith("entities.") and col.id.match(/^data:/))

    siteColumnId = @getSiteValue()

    H.div style: { paddingLeft: 5, paddingTop: 5 },
      H.div style: { paddingBottom: 5 }, "Data Source Options:"

      H.div style: { paddingLeft: 5 },
        if siteColumns.length > 0
          H.div null,
            H.i null, "This data source contains links to monitoring sites. Would you like to:"
            H.div style: { paddingLeft: 8 },
              R ui.Radio, { key: "all", value: siteColumnId, radioValue: null, onChange: @handleSiteChange }, "Show all survey responses (even if there are more than one per site)"
              _.map siteColumns, (column) =>
                R ui.Radio, { key: column.id, value: siteColumnId, radioValue: column.id, onChange: @handleSiteChange }, 
                  "Show only the latest response for each "
                  H.i null, "#{ExprUtils.localizeString(@props.schema.getTable(column.join.toTable)?.name)}"
                  " in the question "
                  H.i null, "'#{ExprUtils.localizeString(column.name)}'"

        R ui.Checkbox, value: @isFinal(), onChange: @handleFinalChange, 
          "Only include final responses (recommended)"
