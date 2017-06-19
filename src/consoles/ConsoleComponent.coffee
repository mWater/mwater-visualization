PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'uuid'

# Console component that displays a console as a series of tabs
module.exports = class ConsoleComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired          # See README.md
    onDesignChange: PropTypes.func               # If not set, readonly
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    consoleDataSource: PropTypes.object.isRequired # console data source

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  constructor: (props) ->
    super(props)

    @state = {
      tabId: null     # Current tab
    }

  componentWillMount: ->
    # Select first tab
    if @props.design.tabs[0]
      @setState(tabId: @props.design.tabs[0].id)

  componentWillReceiveProps: (nextProps) ->
    # TODO select tab if none selected

  handleAddTab: =>
    tabs = @props.design.tabs.concat([{ id: uuid(), type: "blank", name: "New Tab" }])
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))
    @setState(tabId: _.last(tabs).id)

  handleTabClick: (tab) =>
    @setState(tabId: tab.id)

  handleTabRemove: (tab, ev) =>
    # Prevent tab click from hitting
    ev.stopPropagation()

    # Find index of tab being removed
    tabIndex = _.indexOf(@props.design.tabs, tab)

    tabs = _.without(@props.design.tabs, tab)

    # Add blank if none left
    if tabs.length == 0
      tabs.push({ id: uuid(), type: "blank", name: "New Tab" })

    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

    # Select same index or one before if not possible
    selectedTab = tabs[tabIndex] or tabs[tabIndex - 1]
    @setState(tabId: selectedTab.id)

  renderTab: (tab) =>
    H.li key: tab.id, className: (if @state.tabId == tab.id then "active"),
      H.a onClick: @handleTabClick.bind(null, tab),
        tab.name
        # Don't allow deleting only blank tab
        if @props.design.tabs.length > 1 or tab.type != "blank"
          H.button type: "button", className: "btn btn-xs btn-link", onClick: @handleTabRemove.bind(null, tab),
            H.span className: "fa fa-times"

  renderTabs: ->
    H.ul key: "tabs", className: "nav nav-tabs", style: { marginBottom: 10 },
      _.map(@props.design.tabs, @renderTab)
      H.li key: "_add", 
        H.a onClick: @handleAddTab,
          H.span className: "glyphicon glyphicon-plus"

  render: ->
    if @props.tabId?
      tabId = @props.tabId
    else
      tabId =  @state.tabId
    currentTab = _.findWhere(@props.tabs, id: tabId)

    H.div style: { height: "100%", paddingTop: 40, position: "relative" },
      @renderTabs()
      H.div style: { height: "100%", backgroundColor: "blue" }
