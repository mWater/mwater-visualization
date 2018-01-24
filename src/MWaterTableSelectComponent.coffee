PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
querystring = require 'querystring'
TabbedComponent = require('react-library/lib/TabbedComponent')
ui = require('react-library/lib/bootstrap')
uiComponents = require './UIComponents'
ExprUtils = require("mwater-expressions").ExprUtils
moment = require 'moment'
MWaterResponsesFilterComponent = require './MWaterResponsesFilterComponent'

siteTypes = [
  "entities.water_point"
  "entities.household"
  "entities.sanitation_facility"
  "entities.community"
  "entities.school"
  "entities.health_facility"
  "entities.surface_water"
  "entities.place_of_worship"
  "entities.water_system"
  "entities.waste_disposal_site"
  "entities.wastewater_treatment_system"
  "entities.handwashing_facility"
]

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

    # If table is newly selected and is a responses table and no filters, set filters to final only
    if nextProps.table and nextProps.table.match(/responses:/) and nextProps.table != @props.table and not nextProps.filter and nextProps.onFilterChange
      nextProps.onFilterChange({ type: "op", op: "= any", table: nextProps.table, exprs: [
        { type: "field", table: nextProps.table, column: "status" }
        { type: "literal", valueType: "enumset", value: ["final"] }
      ]})

  handleChange: (tableId) =>
    # Close toggle edit
    @refs.toggleEdit.close()

    # Call onChange if different
    if tableId != @props.table
      @props.onChange(tableId)

  handleTableChange: (tableId) =>
    # If not part of formIds, add it and wait for new schema
    if not @props.schema.getTable(tableId)
      @setState(pendingExtraTable: tableId, =>
        @props.onExtraTablesChange(_.union(@props.extraTables, [tableId]))
      )
    else
      @handleChange(tableId)

  handleExtraTableAdd: (tableId) =>
    @props.onExtraTablesChange(_.union(@props.extraTables, [tableId]))

  handleExtraTableRemove: (tableId) =>
    # Set to null if current table
    if @props.table == tableId
      @props.onChange(null)

    @props.onExtraTablesChange(_.without(@props.extraTables, tableId))

  renderSites: ->
    R uiComponents.OptionListComponent,
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
      onExtraTableAdd: @handleExtraTableAdd
      onExtraTableRemove: @handleExtraTableRemove

  renderIndicators: ->
    R IndicatorsListComponent,
      schema: @props.schema
      client: @props.client
      apiUrl: @props.apiUrl
      user: @props.user
      onChange: @handleTableChange
      extraTables: @props.extraTables
      onExtraTableAdd: @handleExtraTableAdd
      onExtraTableRemove: @handleExtraTableRemove

  renderIssues: ->
    R IssuesListComponent,
      schema: @props.schema
      client: @props.client
      apiUrl: @props.apiUrl
      user: @props.user
      onChange: @handleTableChange
      extraTables: @props.extraTables
      onExtraTableAdd: @handleExtraTableAdd
      onExtraTableRemove: @handleExtraTableRemove

  renderOther: ->
    otherTables = _.filter(@props.schema.getTables(), (table) => 
      # Remove deprecated
      if table.deprecated
        return false

      # Remove sites
      if table.id in siteTypes
        return false

      # Remove responses
      if table.id.match(/^responses:/)
        return false

      # Remove indicators
      if table.id.match(/^indicator_values:/)
        return false

      # Remove issues
      if table.id.match(/^(issues|issue_events):/)
        return false

      return true
    )

    otherTables = _.sortBy(otherTables, (table) -> table.name.en)
    R uiComponents.OptionListComponent,
      items: _.map(otherTables, (table) =>
        return { 
          name: ExprUtils.localizeString(table.name, @context.locale)
          desc: ExprUtils.localizeString(table.desc, @context.locale)
          onClick: @handleChange.bind(null, table.id) 
        })

  render: ->
    editor = H.div null,
      # Show message if loading
      if @state.pendingExtraTable
        H.div className: "alert alert-info", key: "pendingExtraTable",
          H.i className: "fa fa-spinner fa-spin"
          "\u00a0Please wait..."

      H.div className: "text-muted",
        "Select data from sites, surveys or an advanced category below. Indicators can be found within their associated site types."

      R TabbedComponent,
        tabs: [
          { id: "sites", label: [H.i(className: "fa fa-map-marker"), " Sites"], elem: @renderSites() }
          { id: "forms", label: [H.i(className: "fa fa-th-list"), " Surveys"], elem: @renderForms() }
          { id: "indicators", label: [H.i(className: "fa fa-check-circle"), " Indicators"], elem: @renderIndicators() }
          { id: "issues", label: [H.i(className: "fa fa-exclamation-circle"), " Issues"], elem: @renderIssues() }
          { id: "other", label: "Advanced", elem: @renderOther() }
        ]
        initialTabId: "sites"

    H.div null,
      R uiComponents.ToggleEditComponent,
        ref: "toggleEdit"
        forceOpen: not @props.table # Must have table
        label: if @props.table then ExprUtils.localizeString(@props.schema.getTable(@props.table)?.name, @context.locale) else ""
        editor: editor
      if @props.table and @props.onFilterChange and @props.table.match(/^responses:/)
        R MWaterResponsesFilterComponent, 
          schema: @props.schema
          table: @props.table
          filter: @props.filter
          onFilterChange: @props.onFilterChange

