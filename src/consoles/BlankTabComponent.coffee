PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

module.exports = class BlankTabComponent extends React.Component
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
