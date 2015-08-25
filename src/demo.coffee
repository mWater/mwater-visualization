H = React.DOM
visualization_mwater = require './systems/mwater'
visualization = require './index'

class DashboardPane extends React.Component
  constructor: (props) ->
    super

    @state = {
      design: dashboardDesign
    }

  componentDidMount: ->
    visualization_mwater.createSchema { apiUrl: @props.apiUrl, client: @props.client }, (err, schema) =>
      if err
        throw err
        
      dataSource = visualization_mwater.createDataSource(@props.apiUrl, @props.client)
 

      layerFactory = new visualization.LayerFactory({
        schema: schema
        dataSource: dataSource
        apiUrl: @props.apiUrl
        client: @props.client
        newLayers: [{ name: "Custom Layer", type: "Markers", design: {} }]
        onMarkerClick: (table, id) => alert("#{table}:#{id}")
      })

      widgetFactory = new visualization.WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory)
 
      @setState(schema: schema, widgetFactory: widgetFactory, dataSource: dataSource, layerFactory: layerFactory)

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
        })

$ ->
  FloatingWindowComponent = require './FloatingWindowComponent'

  sample = H.div className: "container-fluid", style: { height: "100%" },
    H.style null, '''html, body { height: 100% }'''
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
        "w": 12,
        "h": 12
      },
      "widget": {
        "type": "LayeredChart",
        "design": {
          "type": "bar",
          "layers": [
            {
              "axes": {
                "y": {
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
                },
                "x": {
                  "expr": {
                    "type": "scalar",
                    "table": "entities.water_point",
                    "joins": [
                      "source_notes"
                    ],
                    "expr": {
                      "type": "count",
                      "table": "source_notes"
                    },
                    "aggr": "count"
                  }
                }
              },
              "filter": null,
              "table": "entities.water_point"
            }
          ]
        }
      }
    },
    "50cb2e15-3aed-43af-ba5f-fda8dc4e03fb": {
      "layout": {
        "x": 12,
        "y": 0,
        "w": 12,
        "h": 12
      },
      "widget": {
        "type": "TableChart",
        "design": {
          "columns": [
            {
              "textAxis": {
                "expr": {
                  "type": "field",
                  "table": "entities.water_point",
                  "column": "type"
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
          "table": "entities.water_point"
        }
      }
    }
  }
}