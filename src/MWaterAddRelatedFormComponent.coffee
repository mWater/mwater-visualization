_ = require 'lodash'
React = require 'react'
H = React.DOM
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
    table: React.PropTypes.string.isRequired
    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string
    user: React.PropTypes.string                # User id
    onSelect: React.PropTypes.func.isRequired   # Called with table id e.g. responses:someid
    schema: React.PropTypes.object.isRequired   

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
    H.div null,
      if @state.waitingForTable
        H.div null,
          H.i className: "fa fa-spin fa-spinner"
          " Adding..."
      else 
        H.a className: "btn btn-link", onClick: @handleOpen,
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
    table: React.PropTypes.string.isRequired
    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string
    user: React.PropTypes.string              # User id
    onSelect: React.PropTypes.func.isRequired   # Called with table id e.g. responses:someid
    onCancel: React.PropTypes.func.isRequired   # When modal is closed

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

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
      return H.div className: "alert alert-info",
        H.i className: "fa fa-spin fa-spinner"
        " Loading..."

    items = @state.items

    # Filter by search
    if @state.search
      searchStringRegExp = new RegExp(_.escapeRegExp(@state.search), "i")
      items = _.filter(items, (item) => item.name.match(searchStringRegExp))

    H.div null,
      H.input 
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

