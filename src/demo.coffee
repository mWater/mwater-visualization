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

MWaterLoaderComponent = require './MWaterLoaderComponent'
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource')

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')

# class DashboardPane extends React.Component
#   constructor: (props) ->
#     super

#     @state = {
#       schema: null
#       dataSource: null
#       design: dashboardDesign
#     }

#   componentDidMount: ->
#     $.getJSON @props.apiUrl + "jsonql/schema", (schemaJson) =>
#       schema = new Schema(schemaJson)
#       dataSource = new MWaterDataSource(@props.apiUrl, @props.client, { serverCaching: false, localCaching: true })

#       layerFactory = new LayerFactory({
#         schema: schema
#         dataSource: dataSource
#         apiUrl: @props.apiUrl
#         client: @props.client
#         newLayers: [
#           { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
#           { name: "Custom Layer", type: "Markers", design: {} }
#         ]
#         onMarkerClick: (table, id) => alert("#{table}:#{id}")
#       })

#       widgetFactory = new WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory)    

#       @setState(schema: schema, dataSource: dataSource, layerFactory: layerFactory, widgetFactory: widgetFactory)

#   handleDesignChange: (design) =>
#     @setState(design: design)
#     console.log JSON.stringify(design, null, 2)
    
#   render: ->
#     if not @state.widgetFactory
#       return H.div null, "Loading..."

#     return H.div style: { height: "100%" },
#       React.createElement(visualization.DashboardComponent, {
#         design: @state.design
#         widgetFactory: @state.widgetFactory
#         onDesignChange: @handleDesignChange
#         titleElem: "Sample"
#         printScaling: false
#         })

class MWaterDashboardPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: dashboardDesign
      extraTables: []
    }

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)
    
  render: ->
    React.createElement(MWaterLoaderComponent, {
      apiUrl: @props.apiUrl
      client: @props.client
      user: @props.user
      onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
      extraTables: @state.extraTables
    }, (error, config) =>
      H.div style: { height: "100%" },
        React.createElement(visualization.DashboardComponent, {
          schema: config.schema
          dataSource: config.dataSource
          design: @state.design
          widgetFactory: config.widgetFactory
          onDesignChange: @handleDesignChange
          titleElem: "Sample"
        })
    )

class MWaterMapPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: mapDesign
      extraTables: []
    }

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)
    
  render: ->
    React.createElement(MWaterLoaderComponent, {
      apiUrl: @props.apiUrl
      client: @props.client
      user: @props.user
      extraTables: @state.extraTables
      onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
    }, (error, config) =>
      H.div style: { height: "100%" },
        React.createElement(visualization.MapComponent, {
          schema: config.schema
          dataSource: config.dataSource
          design: @state.design
          layerFactory: config.layerFactory
          onDesignChange: @handleDesignChange
          titleElem: "Sample"
        })
    )

class MWaterDatagridDesignerPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: {}
      extraTables: []
    }

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)
    
  render: ->
    React.createElement(MWaterLoaderComponent, {
      apiUrl: @props.apiUrl
      client: @props.client
      user: @props.user
      onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
      extraTables: @state.extraTables
    }, (error, config) =>
      H.div style: { height: "100%" },
        React.createElement(visualization.DatagridDesignerComponent, {
          schema: config.schema
          dataSource: config.dataSource
          design: @state.design
          onDesignChange: @handleDesignChange
        })
    )

class MWaterDatagridPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: datagridDesign
      extraTables: []
    }

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)
    
  render: ->
    React.createElement(MWaterLoaderComponent, {
      apiUrl: @props.apiUrl
      client: @props.client
      user: @props.user
      onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
      extraTables: @state.extraTables
    }, (error, config) =>
      H.div style: { height: "100%" },
        React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
          (size) =>
            React.createElement(visualization.DatagridComponent, {
              width: size.width
              height: size.height
              schema: config.schema
              dataSource: config.dataSource
              design: @state.design
              onDesignChange: @handleDesignChange
              # Called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
              canEditCell: (tableId, rowId, expr, callback) => callback(null, true)
              updateCell: (tableId, rowId, expr, value, callback) => 
                setTimeout () =>
                  callback(null)
              , 1000
            })
        )
    )


# class MapPane extends React.Component
#   constructor: (props) ->
#     super