# Searchable list of forms
class FormsListComponent extends React.Component
  @propTypes:
    apiUrl: PropTypes.string.isRequired # Url to hit api
    client: PropTypes.string            # Optional client
    schema: PropTypes.object.isRequired
    user: PropTypes.string              # User id
    onChange: PropTypes.func.isRequired # Called with table selected
    extraTables: PropTypes.array.isRequired
    onExtraTableAdd: PropTypes.func.isRequired
    onExtraTableRemove: PropTypes.func.isRequired

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

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
        (form) => if "responses:" + form._id in (@props.extraTables or []) then 1 else 0
        (form) => if form.created.by == @props.user then 1 else 0
        (form) => form.modified.on
        ], ['desc', 'desc', 'desc'])

      # TODO use name instead of design.name
      @setState(forms: _.map(forms, (form) => { 
        id: form._id
        name: ExprUtils.localizeString(form.design.name, @context.locale)
        # desc: "Created by #{form.created.by}" 
        desc: "Modified #{moment(form.modified.on, moment.ISO_8601).format("ll")}"
      }))
    .fail (xhr) =>
      @setState(error: xhr.responseText)

  handleTableAdd: (tableId) =>
    @props.onExtraTableAdd(tableId)

  handleTableRemove: (table) =>
    if confirm("Remove #{ExprUtils.localizeString(table.name, @context.locale)}? Any widgets that depend on it will no longer work properly.")
      @props.onExtraTableRemove(table.id)

  searchRef: (comp) =>
    # Focus
    if comp
      comp.focus()

  render: ->
    if @state.error
      return H.div className: "alert alert-danger", @state.error

    # Filter forms
    if @state.search
      escapeRegExp = (s) ->
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

      searchStringRegExp = new RegExp(escapeRegExp(@state.search), "i")

      forms = _.filter(@state.forms, (form) => form.name.match(searchStringRegExp))
    else
      forms = @state.forms

    # Remove if already included
    forms = _.filter(forms, (f) => "responses:#{f.id}" not in (@props.extraTables or []))

    tables = _.filter(@props.schema.getTables(), (table) => (table.id.match(/^responses:/) or table.id.match(/^master_responses:/)) and not table.deprecated)
    tables = _.sortBy(tables, (t) -> t.name.en)

    H.div null,
      H.label null, "Included Surveys:"
      if tables.length > 0
        R uiComponents.OptionListComponent,
          items: _.map(tables, (table) =>
            return { 
              name: ExprUtils.localizeString(table.name, @context.locale)
              desc: ExprUtils.localizeString(table.desc, @context.locale)
              onClick: @props.onChange.bind(null, table.id) 
              onRemove: @handleTableRemove.bind(null, table)
            }
          )
      else
        H.div null, "None"

      H.br()

      H.label null, "All Surveys:"
      if not @state.forms or @state.forms.length == 0
        H.div className: "alert alert-info", 
          H.i className: "fa fa-spinner fa-spin"
          "\u00A0Loading..."
      else
        [
          H.input 
            type: "text"
            className: "form-control input-sm"
            placeholder: "Search..."
            key: "search"
            ref: @searchRef
            style: { maxWidth: "20em", marginBottom: 10 }
            value: @state.search
            onChange: (ev) => @setState(search: ev.target.value)

          R uiComponents.OptionListComponent,
            items: _.map(forms, (form) => { 
              name: form.name
              desc: form.desc
              onClick:  @props.onChange.bind(null, "responses:" + form.id)
            })
        ]

