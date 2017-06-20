PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'uuid'

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
    # If already on tab, rename
    if tab.id == @state.tabId
      name = window.prompt("Enter new name for tab", tab.name)
      if name
        newTab = _.extend({}, tab, name: name)
        @handleTabChange(tab, newTab)
      return

    @setState(tabId: tab.id)

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

    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

    # Select same index or one before if not possible
    selectedTab = tabs[tabIndex] or tabs[tabIndex - 1]
    @setState(tabId: selectedTab.id)

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
    @setState(tabId: newTab.id)

  renderTab: (tab) =>
    active = @state.tabId == tab.id
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
    currentTab = _.findWhere(@props.design.tabs, id: @state.tabId)

    H.div style: { height: "100%", paddingTop: 45, position: "relative" },
      @renderTabs()
      if currentTab
        @renderContents(currentTab)

class BlankTabComponent extends React.Component
  render: ->
    H.div null,
      H.div style: { padding: 10 },
        H.a 
          onClick: (=> @props.onTabChange({ id: @props.tab.id, name: "New Dashboard", type: "dashboard", design: { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" }})),
            "New Dashboard"
      H.div style: { padding: 10 },
        H.a 
          onClick: (=> @props.onTabChange({ id: @props.tab.id, name: "New Map", type: "map", design: {
            baseLayer: "cartodb_positron"
            layerViews: []
            filters: {}
            bounds: { w: -130.60546875, n: 65.87472467098549, e: 52.55859375, s: -56.26776108757582 }
           }})),
            "New Map"
      H.div style: { padding: 10 },
        H.a 
          onClick: (=> @props.onTabChange({ id: @props.tab.id, name: "New Datagrid", type: "datagrid", design: {}})),
            "New Datagrid"
