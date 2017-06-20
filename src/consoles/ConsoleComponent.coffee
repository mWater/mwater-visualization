PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'uuid'

BlankTabComponent = require './BlankTabComponent'
DashboardComponent = require '../dashboards/DashboardComponent'
MapComponent = require '../maps/MapComponent'
DatagridComponent = require '../datagrids/DatagridComponent'

# Console component that displays a console as a series of tabs
module.exports = class ConsoleComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired          # See README.md
    onDesignChange: PropTypes.func               # If not set, readonly
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    consoleDataSource: PropTypes.object.isRequired # console data source

    activeTabId: PropTypes.string.isRequired       # id of active tab
    onActiveTabIdChange: PropTypes.func.isRequired

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Check if expression of table row is editable
    # If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditValue: PropTypes.func             

    # Update table row expression with a new value
    # Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateValue: PropTypes.func

    customTabRenderer: PropTypes.func  # Renders a tab. Called with { tab:, onTabChange:, onTabAppend: }

  constructor: (props) ->
    super(props)

    @state = {
      openTabIds: []   # Track which tabs have been opened to render them and preserve state
    }

    if @props.activeTabId
      @state.openTabIds = [@props.activeTabId]

  componentWillReceiveProps: (nextProps) ->
    # Remove dead tabs
    openTabIds = _.intersection(@state.openTabIds, _.pluck(nextProps.design.tabs, "id"))

    # Add active tab
    if nextProps.activeTabId
      openTabIds = _.union(@state.openTabIds, [nextProps.activeTabId])

    # Sort
    openTabIds.sort()

    if not _.isEqual(openTabIds, @state.openTabIds)
      @setState(openTabIds: openTabIds)

  handleAddTab: =>
    tabs = @props.design.tabs.concat([{ id: uuid(), type: "blank", name: "New Tab" }])
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))
    @props.onActiveTabIdChange(_.last(tabs).id)

  handleTabClick: (tab) =>
    # If already on tab, rename
    if tab.id == @props.activeTabId
      name = window.prompt("Enter new name for tab", tab.name)
      if name
        newTab = _.extend({}, tab, name: name)
        @handleTabChange(tab, newTab)
      return

    @props.onActiveTabIdChange(tab.id)

  handleTabRemove: (tab, ev) =>
    # Prevent tab click from hitting
    ev.stopPropagation()

    if not confirm("Permanently delete tab?")
      return

    # Find index of tab being removed
    tabIndex = _.indexOf(@props.design.tabs, tab)

    tabs = _.without(@props.design.tabs, tab)

    # Add blank if none left
    if tabs.length == 0
      tabs.push({ id: uuid(), type: "blank", name: "New Tab" })

    # Select same index or one before if not possible
    selectedTab = tabs[tabIndex] or tabs[tabIndex - 1]
    @props.onActiveTabIdChange(selectedTab.id)

    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleTabDesignChange: (tab, design) =>
    # Find index of tab being changed
    tabIndex = _.indexOf(@props.design.tabs, tab)

    tabs = @props.design.tabs.slice()
    tabs[tabIndex] = _.extend({}, tab, design: design)

    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleTabChange: (tab, newTab) =>
    # Find index of tab being changed
    tabIndex = _.indexOf(@props.design.tabs, tab)

    tabs = @props.design.tabs.slice()
    tabs[tabIndex] = newTab

    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  # Appends a tab after the current tab
  handleTabAppend: (tab, newTab) =>
    # Find index of tab being changed
    tabIndex = _.indexOf(@props.design.tabs, tab)

    tabs = @props.design.tabs.slice()
    tabs.splice(tabIndex + 1, 0, newTab)

    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))
    @props.onActiveTabIdChange(newTab.id)

  renderTab: (tab) =>
    active = @props.activeTabId == tab.id
    H.li key: tab.id, className: (if active then "active"),
      H.a onClick: @handleTabClick.bind(null, tab), style: { cursor: (if active then "text" else "pointer") },
        tab.name
        # Don't allow deleting only blank tab
        if @props.design.tabs.length > 1 or tab.type != "blank"
          H.button type: "button", className: "btn btn-xs btn-link", onClick: @handleTabRemove.bind(null, tab),
            H.span className: "fa fa-times"

  renderTabs: ->
    H.ul key: "tabs", className: "nav nav-tabs", style: { marginBottom: 10, position: "absolute", top: 0, left: 0, right: 0 },
      _.map(@props.design.tabs, @renderTab)
      H.li key: "_add", 
        H.a onClick: @handleAddTab,
          H.span className: "glyphicon glyphicon-plus"

  # Render active tab contents
  renderContents: (tab) ->
    # First try custom tab renderer
    if @props.customTabRenderer
      contents = @props.customTabRenderer({
        tab: tab
        onTabChange: @handleTabChange.bind(null, tab)
        onTabAppend: @handleTabAppend.bind(null, tab)
      })

      if contents
        return contents

    switch tab.type
      when "blank"
        return R BlankTabComponent,
          tab: tab
          onTabChange: @handleTabChange.bind(null, tab)

      when "dashboard"
        return R DashboardComponent,
          design: tab.design
          onDesignChange: @handleTabDesignChange.bind(null, tab)
          schema: @props.schema
          dataSource: @props.dataSource
          dashboardDataSource: @props.consoleDataSource.getDashboardTabDataSource(tab.id)
          onRowClick: @props.onRowClick
          namedStrings: @props.namedStrings

      when "map"
        return R MapComponent,
          design: tab.design
          onDesignChange: @handleTabDesignChange.bind(null, tab)
          schema: @props.schema
          dataSource: @props.dataSource
          mapDataSource: @props.consoleDataSource.getMapTabDataSource(tab.id)
          onRowClick: @props.onRowClick
          namedStrings: @props.namedStrings

      when "datagrid"
        return R DatagridComponent,
          design: tab.design
          onDesignChange: @handleTabDesignChange.bind(null, tab)
          schema: @props.schema
          dataSource: @props.dataSource
          datagridDataSource: @props.consoleDataSource.getDatagridTabDataSource(tab.id)
          onRowDoubleClick: @props.onRowClick
          canEditValue: @props.canEditValue
          updateValue: @props.updateValue

      when "test" # TODO REMOVE
        return H.div null, "TEST"
      
      else 
        throw new Error("Unsupported tab type #{tab.type}")
    
  render: ->
    H.div style: { height: "100%", paddingTop: 45, position: "relative" },
      @renderTabs()
      _.map @state.openTabIds, (tabId) =>
        active = tabId == @props.activeTabId
        tab = _.findWhere(@props.design.tabs, id: tabId)
        if not tab
          return null

        # Wrap in key to ensure that different tabs have a new component
        return H.div style: { height: "100%", display: (if active then "block" else "none" ) }, key: tabId,
          @renderContents(tab)