#     @state = {
#       schema: null
#       dataSource: null
#       design: mapDesign
#       layerFactory: null
#     }

#   componentDidMount: ->
#     $.getJSON @props.apiUrl + "jsonql/schema", (schemaJson) =>
#       schema = new Schema(schemaJson)
#       dataSource = new MWaterDataSource(@props.apiUrl, @props.client, { serverCaching: false, localCaching: true })

#       layerFactory = new LayerFactory({
#         schema: schema
#         dataSource: dataSource
#         apiUrl: @props.apiUrl
#         client: @props.client
#         newLayers: [
#           { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
#           { name: "Custom Layer", type: "Markers", design: {} }
#         ]
#         onMarkerClick: (table, id) => alert("#{table}:#{id}")
#       })

#       @setState(schema: schema, dataSource: dataSource, layerFactory: layerFactory)

#   handleDesignChange: (design) =>
#     @setState(design: design)
#     console.log JSON.stringify(design, null, 2)

#   render: ->
#     React.createElement(visualization.MapComponent, {
#       layerFactory: @
#     schema: React.PropTypes.object.isRequired
#     dataSource: React.PropTypes.object.isRequired # Data source to use

#     design: React.PropTypes.object.isRequired
#     onDesignChange: React.PropTypes.func  # Null/undefined for readonly
#     })


$ ->
  sample = H.div className: "container-fluid", style: { height: "100%", paddingLeft: 0, paddingRight: 0 },
    H.style null, '''html, body, #main { height: 100% }'''
    # React.createElement(TestPane, apiUrl: "https://api.mwater.co/v3/")
    # React.createElement(MWaterDashboardPane, apiUrl: "http://localhost:1234/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterDashboardPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterDatagridDesignerPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    React.createElement(MWaterDatagridPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterMapPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterMapPane, apiUrl: "http://localhost:1234/v3/", client: window.location.hash.substr(1))
    # React.createElement(DashboardPane, apiUrl: "https://api.mwater.co/v3/")
    # React.createElement(FloatingWindowComponent, initialBounds: { x: 100, y: 100, width: 400, height: 600 })
    # React.createElement(DashboardPane, apiUrl: "http://localhost:1234/v3/")
  ReactDOM.render(sample, document.getElementById("main"))

datagridDesign = {
  "table": "entities.water_point",
  "columns": [
    {
      "id": "5859b3fc-64f0-42c1-a035-9dffbfd13132",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "code"
      }
    },
    {
      "id": "a2c21f4f-2f15-4d11-b2cc-eba8c85e0bbb",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "desc"
      }
    },
    {
      "id": "4162d2d4-c8d0-4e13-8075-7e42f44e57c2",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "location"
      }
    },
    {
      "id": "d5bb43c5-5666-43d9-aef5-3b20fe0d8eee",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "location_accuracy"
      }
    },
    {
      "id": "220f48a7-565f-4374-b42d-eed32a799421",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "location_altitude"
      }
    },
    {
      "id": "dcab1083-a60f-4def-bd7d-de4c9dff4945",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "name"
      }
    },
    {
      "id": "34671083-a60f-4def-bd7d-de4c9dff4945",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "type"
      }
    },
    {
      "id": "3e53e5f9-149d-4a69-8e90-a18a19efc843",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "photos"
      }
    },
    {
      "id": "aea0a8fd-1470-46ea-93e8-939b0797b0f6",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "_created_by"
      }
    },
    {
      "id": "918804c5-769e-4e4a-aacf-762d4474eb61",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "entities.water_point",
        "column": "_created_on"
      }
    }
  ]
}

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

mapDesign = {
  "baseLayer": "bing_road",
  "layerViews": [
     # { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" }, visible: true }
     { 
      name: "Choropleth"
      type: "AdminIndicatorChoropleth"
      design: { 
        scope: 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
        table: "entities.water_point" 
        adminRegionExpr: { type: "scalar", table: "entities.water_point", joins: ['admin_region'], expr: { type: "id", table: "admin_regions" } }
        detailLevel: 1
        condition: { 
          type: "op"
          op: "="
          table: "entities.water_point"
          exprs: [
            { type: "field", table: "entities.water_point", column: "type" }
            { type: "literal", valueType: "enum", value: "Protected dug well" }
          ] 
        }
      }
      visible: true 
    }
  ]
  filters: {}
  bounds: { 
    "w": 23.1591796875,
    "n": 4.214943141390651,
    "e": 44.2529296875,
    "s": -18.583775688370928
  }
}
# bounds: { w: -40, n: 25, e: 40, s: -25 }

