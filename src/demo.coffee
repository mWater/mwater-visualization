React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM

Schema = require('mwater-expressions').Schema
DataSource = require('mwater-expressions').DataSource

visualization = require './index'
LayeredChart = require './widgets/charts/LayeredChart'
LayeredChartDesignerComponent = require './widgets/charts/LayeredChartDesignerComponent'

LayerFactory = require './maps/LayerFactory'
WidgetFactory = require './widgets/WidgetFactory'
CalendarChartViewComponent = require './widgets/charts/CalendarChartViewComponent'

class DashboardPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      schema: null
      dataSource: null
      design: dashboardDesign
    }

  componentDidMount: ->
    $.getJSON @props.apiUrl + "jsonql/schema", (schemaJson) =>
      schema = new Schema(schemaJson)
      dataSource = new MWaterDataSource(@props.apiUrl, @props.client, false)

      layerFactory = new LayerFactory({
        schema: schema
        dataSource: dataSource
        apiUrl: @props.apiUrl
        client: @props.client
        newLayers: [
          { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
          { name: "Custom Layer", type: "Markers", design: {} }
        ]
        onMarkerClick: (table, id) => alert("#{table}:#{id}")
      })

      widgetFactory = new WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory)    

      @setState(schema: schema, dataSource: dataSource, layerFactory: layerFactory, widgetFactory: widgetFactory)

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)
    
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

class TestCalendarChart extends React.Component
  render: ->
    calendarData = { main: [
      { date: "2010-03-09", value: 10 }  # Weird outlier that should be ignored in display (maybe display a tiny warning message ?)
      { date: "2015-03-01", value: 1 }
      { date: "2015-03-02", value: 2 }
      { date: "2015-03-03", value: 4 }
      { date: "2015-03-05", value: 5 }
      { date: "2015-03-06", value: 10 }
      { date: "2015-03-07", value: 5 }
      { date: "2015-03-09", value: 1 }
      { date: "2015-03-15", value: 19 }
      { date: "2015-03-17", value: 9 }
      { date: "2015-03-20", value: 1 }
      { date: "2015-03-21", value: 21 }
      { date: "2015-03-22", value: 1 }
      { date: "2015-03-26", value: 8 }
      { date: "2015-04-09", value: 43 }
      { date: "2015-04-10", value: 1 }
      { date: "2015-04-15", value: 6 }
      { date: "2015-04-16", value: 1 }
      { date: "2015-04-19", value: 21 }
      { date: "2015-04-21", value: 4 }
      { date: "2015-04-23", value: 8 }
      { date: "2015-04-29", value: 1 }
      { date: "2015-06-01", value: 20 }
    ]}
    React.createElement(CalendarChartViewComponent, {
      design: {}
      data: calendarData 

      width: 600
      height: 600
      standardWidth: 800 # Ignore this

      scope: null # Ignore this
      onScopeChange: null # Ignore this
    })


$ ->
  sample = H.div className: "container-fluid", style: { height: "100%" },
    H.style null, '''html, body, #main { height: 100% }'''
    # React.createElement(TestPane, apiUrl: "https://api.mwater.co/v3/")
    # React.createElement(DashboardPane, apiUrl: "https://api.mwater.co/v3/")
    React.createElement(TestCalendarChart)
    # React.createElement(DashboardPane, apiUrl: "https://api.mwater.co/v3/")
    # React.createElement(FloatingWindowComponent, initialBounds: { x: 100, y: 100, width: 400, height: 600 })
    # React.createElement(DashboardPane, apiUrl: "http://localhost:1234/v3/")
  ReactDOM.render(sample, document.getElementById("main"))

# Caching data source for mWater. Requires jQuery
class MWaterDataSource extends DataSource
  # Caching allows server to send cached results
  constructor: (apiUrl, client, caching = true) ->
    @apiUrl = apiUrl
    @client = client
    @caching = caching

  performQuery: (query, cb) ->
    url = @apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query))
    if @client
      url += "&client=#{@client}"

    # Setup caching
    headers = {}
    if not @caching
      headers['Cache-Control'] = "no-cache"

    $.ajax({ dataType: "json", url: url, headers: headers })
      .done (rows) =>
        cb(null, rows)
      .fail (xhr) =>
        cb(new Error(xhr.responseText))



