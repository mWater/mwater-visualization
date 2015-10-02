H = React.DOM
visualization_mwater = require './systems/mwater'
visualization = require './index'

LayeredChart = require './widgets/charts/LayeredChart'
LayeredChartDesignerComponent = require './widgets/charts/LayeredChartDesignerComponent'

class TestPane extends React.Component
  constructor: (props) ->
    super

    @state = { }

  componentDidMount: ->
    visualization_mwater.setup { 
      apiUrl: @props.apiUrl
      client: @props.client
      onMarkerClick: (table, id) => alert("#{table}:#{id}")
      newLayers: [
        { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
        { name: "Custom Layer", type: "Markers", design: {} }
      ]
      onFormTableSelect: (id) -> alert(id)
    }, (err, results) =>
      if err
        throw err
  
      chart = new LayeredChart(schema: results.schema, dataSource: results.dataSource)
      design = chart.cleanDesign({})
        
      @setState(schema: results.schema, widgetFactory: results.widgetFactory, dataSource: results.dataSource, layerFactory: results.layerFactory, design: design)

  handleDesignChange: (design) =>
    chart = new LayeredChart(schema: @state.schema, dataSource: @state.dataSource)
    @setState(design: chart.cleanDesign(design))
    # console.log JSON.stringify(design, null, 2)
    
  render: ->
    if not @state.widgetFactory
      return H.div null, "Loading..."

    React.createElement(LayeredChartDesignerComponent, 
      design: @state.design
      schema: @state.schema
      dataSource: @state.dataSource
      onDesignChange: @handleDesignChange
    )

class DashboardPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: dashboardDesign
    }

  componentDidMount: ->
    visualization_mwater.setup { 
      apiUrl: @props.apiUrl
      client: @props.client
      onMarkerClick: (table, id) => alert("#{table}:#{id}")
      newLayers: [
        { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
        { name: "Custom Layer", type: "Markers", design: {} }
      ]
      onFormTableSelect: (id) -> alert(id)
    }, (err, results) =>
      if err
        throw err
        
      @setState(schema: results.schema, widgetFactory: results.widgetFactory, dataSource: results.dataSource, layerFactory: results.layerFactory)

  handleDesignChange: (design) =>
    @setState(design: design)
    # console.log JSON.stringify(design, null, 2)
    
  render: ->
    if not @state.widgetFactory
      return H.div null, "Loading..."

    return H.div style: { height: "100%" },
      React.createElement(visualization.DashboardComponent, {
        design: @state.design
        widgetFactory: @state.widgetFactory
        onDesignChange: @handleDesignChange
        titleElem: "Sample"
        })

$ ->
  FloatingWindowComponent = require './FloatingWindowComponent'

  sample = H.div className: "container-fluid", style: { height: "100%" },
    H.style null, '''html, body { height: 100% }'''
    # React.createElement(TestPane, apiUrl: "https://api.mwater.co/v3/")
    React.createElement(DashboardPane, apiUrl: "https://api.mwater.co/v3/")
    # React.createElement(FloatingWindowComponent, initialBounds: { x: 100, y: 100, width: 400, height: 600 })
    # React.createElement(DashboardPane, apiUrl: "http://localhost:1234/v3/")
  React.render(sample, document.body)

dashboardDesign = {
  "items": {
    "b854aa65-7644-4b67-b0a4-d2344e7eb43a": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        design: {"version":1,"type":"line","layers":[{"axes":{"x":{"expr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"field","table":"entities.water_point","column":"_created_on"}},"xform":{"type":"date"}},"y":{"expr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"count","table":"entities.water_point"}},"xform":null,"aggr":"count"}},"filter":null,"table":"entities.water_point","cumulative":true}]}
      }
    }
  }
}


#   "items": {
#     "b854aa65-7644-4b67-b0a4-d2344e7eb43a": {
#       "layout": {
#         "x": 0,
#         "y": 0,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "LayeredChart",
#         "design": {
#           "type": "donut",
#           "layers": [
#             {
#               "axes": {
#                 "y": {
#                   "expr": {
#                     "type": "scalar",
#                     "table": "entities.water_point",
#                     "joins": [],
#                     "expr": {
#                       "type": "count",
#                       "table": "entities.water_point"
#                     }
#                   },
#                   "aggr": "count"
#                 },
#                 "color": {
#                   "expr": {
#                     "type": "scalar",
#                     "table": "entities.water_point",
#                     "joins": [
#                       "source_notes"
#                     ],
#                     "aggr": "last",
#                     "expr": {
#                       "type": "field",
#                       "table": "source_notes",
#                       "column": "status"
#                     }
#                   }
#                 }
#               },
#               "filter": null,
#               "table": "entities.water_point"
#             }
#           ],
#           "version": 1,
#           "titleText": "Functional Status of Water Points"
#         }
#       }
#     },
#     "cd96f28e-3757-42b2-a00a-0fced38c92d5": {
#       "layout": {
#         "x": 8,
#         "y": 0,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "LayeredChart",
#         "design": {
#           "version": 1,
#           "type": "bar",
#           "layers": [
#             {
#               "axes": {
#                 "x": {
#                   "expr": {
#                     "type": "field",
#                     "table": "entities.water_point",
#                     "column": "type"
#                   }
#                 },
#                 "y": {
#                   "expr": {
#                     "type": "scalar",
#                     "table": "entities.water_point",
#                     "joins": [],
#                     "expr": {
#                       "type": "count",
#                       "table": "entities.water_point"
#                     }
#                   },
#                   "aggr": "count"
#                 }
#               },
#               "filter": null,
#               "table": "entities.water_point"
#             }
#           ],
#           "transpose": true,
#           "titleText": "Water Points by Type"
#         }
#       }
#     },
#     "3f4a1842-9c14-49fe-9e5d-4c19ae6ba6ec": {
#       "layout": {
#         "x": 0,
#         "y": 8,
#         "w": 11,
#         "h": 7
#       },
#       "widget": {
#         "type": "Map",
#         "design": {
#           "baseLayer": "bing_road",
#           "layerViews": [],
#           "filters": {},
#           "bounds": {
#             "w": 28.487548828125,
#             "n": -0.06591795420830737,
#             "e": 37.44140625,
#             "s": -5.5941182188847876
#           }
#         }
#       }
#     },
#     "353760a5-8976-418d-95cd-0d11ba4aa308": {
#       "layout": {
#         "x": 11,
#         "y": 8,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "Markdown",
#         "design": {
#           "markdown": "### Sample Dashboard\n\nText widgets can be freely mixed with maps, charts and tables. Charts are connected with each other so that clicking on a bar or slice will filter other views.\n"
#         }
#       }
#     }
#   }
# }