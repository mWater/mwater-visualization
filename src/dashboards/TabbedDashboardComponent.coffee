_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

DashboardComponent = require './DashboardComponent'
TabbedComponent = require('react-library/lib/TabbedComponent')

# Multiple tabbed dashboards. Uses only direct dashboard data source which it creates internally.
module.exports = class TabbedDashboard extends React.Component
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired
    client: React.PropTypes.string

    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func               # If not set, readonly
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired

  handleDesignChange: (index, design) =>
    tabs = @props.design.tabs.slice()
    tabs[index] = _.extend({}, tabs[index], design: design)
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleAddTab: =>
    tabs = @props.design.tabs.slice()

    # Add new dashboard
    tabs.push({ name: "Untitled", design: { items: {} } })
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleRemoveTab: (index) =>
    if not confirm("Permanently remove this tab? This cannot be undone!")
      return

    tabs = @props.design.tabs.slice()
    tabs.splice(index, 1)
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleRenameTab: (index) =>
    name = @props.design.tabs[index].name
    name = prompt("Name of tab", name)
    if name
      tabs = @props.design.tabs.slice()
      tabs[index] = _.extend({}, tabs[index], name: name)
      @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  createTab: (tab, index) =>
    return {
      id: "#{index}"
      label: tab.name
      elem: R(DashboardComponent, 
        design: tab.design
        onDesignChange: if @props.onDesignChange then @handleDesignChange.bind(null, index)
        schema: @props.schema
        dataSource: @props.dataSource
        dashboardDataSource: new DirectDashboardDataSource({
          schema: @props.schema
          dataSource: @props.dataSource
          design: tab.design
          apiUrl: @props.apiUrl
          client: @props.client
        })
        extraTitleButtonsElem: if @props.onDesignChange then [
          H.a key: "renametab", className: "btn btn-link btn-sm", onClick: @handleRenameTab.bind(null, index),
            H.span className: "glyphicon glyphicon-pencil"
            " Rename Tab"
          " "
          H.a key: "removetab", className: "btn btn-link btn-sm", onClick: @handleRemoveTab.bind(null, index),
            H.span className: "glyphicon glyphicon-remove"
            " Remove Tab"
        ]
      )
    }

  createTabs: ->
    return _.map(@props.design.tabs, @createTab)

  render: ->
    R(TabbedComponent,
      tabs: @createTabs()
      initialTabId: "0"
      onAddTab: if @props.onDesignChange then @handleAddTab
      )
