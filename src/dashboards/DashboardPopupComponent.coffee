_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ModalWindowComponent = require 'react-library/lib/ModalWindowComponent'
ui = require 'react-library/lib/bootstrap'
update = require 'react-library/lib/update'
DashboardComponent = require './DashboardComponent'

# Displays a dashboard in a popup window when show is called.
# Holds state of extra filters and whether the popup is visible.
# Updates popups with changes if onPopupChange is passed
module.exports = class DashboardPopupComponent extends React.Component
  @propTypes:
    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func               # If not set, readonly
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    widgetDataSource: React.PropTypes.object.isRequired # widget data source for widget on which popup will be shown

    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Filters to add to the dashboard
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired    # id table to filter
      jsonql: React.PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  @defaultProps:
    popups: []

  constructor: ->
    super

    @state = {
      popupId: false
      extraFilters: null
    }

  # Show the popup with the specified id with extra filters appended to filters
  show: (popupId, extraFilters) ->
    @setState(popupId: popupId, extraFilters: extraFilters or [])

  handlePopupChange: (design) =>
    # Get popup
    popup = _.findWhere(@props.popups, id: @state.popupId)

    # Set design
    popup = _.extend({}, popup, design: design)

    # Update popup
    popupIndex = _.findIndex(@props.popups, { id: @state.popupId })
    popups = @props.popups.slice()
    popups[popupIndex] = popup

    @props.onPopupsChange(popups)

  render: ->
    if not @state.popupId
      return null

    filters = (@props.filters or []).concat(@state.extraFilters)

    # Get popup
    popup = _.findWhere(@props.popups, id: @state.popupId)
    if not popup
      return null

    R ModalWindowComponent, 
      onRequestClose: => @setState(popupId: null)
      isOpen: true,
        R DashboardComponent, {
          schema: @props.schema
          dataSource: @props.dataSource
          dashboardDataSource: @props.widgetDataSource.getPopupDashboardDataSource(popup.id)
          design: popup.design
          onDesignChange: if @props.onPopupsChange then @handlePopupChange
          filters: filters
          onSystemAction: @props.onSystemAction
          namedStrings: @props.namedStrings
          popups: @props.popups
          onPopupsChange: @props.onPopupsChange
        }


