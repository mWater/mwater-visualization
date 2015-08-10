React = require 'react'
H = React.DOM

# Simple bootstrap tabbed component
module.exports = class TabbedComponent extends React.Component
  @propTypes:
    tabs: React.PropTypes.array.isRequired # Array of { id, label, elem }
    initialTabId: React.PropTypes.string # Initially selected id of tab

  constructor: ->
    super
    @state = { tabId: @props.initialTabId }

  handleClick: (tabId) =>
    @setState(tabId: tabId)

  renderTab: (tab) =>
    H.li key: tab.id, className: (if @state.tabId == tab.id then "active"),
      H.a onClick: @handleClick.bind(null, tab.id),
        tab.label

  render: ->
    currentTab = _.findWhere(@props.tabs, id: @state.tabId)

    H.div null,
      H.ul className: "nav nav-tabs", 
        _.map(@props.tabs, @renderTab)
      if currentTab
        currentTab.elem
