React = require 'react'
H = React.DOM
R = React.createElement
querystring = require 'querystring'
TabbedComponent = require('react-library/lib/TabbedComponent')
ToggleEditComponent = require('mwater-visualization').ToggleEditComponent
OptionListComponent = require('mwater-visualization').OptionListComponent
ExprUtils = require("mwater-expressions").ExprUtils

siteTypes = ["entities.water_point", "entities.household", "entities.sanitation_facility", "entities.community", "entities.school", "entities.health_facility", "entities.surface_water"]

# Allows selection of a mwater-visualization table. Loads forms as well and calls event if modified
module.exports = class MWaterTableSelectComponent extends React.Component
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired # Url to hit api
    client: React.PropTypes.string            # Optional client
    schema: React.PropTypes.object.isRequired
    user: React.PropTypes.string

    table: React.PropTypes.string
    onChange: React.PropTypes.func.isRequired # Called with table selected

    extraTables: React.PropTypes.array.isRequired
    onExtraTablesChange: React.PropTypes.func.isRequired

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: ->
    super

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
        @refs.toggleEdit.close()
        
        # Fire change
        nextProps.onChange(table)

  handleChange: (tableId) =>
    # Close toggle edit
    @refs.toggleEdit.close()
    @props.onChange(tableId)

  handleTableChange: (tableId) =>
    # If not part of formIds, add it and wait for new schema
    if not @props.schema.getTable(tableId)
      @setState(pendingExtraTable: tableId, =>
        @props.onExtraTablesChange(_.union(@props.extraTables, [tableId]))
      )
    else
      @handleChange(tableId)

  renderSites: ->
    R OptionListComponent,
      items: _.compact(_.map(siteTypes, (tableId) =>
        table = @props.schema.getTable(tableId)
        if not table
          return null
        return { name: ExprUtils.localizeString(table.name, @context.locale), desc: ExprUtils.localizeString(table.desc, @context.locale), onClick: @handleChange.bind(null, table.id) }
      ))

  renderForms: ->
    R FormsListComponent,
      schema: @props.schema
      client: @props.client
      apiUrl: @props.apiUrl
      user: @props.user
      onChange: @handleTableChange
      extraTables: @props.extraTables

  renderIndicators: ->
    tables = _.filter(@props.schema.getTables(), (table) => table.id.match(/^indicator_values:/))
    tables = _.sortBy(tables, (t) -> t.name.en)

    # Add all indicators to top
    table = @props.schema.getTable("response_indicators")
    if table
      tables.unshift(table)

    R OptionListComponent,
      items: _.map(tables, (table) =>
        return { name: ExprUtils.localizeString(table.name, @context.locale), desc: ExprUtils.localizeString(table.desc, @context.locale), onClick: @handleChange.bind(null, table.id) }
      )

  renderOther: ->
    otherTables = _.filter(@props.schema.getTables(), (table) => table.id not in siteTypes and not table.id.match(/^responses:/) and not table.id.match(/^indicator_values:/) and table.id != "response_indicators")
    otherTables = _.sortBy(otherTables, "name")
    R OptionListComponent,
      items: _.map(otherTables, (table) =>
        return { name: ExprUtils.localizeString(table.name, @context.locale), desc: ExprUtils.localizeString(table.desc, @context.locale), onClick: @handleChange.bind(null, table.id) }
      )

  render: ->
    editor = R TabbedComponent,
      tabs: [
        { id: "sites", label: "Sites", elem: @renderSites() }
        { id: "forms", label: "Forms", elem: @renderForms() }
        { id: "indicators", label: "Indicators", elem: @renderIndicators() }
        { id: "other", label: "Other", elem: @renderOther() }
      ]
      initialTabId: "sites"

    R ToggleEditComponent,
      ref: "toggleEdit"
      forceOpen: not @props.table # Must have table
      label: if @props.table then ExprUtils.localizeString(@props.schema.getTable(@props.table).name, @context.locale)
      editor: editor

# Searchable list of forms
class FormsListComponent extends React.Component
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired # Url to hit api
    client: React.PropTypes.string            # Optional client
    schema: React.PropTypes.object.isRequired
    user: React.PropTypes.string
    onChange: React.PropTypes.func.isRequired # Called with table selected
    extraTables: React.PropTypes.array.isRequired

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: ->
    super
    @state = { 
      forms: null 
      search: ""
    }

  componentDidMount: ->
    # Get names and basic of forms
    query = {}
    query.fields = JSON.stringify({ "design.name": 1, roles: 1, created: 1, modified: 1, state: 1, isMaster: 1 })
    query.selector = JSON.stringify({ design: { $exists: true }, state: { $ne: "deleted" } })
    query.client = @props.client

    # Get list of all form names
    $.getJSON @props.apiUrl + "forms?" + querystring.stringify(query), (forms) => 
      
      # Sort by modified.on desc but first by user
      forms = _.sortByOrder(forms, [
        (form) => if "responses:" + form._id in @props.extraTables then 1 else 0
        (form) => if form.created.by == @props.user then 1 else 0
        (form) => form.modified.on
        ], ['desc', 'desc', 'desc'])

      # TODO use name instead of design.name
      @setState(forms: _.map(forms, (form) => { 
          id: form._id
          name: ExprUtils.localizeString(form.design.name, @context.locale)
          desc: "Created by #{form.created.by}" 
      }))
    .fail (xhr) =>
      @setState(error: xhr.responseText)

  searchRef: (comp) =>
    # Focus
    if comp
      comp.focus()

  render: ->
    if @state.error
      return H.div className: "alert alert-danger", @state.error

    if not @state.forms
      return H.div className: "alert alert-info", "Loading..."

    # Filter forms
    if @state.search
      escapeRegExp = (s) ->
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

      searchStringRegExp = new RegExp(escapeRegExp(@state.search), "i")

      forms = _.filter(@state.forms, (form) => form.name.match(searchStringRegExp))
    else
      forms = @state.forms

    tables = _.filter(@props.schema.getTables(), (table) => table.id.match(/^responses:/) or table.id.match(/^master_responses:/))
    tables = _.sortBy(tables, (t) -> t.name.en)

    H.div null,
      R OptionListComponent,
        items: _.map(tables, (table) =>
          return { name: ExprUtils.localizeString(table.name, @context.locale), desc: ExprUtils.localizeString(table.desc, @context.locale), onClick: @props.onChange.bind(null, table.id) }
        )

      H.input 
        type: "text"
        className: "form-control input-sm"
        placeholder: "Search..."
        key: "search"
        ref: @searchRef
        style: { maxWidth: "20em", marginBottom: 10 }
        value: @state.search
        onChange: (ev) => @setState(search: ev.target.value)

      R OptionListComponent,
        items: _.map(forms, (form) => { name: form.name, desc: form.desc, onClick: @props.onChange.bind(null, "responses:" + form.id) })