dashboardDesign = {
  "items": {
    "4ed3415c-30c1-45fe-8984-dbffb9dd42d1": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "xAxisLabelText": "",
          "yAxisLabelText": "",
          "version": 2,
          "layers": [
            {
              "axes": {
                "color": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": [
                      "!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"
                    ],
                    "expr": {
                      "type": "field",
                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                      "column": "Functionality"
                    },
                    "aggr": "last"
                  },
                  "xform": null
                },
                "y": {
                  "expr": {
                    "type": "id",
                    "table": "entities.water_point"
                  },
                  "aggr": "count",
                  "xform": null
                }
              },
              "filter": {
                "type": "op",
                "table": "entities.water_point",
                "op": "= any",
                "exprs": [
                  {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": [
                      "!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"
                    ],
                    "expr": {
                      "type": "field",
                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                      "column": "Functionality"
                    },
                    "aggr": "last"
                  },
                  {
                    "type": "literal",
                    "valueType": "enumset",
                    "value": [
                      "Functional"
                    ]
                  }
                ]
              },
              "table": "entities.water_point"
            }
          ],
          "type": "donut"
        }
      }
    }
  }
}
    # "d41a2dd2-85bd-46d8-af9a-a650af4c0047": {
    #   "layout": {
    #     "x": 16,
    #     "y": 0,
    #     "w": 8,
    #     "h": 6
    #   },
    #   "widget": {
    #     "type": "TableChart",
    #     "design": {
    #       "version": 1,
    #       "columns": [
    #         {
    #           "textAxis": {
    #             "expr": {
    #               "type": "scalar",
    #               "table": "entities.water_point",
    #               "joins": [],
    #               "expr": {
    #                 "type": "field",
    #                 "table": "entities.water_point",
    #                 "column": "type"
    #               }
    #             },
    #             "headerText": "This is a reallyyyyyyyyyy long title "
    #           }
    #         },
    #         {
    #           "textAxis": {
    #             "expr": {
    #               "type": "scalar",
    #               "table": "entities.water_point",
    #               "joins": [],
    #               "expr": {
    #                 "type": "count",
    #                 "table": "entities.water_point"
    #               }
    #             },
    #             "aggr": "count",
    #             "headerText": "This is a reallyyyyyyyyyy long title "
    #           }
    #         },
    #         {
    #           "textAxis": {
    #             "expr": {
    #               "type": "field",
    #               "table": "entities.water_point",
    #               "column": "desc"
    #             }
    #           },
    #           "headerText": "This is a reallyyyyyyyyyy long title "
    #         }
    #       ],
    #       "orderings": [],
    #       "table": "entities.water_point",
    #       "titleText": "TEST",
    #       "filter": {
    #         "type": "op",
    #         "table": "entities.water_point",
    #         "op": "=",
    #         "exprs": [
    #           {
    #             "type": "field",
    #             "table": "entities.water_point",
    #             "column": "code"
    #           },
    #           {
    #             "type": "literal",
    #             "valueType": "text",
    #             "value": "10007"
    #           }
    #         ]
    #       }
    #     }
    #   }
    # },
    # "d2ea9c20-bcd3-46f6-8f78-ccb795d1a91a": {
    #   "layout": {
    #     "x": 0,
    #     "y": 0,
    #     "w": 8,
    #     "h": 8
    #   },
    #   "widget": {
    #     "type": "Map",
    #     "design": {
    #       "baseLayer": "bing_road",
    #       "layerViews": [
    #         {
    #           "id": "827187bf-a5fd-4d07-b34b-1e213407f96d",
    #           "name": "Custom Layer",
    #           "desc": "",
    #           "type": "Markers",
    #           "design": {
    #             "sublayers": [
    #               {
    #                 "axes": {
    #                   "geometry": {
    #                     "expr": {
    #                       "type": "field",
    #                       "table": "entities.water_point",
    #                       "column": "location"
    #                     },
    #                     "xform": null
    #                   },
    #                   "color": {
    #                     "expr": {
    #                       "type": "field",
    #                       "table": "entities.water_point",
    #                       "column": "type"
    #                     },
    #                     "xform": null,
    #                     "colorMap": [
    #                       {
    #                         "value": "Protected dug well",
    #                         "color": "#d0021b"
    #                       },
    #                       {
    #                         "value": "Piped into dwelling",
    #                         "color": "#4a90e2"
    #                       }
    #                     ]
    #                   }
    #                 },
    #                 "color": "#0088FF",
    #                 "filter": null,
    #                 "table": "entities.water_point",
    #                 "symbol": "font-awesome/star"
    #               }
    #             ]
    #           },
    #           "visible": true,
    #           "opacity": 1
    #         }
    #       ],
    #       "filters": {},
    #       "bounds": {
    #         "w": -103.7548828125,
    #         "n": 23.160563309048314,
    #         "e": -92.4169921875,
    #         "s": 12.382928338487408
    #       }
    #     }
    #   }
    # },
    # "9ef85e17-73aa-4b5f-8363-95f9a2e24193": {
    #   "layout": {
    #     "x": 8,
    #     "y": 0,
    #     "w": 8,
    #     "h": 8
    #   },
    #   "widget": {
    #     "type": "LayeredChart",
    #     "design": {
    #       "version": 1,
    #       "layers": [
    #         {
    #           "axes": {
    #             "x": {
    #               "expr": {
    #                 "type": "field",
    #                 "table": "entities.water_point",
    #                 "column": "type"
    #               },
    #               "xform": null
    #             },
    #             "y": {
    #               "expr": {
    #                 "type": "id",
    #                 "table": "entities.water_point"
    #               },
    #               "aggr": "count",
    #               "xform": null
    #             }
    #           },
    #           "filter": null,
    #           "table": "entities.water_point"
    #         }
    #       ],
    #       "type": "bar"
    #     }
    #   }
    # }
