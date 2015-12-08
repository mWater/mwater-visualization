React = require 'react'
H = React.DOM
R = React.createElement
ReactSelect = require 'react-select'
querystring = require 'querystring'
TabbedComponent = require('mwater-visualization').TabbedComponent
ToggleEditComponent = require('mwater-visualization').ToggleEditComponent
OptionListComponent = require('mwater-visualization').OptionListComponent

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

  handleChange: (tableId) =>
    # Close toggle edit
    @refs.toggleEdit.close()
    @props.onChange(tableId)

  renderSites: ->
    R OptionListComponent,
      items: _.map(siteTypes, (tableId) =>
        table = @props.schema.getTable(tableId)
        return { name: table.name, desc: table.desc, onClick: @handleChange.bind(null, table.id) }
      )

  renderForms: ->
    R FormsListComponent,
      schema: @props.schema
      client: @props.client
      apiUrl: @props.apiUrl
      user: @props.user
      onChange: @handleChange

  renderOther: ->
    otherTables = _.filter(@props.schema.getTables(), (table) => table.id not in siteTypes and not table.id.match(/^responses:/))
    otherTables = _.sortBy(otherTables, "name")
    R OptionListComponent,
      items: _.map(otherTables, (table) =>
        return { name: table.name, desc: table.desc, onClick: @handleChange.bind(null, table.id) }
      )

  render: ->
    editor = R TabbedComponent,
      tabs: [
        { id: "sites", label: "Sites", elem: @renderSites() }
        { id: "forms", label: "Forms", elem: @renderForms() }
        { id: "other", label: "Other", elem: @renderOther() }
      ]
      initialTabId: "sites"

    R ToggleEditComponent,
      ref: "toggleEdit"
      forceOpen: not @props.table # Must have table
      label: if @props.table then @props.schema.getTable(@props.table).name
      editor: editor


class FormsListComponent extends React.Component
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired # Url to hit api
    client: React.PropTypes.string            # Optional client
    schema: React.PropTypes.object.isRequired
    user: React.PropTypes.string
    onChange: React.PropTypes.func.isRequired # Called with table selected

  constructor: ->
    super
    @state = { 
      forms: null 
      search: ""
    }

  componentDidMount: ->
    # Get names and basic of forms
    query = {}
    query.fields = JSON.stringify({ "design.name": 1, roles: 1, created: 1, modified: 1, state: 1 })
    query.selector = JSON.stringify({ design: { $exists: true }, state: { $ne: "deleted" } })
    query.client = @props.client

    # Get list of all form names
    $.getJSON @props.apiUrl + "forms?" + querystring.stringify(query), (forms) => 
      
      # Sort by modified.on desc but first by user
      forms = _.sortByOrder(forms, [
        (form) => if form.created.by == @props.user then 1 else 0
        (form) => form.modified.on
        ], ['desc', 'desc'])

      # TODO use name instead of design.name
      @setState(forms: _.map(forms, (form) -> { id: "responses:" + form._id, name: form.design.name[form.design.name._base or "en"] or "", desc: "Created by #{form.created.by}" }))
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

    H.div null,
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
        items: _.map(forms, (form) => { name: form.name, desc: form.desc, onClick: @props.onChange.bind(null, form.id) })

