PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

moment = require 'moment'

querystring = require 'querystring'
ExprUtils = require('mwater-expressions').ExprUtils
ui = require './UIComponents'

# List of indicators related to an entity
module.exports = class MWaterAddRelatedIndicatorComponent extends React.Component
  @propTypes:
    table: PropTypes.string.isRequired
    apiUrl: PropTypes.string.isRequired
    client: PropTypes.string
    user: PropTypes.string                # User id
    onSelect: PropTypes.func.isRequired   # Called with table id e.g. indicator_values:someid
    schema: PropTypes.object.isRequired   
    filter: PropTypes.string              # String filter

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: ->
    super

    @state = { 
      addingTables: []  # Set to table ids that have been added
      indicators: null
    }

  componentDidMount: ->
    # Get all response-type indicators 
    query = {}
    query.selector = JSON.stringify({ type: "response" })
    query.fields = JSON.stringify({ "design.name": 1, "design.desc": 1, "design.properties": 1, "design.recommended": 1, "deprecated": 1 })
    if @props.client
      query.client = @props.client

    # Get list of all indicators
    $.getJSON @props.apiUrl + "indicators?" + querystring.stringify(query), (indicators) => 
      # Filter by table reference
      indicators = _.filter(indicators, (indicator) => @doesIndicatorReferenceTable(indicator, @props.table) and not indicator.deprecated)

      # Sort by recommended then name
      indicators = _.sortByOrder(indicators, [
        (indicator) => if indicator.design.recommended then 0 else 1
        (indicator) => ExprUtils.localizeString(indicator.design.name, @context.locale)
        ], ['asc', 'asc'])

      @setState(indicators: indicators)
    .fail (xhr) =>
      @setState(error: xhr.responseText)

  # See if a property references the indicator
  doesIndicatorReferenceTable: (indicator, table) ->
    for proplist in _.values(indicator.design.properties)
      for property in flattenProperties(proplist)
        if property.idTable == table
          return true

    return false

  handleSelect: (table) =>
    # Mark as being added
    @setState(addingTables: _.union(@state.addingTables, [table]))

    @props.onSelect(table)

  render: ->
    # Filter out ones that are known and not recently added
    indicators = _.filter(@state.indicators, (indicator) => 
      not @props.schema.getTable("indicator_values:#{indicator._id}") or "indicator_values:#{indicator._id}" in @state.addingTables)

    # Filter by search
    if @props.filter
      indicators = _.filter(indicators, (indicator) => filterMatches(@props.filter, ExprUtils.localizeString(indicator.design.name, @context.locale)))

    return R 'div', null,
      R 'div', style: { paddingLeft: 5 }, className: "text-muted", 
        "Other Available Indicators. Click to enable. "
          R 'i', className: "fa fa-check-circle"
          " = recommended"

        if not @state.indicators
          R 'div', className: "text-muted",
            R 'i', className: "fa fa-spin fa-spinner"
            " Loading..."

        R 'div', style: { paddingLeft: 10 },
          _.map indicators, (indicator) =>
            name = ExprUtils.localizeString(indicator.design.name, @context.locale)
            desc = ExprUtils.localizeString(indicator.design.desc, @context.locale)

            # If added, put special message
            if @props.schema.getTable("indicator_values:#{indicator._id}")
              return R 'div', key: indicator._id, style: { cursor: "pointer", padding: 4 }, className: "text-success",
                "#{name} added. See above."

            return R 'div', key: indicator._id, style: { cursor: "pointer", color: "#478", padding: 4 }, onClick: @handleSelect.bind(null, "indicator_values:#{indicator._id}"),
              # If in process of adding
              if indicator._id in @state.addingTables
                R 'i', className: "fa fa-spin fa-spinner"

              if indicator.design.recommended
                R 'i', className: "fa fa-check-circle fa-fw", style: { color: "#337ab7" }
              name
              if desc
                R 'span', className: "text-muted", style: { fontSize: 12, paddingLeft: 3 }, 
                  " - " + desc

# Flattens a nested list of properties
flattenProperties = (properties) ->
  # Flatten
  props = []
  for prop in properties
    if prop.contents
      props = props.concat(flattenProperties(prop.contents))
    else
      props.push(prop)

  return props

# Filters text based on lower-case
filterMatches = (filter, text) ->
  if not filter
    return true

  if not text
    return false

  if text.match(new RegExp(_.escapeRegExp(filter), "i"))
    return true
  return false