#   }
# }

#   {
#   "items": {
#     "df5aa9d4-20fb-4735-9178-ba7cc543fa27": {
#       "layout": {
#         "x": 0,
#         "y": 0,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "LayeredChart",
#         "design": {
#           "version": 1,
#           "layers": [
#             {
#               "axes": {
#                 "x": {
#                   "expr": {
#                     "type": "field",
#                     "table": "responses:e24f0a0ec11643cab3c21c07de2f6889",
#                     "column": "data:fd43a6faa6764490ab82eae19d71af71:value"
#                   },
#                   "xform": {
#                     "type": "bin",
#                     "numBins": 6
#                   }
#                 },
#                 "y": {
#                   "expr": {
#                     "type": "id",
#                     "table": "responses:e24f0a0ec11643cab3c21c07de2f6889"
#                   },
#                   "aggr": "count",
#                   "xform": null
#                 }
#               },
#               "filter": null,
#               "table": "responses:e24f0a0ec11643cab3c21c07de2f6889"
#             }
#           ],
#           "type": "bar"
#         }
#       }
#     }
#   }
# }

#   "items": {
#     "0f55a8aa-afff-4511-870d-63dd604c1525": {
#       "layout": {
#         "x": 0,
#         "y": 0,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "Map",
#         "design": {
#           "baseLayer": "bing_road",
#           "layerViews": [
#             {
#               "id": "7002dace-6b00-44f6-98fb-d136817ac6c1",
#               "name": "Custom Layer",
#               "desc": "",
#               "type": "Markers",
#               "design": {
#                 "sublayers": [
#                   {
#                     "axes": {
#                       "geometry": {
#                         "expr": {
#                           "type": "field",
#                           "table": "entities.community",
#                           "column": "location"
#                         },
#                         "xform": null
#                       }
#                     },                    
#                     "color": "#0088FF",
#                     "filter": null,
#                     "table": "entities.community",
#                     "symbol": "font-awesome/times"
#                   }
#                 ]
#               },
#               "visible": true,
#               "opacity": 1
#             }
#           ],
#           "filters": {},
#           "bounds": {
#             "w": -52.91015625,
#             "n": 46.6795944656402,
#             "e": 52.91015625,
#             "s": -46.679594465640186
#           }
#         }
#       }
#     }
#   }
# }


