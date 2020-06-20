_ = require 'lodash'
$ = require 'jquery'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
uiComponents = require './UIComponents'
ExprUtils = require("mwater-expressions").ExprUtils
MWaterResponsesFilterComponent = require './MWaterResponsesFilterComponent'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
MWaterCompleteTableSelectComponent = require './MWaterCompleteTableSelectComponent'

# Allows selection of a mwater-visualization table. Loads forms as well and calls event if modified
module.exports = class MWaterTableSelectComponent extends React.Component
  @propTypes:
    apiUrl: PropTypes.string.isRequired # Url to hit api
    client: PropTypes.string            # Optional client
    schema: PropTypes.object.isRequired
    user: PropTypes.string              # User id

    table: PropTypes.string
    onChange: PropTypes.func.isRequired # Called with table selected

    extraTables: PropTypes.array.isRequired
    onExtraTablesChange: PropTypes.func.isRequired

    # Can also perform filtering for some types. Include these props to enable this
    filter: PropTypes.object
    onFilterChange: PropTypes.func

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

    # Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)  

  constructor: (props) ->
    super(props)

    @state = {
      pendingExtraTable: null   # Set when waiting for a table to load
    }

  componentWillReceiveProps: (nextProps) ->
    # If received new schema with pending extra table, select it
    if @state.pendingExtraTable
      table = @state.pendingExtraTable
      if nextProps.schema.getTable(table)
        # No longer waiting
        @setState(pendingExtraTable: null)

        # Close toggle edit
        @toggleEdit.close()
        
        # Fire change
        nextProps.onChange(table)

    # If table is newly selected and is a responses table and no filters, set filters to final only
    if nextProps.table and nextProps.table.match(/responses:/) and nextProps.table != @props.table and not nextProps.filter and nextProps.onFilterChange
      nextProps.onFilterChange({ type: "op", op: "= any", table: nextProps.table, exprs: [
        { type: "field", table: nextProps.table, column: "status" }
        { type: "literal", valueType: "enumset", value: ["final"] }
      ]})

  handleChange: (tableId) =>
    # Close toggle edit
    @toggleEdit.close()

    # Call onChange if different
    if tableId != @props.table
      @props.onChange(tableId)

  handleTableChange: (tableId) =>
    # If not part of extra tables, add it and wait for new schema
    if tableId and not @props.schema.getTable(tableId)
      @setState(pendingExtraTable: tableId, =>
        @props.onExtraTablesChange(_.union(@props.extraTables, [tableId]))
      )
    else
      @handleChange(tableId)

  render: ->
    editor = R EditModeTableSelectComponent,
      apiUrl: @props.apiUrl
      client: @props.client
      schema: @props.schema
      user: @props.user
      table: @props.table
      onChange: @handleTableChange
      extraTables: @props.extraTables
      onExtraTablesChange: @props.onExtraTablesChange

    R 'div', null,
      # Show message if loading
      if @state.pendingExtraTable
        R 'div', className: "alert alert-info", key: "pendingExtraTable",
          R 'i', className: "fa fa-spinner fa-spin"
          "\u00a0Please wait..."

      R uiComponents.ToggleEditComponent,
        ref: (c) => @toggleEdit = c
        forceOpen: not @props.table # Must have table
        label: if @props.table then ExprUtils.localizeString(@props.schema.getTable(@props.table)?.name, @context.locale) else ""
        editor: editor

      # Make sure table still exists
      if @props.table and @props.onFilterChange and @props.table.match(/^responses:/) and @props.schema.getTable(@props.table)
        R MWaterResponsesFilterComponent, 
          schema: @props.schema
          table: @props.table
          filter: @props.filter
          onFilterChange: @props.onFilterChange


# Is the table select component when in edit mode. Toggles between complete list and simplified list
class EditModeTableSelectComponent extends React.Component
  @propTypes:
    apiUrl: PropTypes.string.isRequired # Url to hit api
    client: PropTypes.string            # Optional client
    schema: PropTypes.object.isRequired
    user: PropTypes.string              # User id

    table: PropTypes.string
    onChange: PropTypes.func.isRequired # Called with table selected

    extraTables: PropTypes.array.isRequired
    onExtraTablesChange: PropTypes.func.isRequired

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

    # Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)  

  constructor: (props) ->
    super(props)

    @state = {
      # True when in popup mode that shows all tables
      completeMode: false
    }

  handleShowMore: =>
    @setState(completeMode: true)

  # Get list of tables that should be included in shortlist
  # This is all active tables and all responses tables in schema (so as to include rosters) and all extra tables
  # Also includes current table
  getTableShortlist: ->
    tables = @context.activeTables or []

    # Remove dead tables
    tables = tables.filter((t) => @props.schema.getTable(t)?)
    tables = _.union(tables, _.filter(_.pluck(@props.schema.getTables(), "id"), (t) -> t.match(/^responses:/)))
    if @props.table
      tables = _.union(tables, [@props.table])

    for extraTable in @props.extraTables or []
      # Check if wildcard
      if extraTable.match(/\*$/)
        for table in @props.schema.getTables()
          if table.id.startsWith(extraTable.substr(0, extraTable.length - 1))
            tables = _.union(tables, [table.id])
      else
        # Add if exists
        if @props.schema.getTable(extraTable)
          tables = _.union(tables, [extraTable])

    # Sort by name
    tables = _.sortBy(tables, (tableId) => ExprUtils.localizeString(@props.schema.getTable(tableId).name, @context.locale))

    return tables

  handleCompleteChange: (tableId) =>
    @setState(completeMode: false)
    @props.onChange(tableId)

  render: ->
    items = _.map @getTableShortlist(), (tableId) =>
      table = @props.schema.getTable(tableId)

      return { 
        name: ExprUtils.localizeString(table.name, @context.locale)
        desc: ExprUtils.localizeString(table.desc, @context.locale)
        onClick: @props.onChange.bind(null, table.id) 
      }

    return R 'div', null,
      if @state.completeMode
        R ModalPopupComponent, 
          header: "Select Data Source"
          onClose: => @setState(completeMode: false)
          showCloseX: true
          size: "large",
            R MWaterCompleteTableSelectComponent,
              apiUrl: @props.apiUrl
              client: @props.client
              schema: @props.schema
              user: @props.user
              table: @props.table
              onChange: @handleCompleteChange
              extraTables: @props.extraTables
              onExtraTablesChange: @props.onExtraTablesChange

      if items.length > 0
        [ 
          R 'div', className: "text-muted", 
            "Select Data Source:"

          R uiComponents.OptionListComponent,
            items: items

          R 'div', null,
            if items.length > 0
              R 'button', type: "button", className: "btn btn-link btn-sm", onClick: @handleShowMore,
                "Show All Available Data Sources..."
        ]
      else
        R 'button', type: "button", className: "btn btn-link", onClick: @handleShowMore,
          "Select Data Source..."
