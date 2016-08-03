React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
querystring = require 'querystring'

Schema = require('mwater-expressions').Schema
DataSource = require('mwater-expressions').DataSource

visualization = require './index'
LayeredChart = require './widgets/charts/LayeredChart'
LayeredChartDesignerComponent = require './widgets/charts/LayeredChartDesignerComponent'

CalendarChartViewComponent = require './widgets/charts/CalendarChartViewComponent'

MWaterLoaderComponent = require './MWaterLoaderComponent'
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource')

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')

DirectDashboardDataSource = require './dashboards/DirectDashboardDataSource'
DirectMapDataSource = require './maps/DirectMapDataSource'

ServerMapDataSource = require './maps/ServerMapDataSource'
ServerDashboardDataSource = require './dashboards/ServerDashboardDataSource'

dashboardId = "f1532f47b96c4211afbb15bd754068bf"

class MWaterDashboardPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: dashboardDesign
      extraTables: ['entities.school']
    }

  componentWillMount: ->
# Load dashboard
#    url = @props.apiUrl + "dashboards/#{dashboardId}?" + querystring.stringify({ client: @props.client, share: @props.share })
#    $.getJSON url, (dashboard) =>
#      @setState(design: dashboard.design, extraTables: dashboard.extra_tables)

  handleDesignChange: (design) =>
    @setState(design: design, extraTables: [])
    console.log JSON.stringify(design, null, 2)

  render: ->
    if not @state.design
      return H.div null, "Loading..."

    return React.createElement(MWaterLoaderComponent, {
      apiUrl: @props.apiUrl
      client: @props.client
      user: @props.user
      onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
      extraTables: @state.extraTables
    }, (error, config) =>
#      dashboardDataSource = new ServerDashboardDataSource({
#        apiUrl: @props.apiUrl, client: @props.client, share: share, dashboardId: dashboardId
#      })
      dashboardDataSource = new DirectDashboardDataSource({
        apiUrl: @props.apiUrl
        client: @props.client
        design: @state.design
        schema: config.schema
        dataSource: config.dataSource
      })
      H.div style: { height: "100%" },
        React.createElement(visualization.DashboardComponent, {
          schema: config.schema
          dataSource: config.dataSource
          dashboardDataSource: dashboardDataSource
          design: @state.design
          onDesignChange: @handleDesignChange
          titleElem: "Sample"
        })
    )

design = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
        "type": "widget",
        "widgetType": "Text",
        "design": {
          "style": "title",
          "items": [
            "The Water Situation"
          ]
        },
        "id": "2fb6f7f9-212f-4488-abb6-9662eacc879f"
      },
      {
        "type": "widget",
        "widgetType": "Text",
        "design": {
          "items": [
            "We have ",
            {
              "type": "expr",
              "id": "b0e56d85-7999-4dfa-84ac-a4f6b4878f53",
              "expr": {
                "type": "op",
                "op": "count",
                "table": "entities.water_point",
                "exprs": []
              }
            },
            " water points in mWater. Of these, ",
            {
              "type": "expr",
              "id": "9accfd63-7ae9-4e8e-a784-dfc259977d4c",
              "expr": {
                "type": "op",
                "table": "entities.water_point",
                "op": "count where",
                "exprs": [
                  {
                    "type": "op",
                    "table": "entities.water_point",
                    "op": "= any",
                    "exprs": [
                      {
                        "type": "field",
                        "table": "entities.water_point",
                        "column": "type"
                      },
                      {
                        "type": "literal",
                        "valueType": "enumset",
                        "value": [
                          "Protected dug well",
                          "Unprotected dug well"
                        ]
                      }
                    ]
                  }
                ]
              }
            },
            " are dug wells!"
          ]
        },
        "id": "09c8981b-3869-410d-bd90-4a5a012314a8"
      },
      {
        "type": "widget",
        "aspectRatio": 1.4,
        "widgetType": "LayeredChart",
        "design": {
          "version": 2,
          "layers": [
            {
              "axes": {
                "x": {
                  "expr": {
                    "type": "field",
                    "table": "entities.water_point",
                    "column": "_created_on"
                  },
                  "xform": {
                    "type": "yearmonth"
                  }
                },
                "y": {
                  "expr": {
                    "type": "op",
                    "op": "count",
                    "table": "entities.water_point",
                    "exprs": []
                  },
                  "xform": null
                }
              },
              "filter": {
                "type": "op",
                "table": "entities.water_point",
                "op": "thisyear",
                "exprs": [
                  {
                    "type": "field",
                    "table": "entities.water_point",
                    "column": "_created_on"
                  }
                ]
              },
              "table": "entities.water_point",
              "cumulative": false
            }
          ],
          "type": "bar",
          "titleText": "Water points added by month 2016"
        },
        "id": "906863e8-3b03-4b6c-b70f-f4cd4adc002b"
      }
    ]
  },
  "layout": "blocks"
}

class MWaterDirectDashboardPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      # design: { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" } # dashboardDesign
      design: dashboardDesign
      extraTables: [] #['responses:e24f0a0ec11643cab3c21c07de2f6889']
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
      if error
        alert("Error: " + error.message)
        return null

      dashboardDataSource = new DirectDashboardDataSource({
        apiUrl: @props.apiUrl
        client: @props.client
        design: @state.design
        schema: config.schema
        dataSource: config.dataSource
      })

      H.div style: { height: "100%" },
        React.createElement(visualization.DashboardComponent, {
          schema: config.schema
          dataSource: config.dataSource
          dashboardDataSource: dashboardDataSource
          design: @state.design
          onDesignChange: @handleDesignChange
          titleElem: "Sample"
        })
    )


mapId = "ed291fa35f994c0094aba62b57ac004c"
share = "testshareid"

class MWaterMapPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: null
      extraTables: []
    }

  componentWillMount: ->
# Load map
    url = @props.apiUrl + "maps/#{mapId}?" + querystring.stringify({ client: @props.client, share: share })
    $.getJSON url, (map) =>
      @setState(design: map.design, extraTables: map.extra_tables)

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)

  render: ->
    if not @state.design
      return H.div null, "Loading..."

    React.createElement(MWaterLoaderComponent, {
      apiUrl: @props.apiUrl
      client: @props.client
      share: share
      user: @props.user
      extraTables: @state.extraTables
      onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
    }, (error, config) =>
      # Create map url source
      # mapDataSource = new DirectMapDataSource({ apiUrl: @props.apiUrl, client: @props.client, schema: config.schema, mapDesign: @state.design })
      mapDataSource = new ServerMapDataSource({ apiUrl: @props.apiUrl, client: @props.client, share: share, mapId: mapId })

      H.div style: { height: "100%" },
        React.createElement(visualization.MapComponent, {
          schema: config.schema
          dataSource: config.dataSource
          design: @state.design
          mapDataSource: mapDataSource
          onDesignChange: @handleDesignChange
          onRowClick: (tableId, rowId) => alert("#{tableId}:#{rowId}")
          titleElem: "Sample"
        })
    )

