_ = require 'lodash'
$ = require 'jquery'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
querystring = require 'querystring'
TabbedComponent = require('react-library/lib/TabbedComponent')
uiComponents = require './UIComponents'
ExprUtils = require("mwater-expressions").ExprUtils
moment = require 'moment'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')

sitesOrder = {
  "entities.water_point": 1
  "entities.sanitation_facility": 2
  "entities.household": 3
  "entities.community": 4
  "entities.school": 5
  "entities.health_facility": 6
  "entities.place_of_worship": 7
  "entities.water_system": 8
  "entities.water_system_component": 9
  "entities.wastewater_treatment_system": 10
  "entities.waste_disposal_site": 11
}

# Allows selection of a table. Is the complete list mode of tables
module.exports = class MWaterCompleteTableSelectComponent extends React.Component
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

  handleExtraTableAdd: (tableId) =>
    @props.onExtraTablesChange(_.union(@props.extraTables, [tableId]))

  handleExtraTableRemove: (tableId) =>
    # Set to null if current table
    if @props.table == tableId
      @props.onChange(null)

    @props.onExtraTablesChange(_.without(@props.extraTables, tableId))

  renderSites: ->
    types = []

    for table in @props.schema.getTables()
      if table.deprecated
        continue

      if not table.id.match(/^entities\./)
        continue
    
      types.push(table.id)
    
    # Sort by order if present
    types = _.sortBy(types, (type) -> sitesOrder[type] or 999)

    R uiComponents.OptionListComponent,
      items: _.compact(_.map(types, (tableId) =>
        table = @props.schema.getTable(tableId)
        return { name: ExprUtils.localizeString(table.name, @context.locale), desc: ExprUtils.localizeString(table.desc, @context.locale), onClick: @props.onChange.bind(null, table.id) }
      ))

  renderForms: ->
    R FormsListComponent,
      schema: @props.schema
      client: @props.client
      apiUrl: @props.apiUrl
      user: @props.user
      onChange: @props.onChange
      extraTables: @props.extraTables
      onExtraTableAdd: @handleExtraTableAdd
      onExtraTableRemove: @handleExtraTableRemove

  renderIndicators: ->
    R IndicatorsListComponent,
      schema: @props.schema
      client: @props.client
      apiUrl: @props.apiUrl
      user: @props.user
      onChange: @props.onChange
      extraTables: @props.extraTables
      onExtraTableAdd: @handleExtraTableAdd
      onExtraTableRemove: @handleExtraTableRemove

  renderIssues: ->
    R IssuesListComponent,
      schema: @props.schema
      client: @props.client
      apiUrl: @props.apiUrl
      user: @props.user
      onChange: @props.onChange
      extraTables: @props.extraTables
      onExtraTableAdd: @handleExtraTableAdd
      onExtraTableRemove: @handleExtraTableRemove
    
  renderSweetSense: ->
    sweetSenseTables = @getSweetSenseTables()

    sweetSenseTables = _.sortBy(sweetSenseTables, (table) -> table.name.en)
    R uiComponents.OptionListComponent,
      items: _.map(sweetSenseTables, (table) =>
        return { 
          name: ExprUtils.localizeString(table.name, @context.locale)
          desc: ExprUtils.localizeString(table.desc, @context.locale)
          onClick: @props.onChange.bind(null, table.id) 
        })

  renderOther: ->
    otherTables = _.filter(@props.schema.getTables(), (table) => 
      # Remove deprecated
      if table.deprecated
        return false

      # Remove sites
      if table.id.match(/^entities\./)
        return false

      # sweetsense tables
      if table.id.match(/^sweetsense/)
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
          onClick: @props.onChange.bind(null, table.id) 
        })

  getSweetSenseTables: ->
    _.filter(@props.schema.getTables(), (table) => 
      if table.deprecated
        return false

      if table.id.match(/^sweetsense/)
        return true
      
      return false
    )

  render: ->
    sweetSenseTables = @getSweetSenseTables()
     
    tabs = [
      { id: "sites", label: [R('i', className: "fa fa-map-marker"), " Sites"], elem: @renderSites() }
      { id: "forms", label: [R('i', className: "fa fa-th-list"), " Surveys"], elem: @renderForms() }
      { id: "indicators", label: [R('i', className: "fa fa-check-circle"), " Indicators"], elem: @renderIndicators() }
      { id: "issues", label: [R('i', className: "fa fa-exclamation-circle"), " Issues"], elem: @renderIssues() }
    ]

    if sweetSenseTables.length > 0
      tabs.push({ id: "sensors", label: " Sensors", elem: @renderSweetSense() })
    
    tabs.push({ id: "other", label: "Advanced", elem: @renderOther() })

    return R 'div', null,
      R 'div', className: "text-muted",
        "Select data from sites, surveys or an advanced category below. Indicators can be found within their associated site types."

      R TabbedComponent,
        tabs: tabs
        initialTabId: "sites"



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

  constructor: (props) ->
    super(props)
    @state = { 
      forms: null 
      search: ""
    }

  componentDidMount: ->
    # Get names and basic of forms
    query = {}
    query.fields = JSON.stringify({ "design.name": 1, "design.description": 1, roles: 1, created: 1, modified: 1, state: 1, isMaster: 1 })
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
      @setState(forms: _.map(forms, (form) => 
        desc = ExprUtils.localizeString(form.design.description, @context.locale) or ""
        if desc
          desc += " - "
        desc += "Modified #{moment(form.modified.on, moment.ISO_8601).format("ll")}"

        return { 
          id: form._id
          name: ExprUtils.localizeString(form.design.name, @context.locale)
          desc: desc
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
      return R 'div', className: "alert alert-danger", @state.error

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

    R 'div', null,
      R 'label', null, "Included Surveys:"
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
        R 'div', null, "None"

      R('br')

      R 'label', null, "All Surveys:"
      if not @state.forms or @state.forms.length == 0
        R 'div', className: "alert alert-info", 
          R 'i', className: "fa fa-spinner fa-spin"
          "\u00A0Loading..."
      else
        [
          R 'input', 
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

  constructor: (props) ->
    super(props)
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

  handleSelect: (tableId) =>
    # Add table if not present
    if not @props.schema.getTable(tableId)
      @props.onExtraTableAdd(tableId)

    @addIndicatorConfirmPopup.show(tableId)

  render: ->
    if @state.error
      return R 'div', className: "alert alert-danger", @state.error

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

    R 'div', null,
      R AddIndicatorConfirmPopupComponent,
        schema: @props.schema
        onChange: @props.onChange
        onExtraTableAdd: @props.onExtraTableAdd
        ref: (c) => @addIndicatorConfirmPopup = c

      R 'label', null, "Included Indicators:"
      if tables.length > 0
        R uiComponents.OptionListComponent,
          items: _.map(tables, (table) =>
            return { 
              name: ExprUtils.localizeString(table.name, @context.locale)
              desc: ExprUtils.localizeString(table.desc, @context.locale)
              onClick: @handleSelect.bind(null, table.id) 
              onRemove: @handleTableRemove.bind(null, table)
            }
          )
      else
        R 'div', null, "None"

      R('br')

      R 'label', null, "All Indicators:"
      if not @state.indicators or @state.indicators.length == 0
        R 'div', className: "alert alert-info", 
          R 'i', className: "fa fa-spinner fa-spin"
          "\u00A0Loading..."
      else
        [
          R 'input', 
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
              onClick: @handleSelect.bind(null, "indicator_values:" + indicator.id)
            })
        ]

class AddIndicatorConfirmPopupComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    onChange: PropTypes.func.isRequired # Called with table selected
    onExtraTableAdd: PropTypes.func.isRequired

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super(props)
    @state = { 
      visible: false
      indicatorTable: null
    }

  show: (indicatorTable) ->
    @setState(visible: true, indicatorTable: indicatorTable)

  renderContents: ->
    # Show loading if table not loaded
    if not @props.schema.getTable(@state.indicatorTable)
      return R 'div', className: "alert alert-info", 
        R 'i', className: "fa fa-spinner fa-spin"
        "\u00A0Loading..."

    # Find entity links
    entityColumns = _.filter(@props.schema.getColumns(@state.indicatorTable), (col) => col.join?.toTable?.match(/^entities\./))

    R 'div', null,
      R 'p', null, 
        '''In general, it is better to get indicator values from the related site. Please select the site 
        below, then find the indicator values in the 'Related Indicators' section. Or click on 'Use Raw Indicator' if you 
        are certain that you want to use the raw indicator table'''

      R uiComponents.OptionListComponent,
        items: _.map(entityColumns, (entityColumn) => { 
          name: ExprUtils.localizeString(entityColumn.name, @context.locale)
          desc: ExprUtils.localizeString(entityColumn.desc, @context.locale)
          onClick: => 
            # Select table
            @props.onChange(entityColumn.join.toTable)
            @setState(visible: false)
        })

      R('br')

      R 'div', null,
        R 'a', onClick: @props.onChange.bind(null, @state.indicatorTable),
          "Use Raw Indicator"

  render: ->
    if not @state.visible
      return null

    R ModalPopupComponent,
      showCloseX: true
      onClose: => @setState(visible: false)
      header: "Add Indicator",
        @renderContents()


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

  constructor: (props) ->
    super(props)
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
      return R 'div', className: "alert alert-danger", @state.error

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

    R 'div', null,
      R 'label', null, "Included Issues:"
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
        R 'div', null, "None"

      R('br')

      R 'label', null, "All Issues:"
      if not @state.issueTypes or @state.issueTypes.length == 0
        R 'div', className: "alert alert-info", 
          R 'i', className: "fa fa-spinner fa-spin"
          "\u00A0Loading..."
      else
        [
          R 'input', 
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
