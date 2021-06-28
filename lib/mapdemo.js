// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
// React = require 'react'
// ReactDOM = require 'react-dom'
// R = React.createElement
// visualization_mwater = require './systems/mwater'
// visualization = require './index'
// uuid = require 'uuid'
// class MapDemoComponent extends React.Component
//   constructor: (props) ->
//     super
//     @state = { design: @props.initialDesign }
//   componentDidMount: ->
//     visualization_mwater.setup {
//       apiUrl: @props.apiUrl
//       client: @props.client
//       onMarkerClick: (table, id) => alert("#{table}:#{id}")
//     }, (err, results) =>
//       if err
//         throw err
//       @setState(schema: results.schema, widgetFactory: results.widgetFactory, dataSource: results.dataSource, layerFactory: results.layerFactory)
//   handleDesignChange: (design) =>
//     @setState(design: design)
//     console.log JSON.stringify(design, null, 2)
//   render: ->
//     if not @state.schema
//       return R 'div', null, "Loading..."
//     return R 'div', style: { height: "100%" },
//       R 'style', null, '''html, body { height: 100% }'''
//       React.createElement(visualization.MapComponent, {
//         layerFactory: @state.layerFactory
//         schema: @state.schema
//         dataSource: @state.dataSource
//         design: @state.design
//         onDesignChange: @handleDesignChange
//         })
// layerViews = []
// newLayers = []
// addServerLayerView = (options) ->
//   newLayers.push {
//     name: options.name
//     type: "MWaterServer"
//     design: {
//       type: options.type
//       table: "entities.water_point"
//       minZoom: options.minZoom
//       maxZoom: options.maxZoom
//     }
//   }
//   layerViews.push {
//     id: uuid()
//     name: options.name
//     visible: options.visible == true
//     opacity: 1
//     type: "MWaterServer"
//     group: options.group
//     design: {
//       type: options.type
//       table: "entities.water_point"
//       minZoom: options.minZoom
//       maxZoom: options.maxZoom
//     }
//   }
// addServerLayerView({ type: "safe_water_access", name: "Safe Water Access", group: "access", minZoom: 10 })
// addServerLayerView({ type: "water_access", name: "Functional Water Access", group: "access", minZoom: 10 })
// addServerLayerView({ type: "water_points_by_type", name: "Water Point Type", group: "points", visible: false })
// addServerLayerView({ type: "functional_status", name: "Functionality", group: "points" })
// addServerLayerView({ type: "ecoli_status", name: "E.Coli Level", group: "points" })
// newLayers.push {
//   name: "Custom Layer"
//   type: "Markers"
//   design: { }
// }
// layerViews.push {
//   "id": "9ff7edcd-1955-4986-b082-c5af71e4a089",
//   "name": "Custom Layer",
//   "desc": "",
//   "type": "Markers",
//   "design": {
//     "sublayers": [
//       {
//         "axes": {
//           "geometry": {
//             "expr": {
//               "type": "scalar",
//               "table": "entities.water_point",
//               "joins": [],
//               "expr": {
//                 "type": "field",
//                 "table": "entities.water_point",
//                 "column": "location"
//               }
//             }
//           }
//         },
//         "color": "#0088FF",
//         "filter": null,
//         "table": "entities.water_point"
//       }
//     ]
//   },
//   "visible": true,
//   "opacity": 1
// }
// design = {
//   baseLayer: "bing_road"
//   layerViews: layerViews
//   filters: {}
//   bounds: { w: 0, n: 0, e: 40, s: -25 }
// }
// $ ->
//   # sample = React.createElement(MapDemoComponent, initialDesign: design, apiUrl: "http://localhost:1234/v3/")
//   sample = React.createElement(MapDemoComponent, initialDesign: design, apiUrl: "https://api.mwater.co/v3/")
//   ReactDOM.render(sample, document.body)