class MWaterDirectMapPane extends React.Component
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
      # Create map url source
      mapDataSource = new DirectMapDataSource({ apiUrl: @props.apiUrl, client: @props.client, schema: config.schema, mapDesign: @state.design })

      H.div style: { height: "100%" },
        React.createElement(visualization.MapComponent, {
          schema: config.schema
          dataSource: config.dataSource
          design: @state.design
          mapDataSource: mapDataSource
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
      design: rosterDatagridDesign
      extraTables: ["responses:3aee880e079a417ea51d388d95217edf"]
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
                console.log value
                setTimeout () =>
                  callback(null)
              , 500
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
    React.createElement(MWaterDirectDashboardPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterDatagridDesignerPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterDatagridDesignerPane, apiUrl: "http://localhost:1234/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterDatagridPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    # React.createElement(MWaterDirectMapPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
    # React.createElement(BlocksDesignerComponent, renderBlock: [])
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
#  {
#   id: "4ed3415c-30c1-45fe-8984-dbffb9dd42d1"
#   name: "Choropleth"
#   type: "AdminIndicatorChoropleth"
#   design: {
#     scope: 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
#     table: "entities.water_point"
#     adminRegionExpr: { type: "scalar", table: "entities.water_point", joins: ['admin_region'], expr: { type: "id", table: "admin_regions" } }
#     detailLevel: 1
#     condition: {
#       type: "op"
#       op: "="
#       table: "entities.water_point"
#       exprs: [
#         { type: "field", table: "entities.water_point", column: "type" }
#         { type: "literal", valueType: "enum", value: "Protected dug well" }
#       ]
#     }
#   }
#   visible: true
# }
    {
      "id": "afbf76a3-29b8-4a11-882c-42aa21a3ca7a",
      "name": "Untitled Layer",
      "desc": "",
      "type": "AdminChoropleth",
      "visible": true,
      "opacity": 1,
      "design": {
        "adminRegionExpr": {
          "type": "scalar",
          "table": "entities.water_point",
          "joins": [
            "admin_region"
          ],
          "expr": {
            "type": "id",
            "table": "admin_regions"
          }
        },
        "axes": {
          "color": {
            "expr": {
              "type": "op",
              "op": "percent where",
              "table": "entities.water_point",
              "exprs": []
            },
            "xform": {
              "type": "bin",
              "numBins": 6,
              "min": 0,
              "max": 100
            },
            "colorMap": [
              {
                "value": 1,
                "color": "#f8e71c"
              },
              {
                "value": 2,
                "color": "#7ed321"
              },
              {
                "value": 3,
                "color": "#f5a623"
              },
              {
                "value": 4,
                "color": "#d0021b"
              },
              {
                "value": 5,
                "color": "#4725f0"
              }
            ]
          }
        },
        "opacity": 1,
        "nameLabels": true,
        "filter": null,
        "scope": "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
        "detailLevel": 1,
        "table": "entities.water_point",
        "color": "#9b9b9b"
      }
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
# mapDesign = {
#   "baseLayer": "bing_road",
#   "layerViews": [
#      { 
#       id: "4ed3415c-30c1-45fe-8984-dbffb9dd42d1"
#       name: "Buffer"
#       type: "Buffer"
#       design: { 
#         table: "entities.water_point" 
#         opacity: 0.5
#         radius: 1000
#         "axes": {
#           "geometry": {
#             "expr": {
#               "type": "field",
#               "table": "entities.water_point",
#               "column": "location"
#             },
#             "xform": null
#           }
#           "color": {
#             "expr": {
#               "type": "field",
#               "table": "entities.water_point",
#               "column": "type"
#             },
#             "xform": null,
#             "colorMap": [
#               {
#                 "value": "Protected dug well",
#                 "color": "#d0021b"
#               },
#               {
#                 "value": "Piped into dwelling",
#                 "color": "#7ed321"
#               },
#               {
#                 "value": "Borehole or tubewell",
#                 "color": "#f8e71c"
#               }
#             ]
#           }
#         },
#         color: "#9b9b9b"
#         filter: null
#       }
#       visible: true 
#     }
#      { id: "old_func_status", name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" }, visible: true }
#   ]
#   filters: {}
#   bounds: {
#     "w": 32.75848388671875,
#     "n": -2.217997457638444,
#     "e": 33.4808349609375,
#     "s": -2.9375549775994263
#   }
# }

dashboardDesign = {
  "items": {
    "c83b1d83-bc2b-4c87-a7fc-2e4bcd7694d8": {
      "layout": {
        "x": 0,
        "y": 0,
        "w": 8,
        "h": 8
      },
      "widget": {
        "type": "Map",
        "design": {
          "baseLayer": "bing_road",
          "layerViews": [
            {
              "id": "53c9d731-dbe6-4987-b0ef-434a944b26b5",
              "desc": "",
              "type": "Markers",
              "visible": true,
              "opacity": 1,
              "design": {
                "axes": {
                  "geometry": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "location"
                    }
                  },
                  "color": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_point",
                      "column": "drilling_method"
                    },
                    "colorMap": [
                      {
                        "value": "manual",
                        "color": "#d49097"
                      },
                      {
                        "value": "mechanical",
                        "color": "#a9424c"
                      },
                      {
                        "value": "other",
                        "color": "#542126"
                      }
                    ]
                  }
                },
                "name": "Water points",
                "color": "#0088FF",
                "filter": null,
                "table": "entities.water_point",
                "symbol": "font-awesome/star"
              }
            },
            {
              "id": "53c9d731-dbe6-4987-b0ef-434a944b26a5",
              "name": "Schools",
              "desc": "",
              "type": "Markers",
              "visible": true,
              "opacity": 1,
              "design": {
                "axes": {
                  "geometry": {
                    "expr": {
                      "type": "field",
                      "table": "entities.school",
                      "column": "location"
                    }
                  }
                },
                "color": "#5e354c",
                "filter": null,
                "table": "entities.school",
                "symbol": "font-awesome/h-square"
              }
            },
            {
              "id": "656b346f-c4ee-41e7-b6bc-2c7361403d62",
              "name": "Affected Area",
              "desc": "",
              "type": "Buffer",
              "visible": true,
              "opacity": 1,
              "design": {
                "axes": {
                  "geometry": {
                    "expr": {
                      "type": "field",
                      "table": "entities.water_system",
                      "column": "location"
                    }
                  }
                },
                "radius": 150000,
                "fillOpacity": 0.5,
                "filter": null,
                "table": "entities.water_system",
                "color": "#25250e"
              }
            },
            {
              "id": "1ae794c7-77e5-41c5-beba-54734221a7ba",
              "name": "Water surfaces",
              "desc": "",
              "type": "AdminChoropleth",
              "visible": true,
              "opacity": 1,
              "design": {
                "color": "#8f5c5c",
                "adminRegionExpr": {
                  "type": "scalar",
                  "table": "entities.surface_water",
                  "joins": [
                    "admin_region"
                  ],
                  "expr": {
                    "type": "id",
                    "table": "admin_regions"
                  }
                },
                "axes": {},
                "fillOpacity": 0.75,
                "displayNames": true,
                "filter": null,
                "scope": null,
                "detailLevel": 0,
                "table": "entities.surface_water"
              }
            }
          ],
          "filters": {},
          "bounds": {
            "w": -69.9609375,
            "n": 57.136239319177434,
            "e": 69.9609375,
            "s": -57.13623931917743
          }
        }
      }
    }
#    "4ed3415c-30c1-45fe-8984-dbffb9dd42d1": {
#      "layout": {
#        "x": 0,
#        "y": 0,
#        "w": 8,
#        "h": 8
#      },
#      "widget": {
#        "type": "LayeredChart",
#        "design": {
#          "xAxisLabelText": "",
#          "yAxisLabelText": "",
#          "version": 2,
#          "layers": [
#            {
#              "axes": {
#                "color": {
#                  "expr": {
#                    "type": "scalar",
#                    "table": "entities.water_point",
#                    "joins": [
#                      "!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"
#                    ],
#                    "expr": {
#                      "type": "field",
#                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
#                      "column": "Functionality"
#                    },
#                    "aggr": "last"
#                  },
#                  "xform": null
#                },
#                "y": {
#                  "expr": {
#                    "type": "id",
#                    "table": "entities.water_point"
#                  },
#                  "aggr": "count",
#                  "xform": null
#                }
#              },
#              "filter": {
#                "type": "op",
#                "table": "entities.water_point",
#                "op": "= any",
#                "exprs": [
#                  {
#                    "type": "scalar",
#                    "table": "entities.water_point",
#                    "joins": [
#                      "!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"
#                    ],
#                    "expr": {
#                      "type": "field",
#                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
#                      "column": "Functionality"
#                    },
#                    "aggr": "last"
#                  },
#                  {
#                    "type": "literal",
#                    "valueType": "enumset",
#                    "value": []
#                  }
#                ]
#              },
#              "table": "entities.water_point"
#            }
#          ],
#          "type": "donut"
#        }
#      }
#    },
#    "1219bae7-b616-4c53-8423-a6495ecf26f9": {
#      "layout": {
#        "x": 16,
#        "y": 0,
#        "w": 8,
#        "h": 8
#      },
#      "widget": {
#        "type": "ImageMosaicChart",
#        "design": {
#          "version": 1,
#          "imageAxis": {
#            "expr": {
#              "type": "field",
#              "table": "entities.community",
#              "column": "photos"
#            }
#          },
#          "filter": null,
#          "table": "entities.community",
#          "titleText": "gfhfdg hdfgh dfh"
#        }
#      }
#    },
#    "c84506e8-727d-4515-9579-fd66220ebdea": {
#      "layout": {
#        "x": 8,
#        "y": 0,
#        "w": 8,
#        "h": 8
#      },
#      "widget": {
#        "type": "TableChart",
#        "design": {
#          "version": 1,
#          "columns": [
#            {
#              "textAxis": {
#                "expr": {
#                  "type": "op",
#                  "op": "count",
#                  "table": "entities.water_point",
#                  "exprs": []
#                }
#              },
#              "headerText": "# Water points"
#            },
#            {
#              "textAxis": {
#                "expr": {
#                  "type": "op",
#                  "table": "entities.water_point",
#                  "op": "percent where",
#                  "exprs": [
#                    {
#                      "type": "op",
#                      "table": "entities.water_point",
#                      "op": "= any",
#                      "exprs": [
#                        {
#                          "type": "field",
#                          "table": "entities.water_point",
#                          "column": "type"
#                        },
#                        {
#                          "type": "literal",
#                          "valueType": "enumset",
#                          "value": [
#                            "Protected dug well",
#                            "Unprotected dug well"
#                          ]
#                        }
#                      ]
#                    }
#                  ]
#                }
#              },
#              "headerText": "% Dug Wells"
#            },
#            {
#              "textAxis": {
#                "expr": {
#                  "type": "scalar",
#                  "table": "entities.water_point",
#                  "joins": [
#                    "admin_region"
#                  ],
#                  "expr": {
#                    "type": "field",
#                    "table": "admin_regions",
#                    "column": "country"
#                  }
#                }
#              },
#              "headerText": "Country"
#            }
#          ],
#          "orderings": [
#            {
#              "axis": {
#                "expr": {
#                  "type": "op",
#                  "op": "count",
#                  "table": "entities.water_point",
#                  "exprs": []
#                }
#              },
#              "direction": "desc"
#            }
#          ],
#          "table": "entities.water_point"
#        }
#      }
#    }
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


rosterDatagridDesign = {
  "table": "responses:3aee880e079a417ea51d388d95217edf",
  subtables: [
    { id: "r1", joins: ["data:cb4661bb948c4c188f6b94bc7bb3ce1f"] }
  ]
  "columns": [
    {
      "id": "5fa704cf-f08b-4ff0-9b33-3814238a021a",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "deployment"
      }
    },
    {
      "id": "7e90248c-aa7e-4c90-b08a-7be61ac849d1",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "user"
      }
    },
    {
      "id": "5882d5b6-ee8c-44a0-abc2-a1782d9d1593",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "status"
      }
    },
    {
      "id": "1efa41fa-f173-467b-92ab-144d0899cf1b",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "code"
      }
    },
    {
      "id": "39cadddf-0ec7-401f-ade0-39bc726dbc5b",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "submittedOn"
      }
    },
    {
      "id": "efc513f6-94b2-4399-a98f-3fbec3a0d502",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "data:ec3613ba32184bf6bd69911055efad71:value"
      }
    },
    {
      "id": "79520f3e-71fd-4907-8dc6-6b25741a7277",
      "type": "expr",
      "width": 150,
      "expr": {
        "type": "field",
        "table": "responses:3aee880e079a417ea51d388d95217edf",
        "column": "data:4a276bc577254a63943cf77f86f86382:value"
      }
    }
    {
      "id": "roster1",
      "type": "expr",
      width: 200
      subtable: "r1"
      expr: {
        type: "field"
        table: "responses:3aee880e079a417ea51d388d95217edf:roster:cb4661bb948c4c188f6b94bc7bb3ce1f"
        column: "data:37c99596f2e14feaa313431a91e3e620:value"
      }
    }
  ]
}


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