# Searchable list of indicators
class IndicatorsListComponent extends React.Component
  @propTypes:
    apiUrl: PropTypes.string.isRequired # Url to hit api
    client: PropTypes.string            # Optional client
    schema: PropTypes.object.isRequired
    user: PropTypes.string              # User id
    onChange: PropTypes.func.isRequired # Called with table selected
    extraTables: PropTypes.array.isRequired
    onExtraTableAdd: PropTypes.func.isRequired
    onExtraTableRemove: PropTypes.func.isRequired

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: ->
    super
    @state = { 
      indicators: null 
      search: ""
    }

  componentDidMount: ->
    # Get names and basic of forms
    query = {}
    query.fields = JSON.stringify({ "design.name": 1, "design.desc": 1, "design.recommended": 1 , deprecated: 1 })
    query.client = @props.client

    # Get list of all indicator names
    $.getJSON @props.apiUrl + "indicators?" + querystring.stringify(query), (indicators) => 
      # Remove deprecated
      indicators = _.filter(indicators, (indicator) -> not indicator.deprecated)
      
      # Sort by name
      indicators = _.sortByOrder(indicators, [
        (indicator) => if "indicator_values:" + indicator._id in (@props.extraTables or []) then 0 else 1
        (indicator) => if indicator.design.recommended then 0 else 1
        (indicator) => ExprUtils.localizeString(indicator.design.name, @context.locale)
        ], ['asc', 'asc', 'asc'])

      @setState(indicators: _.map(indicators, (indicator) => { 
        id: indicator._id
        name: ExprUtils.localizeString(indicator.design.name, @context.locale)
        desc: ExprUtils.localizeString(indicator.design.desc, @context.locale)
      }))
    .fail (xhr) =>
      @setState(error: xhr.responseText)

  handleTableAdd: (tableId) =>
    @props.onExtraTableAdd(tableId)

  handleTableRemove: (table) =>
    if confirm("Remove #{ExprUtils.localizeString(table.name, @context.locale)}? Any widgets that depend on it will no longer work properly.")
      @props.onExtraTableRemove(table.id)

  searchRef: (comp) =>
    # Focus
    if comp
      comp.focus()

  render: ->
    if @state.error
      return H.div className: "alert alert-danger", @state.error

    # Filter indicators
    if @state.search
      escapeRegExp = (s) ->
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

      searchStringRegExp = new RegExp(escapeRegExp(@state.search), "i")

      indicators = _.filter(@state.indicators, (indicator) => indicator.name.match(searchStringRegExp))
    else
      indicators = @state.indicators

    # Remove if already included
    indicators = _.filter(indicators, (f) => "indicator_values:#{f.id}" not in (@props.extraTables or []))

    tables = _.filter(@props.schema.getTables(), (table) => table.id.match(/^indicator_values:/) and not table.deprecated)
    tables = _.sortBy(tables, (t) -> t.name.en)

    H.div null,
      H.label null, "Included Indicators:"
      if tables.length > 0
        R uiComponents.OptionListComponent,
          items: _.map(tables, (table) =>
            return { 
              name: ExprUtils.localizeString(table.name, @context.locale)
              desc: ExprUtils.localizeString(table.desc, @context.locale)
              onClick: @props.onChange.bind(null, table.id) 
              onRemove: @handleTableRemove.bind(null, table)
            }
          )
      else
        H.div null, "None"

      H.br()

      H.label null, "All Indicators:"
      if not @state.indicators or @state.indicators.length == 0
        H.div className: "alert alert-info", 
          H.i className: "fa fa-spinner fa-spin"
          "\u00A0Loading..."
      else
        [
          H.input 
            type: "text"
            className: "form-control input-sm"
            placeholder: "Search..."
            key: "search"
            ref: @searchRef
            style: { maxWidth: "20em", marginBottom: 10 }
            value: @state.search
            onChange: (ev) => @setState(search: ev.target.value)

          R uiComponents.OptionListComponent,
            items: _.map(indicators, (indicator) => { 
              name: indicator.name
              desc: indicator.desc
              onClick:  @props.onChange.bind(null, "indicator_values:" + indicator.id)
            })
        ]


