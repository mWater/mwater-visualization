PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

moment = require 'moment'

ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
querystring = require 'querystring'
ExprUtils = require('mwater-expressions').ExprUtils
ui = require './UIComponents'
formUtils = require('mwater-forms/lib/formUtils') # TODO requireing this directly because of bizarre backbone issue

# Link that when clicked popup up a modal window allowing user to select a form
# with an Entity/Site question to the extraTables
module.exports = class MWaterAddRelatedFormComponent extends React.Component
  @propTypes:
    table: PropTypes.string.isRequired
    apiUrl: PropTypes.string.isRequired
    client: PropTypes.string
    user: PropTypes.string                # User id
    onSelect: PropTypes.func.isRequired   # Called with table id e.g. responses:someid
    schema: PropTypes.object.isRequired   

  constructor: ->
    super

    @state = { 
      open: false
      waitingForTable: null  # Set to table id that is being waited for as the result of being selected
    }

  componentWillReceiveProps: (nextProps) ->
    # If waiting and table has arrived, cancel waiting
    if @state.waitingForTable and nextProps.schema.getTable(@state.waitingForTable)
      @setState(waitingForTable: null)

  handleOpen: =>
    @setState(open: true)

  handleSelect: (table) =>
    @setState(open: false)

    # Wait for table if not in schema
    if not @props.schema.getTable(table)
      @setState(waitingForTable: table)

    @props.onSelect(table)

  render: ->
    R 'div', null,
      if @state.waitingForTable
        R 'div', null,
          R 'i', className: "fa fa-spin fa-spinner"
          " Adding..."
      else 
        R 'a', className: "btn btn-link", onClick: @handleOpen,
          "+ Add Related Survey"
      if @state.open
        R AddRelatedFormModalComponent,
          table: @props.table
          apiUrl: @props.apiUrl
          client: @props.client
          user: @props.user
          onSelect: @handleSelect
          onCancel: => @setState(open: false)


# Actual modal that displays the 
class AddRelatedFormModalComponent extends React.Component
  @propTypes:
    table: PropTypes.string.isRequired
    apiUrl: PropTypes.string.isRequired
    client: PropTypes.string
    user: PropTypes.string              # User id
    onSelect: PropTypes.func.isRequired   # Called with table id e.g. responses:someid
    onCancel: PropTypes.func.isRequired   # When modal is closed

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: ->
    super
    @state = { 
      items: null 
      search: ""
    }

  componentDidMount: ->
    # Get all forms visible to user
    query = {}
    query.selector = JSON.stringify({ state: { $ne: "deleted" } })
    if @props.client
      query.client = @props.client

    # Get list of all form names
    $.getJSON @props.apiUrl + "forms?" + querystring.stringify(query), (forms) => 
      # Sort by modified.on desc but first by user
      forms = _.sortByOrder(forms, [
        (form) => if form.created.by == @props.user then 1 else 0
        (form) => form.modified.on
        ], ['desc', 'desc'])

      # Filter by Entity and Site questions of tableId type
      forms = _.filter(forms, (form) => formUtils.findEntityQuestion(form.design, @props.table.split(".")[1]))

      # Get _id, name, and description
      items = _.map(forms, (form) => { 
        name: ExprUtils.localizeString(form.design.name, @context.locale)
        desc: "Modified #{moment(form.modified.on, moment.ISO_8601).format("ll")}"
        onClick: @props.onSelect.bind(null, "responses:" + form._id) 
      })

      @setState(items: items)
    .fail (xhr) =>
      @setState(error: xhr.responseText)

  renderContents: ->
    if not @state.items
      return R 'div', className: "alert alert-info",
        R 'i', className: "fa fa-spin fa-spinner"
        " Loading..."

    items = @state.items

    # Filter by search
    if @state.search
      searchStringRegExp = new RegExp(escapeRegex(@state.search), "i")
      items = _.filter(items, (item) => item.name.match(searchStringRegExp))

    R 'div', null,
      R 'input', 
        type: "text"
        className: "form-control"
        placeholder: "Search..."
        key: "search"
        ref: @searchRef
        style: { marginBottom: 10 }
        value: @state.search
        onChange: (ev) => @setState(search: ev.target.value)

      R ui.OptionListComponent,
        items: items

  render: ->
    R ModalPopupComponent,
      showCloseX: true
      onClose: @props.onCancel
      header: "Add Related Survey",
        @renderContents()

escapeRegex = (s) -> s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')