dashboardDesign = {
  "items": {
    "e08ef8a3-34db-467d-ac78-f0f273d49f25": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "Markdown",
        "design": {
          "markdown": "# Header 1\n## Header 2\n### Header 3\nText Text Text More Text\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      }
    },
    "9d8df869-8869-4191-aa18-b58142f9c961": {
      "layout": {
        "x": 8,
        "y": 0,
        "w": 10,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "version": 1,
          "layers": [
            {
              "axes": {
                "color": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": [],
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "type"
                    }
                  },
                  "xform": null
                },
                "y": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "expr": {
                      "type": "count",
                      "table": "entities.water_point"
                    },
                    "joins": []
                  },
                  "aggr": "count",
                  "xform": null
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ],
          "type": "donut"
        }
      }
    },
    "409d7b5b-e1d9-4e18-bd45-afdead7fe18f": {
      "layout": {
        "x": 0,
        "y": 8,
        "w": 18,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "version": 1,
          "layers": [
            {
              "axes": {
                "x": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.news_item",
                    "joins": [],
                    "expr": {
                      "type": "field",
                      "table": "entities.news_item",
                      "column": "post_country"
                    }
                  },
                  "xform": null
                },
                "y": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.news_item",
                    "expr": {
                      "type": "count",
                      "table": "entities.news_item"
                    },
                    "joins": []
                  },
                  "aggr": "count",
                  "xform": null
                }
              },
              "filter": null,
              "table": "entities.news_item"
            }
          ],
          "type": "bar",
          "titleText": "Some Title"
        }
      }
    },
    "d41a2dd2-85bd-46d8-af9a-a650af4c0047": {
      "layout": {
        "x": 0,
        "y": 16,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "TableChart",
        "design": {
          "version": 1,
          "columns": [
            {
              "textAxis": {
                "expr": {
                  "type": "scalar",
                  "table": "entities.water_point",
                  "joins": [],
                  "expr": {
                    "type": "field",
                    "table": "entities.water_point",
                    "column": "type"
                  }
                }
              }
            },
            {
              "textAxis": {
                "expr": {
                  "type": "scalar",
                  "table": "entities.water_point",
                  "joins": [],
                  "expr": {
                    "type": "count",
                    "table": "entities.water_point"
                  }
                },
                "aggr": "count"
              }
            }
          ],
          "orderings": [],
          "table": "entities.water_point",
          "titleText": "TEST"
        }
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
#         design: {"version":1,"type":"line","layers":[{"axes":{"x":{"expr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"field","table":"entities.water_point","column":"_created_on"}},"xform":{"type":"date"}},"y":{"expr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"count","table":"entities.water_point"}},"xform":null,"aggr":"count"}},"filter":null,"table":"entities.water_point","cumulative":true}]}
#       }
#     }
#   }
# }


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
# }# class TestPane extends React.Component
#   constructor: (props) ->
#     super

#     @state = { }

#   componentDidMount: ->
#     $.getJSON @props.apiUrl + "jsonql/schema", (schemaJson) =>
#       @setState()
#     visualization_mwater.setup { 
#       apiUrl: @props.apiUrl
#       client: @props.client
#       onMarkerClick: (table, id) => alert("#{table}:#{id}")
#       newLayers: [
#         { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
#         { name: "Custom Layer", type: "Markers", design: {} }
#       ]
#       onFormTableSelect: (id) -> alert(id)
#     }, (err, results) =>
#       if err
#         throw err
  
#       chart = new LayeredChart(schema: results.schema, dataSource: results.dataSource)
#       design = chart.cleanDesign({})
        
#       @setState(schema: results.schema, widgetFactory: results.widgetFactory, dataSource: results.dataSource, layerFactory: results.layerFactory, design: design)

#   handleDesignChange: (design) =>
#     chart = new LayeredChart(schema: @state.schema, dataSource: @state.dataSource)
#     @setState(design: chart.cleanDesign(design))
#     console.log JSON.stringify(design, null, 2)
    
#   render: ->
#     if not @state.widgetFactory
#       return H.div null, "Loading..."

#     React.createElement(LayeredChartDesignerComponent, 
#       design: @state.design
#       schema: @state.schema
#       dataSource: @state.dataSource
#       onDesignChange: @handleDesignChange
#     )