# Searchable list of issue types
class IssuesListComponent extends React.Component
  @propTypes:
    apiUrl: PropTypes.string.isRequired # Url to hit api
    client: PropTypes.string            # Optional client
    schema: PropTypes.object.isRequired
    user: PropTypes.string              # User id
    onChange: PropTypes.func.isRequired # Called with table selected
    extraTables: PropTypes.array.isRequired
    onExtraTableAdd: PropTypes.func.isRequired
    onExtraTableRemove: PropTypes.func.isRequired

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: ->
    super
    @state = { 
      issueTypes: null 
      search: ""
    }

  componentDidMount: ->
    # Get names and basic of issueTypes
    query = {}
    query.fields = JSON.stringify({ name: 1, desc: 1, roles: 1, created: 1, modified: 1 })
    query.client = @props.client

    # Get list of all issueType names
    $.getJSON @props.apiUrl + "issue_types?" + querystring.stringify(query), (issueTypes) => 
      
      # Sort by modified.on desc but first by user
      issueTypes = _.sortByOrder(issueTypes, [
        (issueType) => if "issues:" + issueType._id in (@props.extraTables or []) then 0 else 1
        (issueType) => if issueType.created.by == @props.user then 0 else 1
        (issueType) => ExprUtils.localizeString(issueType.name, @context.locale)
        ], ['asc', 'asc', 'asc'])

      @setState(issueTypes: _.map(issueTypes, (issueType) => { 
        id: issueType._id
        name: ExprUtils.localizeString(issueType.name, @context.locale)
        desc: ExprUtils.localizeString(issueType.desc, @context.locale)
      }))
    .fail (xhr) =>
      @setState(error: xhr.responseText)

  handleTableAdd: (tableId) =>
    @props.onExtraTableAdd(tableId)

  handleTableRemove: (table) =>
    if confirm("Remove #{ExprUtils.localizeString(table.name, @context.locale)}? Any widgets that depend on it will no longer work properly.")
      @props.onExtraTableRemove(table.id)

  searchRef: (comp) =>
    # Focus
    if comp
      comp.focus()

  render: ->
    if @state.error
      return H.div className: "alert alert-danger", @state.error

    # Filter issueTypes
    if @state.search
      escapeRegExp = (s) ->
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

      searchStringRegExp = new RegExp(escapeRegExp(@state.search), "i")

      issueTypes = _.filter(@state.issueTypes, (issueType) => issueType.name.match(searchStringRegExp))
    else
      issueTypes = @state.issueTypes

    # Remove if already included
    issueTypes = _.filter(issueTypes, (f) => "issues:#{f.id}" not in (@props.extraTables or []))

    tables = _.filter(@props.schema.getTables(), (table) => (table.id.match(/^issues:/) or table.id.match(/^issue_events:/)) and not table.deprecated)
    tables = _.sortBy(tables, (t) -> t.name.en)

    H.div null,
      H.label null, "Included Issues:"
      if tables.length > 0
        R uiComponents.OptionListComponent,
          items: _.map(tables, (table) =>
            return { 
              name: ExprUtils.localizeString(table.name, @context.locale)
              desc: ExprUtils.localizeString(table.desc, @context.locale)
              onClick: @props.onChange.bind(null, table.id) 
              onRemove: @handleTableRemove.bind(null, table)
            }
          )
      else
        H.div null, "None"

      H.br()

      H.label null, "All Issues:"
      if not @state.issueTypes or @state.issueTypes.length == 0
        H.div className: "alert alert-info", 
          H.i className: "fa fa-spinner fa-spin"
          "\u00A0Loading..."
      else
        [
          H.input 
            type: "text"
            className: "form-control input-sm"
            placeholder: "Search..."
            key: "search"
            ref: @searchRef
            style: { maxWidth: "20em", marginBottom: 10 }
            value: @state.search
            onChange: (ev) => @setState(search: ev.target.value)

          R uiComponents.OptionListComponent,
            items: _.map(issueTypes, (issueType) => { 
              name: issueType.name
              desc: issueType.desc
              onClick:  @props.onChange.bind(null, "issues:" + issueType.id)
            })
        ]