#   "items": {
#     "c78d1987-a14e-4cab-b772-4a56136e2641": {
#       "layout": {
#         "x": 0,
#         "y": 0,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "CalendarChart",
#         "design": {
#           "version": 1,
#           "dateAxis": {
#             "expr": {
#               "type": "field",
#               "table": "entities.water_point",
#               "column": "_created_on"
#             },
#             "xform": {
#               "type": "date"
#             }
#           },
#           "valueAxis": {
#             "expr": {
#               "type": "id",
#               "table": "entities.water_point"
#             },
#             "aggr": "count",
#             "xform": null
#           },
#           "filter": null,
#           "table": "entities.water_point"
#         }
#       }
#     }
#   }
# }

# dashboardDesign = {
#   "items": {
#     "e08ef8a3-34db-467d-ac78-f0f273d49f25": {
#       "layout": {
#         "x": 0,
#         "y": 0,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "Markdown",
#         "design": {
#           "markdown": "# Header 1\n## Header 2\n### Header 3\nText Text Text More Text\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
#         }
#       }
#     },
#     "9d8df869-8869-4191-aa18-b58142f9c961": {
#       "layout": {
#         "x": 8,
#         "y": 0,
#         "w": 10,
#         "h": 8
#       },
#       "widget": {
#         "type": "LayeredChart",
#         "design": {
#           "version": 1,
#           "layers": [
#             {
#               "axes": {
#                 "color": {
#                   "expr": {
#                     "type": "scalar",
#                     "table": "entities.water_point",
#                     "joins": [],
#                     "expr": {
#                       "type": "field",
#                       "table": "entities.water_point",
#                       "column": "type"
#                     }
#                   },
#                   "xform": null
#                 },
#                 "y": {
#                   "expr": {
#                     "type": "scalar",
#                     "table": "entities.water_point",
#                     "expr": {
#                       "type": "count",
#                       "table": "entities.water_point"
#                     },
#                     "joins": []
#                   },
#                   "aggr": "count",
#                   "xform": null
#                 }
#               },
#               "filter": null,
#               "table": "entities.water_point"
#             }
#           ],
#           "type": "donut"
#         }
#       }
#     },
#     "409d7b5b-e1d9-4e18-bd45-afdead7fe18f": {
#       "layout": {
#         "x": 0,
#         "y": 8,
#         "w": 18,
#         "h": 8
#       },
#       "widget": {
#         "type": "LayeredChart",
#         "design": {
#           "version": 1,
#           "layers": [
#             {
#               "axes": {
#                 "x": {
#                   "expr": {
#                     "type": "scalar",
#                     "table": "entities.news_item",
#                     "joins": [],
#                     "expr": {
#                       "type": "field",
#                       "table": "entities.news_item",
#                       "column": "post_country"
#                     }
#                   },
#                   "xform": null
#                 },
#                 "y": {
#                   "expr": {
#                     "type": "scalar",
#                     "table": "entities.news_item",
#                     "expr": {
#                       "type": "count",
#                       "table": "entities.news_item"
#                     },
#                     "joins": []
#                   },
#                   "aggr": "count",
#                   "xform": null
#                 }
#               },
#               "filter": null,
#               "table": "entities.news_item"
#             }
#           ],
#           "type": "bar",
#           "titleText": "Some Title"
#         }
#       }
#     },
#     "d41a2dd2-85bd-46d8-af9a-a650af4c0047": {
#       "layout": {
#         "x": 0,
#         "y": 16,
#         "w": 8,
#         "h": 8
#       },
#       "widget": {
#         "type": "TableChart",
#         "design": {
#           "version": 1,
#           "columns": [
#             {
#               "textAxis": {
#                 "expr": {
#                   "type": "scalar",
#                   "table": "entities.water_point",
#                   "joins": [],
#                   "expr": {
#                     "type": "field",
#                     "table": "entities.water_point",
#                     "column": "type"
#                   }
#                 }
#               }
#             },
#             {
#               "textAxis": {
#                 "expr": {
#                   "type": "scalar",
#                   "table": "entities.water_point",
#                   "joins": [],
#                   "expr": {
#                     "type": "count",
#                     "table": "entities.water_point"
#                   }
#                 },
#                 "aggr": "count"
#               }
#             }
#           ],
#           "orderings": [],
#           "table": "entities.water_point",
#           "titleText": "TEST"
#         }
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
