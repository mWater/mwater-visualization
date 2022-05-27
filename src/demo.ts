// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from "prop-types"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement
import querystring from "querystring"
import $ from "jquery"
import { Expr, Schema } from "mwater-expressions"
import { DataSource } from "mwater-expressions"
import * as visualization from "./index"

// CalendarChartViewComponent = require './widgets/charts/CalendarChartViewComponent'

import MWaterLoaderComponent from "./MWaterLoaderComponent"

import MWaterDataSource from "mwater-expressions/lib/MWaterDataSource"
import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import DirectDatagridDataSource from "./datagrids/DirectDatagridDataSource"
import DirectDashboardDataSource from "./dashboards/DirectDashboardDataSource"
import { default as DirectMapDataSource } from "./maps/DirectMapDataSource"
import { default as ServerMapDataSource } from "./maps/ServerMapDataSource"
import LeafletMapComponent from "./maps/LeafletMapComponent"
import { default as ServerDashboardDataSource } from "./dashboards/ServerDashboardDataSource"
import RichTextComponent from "./richtext/RichTextComponent"
import ItemsHtmlConverter from "./richtext/ItemsHtmlConverter"
import { DragDropContextProvider } from "react-dnd"
import { default as HTML5Backend } from "react-dnd-html5-backend"
import { defaultT } from 'ez-localize'
import { setMapTilerApiKey } from "./maps/vectorMaps"

// Setup localizer
global.T = defaultT

// Set demo key
setMapTilerApiKey("cNNyJl2nwIIKEUYSeXYc")

$(function () {
  const sample = R(
    DragDropContextProvider,
    { backend: HTML5Backend },
    R(
      "div",
      { className: "container-fluid", style: { height: "100%", paddingLeft: 0, paddingRight: 0 } },
      R("style", null, "html, body, #main { height: 100% }"),
      // R(MWaterDirectMapPane, { apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1) })
      // R(RichTextPane)
      // R(TestPane, apiUrl: "https://api.mwater.co/v3/")
      // R(MWaterDashboardPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1), dashboardId: "a855eb0587d845d3ac27aed03c463976", share: "817c76088c7649ec8cc0b8193e547a09")
      // R(MWaterDashboardPane, {apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1), dashboardId: "f99f206ddd4442a981761b8342c58058"})
      // R(MWaterDashboardPane, {apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1), dashboardId: "f99f206ddd4442a981761b8342c58058"})
      R(MWaterDirectDashboardPane, { apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1) })
      //R(MWaterDatagridPane, { apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1) })
      // R(MWaterDirectMapPane, { apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1) })
    )
  )
  // R(MWaterDatagridPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
  // R(MWaterDatagridDesignerPane, apiUrl: "http://localhost:1234/v3/", client: window.location.hash.substr(1))
  // R(MWaterDatagridPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
  // R(MWaterDirectMapPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
  // R(MWaterDirectMapPane, apiUrl: "http://localhost:1234/v3/", client: window.location.hash.substr(1))
  // R(WaterOrgDashboardPane, apiUrl: "http://localhost:1235/mwater/")
  // R(BlocksDesignerComponent, renderBlock: [])
  // R(MWaterMapPane, apiUrl: "http://localhost:1234/v3/", client: window.location.hash.substr(1))
  // R(MWaterMapPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
  // R(DashboardPane, apiUrl: "https://api.mwater.co/v3/")
  // R(FloatingWindowComponent, initialBounds: { x: 100, y: 100, width: 400, height: 600 })
  // R(DashboardPane, apiUrl: "http://localhost:1234/v3/")
  // R(MWaterDirectDashboardPane, apiUrl: "https://api.mwater.co/v3/", client: window.location.hash.substr(1))
  // R LeafletMapComponent, baseLayerId: "bing_road", width: "100%", height: 400, layers: [
  //   {
  //     geometry: { type: "Point", coordinates: [-73.5, 45.5]}
  //     onClick: => alert("clicked!")
  //   }
  // ]
  return ReactDOM.render(sample, document.getElementById("main"))
})

class RichTextPane extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      items: null
    }
  }

  handleInsert = (ev: any) => {
    ev.preventDefault()
    return this.editor.pasteHTML("x")
  }

  renderExtraButtons() {
    return R(
      "div",
      { key: "x", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleInsert },
      "x"
    )
  }

  render() {
    return R(
      "div",
      { style: { paddingTop: 100 } },
      R(RichTextComponent, {
        ref: (c: any) => {
          return (this.editor = c)
        },
        items: this.state.items,
        onItemsChange: (items: any) => this.setState({ items }),
        itemsHtmlConverter: new ItemsHtmlConverter(),
        extraPaletteButtons: this.renderExtraButtons()
      })
    )
  }
}

class MWaterDashboardPane extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      design: null,
      extraTables: []
    }
  }

  componentWillMount() {
    // Load dashboard
    const url =
      this.props.apiUrl +
      `dashboards/${this.props.dashboardId}?` +
      querystring.stringify({ client: this.props.client, share: this.props.share })
    return $.getJSON(url, (dashboard) => {
      return this.setState({ design: dashboard.design, extraTables: dashboard.extraTables })
    })
  }

  handleDesignChange = (design: any) => {}
  // @setState(design: design, extraTables: )
  // console.log JSON.stringify(design, null, 2)

  render() {
    if (!this.state.design) {
      return R("div", null, "Loading...")
    }

    return React.createElement(
      MWaterLoaderComponent,
      {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        share: this.props.share,
        onExtraTablesChange: (extraTables: any) => this.setState({ extraTables }),
        extraTables: this.state.extraTables,
        errorFormatter: (err: any, defaultError: any) => {
          if (!err.form) {
            return defaultError
          }
          return `This dashboard depends on the survey ${err.form.name} which cannot be loaded. \
Perhaps the administrator of the survey has not shared it with you? \
The survey was created by ${err.form.created_by}`
        }
      },
      (error: any, config: any) => {
        if (error) {
          return R("div", { className: "alert alert-danger" }, error)
        }

        const dashboardDataSource = new ServerDashboardDataSource({
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          share: this.props.share,
          dashboardId: this.props.dashboardId,
          dataSource: config.dataSource
        })
        // dashboardDataSource = new DirectDashboardDataSource(@props.apiUrl, @props.client, @state.design, config.schema, config.dataSource)

        return R(
          "div",
          { style: { height: "100%" } },
          React.createElement(visualization.DashboardComponent, {
            schema: config.schema,
            dataSource: config.dataSource,
            dashboardDataSource,
            design: this.state.design,
            onDesignChange: this.handleDesignChange,
            titleElem: "Sample"
          })
        )
      }
    )
  }
}

class MWaterDirectDashboardPane extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      // design: { items: {}, layout: "grid" } # dashboardDesign
      // design: { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" } # dashboardDesign
      design: window.localStorage.getItem("MWaterDirectDashboardPane.design")
        ? JSON.parse(window.localStorage.getItem("MWaterDirectDashboardPane.design")!)
        : mapAndChartDashboard,
      // design: imageWidgetDashboardDesign
      // design: dashboardDesign
      extraTables: window.localStorage.getItem("MWaterDirectDashboardPane.extraTables")
        ? JSON.parse(window.localStorage.getItem("MWaterDirectDashboardPane.extraTables")!)
        : []
    }
  }

  handleDesignChange = (design: any) => {
    this.setState({ design })
    // console.log JSON.stringify(design, null, 2)
    return window.localStorage.setItem("MWaterDirectDashboardPane.design", JSON.stringify(design))
  }

  handleExtraTablesChange = (extraTables: any) => {
    this.setState({ extraTables })
    return window.localStorage.setItem("MWaterDirectDashboardPane.extraTables", JSON.stringify(extraTables))
  }

  render() {
    return React.createElement(
      MWaterLoaderComponent,
      {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        onExtraTablesChange: this.handleExtraTablesChange,
        extraTables: this.state.extraTables
      },
      (error: any, config: any) => {
        if (error) {
          alert("Error: " + error.message)
          return null
        }

        const dashboardDataSource = new DirectDashboardDataSource({
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          schema: config.schema,
          dataSource: config.dataSource
        })

        return R(
          "div",
          { style: { height: "100%" } },
          React.createElement(visualization.DashboardComponent, {
            schema: config.schema,
            dataSource: config.dataSource,
            dashboardDataSource,
            design: this.state.design,
            onDesignChange: this.handleDesignChange,
            titleElem: "Sample",
            // quickfilterLocks: [{ expr: { type: "field", table: "entities.water_point", column: "type" }, value: "Protected dug well" }]
            namedStrings: { branding: "mWater" },
            onRowClick: (table: any, rowId: any) => alert(`Row clicked: ${table} ${rowId}`)
          })
        )
      }
    )
  }
}

// mapId = "fb92ca9ca9a04bfd8dc156b5ac71380d"
const mapId = "5e9a90f0f52e4690b42378534752ebfc"
const share = "testshareid"

class MWaterMapPane extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      design: null,
      extraTables: []
    }
  }

  componentWillMount() {
    // Load map
    const url = this.props.apiUrl + `maps/${mapId}?` + querystring.stringify({ client: this.props.client })
    return $.getJSON(url, (map) => {
      return this.setState({ design: map.design, extraTables: map.extra_tables })
    })
  }

  handleDesignChange = (design: any) => {
    this.setState({ design })
    return console.log(JSON.stringify(design, null, 2))
  }

  render() {
    if (!this.state.design) {
      return R("div", null, "Loading...")
    }

    return React.createElement(
      MWaterLoaderComponent,
      {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        extraTables: this.state.extraTables,
        onExtraTablesChange: (extraTables: any) => this.setState({ extraTables })
      },
      (error: any, config: any) => {
        // Create map url source

        //      mapDataSource = new DirectMapDataSource({ apiUrl: @props.apiUrl, client: @props.client, schema: config.schema, mapDesign: @state.design })
        const mapDataSource = new ServerMapDataSource({
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          mapId,
          design: this.state.design
        })

        return R(
          "div",
          { style: { height: "100%" } },
          React.createElement(visualization.MapComponent, {
            schema: config.schema,
            dataSource: config.dataSource,
            design: this.state.design,
            mapDataSource,
            onDesignChange: this.handleDesignChange,
            onRowClick: (tableId: any, rowId: any) => alert(`${tableId}:${rowId}`),
            titleElem: "Sample"
          })
        )
      }
    )
  }
}

class MWaterDirectMapPane extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      design: window.localStorage.getItem("MWaterDirectMapPane.design")
        ? JSON.parse(window.localStorage.getItem("MWaterDirectMapPane.design"))
        : doubleClickMap,
      extraTables: window.localStorage.getItem("MWaterDirectMapPane.extraTables")
        ? JSON.parse(window.localStorage.getItem("MWaterDirectMapPane.extraTables"))
        : []
    }
  }

  handleDesignChange = (design: any) => {
    this.setState({ design })
    // console.log JSON.stringify(design, null, 2)
    return window.localStorage.setItem("MWaterDirectMapPane.design", JSON.stringify(design))
  }

  handleExtraTablesChange = (extraTables: any) => {
    this.setState({ extraTables })
    return window.localStorage.setItem("MWaterDirectMapPane.extraTables", JSON.stringify(extraTables))
  }

  render() {
    return React.createElement(
      MWaterLoaderComponent,
      {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        extraTables: this.state.extraTables,
        onExtraTablesChange: this.handleExtraTablesChange
      },
      (error: any, config: any) => {
        // Create map url source
        const mapDataSource = new DirectMapDataSource({
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          schema: config.schema,
          dataSource: config.dataSource,
          design: this.state.design
        })

        return R(
          "div",
          { style: { height: "100%" } },
          React.createElement(visualization.MapComponent, {
            schema: config.schema,
            dataSource: config.dataSource,
            design: this.state.design,
            mapDataSource,
            onDesignChange: this.handleDesignChange,
            onRowClick: (tableId: any, rowId: any) => console.log(`Click ${tableId}:${rowId}`),
            titleElem: "Sample"
          })
        )
      }
    )
  }
}

class MWaterDatagridPane extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      design: datagridDesign,
      extraTables: [] // "responses:3aee880e079a417ea51d388d95217edf"]
    }
  }

  handleDesignChange = (design: any) => {
    this.setState({ design })
    return console.log(JSON.stringify(design, null, 2))
  }

  render() {
    return R(
      MWaterLoaderComponent,
      {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        onExtraTablesChange: (extraTables: any) => this.setState({ extraTables }),
        extraTables: this.state.extraTables
      },
      (error: any, config: any) => {
        const datagridDataSource = new DirectDatagridDataSource({
          schema: config.schema,
          dataSource: config.dataSource
        })

        return R(
          "div",
          { style: { height: "100%" } },
          R(visualization.DatagridComponent, {
            schema: config.schema,
            dataSource: config.dataSource,
            datagridDataSource,
            design: this.state.design,
            onDesignChange: this.handleDesignChange,
            titleElem: "Sample",
            onRowDoubleClick: function () {
              return console.log(arguments)
            }.bind(this),
            canEditExpr: (tableId: string, rowId: any, expr: Expr) => { return Promise.resolve(true) },
            updateExprValues: (tableId: string, rowUpdates: any[]) => {
              console.log(rowUpdates)
              return new Promise<void>((resolve) => {
                setTimeout(() => {
                  resolve()
                }, 1000)
              })
            }
          })
        )
      }
    )
  }
}

class WaterOrgDashboardPane extends React.Component {
  constructor(props: any) {
    super(props)

    this.state = {
      design: { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" }
    }
  }

  componentWillMount() {
    const url = this.props.apiUrl + "jsonql/schema"
    return $.getJSON(url, (schemaJson) => {
      const schema = new Schema(schemaJson)
      const dataSource = new MWaterDataSource(this.props.apiUrl, null, { serverCaching: false, localCaching: true })

      return this.setState({ schema, dataSource })
    }).fail((xhr) => {
      console.log(xhr.responseText)
      throw new Error("Cannot connect")
    })
  }

  handleDesignChange = (design: any) => {
    this.setState({ design })
    return console.log(JSON.stringify(design, null, 2))
  }

  render() {
    if (!this.state.schema) {
      return R("div", null, "Loading...")
    }

    const dashboardDataSource = new DirectDashboardDataSource({
      apiUrl: this.props.apiUrl,
      schema: this.state.schema,
      dataSource: this.state.dataSource
    })

    return R(
      "div",
      { style: { height: "100%" } },
      React.createElement(visualization.DashboardComponent, {
        schema: this.state.schema,
        dataSource: this.state.dataSource,
        dashboardDataSource,
        design: this.state.design,
        onDesignChange: this.handleDesignChange,
        titleElem: "Sample"
      })
    )
  }
}

// class MapPane extends React.Component
//   constructor: (props) ->
//     super

//     @state = {
//       schema: null
//       dataSource: null
//       design: mapDesign
//       layerFactory: null
//     }

//   componentDidMount: ->
//     $.getJSON @props.apiUrl + "jsonql/schema", (schemaJson) =>
//       schema = new Schema(schemaJson)
//       dataSource = new MWaterDataSource(@props.apiUrl, @props.client, { serverCaching: false, localCaching: true })

//       layerFactory = new LayerFactory({
//         schema: schema
//         dataSource: dataSource
//         apiUrl: @props.apiUrl
//         client: @props.client
//         newLayers: [
//           { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
//           { name: "Custom Layer", type: "Markers", design: {} }
//         ]
//         onMarkerClick: (table, id) => alert("#{table}:#{id}")
//       })

//       @setState(schema: schema, dataSource: dataSource, layerFactory: layerFactory)

//   handleDesignChange: (design) =>
//     @setState(design: design)
//     console.log JSON.stringify(design, null, 2)

//   render: ->
//     React.createElement(visualization.MapComponent, {
//       layerFactory: @
//     schema: PropTypes.object.isRequired
//     dataSource: PropTypes.object.isRequired # Data source to use

//     design: PropTypes.object.isRequired
//     onDesignChange: PropTypes.func  # Null/undefined for readonly
//     })

var datagridDesign = {
  table: "entities.water_point",
  columns: [
    {
      id: "5859b3fc-64f0-42c1-a035-9dffbfd13132",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "code"
      }
    },
    {
      id: "a2c21f4f-2f15-4d11-b2cc-eba8c85e0bbb",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "desc"
      }
    },
    {
      id: "4162d2d4-c8d0-4e13-8075-7e42f44e57c2",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "location"
      }
    },
    {
      id: "d5bb43c5-5666-43d9-aef5-3b20fe0d8eee",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "location_accuracy"
      }
    },
    {
      id: "220f48a7-565f-4374-b42d-eed32a799421",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "location_altitude"
      }
    },
    {
      id: "dcab1083-a60f-4def-bd7d-de4c9dff4945",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "name"
      }
    },
    {
      id: "34671083-a60f-4def-bd7d-de4c9dff4945",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "type"
      }
    },
    {
      id: "3e53e5f9-149d-4a69-8e90-a18a19efc843",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "photos"
      }
    },
    {
      id: "aea0a8fd-1470-46ea-93e8-939b0797b0f6",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "_created_by"
      }
    },
    {
      id: "918804c5-769e-4e4a-aacf-762d4474eb61",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "_created_on"
      }
    }
  ],
  quickfilters: [
    {
      table: "entities.water_point",
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "type"
      },
      label: null
    }
  ]
}

// mapDesign = {
//   "baseLayer": "bing_road",
//   "layerViews": [
//      # { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" }, visible: true }
//     #  {
//     #   id: "4ed3415c-30c1-45fe-8984-dbffb9dd42d1"
//     #   name: "Choropleth"
//     #   type: "AdminIndicatorChoropleth"
//     #   design: {
//     #     scope: 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
//     #     table: "entities.water_point"
//     #     adminRegionExpr: { type: "scalar", table: "entities.water_point", joins: ['admin_region'], expr: { type: "id", table: "admin_regions" } }
//     #     detailLevel: 1
//     #     condition: {
//     #       type: "op"
//     #       op: "="
//     #       table: "entities.water_point"
//     #       exprs: [
//     #         { type: "field", table: "entities.water_point", column: "type" }
//     #         { type: "literal", valueType: "enum", value: "Protected dug well" }
//     #       ]
//     #     }
//     #   }
//     #   visible: true
//     # }
//     # {
//     #   "id": "afbf76a3-29b8-4a11-882c-42aa21a3ca7a",
//     #   "name": "Untitled Layer",
//     #   "desc": "",
//     #   "type": "AdminChoropleth",
//     #   "visible": true,
//     #   "opacity": 1,
//     #   "design": {
//     #     "adminRegionExpr": {
//     #       "type": "scalar",
//     #       "table": "entities.water_point",
//     #       "joins": [
//     #         "admin_region"
//     #       ],
//     #       "expr": {
//     #         "type": "id",
//     #         "table": "admin_regions"
//     #       }
//     #     },
//     #     "axes": {
//     #       "color": {
//     #         "expr": {
//     #           "type": "op",
//     #           "op": "percent where",
//     #           "table": "entities.water_point",
//     #           "exprs": []
//     #         },
//     #         "xform": {
//     #           "type": "bin",
//     #           "numBins": 6,
//     #           "min": 0,
//     #           "max": 100
//     #         },
//     #         "colorMap": [
//     #           {
//     #             "value": 1,
//     #             "color": "#f8e71c"
//     #           },
//     #           {
//     #             "value": 2,
//     #             "color": "#7ed321"
//     #           },
//     #           {
//     #             "value": 3,
//     #             "color": "#f5a623"
//     #           },
//     #           {
//     #             "value": 4,
//     #             "color": "#d0021b"
//     #           },
//     #           {
//     #             "value": 5,
//     #             "color": "#4725f0"
//     #           }
//     #         ]
//     #       }
//     #     },
//     #     "opacity": 1,
//     #     "nameLabels": true,
//     #     "filter": null,
//     #     "scope": "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
//     #     "detailLevel": 1,
//     #     "table": "entities.water_point",
//     #     "color": "#9b9b9b"
//     #   }
//     # }
//   ]
//   filters: {}
//   bounds: {
//     "w": 23.1591796875,
//     "n": 4.214943141390651,
//     "e": 44.2529296875,
//     "s": -18.583775688370928
//   }
// }

const mapDesign = {
  baseLayer: "cartodb_positron",
  layerViews: [
    // {
    //   "id": "afbf76a3-29b8-4a11-882c-42aa21a3ca7a",
    //   "name": "Untitled Layer",
    //   "desc": "",
    //   "type": "AdminChoropleth",
    //   "visible": true,
    //   "opacity": 1,
    //   "design": {
    //     "adminRegionExpr": {
    //       "type": "scalar",
    //       "table": "entities.water_point",
    //       "joins": [
    //         "admin_region"
    //       ],
    //       "expr": {
    //         "type": "id",
    //         "table": "admin_regions"
    //       }
    //     },
    //     "axes": {
    //       "color": {
    //         "expr": {
    //           "type": "op",
    //           "op": "percent where",
    //           "table": "entities.water_point",
    //           "exprs": [
    //             {
    //               "type": "op",
    //               "table": "entities.water_point",
    //               "op": "= any",
    //               "exprs": [
    //                 {
    //                   "type": "field",
    //                   "table": "entities.water_point",
    //                   "column": "type"
    //                 },
    //                 {
    //                   "type": "literal",
    //                   "valueType": "enumset",
    //                   "value": [
    //                     "Protected dug well"
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         "xform": {
    //           "type": "bin",
    //           "numBins": 6,
    //           "min": 0,
    //           "max": 100
    //         },
    //         "colorMap": [
    //           {
    //             "value": 0,
    //             "color": "#c1cce6"
    //           },
    //           {
    //             "value": 1,
    //             "color": "#99abd6"
    //           },
    //           {
    //             "value": 2,
    //             "color": "#748dc8"
    //           },
    //           {
    //             "value": 3,
    //             "color": "#4c6db8"
    //           },
    //           {
    //             "value": 4,
    //             "color": "#3c5796"
    //           },
    //           {
    //             "value": 5,
    //             "color": "#2d4171"
    //           },
    //           {
    //             "value": 6,
    //             "color": "#1d2a49"
    //           },
    //           {
    //             "value": 7,
    //             "color": "#0f1524"
    //           }
    //         ]
    //       }
    //     },
    //     "opacity": 1,
    //     "nameLabels": true,
    //     "filter": null,
    //     "scope": "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
    //     "detailLevel": 1,
    //     "table": "entities.water_point",
    //     "color": "#9b9b9b",
    //     "fillOpacity": 0.75,
    //     "displayNames": true
    //   }
    // },
    {
      id: "0c6525a2-1300-48db-b793-ba7806827f3c",
      name: "Untitled Layer",
      desc: "",
      type: "Markers",
      visible: false,
      opacity: 1,
      design: {
        axes: {
          geometry: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "location"
            }
          },
          color: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "drilling_method_other"
            },
            colorMap: [
              {
                value: null,
                color: "#d49097"
              },
              {
                value: "a pied",
                color: "#ba4f5a"
              },
              {
                value: "testing other",
                color: "#81323a"
              },
              {
                value: "A pied",
                color: "#3e181c"
              }
            ],
            drawOrder: [null, "a pied", "testing other", "A pied"]
          }
        },
        color: "#0088FF",
        filter: null,
        table: "entities.water_point",
        popup: {
          items: {
            id: "root",
            type: "root",
            blocks: [
              {
                id: "f5dcf519-0287-4f65-ab44-abdd609b704b",
                type: "horizontal",
                blocks: [
                  {
                    id: "e50f7026-44f2-44fd-9c19-a2c412d6cf10",
                    type: "vertical",
                    blocks: [
                      {
                        type: "widget",
                        widgetType: "Text",
                        design: {
                          style: "title",
                          items: [
                            {
                              type: "expr",
                              id: "1af0f88c-db39-46bb-ad5a-4777a7d0357d",
                              expr: {
                                type: "field",
                                table: "entities.water_point",
                                column: "name"
                              }
                            }
                          ]
                        },
                        id: "b2becac4-db3c-48b8-92db-9f1d2da0df97"
                      },
                      {
                        type: "widget",
                        widgetType: "Text",
                        design: {
                          items: [
                            "Description: ",
                            {
                              type: "expr",
                              id: "d3813f6f-a8c6-4783-80ca-70a18e8fa630",
                              expr: {
                                type: "field",
                                table: "entities.water_point",
                                column: "desc"
                              }
                            },
                            {
                              type: "element",
                              tag: "div",
                              items: [
                                "Type: ",
                                {
                                  type: "expr",
                                  id: "7c74bf50-d649-4e25-a80b-27504d029f4c",
                                  expr: {
                                    type: "field",
                                    table: "entities.water_point",
                                    column: "type"
                                  }
                                },
                                {
                                  type: "element",
                                  tag: "br",
                                  items: []
                                }
                              ]
                            }
                          ]
                        },
                        id: "47e4be90-cfad-4145-8afd-3adfb2ac2882"
                      }
                    ]
                  },
                  {
                    type: "widget",
                    widgetType: "Image",
                    design: {},
                    id: "858fb20f-5f5f-48cf-8fe3-a4f3639b7684"
                  }
                ]
              }
            ]
          }
        }
      }
    },
    {
      id: "cc3771af-ce10-48ee-b48a-e698513fa8bf",
      name: "Untitled Layer",
      desc: "",
      type: "Buffer",
      visible: false,
      opacity: 1,
      design: {
        axes: {
          geometry: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "location"
            }
          },
          color: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "drilling_method"
            },
            colorMap: [
              {
                value: "manual",
                color: "#d49097"
              },
              {
                value: "mechanical",
                color: "#a9424c"
              },
              {
                value: "other",
                color: "#542126"
              }
            ],
            drawOrder: ["manual", "mechanical", "other"]
          }
        },
        radius: 100000,
        fillOpacity: 0.5,
        filter: null,
        table: "entities.water_point",
        color: "#6244f8"
      }
    }
  ],
  filters: {},
  bounds: {
    //    "w": 10.590820312499998,
    //    "n": 15.241789855961722,
    //    "e": 41.4404296875,
    //    "s": -27.33273513685913
    w: 10.590820312499998,
    n: 15.241789855961722,
    e: 41.4404296875,
    s: -27.33273513685913
  }
}

// bounds: { w: -40, n: 25, e: 40, s: -25 }
// mapDesign = {
//   "baseLayer": "bing_road",
//   "layerViews": [
//      {
//       id: "4ed3415c-30c1-45fe-8984-dbffb9dd42d1"
//       name: "Buffer"
//       type: "Buffer"
//       design: {
//         table: "entities.water_point"
//         opacity: 0.5
//         radius: 1000
//         "axes": {
//           "geometry": {
//             "expr": {
//               "type": "field",
//               "table": "entities.water_point",
//               "column": "location"
//             },
//             "xform": null
//           }
//           "color": {
//             "expr": {
//               "type": "field",
//               "table": "entities.water_point",
//               "column": "type"
//             },
//             "xform": null,
//             "colorMap": [
//               {
//                 "value": "Protected dug well",
//                 "color": "#d0021b"
//               },
//               {
//                 "value": "Piped into dwelling",
//                 "color": "#7ed321"
//               },
//               {
//                 "value": "Borehole or tubewell",
//                 "color": "#f8e71c"
//               }
//             ]
//           }
//         },
//         color: "#9b9b9b"
//         filter: null
//       }
//       visible: true
//     }
//      { id: "old_func_status", name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" }, visible: true }
//   ]
//   filters: {}
//   bounds: {
//     "w": 32.75848388671875,
//     "n": -2.217997457638444,
//     "e": 33.4808349609375,
//     "s": -2.9375549775994263
//   }
// }

const imageWidgetDashboardDesign = {
  items: {
    "3f8ffda5-79c4-423d-95f3-152b94bba6d4": {
      layout: {
        x: 0,
        y: 0,
        w: 9,
        h: 7
      },
      widget: {
        type: "Image",
        design: {
          uid: "cfce4760503a422d88da67ef55b1e82b",
          imageUrl: null,
          expr: null
          //          "imageURL": "https://img0.etsystatic.com/108/0/6281042/il_570xN.916411774_dslp.jpg"
        }
      }
    }
  }
}

let oldDashboardDesign = {
  items: {
    "c83b1d83-bc2b-4c87-a7fc-2e4bcd7694d8": {
      layout: {
        x: 0,
        y: 0,
        w: 8,
        h: 8
      },
      widget: {
        type: "Map",
        design: {
          baseLayer: "bing_road",
          layerViews: [
            {
              id: "53c9d731-dbe6-4987-b0ef-434a944b26b5",
              name: "Water points",
              desc: "",
              type: "Markers",
              visible: true,
              opacity: 1,
              design: {
                axes: {
                  geometry: {
                    expr: {
                      type: "field",
                      table: "entities.water_point",
                      column: "location"
                    }
                  },
                  color: {
                    expr: {
                      type: "field",
                      table: "entities.water_point",
                      column: "drilling_method_other"
                    },
                    colorMap: [
                      {
                        value: null,
                        color: "#d49097"
                      },
                      {
                        value: "a pied",
                        color: "#ba4f5a"
                      },
                      {
                        value: "testing other",
                        color: "#81323a"
                      },
                      {
                        value: "A pied",
                        color: "#3e181c"
                      }
                    ],
                    drawOrder: [null, "a pied", "testing other", "A pied"]
                  }
                },
                color: "#0088FF",
                filter: null,
                table: "entities.water_point",
                symbol: "font-awesome/star"
              }
            },
            {
              id: "53c9d731-dbe6-4987-b0ef-434a944b26a5",
              name: "Schools",
              desc: "",
              type: "Markers",
              visible: true,
              opacity: 1,
              design: {
                axes: {
                  geometry: {
                    expr: {
                      type: "field",
                      table: "entities.school",
                      column: "location"
                    }
                  }
                },
                color: "#5e354c",
                filter: null,
                table: "entities.school",
                symbol: "font-awesome/h-square"
              }
            },
            {
              id: "656b346f-c4ee-41e7-b6bc-2c7361403d62",
              name: "Affected Area",
              desc: "",
              type: "Buffer",
              visible: true,
              opacity: 1,
              design: {
                axes: {
                  geometry: {
                    expr: {
                      type: "field",
                      table: "entities.water_system",
                      column: "location"
                    }
                  },
                  color: {
                    expr: {
                      type: "scalar",
                      table: "entities.water_system",
                      joins: ["!entities.water_point.water_system"],
                      expr: {
                        type: "op",
                        op: "count",
                        table: "entities.water_point",
                        exprs: []
                      }
                    },
                    xform: {
                      type: "bin",
                      numBins: 6,
                      min: 1,
                      max: 3000
                    },
                    colorMap: [
                      {
                        value: 0,
                        color: "#9c9ede"
                      },
                      {
                        value: 1,
                        color: "#7375b5"
                      },
                      {
                        value: 2,
                        color: "#4a5584"
                      },
                      {
                        value: 3,
                        color: "#cedb9c"
                      },
                      {
                        value: 4,
                        color: "#b5cf6b"
                      },
                      {
                        value: 5,
                        color: "#8ca252"
                      },
                      {
                        value: 6,
                        color: "#637939"
                      },
                      {
                        value: 7,
                        color: "#e7cb94"
                      }
                    ],
                    drawOrder: [7, 2, 5, 6, 1, 0, 3, 4]
                  }
                },
                radius: 500000,
                fillOpacity: 0.5,
                filter: null,
                table: "entities.water_system",
                color: "#25250e"
              }
            },
            {
              id: "1ae794c7-77e5-41c5-beba-54734221a7ba",
              name: "Water surfaces",
              desc: "",
              type: "AdminChoropleth",
              visible: true,
              opacity: 1,
              design: {
                color: "#8f5c5c",
                adminRegionExpr: {
                  type: "scalar",
                  table: "entities.surface_water",
                  joins: ["admin_region"],
                  expr: {
                    type: "id",
                    table: "admin_regions"
                  }
                },
                axes: {
                  color: {
                    expr: {
                      type: "op",
                      op: "count",
                      table: "entities.surface_water",
                      exprs: []
                    },
                    xform: {
                      type: "bin",
                      numBins: 6,
                      min: 0,
                      max: 1000
                    },
                    colorMap: [
                      {
                        value: 0,
                        color: "#c1e6e6"
                      },
                      {
                        value: 1,
                        color: "#99d6d6"
                      },
                      {
                        value: 2,
                        color: "#74c8c8"
                      },
                      {
                        value: 3,
                        color: "#4cb8b8"
                      },
                      {
                        value: 4,
                        color: "#3c9696"
                      },
                      {
                        value: 5,
                        color: "#2d7171"
                      },
                      {
                        value: 6,
                        color: "#1d4949"
                      },
                      {
                        value: 7,
                        color: "#0f2424"
                      }
                    ]
                  }
                },
                fillOpacity: 0.75,
                displayNames: true,
                filter: null,
                scope: null,
                detailLevel: 0,
                table: "entities.surface_water"
              }
            }
          ],
          filters: {},
          bounds: {
            w: -69.9609375,
            n: 57.136239319177434,
            e: 69.9609375,
            s: -57.13623931917743
          }
        }
      }
    }
    //    "4ed3415c-30c1-45fe-8984-dbffb9dd42d1": {
    //      "layout": {
    //        "x": 0,
    //        "y": 0,
    //        "w": 8,
    //        "h": 8
    //      },
    //      "widget": {
    //        "type": "LayeredChart",
    //        "design": {
    //          "xAxisLabelText": "",
    //          "yAxisLabelText": "",
    //          "version": 2,
    //          "layers": [
    //            {
    //              "axes": {
    //                "color": {
    //                  "expr": {
    //                    "type": "scalar",
    //                    "table": "entities.water_point",
    //                    "joins": [
    //                      "!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"
    //                    ],
    //                    "expr": {
    //                      "type": "field",
    //                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
    //                      "column": "Functionality"
    //                    },
    //                    "aggr": "last"
    //                  },
    //                  "xform": null
    //                },
    //                "y": {
    //                  "expr": {
    //                    "type": "id",
    //                    "table": "entities.water_point"
    //                  },
    //                  "aggr": "count",
    //                  "xform": null
    //                }
    //              },
    //              "filter": {
    //                "type": "op",
    //                "table": "entities.water_point",
    //                "op": "= any",
    //                "exprs": [
    //                  {
    //                    "type": "scalar",
    //                    "table": "entities.water_point",
    //                    "joins": [
    //                      "!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"
    //                    ],
    //                    "expr": {
    //                      "type": "field",
    //                      "table": "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
    //                      "column": "Functionality"
    //                    },
    //                    "aggr": "last"
    //                  },
    //                  {
    //                    "type": "literal",
    //                    "valueType": "enumset",
    //                    "value": []
    //                  }
    //                ]
    //              },
    //              "table": "entities.water_point"
    //            }
    //          ],
    //          "type": "donut"
    //        }
    //      }
    //    },
    //    "1219bae7-b616-4c53-8423-a6495ecf26f9": {
    //      "layout": {
    //        "x": 16,
    //        "y": 0,
    //        "w": 8,
    //        "h": 8
    //      },
    //      "widget": {
    //        "type": "ImageMosaicChart",
    //        "design": {
    //          "version": 1,
    //          "imageAxis": {
    //            "expr": {
    //              "type": "field",
    //              "table": "entities.community",
    //              "column": "photos"
    //            }
    //          },
    //          "filter": null,
    //          "table": "entities.community",
    //          "titleText": "gfhfdg hdfgh dfh"
    //        }
    //      }
    //    },
    //    "c84506e8-727d-4515-9579-fd66220ebdea": {
    //      "layout": {
    //        "x": 8,
    //        "y": 0,
    //        "w": 8,
    //        "h": 8
    //      },
    //      "widget": {
    //        "type": "TableChart",
    //        "design": {
    //          "version": 1,
    //          "columns": [
    //            {
    //              "textAxis": {
    //                "expr": {
    //                  "type": "op",
    //                  "op": "count",
    //                  "table": "entities.water_point",
    //                  "exprs": []
    //                }
    //              },
    //              "headerText": "# Water points"
    //            },
    //            {
    //              "textAxis": {
    //                "expr": {
    //                  "type": "op",
    //                  "table": "entities.water_point",
    //                  "op": "percent where",
    //                  "exprs": [
    //                    {
    //                      "type": "op",
    //                      "table": "entities.water_point",
    //                      "op": "= any",
    //                      "exprs": [
    //                        {
    //                          "type": "field",
    //                          "table": "entities.water_point",
    //                          "column": "type"
    //                        },
    //                        {
    //                          "type": "literal",
    //                          "valueType": "enumset",
    //                          "value": [
    //                            "Protected dug well",
    //                            "Unprotected dug well"
    //                          ]
    //                        }
    //                      ]
    //                    }
    //                  ]
    //                }
    //              },
    //              "headerText": "% Dug Wells"
    //            },
    //            {
    //              "textAxis": {
    //                "expr": {
    //                  "type": "scalar",
    //                  "table": "entities.water_point",
    //                  "joins": [
    //                    "admin_region"
    //                  ],
    //                  "expr": {
    //                    "type": "field",
    //                    "table": "admin_regions",
    //                    "column": "country"
    //                  }
    //                }
    //              },
    //              "headerText": "Country"
    //            }
    //          ],
    //          "orderings": [
    //            {
    //              "axis": {
    //                "expr": {
    //                  "type": "op",
    //                  "op": "count",
    //                  "table": "entities.water_point",
    //                  "exprs": []
    //                }
    //              },
    //              "direction": "desc"
    //            }
    //          ],
    //          "table": "entities.water_point"
    //        }
    //      }
    //    }
  }
}
// "d41a2dd2-85bd-46d8-af9a-a650af4c0047": {
//   "layout": {
//     "x": 16,
//     "y": 0,
//     "w": 8,
//     "h": 6
//   },
//   "widget": {
//     "type": "TableChart",
//     "design": {
//       "version": 1,
//       "columns": [
//         {
//           "textAxis": {
//             "expr": {
//               "type": "scalar",
//               "table": "entities.water_point",
//               "joins": [],
//               "expr": {
//                 "type": "field",
//                 "table": "entities.water_point",
//                 "column": "type"
//               }
//             },
//             "headerText": "This is a reallyyyyyyyyyy long title "
//           }
//         },
//         {
//           "textAxis": {
//             "expr": {
//               "type": "scalar",
//               "table": "entities.water_point",
//               "joins": [],
//               "expr": {
//                 "type": "count",
//                 "table": "entities.water_point"
//               }
//             },
//             "aggr": "count",
//             "headerText": "This is a reallyyyyyyyyyy long title "
//           }
//         },
//         {
//           "textAxis": {
//             "expr": {
//               "type": "field",
//               "table": "entities.water_point",
//               "column": "desc"
//             }
//           },
//           "headerText": "This is a reallyyyyyyyyyy long title "
//         }
//       ],
//       "orderings": [],
//       "table": "entities.water_point",
//       "titleText": "TEST",
//       "filter": {
//         "type": "op",
//         "table": "entities.water_point",
//         "op": "=",
//         "exprs": [
//           {
//             "type": "field",
//             "table": "entities.water_point",
//             "column": "code"
//           },
//           {
//             "type": "literal",
//             "valueType": "text",
//             "value": "10007"
//           }
//         ]
//       }
//     }
//   }
// },
// "d2ea9c20-bcd3-46f6-8f78-ccb795d1a91a": {
//   "layout": {
//     "x": 0,
//     "y": 0,
//     "w": 8,
//     "h": 8
//   },
//   "widget": {
//     "type": "Map",
//     "design": {
//       "baseLayer": "bing_road",
//       "layerViews": [
//         {
//           "id": "827187bf-a5fd-4d07-b34b-1e213407f96d",
//           "name": "Custom Layer",
//           "desc": "",
//           "type": "Markers",
//           "design": {
//             "sublayers": [
//               {
//                 "axes": {
//                   "geometry": {
//                     "expr": {
//                       "type": "field",
//                       "table": "entities.water_point",
//                       "column": "location"
//                     },
//                     "xform": null
//                   },
//                   "color": {
//                     "expr": {
//                       "type": "field",
//                       "table": "entities.water_point",
//                       "column": "type"
//                     },
//                     "xform": null,
//                     "colorMap": [
//                       {
//                         "value": "Protected dug well",
//                         "color": "#d0021b"
//                       },
//                       {
//                         "value": "Piped into dwelling",
//                         "color": "#4a90e2"
//                       }
//                     ]
//                   }
//                 },
//                 "color": "#0088FF",
//                 "filter": null,
//                 "table": "entities.water_point",
//                 "symbol": "font-awesome/star"
//               }
//             ]
//           },
//           "visible": true,
//           "opacity": 1
//         }
//       ],
//       "filters": {},
//       "bounds": {
//         "w": -103.7548828125,
//         "n": 23.160563309048314,
//         "e": -92.4169921875,
//         "s": 12.382928338487408
//       }
//     }
//   }
// },
// "9ef85e17-73aa-4b5f-8363-95f9a2e24193": {
//   "layout": {
//     "x": 8,
//     "y": 0,
//     "w": 8,
//     "h": 8
//   },
//   "widget": {
//     "type": "LayeredChart",
//     "design": {
//       "version": 1,
//       "layers": [
//         {
//           "axes": {
//             "x": {
//               "expr": {
//                 "type": "field",
//                 "table": "entities.water_point",
//                 "column": "type"
//               },
//               "xform": null
//             },
//             "y": {
//               "expr": {
//                 "type": "id",
//                 "table": "entities.water_point"
//               },
//               "aggr": "count",
//               "xform": null
//             }
//           },
//           "filter": null,
//           "table": "entities.water_point"
//         }
//       ],
//       "type": "bar"
//     }
//   }
// }
//   }
// }

//   {
//   "items": {
//     "df5aa9d4-20fb-4735-9178-ba7cc543fa27": {
//       "layout": {
//         "x": 0,
//         "y": 0,
//         "w": 8,
//         "h": 8
//       },
//       "widget": {
//         "type": "LayeredChart",
//         "design": {
//           "version": 1,
//           "layers": [
//             {
//               "axes": {
//                 "x": {
//                   "expr": {
//                     "type": "field",
//                     "table": "responses:e24f0a0ec11643cab3c21c07de2f6889",
//                     "column": "data:fd43a6faa6764490ab82eae19d71af71:value"
//                   },
//                   "xform": {
//                     "type": "bin",
//                     "numBins": 6
//                   }
//                 },
//                 "y": {
//                   "expr": {
//                     "type": "id",
//                     "table": "responses:e24f0a0ec11643cab3c21c07de2f6889"
//                   },
//                   "aggr": "count",
//                   "xform": null
//                 }
//               },
//               "filter": null,
//               "table": "responses:e24f0a0ec11643cab3c21c07de2f6889"
//             }
//           ],
//           "type": "bar"
//         }
//       }
//     }
//   }
// }

//   "items": {
//     "0f55a8aa-afff-4511-870d-63dd604c1525": {
//       "layout": {
//         "x": 0,
//         "y": 0,
//         "w": 8,
//         "h": 8
//       },
//       "widget": {
//         "type": "Map",
//         "design": {
//           "baseLayer": "bing_road",
//           "layerViews": [
//             {
//               "id": "7002dace-6b00-44f6-98fb-d136817ac6c1",
//               "name": "Custom Layer",
//               "desc": "",
//               "type": "Markers",
//               "design": {
//                 "sublayers": [
//                   {
//                     "axes": {
//                       "geometry": {
//                         "expr": {
//                           "type": "field",
//                           "table": "entities.community",
//                           "column": "location"
//                         },
//                         "xform": null
//                       }
//                     },
//                     "color": "#0088FF",
//                     "filter": null,
//                     "table": "entities.community",
//                     "symbol": "font-awesome/times"
//                   }
//                 ]
//               },
//               "visible": true,
//               "opacity": 1
//             }
//           ],
//           "filters": {},
//           "bounds": {
//             "w": -52.91015625,
//             "n": 46.6795944656402,
//             "e": 52.91015625,
//             "s": -46.679594465640186
//           }
//         }
//       }
//     }
//   }
// }

//   "items": {
//     "c78d1987-a14e-4cab-b772-4a56136e2641": {
//       "layout": {
//         "x": 0,
//         "y": 0,
//         "w": 8,
//         "h": 8
//       },
//       "widget": {
//         "type": "CalendarChart",
//         "design": {
//           "version": 1,
//           "dateAxis": {
//             "expr": {
//               "type": "field",
//               "table": "entities.water_point",
//               "column": "_created_on"
//             },
//             "xform": {
//               "type": "date"
//             }
//           },
//           "valueAxis": {
//             "expr": {
//               "type": "id",
//               "table": "entities.water_point"
//             },
//             "aggr": "count",
//             "xform": null
//           },
//           "filter": null,
//           "table": "entities.water_point"
//         }
//       }
//     }
//   }
// }

oldDashboardDesign = {
  items: {
    "e08ef8a3-34db-467d-ac78-f0f273d49f25": {
      layout: {
        x: 0,
        y: 0,
        w: 8,
        h: 8
      },
      widget: {
        type: "Markdown",
        design: {
          markdown:
            "# Header 1\n## Header 2\n### Header 3\nText Text Text More Text\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      }
    },
    "9d8df869-8869-4191-aa18-b58142f9c961": {
      layout: {
        x: 8,
        y: 0,
        w: 10,
        h: 8
      },
      widget: {
        type: "LayeredChart",
        design: {
          version: 1,
          layers: [
            {
              axes: {
                color: {
                  expr: {
                    type: "scalar",
                    table: "entities.water_point",
                    joins: [],
                    expr: {
                      type: "field",
                      table: "entities.water_point",
                      column: "type"
                    }
                  },
                  xform: null
                },
                y: {
                  expr: {
                    type: "scalar",
                    table: "entities.water_point",
                    expr: {
                      type: "count",
                      table: "entities.water_point"
                    },
                    joins: []
                  },
                  aggr: "count",
                  xform: null
                }
              },
              filter: null,
              table: "entities.water_point"
            }
          ],
          type: "donut"
        }
      }
    },
    "409d7b5b-e1d9-4e18-bd45-afdead7fe18f": {
      layout: {
        x: 0,
        y: 8,
        w: 18,
        h: 8
      },
      widget: {
        type: "LayeredChart",
        design: {
          version: 1,
          layers: [
            {
              axes: {
                x: {
                  expr: {
                    type: "scalar",
                    table: "entities.news_item",
                    joins: [],
                    expr: {
                      type: "field",
                      table: "entities.news_item",
                      column: "post_country"
                    }
                  },
                  xform: null
                },
                y: {
                  expr: {
                    type: "scalar",
                    table: "entities.news_item",
                    expr: {
                      type: "count",
                      table: "entities.news_item"
                    },
                    joins: []
                  },
                  aggr: "count",
                  xform: null
                }
              },
              filter: null,
              table: "entities.news_item"
            }
          ],
          type: "bar",
          titleText: "Some Title"
        }
      }
    },
    "d41a2dd2-85bd-46d8-af9a-a650af4c0047": {
      layout: {
        x: 0,
        y: 16,
        w: 8,
        h: 8
      },
      widget: {
        type: "TableChart",
        design: {
          version: 1,
          columns: [
            {
              textAxis: {
                expr: {
                  type: "scalar",
                  table: "entities.water_point",
                  joins: [],
                  expr: {
                    type: "field",
                    table: "entities.water_point",
                    column: "type"
                  }
                }
              }
            },
            {
              textAxis: {
                expr: {
                  type: "scalar",
                  table: "entities.water_point",
                  joins: [],
                  expr: {
                    type: "count",
                    table: "entities.water_point"
                  }
                },
                aggr: "count"
              }
            }
          ],
          orderings: [],
          table: "entities.water_point",
          titleText: "TEST"
        }
      }
    }
  }
}
//   "items": {
//     "b854aa65-7644-4b67-b0a4-d2344e7eb43a": {
//       "layout": {
//         "x": 0,
//         "y": 0,
//         "w": 8,
//         "h": 8
//       },
//       "widget": {
//         "type": "LayeredChart",
//         design: {"version":1,"type":"line","layers":[{"axes":{"x":{"expr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"field","table":"entities.water_point","column":"_created_on"}},"xform":{"type":"date"}},"y":{"expr":{"type":"scalar","table":"entities.water_point","joins":[],"expr":{"type":"count","table":"entities.water_point"}},"xform":null,"aggr":"count"}},"filter":null,"table":"entities.water_point","cumulative":true}]}
//       }
//     }
//   }
// }

//   "items": {
//     "b854aa65-7644-4b67-b0a4-d2344e7eb43a": {
//       "layout": {
//         "x": 0,
//         "y": 0,
//         "w": 8,
//         "h": 8
//       },
//       "widget": {
//         "type": "LayeredChart",
//         "design": {
//           "type": "donut",
//           "layers": [
//             {
//               "axes": {
//                 "y": {
//                   "expr": {
//                     "type": "scalar",
//                     "table": "entities.water_point",
//                     "joins": [],
//                     "expr": {
//                       "type": "count",
//                       "table": "entities.water_point"
//                     }
//                   },
//                   "aggr": "count"
//                 },
//                 "color": {
//                   "expr": {
//                     "type": "scalar",
//                     "table": "entities.water_point",
//                     "joins": [
//                       "source_notes"
//                     ],
//                     "aggr": "last",
//                     "expr": {
//                       "type": "field",
//                       "table": "source_notes",
//                       "column": "status"
//                     }
//                   }
//                 }
//               },
//               "filter": null,
//               "table": "entities.water_point"
//             }
//           ],
//           "version": 1,
//           "titleText": "Functional Status of Water Points"
//         }
//       }
//     },
//     "cd96f28e-3757-42b2-a00a-0fced38c92d5": {
//       "layout": {
//         "x": 8,
//         "y": 0,
//         "w": 8,
//         "h": 8
//       },
//       "widget": {
//         "type": "LayeredChart",
//         "design": {
//           "version": 1,
//           "type": "bar",
//           "layers": [
//             {
//               "axes": {
//                 "x": {
//                   "expr": {
//                     "type": "field",
//                     "table": "entities.water_point",
//                     "column": "type"
//                   }
//                 },
//                 "y": {
//                   "expr": {
//                     "type": "scalar",
//                     "table": "entities.water_point",
//                     "joins": [],
//                     "expr": {
//                       "type": "count",
//                       "table": "entities.water_point"
//                     }
//                   },
//                   "aggr": "count"
//                 }
//               },
//               "filter": null,
//               "table": "entities.water_point"
//             }
//           ],
//           "transpose": true,
//           "titleText": "Water Points by Type"
//         }
//       }
//     },
//     "3f4a1842-9c14-49fe-9e5d-4c19ae6ba6ec": {
//       "layout": {
//         "x": 0,
//         "y": 8,
//         "w": 11,
//         "h": 7
//       },
//       "widget": {
//         "type": "Map",
//         "design": {
//           "baseLayer": "bing_road",
//           "layerViews": [],
//           "filters": {},
//           "bounds": {
//             "w": 28.487548828125,
//             "n": -0.06591795420830737,
//             "e": 37.44140625,
//             "s": -5.5941182188847876
//           }
//         }
//       }
//     },
//     "353760a5-8976-418d-95cd-0d11ba4aa308": {
//       "layout": {
//         "x": 11,
//         "y": 8,
//         "w": 8,
//         "h": 8
//       },
//       "widget": {
//         "type": "Markdown",
//         "design": {
//           "markdown": "### Sample Dashboard\n\nText widgets can be freely mixed with maps, charts and tables. Charts are connected with each other so that clicking on a bar or slice will filter other views.\n"
//         }
//       }
//     }
//   }
// }# class TestPane extends React.Component
//   constructor: (props) ->
//     super

//     @state = { }

//   componentDidMount: ->
//     $.getJSON @props.apiUrl + "jsonql/schema", (schemaJson) =>
//       @setState()
//     visualization_mwater.setup {
//       apiUrl: @props.apiUrl
//       client: @props.client
//       onMarkerClick: (table, id) => alert("#{table}:#{id}")
//       newLayers: [
//         { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
//         { name: "Custom Layer", type: "Markers", design: {} }
//       ]
//       onFormTableSelect: (id) -> alert(id)
//     }, (err, results) =>
//       if err
//         throw err

//       chart = new LayeredChart(schema: results.schema, dataSource: results.dataSource)
//       design = chart.cleanDesign({})

//       @setState(schema: results.schema, widgetFactory: results.widgetFactory, dataSource: results.dataSource, layerFactory: results.layerFactory, design: design)

//   handleDesignChange: (design) =>
//     chart = new LayeredChart(schema: @state.schema, dataSource: @state.dataSource)
//     @setState(design: chart.cleanDesign(design))
//     console.log JSON.stringify(design, null, 2)

//   render: ->
//     if not @state.widgetFactory
//       return R 'div', null, "Loading..."

//     React.createElement(LayeredChartDesignerComponent,
//       design: @state.design
//       schema: @state.schema
//       dataSource: @state.dataSource
//       onDesignChange: @handleDesignChange
//     )

const rosterDatagridDesign = {
  table: "responses:3aee880e079a417ea51d388d95217edf",
  subtables: [{ id: "r1", joins: ["data:cb4661bb948c4c188f6b94bc7bb3ce1f"] }],
  columns: [
    {
      id: "5fa704cf-f08b-4ff0-9b33-3814238a021a",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf",
        column: "deployment"
      }
    },
    {
      id: "7e90248c-aa7e-4c90-b08a-7be61ac849d1",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf",
        column: "user"
      }
    },
    {
      id: "5882d5b6-ee8c-44a0-abc2-a1782d9d1593",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf",
        column: "status"
      }
    },
    {
      id: "1efa41fa-f173-467b-92ab-144d0899cf1b",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf",
        column: "code"
      }
    },
    {
      id: "39cadddf-0ec7-401f-ade0-39bc726dbc5b",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf",
        column: "submittedOn"
      }
    },
    {
      id: "efc513f6-94b2-4399-a98f-3fbec3a0d502",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf",
        column: "data:ec3613ba32184bf6bd69911055efad71:value"
      }
    },
    {
      id: "79520f3e-71fd-4907-8dc6-6b25741a7277",
      type: "expr",
      width: 150,
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf",
        column: "data:4a276bc577254a63943cf77f86f86382:value"
      }
    },
    {
      id: "roster1",
      type: "expr",
      width: 200,
      subtable: "r1",
      expr: {
        type: "field",
        table: "responses:3aee880e079a417ea51d388d95217edf:roster:cb4661bb948c4c188f6b94bc7bb3ce1f",
        column: "data:37c99596f2e14feaa313431a91e3e620:value"
      }
    }
  ]
}

// class DashboardPane extends React.Component
//   constructor: (props) ->
//     super

//     @state = {
//       schema: null
//       dataSource: null
//       design: dashboardDesign
//     }

//   componentDidMount: ->
//     $.getJSON @props.apiUrl + "jsonql/schema", (schemaJson) =>
//       schema = new Schema(schemaJson)
//       dataSource = new MWaterDataSource(@props.apiUrl, @props.client, { serverCaching: false, localCaching: true })

//       layerFactory = new LayerFactory({
//         schema: schema
//         dataSource: dataSource
//         apiUrl: @props.apiUrl
//         client: @props.client
//         newLayers: [
//           { name: "Functional Status", type: "MWaterServer", design: { type: "functional_status", table: "entities.water_point" } }
//           { name: "Custom Layer", type: "Markers", design: {} }
//         ]
//         onMarkerClick: (table, id) => alert("#{table}:#{id}")
//       })

//       widgetFactory = new WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory)

//       @setState(schema: schema, dataSource: dataSource, layerFactory: layerFactory, widgetFactory: widgetFactory)

//   handleDesignChange: (design) =>
//     @setState(design: design)
//     console.log JSON.stringify(design, null, 2)

//   render: ->
//     if not @state.widgetFactory
//       return R 'div', null, "Loading..."

//     return R 'div', style: { height: "100%" },
//       React.createElement(visualization.DashboardComponent, {
//         design: @state.design
//         widgetFactory: @state.widgetFactory
//         onDesignChange: @handleDesignChange
//         titleElem: "Sample"
//         printScaling: false
//         })

const bufferMap = {
  baseLayer: "cartodb_positron",
  layerViews: [
    {
      id: "6991fe14-03eb-4cf1-a4f5-6e3ebe581482",
      name: "Untitled Layer",
      desc: "",
      type: "Buffer",
      visible: true,
      opacity: 1,
      design: {
        axes: {
          geometry: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "location"
            }
          },
          color: {
            expr: {
              type: "scalar",
              table: "entities.water_point",
              joins: ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
              expr: {
                type: "op",
                op: "last",
                table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                exprs: [
                  {
                    type: "field",
                    table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                    column: "Functionality"
                  }
                ]
              }
            },
            colorMap: [
              {
                value: "Partially functional",
                color: "#ff7f0e"
              },
              {
                value: "Functional",
                color: "#7ed321"
              },
              {
                value: "Not functional",
                color: "#d0021b"
              },
              {
                value: null,
                color: "#9b9b9b"
              },
              {
                value: "No longer exists",
                color: "#000000"
              }
            ],
            drawOrder: ["Functional", "Partially functional", "Not functional", "No longer exists", null]
          }
        },
        radius: 1000,
        fillOpacity: 0.5,
        filter: null,
        table: "entities.water_point",
        color: "#9b9b9b"
      }
    }
  ],
  filters: {},
  bounds: {
    w: 32.01690673828125,
    n: -1.9606767908079445,
    e: 33.86260986328125,
    s: -3.424320686307251
  }
}

const adminRegionMap = {
  baseLayer: "cartodb_positron",
  layerViews: [
    {
      id: "f17cae2c-6357-432f-aaff-c3f98cbc374e",
      name: "Untitled Layer",
      desc: "",
      type: "AdminChoropleth",
      visible: true,
      opacity: 1,
      design: {
        color: "#FFFFFF",
        adminRegionExpr: {
          type: "field",
          table: "entities.water_point",
          column: "admin_region"
        },
        axes: {
          color: {
            expr: {
              type: "op",
              op: "percent where",
              table: "entities.water_point",
              exprs: [
                {
                  type: "op",
                  table: "entities.water_point",
                  op: "= any",
                  exprs: [
                    {
                      type: "field",
                      table: "entities.water_point",
                      column: "type"
                    },
                    {
                      type: "literal",
                      valueType: "enumset",
                      value: ["Protected dug well", "Unprotected dug well"]
                    }
                  ]
                },
                null
              ]
            },
            xform: {
              type: "bin",
              numBins: 6,
              min: 0,
              max: 100
            },
            colorMap: [
              {
                value: 0,
                color: "#c1cce6"
              },
              {
                value: 1,
                color: "#9daed8"
              },
              {
                value: 2,
                color: "#7c93cb"
              },
              {
                value: 3,
                color: "#5b79be"
              },
              {
                value: 4,
                color: "#4361a8"
              },
              {
                value: 5,
                color: "#344c83"
              },
              {
                value: 6,
                color: "#273962"
              },
              {
                value: 7,
                color: "#1a2642"
              },
              {
                value: null,
                color: "#0d1321"
              }
            ],
            drawOrder: [0, 1, 2, 3, 4, 5, 6, 7, null]
          }
        },
        fillOpacity: 0.75,
        displayNames: true,
        filter: null,
        scope: "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
        detailLevel: 2,
        table: "entities.water_point"
      }
    }
  ],
  filters: {},
  bounds: {
    w: 27.916259765625,
    n: -0.7470491450051796,
    e: 42.681884765625,
    s: -12.37219737335794
  }
}

const wholeWorldFuncMap = {
  baseLayer: "cartodb_positron",
  layerViews: [
    {
      id: "83530ec5-6c08-477c-8c1e-e5ee0077f14f",
      desc: "",
      name: "% Functional",
      type: "AdminChoropleth",
      design: {
        axes: {
          color: {
            expr: {
              op: "percent where",
              type: "op",
              exprs: [
                {
                  op: "= any",
                  type: "op",
                  exprs: [
                    {
                      expr: {
                        op: "last",
                        type: "op",
                        exprs: [
                          {
                            type: "field",
                            table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                            column: "Functionality"
                          }
                        ],
                        table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9"
                      },
                      type: "scalar",
                      joins: ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
                      table: "entities.water_point"
                    },
                    {
                      type: "literal",
                      value: ["Functional"],
                      valueType: "enumset"
                    }
                  ],
                  table: "entities.water_point"
                },
                {
                  op: "is not null",
                  type: "op",
                  exprs: [
                    {
                      expr: {
                        op: "last",
                        type: "op",
                        exprs: [
                          {
                            type: "field",
                            table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                            column: "Functionality"
                          }
                        ],
                        table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9"
                      },
                      type: "scalar",
                      joins: ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
                      table: "entities.water_point"
                    }
                  ],
                  table: "entities.water_point"
                }
              ],
              table: "entities.water_point"
            },
            xform: {
              max: 100,
              min: 0,
              type: "bin",
              numBins: 6
            },
            colorMap: [
              {
                color: "#c8e6c1",
                value: 0
              },
              {
                color: "#a4d699",
                value: 1
              },
              {
                color: "#84c874",
                value: 2
              },
              {
                color: "#60b84c",
                value: 3
              },
              {
                color: "#4c963c",
                value: 4
              },
              {
                color: "#3a712d",
                value: 5
              },
              {
                color: "#25491d",
                value: 6
              },
              {
                color: "#13240f",
                value: 7
              }
            ],
            drawOrder: [0, 1, 2, 3, 4, 5, 6, 7]
          }
        },
        color: "#FFFFFF",
        scope: null,
        table: "entities.water_point",
        filter: null,
        detailLevel: 0,
        fillOpacity: 0.75,
        displayNames: true,
        adminRegionExpr: {
          type: "field",
          table: "entities.water_point",
          column: "admin_region"
        },
        scopeLevel: null
      },
      opacity: 1,
      visible: true
    }
  ],
  filters: {},
  bounds: {
    w: -21.181640624999996,
    n: 35.60371874069731,
    e: 69.43359375,
    s: -33.7243396617476
  }
}

const design = {
  items: {
    id: "root",
    type: "root",
    blocks: [
      {
        type: "widget",
        widgetType: "Text",
        design: {
          style: "title",
          items: ["The Water Situation"]
        },
        id: "2fb6f7f9-212f-4488-abb6-9662eacc879f"
      },
      {
        type: "widget",
        widgetType: "Text",
        design: {
          items: [
            "We have ",
            {
              type: "expr",
              id: "b0e56d85-7999-4dfa-84ac-a4f6b4878f53",
              expr: {
                type: "op",
                op: "count",
                table: "entities.water_point",
                exprs: []
              }
            },
            " water points in mWater. Of these, ",
            {
              type: "expr",
              id: "9accfd63-7ae9-4e8e-a784-dfc259977d4c",
              expr: {
                type: "op",
                table: "entities.water_point",
                op: "count where",
                exprs: [
                  {
                    type: "op",
                    table: "entities.water_point",
                    op: "= any",
                    exprs: [
                      {
                        type: "field",
                        table: "entities.water_point",
                        column: "type"
                      },
                      {
                        type: "literal",
                        valueType: "enumset",
                        value: ["Protected dug well", "Unprotected dug well"]
                      }
                    ]
                  }
                ]
              }
            },
            " are dug wells!"
          ]
        },
        id: "09c8981b-3869-410d-bd90-4a5a012314a8"
      },
      {
        id: "9bec34a2-f0e5-4a0b-88e8-3406521408bf",
        type: "horizontal",
        blocks: [
          {
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "TableChart",
            design: {
              version: 1,
              columns: [
                {
                  textAxis: {
                    expr: {
                      type: "field",
                      table: "entities.water_point",
                      column: "name"
                    }
                  }
                },
                {
                  textAxis: {
                    expr: {
                      type: "field",
                      table: "entities.water_point",
                      column: "type"
                    }
                  }
                }
              ],
              orderings: [],
              table: "entities.water_point",
              titleText:
                "This is a really long title This is a really long title This is a really long title This is a really long title "
            },
            id: "ca85906f-c6cd-4729-a52f-984c28d625a8"
          },
          {
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "Map",
            design: {
              baseLayer: "cartodb_positron",
              layerViews: [
                {
                  id: "471776be-5c67-4d0d-a0fd-d406cc60c44c",
                  name: "Untitled Layer",
                  desc: "",
                  type: "AdminChoropleth",
                  visible: false,
                  opacity: 1,
                  design: {
                    color: "#FFFFFF",
                    adminRegionExpr: {
                      type: "field",
                      table: "entities.water_point",
                      column: "admin_region"
                    },
                    axes: {
                      color: {
                        expr: {
                          type: "op",
                          table: "entities.water_point",
                          op: "percent where",
                          exprs: [
                            {
                              type: "op",
                              table: "entities.water_point",
                              op: "= any",
                              exprs: [
                                {
                                  type: "field",
                                  table: "entities.water_point",
                                  column: "type"
                                },
                                {
                                  type: "literal",
                                  valueType: "enumset",
                                  value: ["Protected dug well", "Unprotected dug well"]
                                }
                              ]
                            },
                            null
                          ]
                        },
                        xform: {
                          type: "bin",
                          numBins: 6,
                          min: 0,
                          max: 100
                        },
                        colorMap: [
                          {
                            value: 0,
                            color: "#c1cce6"
                          },
                          {
                            value: 1,
                            color: "#99abd6"
                          },
                          {
                            value: 2,
                            color: "#748dc8"
                          },
                          {
                            value: 3,
                            color: "#4c6db8"
                          },
                          {
                            value: 4,
                            color: "#3c5796"
                          },
                          {
                            value: 5,
                            color: "#2d4171"
                          },
                          {
                            value: 6,
                            color: "#1d2a49"
                          },
                          {
                            value: 7,
                            color: "#0f1524"
                          }
                        ],
                        drawOrder: [0, 1, 2, 3, 4, 5, 6, 7]
                      }
                    },
                    fillOpacity: 0.75,
                    displayNames: true,
                    filter: null,
                    scope: "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
                    detailLevel: 1,
                    table: "entities.water_point"
                  }
                },
                {
                  id: "fc9a4641-8319-471d-9e80-c2c3a6b11e34",
                  name: "Untitled Layer",
                  desc: "",
                  type: "Markers",
                  visible: false,
                  opacity: 1,
                  design: {
                    axes: {
                      geometry: {
                        expr: {
                          type: "field",
                          table: "entities.water_point",
                          column: "location"
                        }
                      },
                      color: {
                        expr: {
                          type: "field",
                          table: "entities.water_point",
                          column: "drilling_method_other"
                        },
                        colorMap: [
                          {
                            value: "A pied",
                            color: "#1f77b4"
                          },
                          {
                            value: "a pied",
                            color: "#aec7e8"
                          },
                          {
                            value: "testing other",
                            color: "#ff7f0e"
                          },
                          {
                            value: null,
                            color: "#ffbb78"
                          }
                        ],
                        drawOrder: ["A pied", "a pied", "testing other", null]
                      }
                    },
                    color: "#0088FF",
                    filter: null,
                    table: "entities.water_point"
                  }
                },
                {
                  id: "c8fe521e-1577-4b4c-98a9-c2c5aba964e5",
                  name: "Untitled Layer",
                  desc: "",
                  type: "Buffer",
                  visible: true,
                  opacity: 1,
                  design: {
                    axes: {
                      geometry: {
                        expr: {
                          type: "field",
                          table: "entities.water_point",
                          column: "location"
                        }
                      },
                      color: {
                        expr: {
                          type: "field",
                          table: "entities.water_point",
                          column: "_created_on"
                        },
                        xform: {
                          type: "month"
                        },
                        colorMap: [
                          {
                            value: "01",
                            color: "#1f77b4"
                          },
                          {
                            value: "02",
                            color: "#ff7f0e"
                          },
                          {
                            value: "03",
                            color: "#2ca02c"
                          },
                          {
                            value: "04",
                            color: "#d62728"
                          },
                          {
                            value: "05",
                            color: "#9467bd"
                          },
                          {
                            value: "06",
                            color: "#8c564b"
                          },
                          {
                            value: "07",
                            color: "#e377c2"
                          },
                          {
                            value: "08",
                            color: "#7f7f7f"
                          },
                          {
                            value: "09",
                            color: "#bcbd22"
                          },
                          {
                            value: "10",
                            color: "#17becf"
                          },
                          {
                            value: "11",
                            color: "#1f77b4"
                          },
                          {
                            value: "12",
                            color: "#ff7f0e"
                          }
                        ],
                        drawOrder: ["03", "01", "04", "12", "05", "06", "07", "08", "09", "10", "11", "02"]
                      }
                    },
                    radius: 50000,
                    fillOpacity: 0.5,
                    filter: null,
                    table: "entities.water_point"
                  }
                }
              ],
              filters: {},
              bounds: {
                w: 28.63037109375,
                n: -1.625758360412755,
                e: 41.06689453125,
                s: -10.336536087082974
              }
            },
            id: "a4148cd8-457f-4424-b464-c427f1b630de"
          },
          {
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "LayeredChart",
            design: {
              version: 2,
              layers: [
                {
                  axes: {
                    x: {
                      expr: {
                        type: "field",
                        table: "entities.water_point",
                        column: "_created_on"
                      },
                      xform: {
                        type: "yearmonth"
                      }
                    },
                    y: {
                      expr: {
                        type: "op",
                        op: "count",
                        table: "entities.water_point",
                        exprs: []
                      },
                      xform: null
                    }
                  },
                  filter: {
                    type: "op",
                    table: "entities.water_point",
                    op: "thisyear",
                    exprs: [
                      {
                        type: "field",
                        table: "entities.water_point",
                        column: "_created_on"
                      }
                    ]
                  },
                  table: "entities.water_point",
                  cumulative: false
                }
              ],
              type: "bar",
              titleText: "Water points added by month 2016"
            },
            id: "906863e8-3b03-4b6c-b70f-f4cd4adc002b"
          }
        ]
      }
    ]
  },
  layout: "blocks",
  style: "greybg"
}

const autoBoundsMap = {
  baseLayer: "cartodb_positron",
  layerViews: [
    {
      id: "6991fe14-03eb-4cf1-a4f5-6e3ebe581482",
      name: "Untitled Layer",
      desc: "",
      type: "Buffer",
      visible: true,
      opacity: 1,
      design: {
        axes: {
          geometry: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "location"
            }
          },
          color: {
            expr: {
              type: "scalar",
              table: "entities.water_point",
              joins: ["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],
              expr: {
                type: "op",
                op: "last",
                table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                exprs: [
                  {
                    type: "field",
                    table: "indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9",
                    column: "Functionality"
                  }
                ]
              }
            },
            colorMap: [
              {
                value: "Partially functional",
                color: "#ff7f0e"
              },
              {
                value: "Functional",
                color: "#7ed321"
              },
              {
                value: "Not functional",
                color: "#d0021b"
              },
              {
                value: null,
                color: "#9b9b9b"
              },
              {
                value: "No longer exists",
                color: "#000000"
              }
            ],
            drawOrder: ["Functional", "Partially functional", "Not functional", "No longer exists", null]
          }
        },
        radius: 1000,
        fillOpacity: 0.5,
        filter: null,
        table: "entities.water_point",
        color: "#9b9b9b"
      }
    }
  ],
  filters: {
    "entities.water_point": {
      type: "op",
      table: "entities.water_point",
      op: "within",
      exprs: [
        {
          type: "field",
          table: "entities.water_point",
          column: "admin_region"
        },
        {
          type: "literal",
          valueType: "id",
          idTable: "admin_regions",
          value: "316f16a2-89e1-46b4-8a4b-561478997000"
        }
      ]
    }
  },
  bounds: {
    w: 32.01690673828125,
    n: -1.9606767908079445,
    e: 33.86260986328125,
    s: -3.424320686307251
  },
  autoBounds: true
}

const testMedium = {
  items: {
    id: "root",
    type: "root",
    blocks: [
      {
        type: "widget",
        widgetType: "Text",
        design: {
          style: "title",
          items: ["The Water Situation"]
        },
        id: "2fb6f7f9-212f-4488-abb6-9662eacc879f"
      },
      {
        id: "bf69f1c3-aa74-4f53-b3d1-878a5cc2c71f",
        type: "horizontal",
        blocks: [
          {
            type: "widget",
            widgetType: "Text",
            design: {
              items: [
                {
                  type: "element",
                  tag: "h1",
                  items: ["How it is"]
                },
                "The new Sustainable Development Goal target for safely managed drinking water raises the bar from simply providing access to a water source to proving that the water is safe to drink and is being managed to prevent contamination. ",
                {
                  type: "element",
                  tag: "h2",
                  items: ["What's new"]
                },
                {
                  type: "element",
                  tag: "div",
                  items: [
                    "The water quality crisis is a significant new challenge, with studies indicating that up to 2 billion people drink contaminated water every day. Recent evidence from nationally representative surveys by UNICEF indicates that water stored in households is at the greatest risk and over 80% of samples tested contain fecal bacteria. "
                  ]
                },
                {
                  type: "element",
                  tag: "div",
                  items: [
                    "Improving water safety means more than just testing; local water managers must be empowered to identify and control risks, monitor operations, and respond quickly to changing conditions such as drought or contamination events."
                  ]
                }
              ]
            },
            id: "09c8981b-3869-410d-bd90-4a5a012314a8"
          },
          {
            type: "spacer",
            aspectRatio: 1.4,
            id: "ba931d1d-3e29-47d5-b264-04ca5e0f10da"
          }
        ],
        weights: [1.6406417112299465, 0.3593582887700535]
      },
      {
        id: "d640a32c-2ed6-4a3e-b746-07dcc2c0b1cc",
        type: "horizontal",
        blocks: [
          {
            type: "widget",
            widgetType: "Text",
            design: {
              items: [
                {
                  type: "element",
                  tag: "span",
                  items: [
                    "Managing digital data and implementing mobile data collection, and how they are now scaling globally. The Water Trust and the Millennium Water Alliance will also talk about the real world issues faced every day in the process of using mWater: planning a digital M&E strategy, training staff to move from paper to mobiles, im"
                  ]
                }
              ]
            },
            id: "8eabe8c1-e23b-4d89-8179-a5ec84f9d538"
          },
          {
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "Image",
            design: {
              imageUrl: "https://cdn-images-1.medium.com/max/600/1*7o1w_pkB_jHoKSUeYotY1Q.jpeg",
              uid: null,
              expr: null,
              caption: "Some serious stuff here"
            },
            id: "2412f938-7b5e-4ab4-984d-5e04beca5956"
          }
        ],
        weights: [1.1358288770053475, 0.8641711229946524]
      }
    ]
  },
  layout: "blocks",
  style: "default"
}

const badColorsMap = {
  baseLayer: "cartodb_positron",
  layerViews: [
    {
      id: "f17c9aca-f418-4718-a349-0aecc708fdc4",
      name: "Untitled Layer",
      desc: "",
      type: "AdminChoropleth",
      visible: true,
      opacity: 1,
      design: {
        color: "#FFFFFF",
        adminRegionExpr: {
          type: "field",
          table: "entities.water_point",
          column: "admin_region"
        },
        axes: {
          color: {
            expr: {
              type: "op",
              op: "percent where",
              table: "entities.water_point",
              exprs: [
                {
                  type: "op",
                  table: "entities.water_point",
                  op: "= any",
                  exprs: [
                    {
                      type: "field",
                      table: "entities.water_point",
                      column: "type"
                    },
                    {
                      type: "literal",
                      valueType: "enumset",
                      value: ["Protected dug well", "Unprotected dug well"]
                    }
                  ]
                },
                null
              ]
            },
            xform: {
              type: "bin",
              numBins: 6,
              min: 0,
              max: 100
            },
            colorMap: [
              {
                value: 0,
                color: "#9e0142"
              },
              {
                value: 1,
                color: "#e1524a"
              },
              {
                value: 2,
                color: "#fba35e"
              },
              {
                value: 3,
                color: "#fee89a"
              },
              {
                value: 4,
                color: "#ebf7a6"
              },
              {
                value: 5,
                color: "#a0d9a3"
              },
              {
                value: 6,
                color: "#4ba0b1"
              },
              {
                value: 7,
                color: "#5e4fa2"
              },
              {
                value: null,
                color: "#aaaaaa"
              }
            ],
            drawOrder: [0, 1, 2, 3, 4, 5, 6, 7, null]
          }
        },
        fillOpacity: 0.75,
        displayNames: true,
        filter: null,
        table: "entities.water_point",
        scope: "eb3e12a2-de1e-49a9-8afd-966eb55d47eb",
        scopeLevel: 0,
        detailLevel: 1
      }
    }
  ],
  filters: {
    "entities.water_point": null
  },
  bounds: {
    w: 24.873046874999996,
    n: 3.469557303061473,
    e: 45.6591796875,
    s: -19.16592425362801
  },
  autoBounds: false
}

const badColorsMap2 = {
  baseLayer: "cartodb_positron",
  layerViews: [
    {
      id: "8e22dc94-049a-4b20-85dc-70429328eb68",
      name: "Untitled Layer",
      desc: "",
      type: "Markers",
      visible: true,
      opacity: 1,
      design: {
        axes: {
          geometry: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "location"
            }
          },
          color: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "type"
            },
            colorMap: [
              {
                value: "Protected dug well",
                color: "#377eb8"
              },
              {
                value: "Unprotected dug well",
                color: "#4daf4a"
              },
              {
                value: "Borehole or tubewell",
                color: "#984ea3"
              },
              {
                value: "Protected spring",
                color: "#ff7f00"
              },
              {
                value: "Unprotected spring",
                color: "#ffff33"
              },
              {
                value: "Rainwater",
                color: "#a65628"
              },
              {
                value: "Surface water",
                color: "#f781bf"
              },
              {
                value: "Piped into dwelling",
                color: "#999999"
              },
              {
                value: "Piped into yard/plot",
                color: "#e41a1c"
              },
              {
                value: "Piped into public tap or basin",
                color: "#377eb8"
              },
              {
                value: "Bottled water",
                color: "#4daf4a"
              },
              {
                value: "Tanker truck",
                color: "#984ea3"
              },
              {
                value: "Cart with small tank/drum",
                color: "#ff7f00"
              },
              {
                value: "other",
                color: "#ffff33"
              },
              {
                value: null,
                color: "#aaaaaa"
              }
            ],
            drawOrder: [
              "Protected dug well",
              "Unprotected dug well",
              "Borehole or tubewell",
              "Protected spring",
              "Unprotected spring",
              "Rainwater",
              "Surface water",
              "Piped into dwelling",
              "Piped into yard/plot",
              "Piped into public tap or basin",
              "Bottled water",
              "Tanker truck",
              "Cart with small tank/drum",
              "other",
              null
            ]
          }
        },
        color: "#0088FF",
        filter: {
          type: "op",
          table: "entities.water_point",
          op: "within",
          exprs: [
            {
              type: "field",
              table: "entities.water_point",
              column: "admin_region"
            },
            {
              type: "literal",
              valueType: "id",
              idTable: "admin_regions",
              value: "316f16a2-89e1-46b4-8a4b-561478997000"
            }
          ]
        },
        table: "entities.water_point",
        popup: {
          items: {
            id: "root",
            type: "root",
            blocks: [
              {
                type: "widget",
                widgetType: "Text",
                design: {
                  style: "title",
                  items: [
                    {
                      type: "expr",
                      id: "ac490926-5a04-4b01-8679-54375970c8d8",
                      expr: {
                        type: "field",
                        table: "entities.water_point",
                        column: "name"
                      },
                      includeLabel: false
                    }
                  ]
                },
                id: "5c4264d1-183c-4c03-b8a7-1d6ba2466ad7"
              }
            ]
          }
        }
      }
    }
  ],
  filters: {
    "entities.water_point": null
  },
  bounds: {
    n: -1.71348600000001,
    e: 33.775625,
    s: -3.4254440000000197,
    w: 32.045458
  },
  autoBounds: true
}

const pageBreakProblem = {
  items: {
    id: "root",
    type: "root",
    blocks: [
      {
        type: "widget",
        widgetType: "Text",
        design: {
          style: "title",
          items: ["The Water Situation"]
        },
        id: "2fb6f7f9-212f-4488-abb6-9662eacc879f"
      },
      {
        id: "bf69f1c3-aa74-4f53-b3d1-878a5cc2c71f",
        type: "horizontal",
        blocks: [
          {
            type: "widget",
            widgetType: "Text",
            design: {
              items: [
                {
                  type: "element",
                  tag: "h1",
                  items: ["How it is"]
                },
                "The new Sustainable Development Goal target for safely managed drinking water raises the bar from simply providing access to a water source to proving that the water is safe to drink and is being managed to prevent contamination. ",
                {
                  type: "element",
                  tag: "h2",
                  items: ["What's new"]
                },
                {
                  type: "element",
                  tag: "div",
                  items: [
                    "The water quality crisis is a significant new challenge, with studies indicating that up to 2 billion people drink contaminated water every day. Recent evidence from nationally representative surveys by UNICEF indicates that water stored in households is at the greatest risk and over 80% of samples tested contain fecal bacteria. "
                  ]
                },
                {
                  type: "element",
                  tag: "div",
                  items: [
                    "Improving water safety means more than just testing; local water managers must be empowered to identify and control risks, monitor operations, and respond quickly to changing conditions such as drought or contamination events."
                  ]
                }
              ]
            },
            id: "09c8981b-3869-410d-bd90-4a5a012314a8"
          },
          {
            type: "spacer",
            aspectRatio: 1.4,
            id: "ba931d1d-3e29-47d5-b264-04ca5e0f10da"
          }
        ],
        weights: [1.6406417112299465, 0.3593582887700535]
      },
      {
        type: "widget",
        widgetType: "Text",
        design: {
          items: [
            {
              type: "element",
              tag: "span",
              items: [
                "Managing digital data and implementing mobile data collection, and how they are now scaling globally. The Water Trust and the Millennium Water Alliance will also talk about the real world issues faced every day in the process of using mWater: planning a digital M&E strategy, training staff to move from paper to mobiles, im"
              ]
            }
          ]
        },
        id: "8eabe8c1-e23b-4d89-8179-a5ec84f9d538"
      },
      {
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "Image",
        design: {
          imageUrl: "https://cdn-images-1.medium.com/max/600/1*7o1w_pkB_jHoKSUeYotY1Q.jpeg",
          uid: null,
          expr: null,
          caption: "Some serious stuff here"
        },
        id: "2412f938-7b5e-4ab4-984d-5e04beca5956"
      },
      {
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "LayeredChart",
        design: {
          version: 2,
          layers: [
            {
              axes: {
                x: {
                  expr: {
                    type: "field",
                    table: "entities.water_point",
                    column: "type"
                  }
                },
                y: {
                  expr: {
                    type: "op",
                    op: "count",
                    table: "entities.water_point",
                    exprs: []
                  }
                }
              },
              filter: null,
              table: "entities.water_point"
            }
          ],
          type: "bar"
        },
        id: "e77cd4f4-27b5-4c47-b5de-2c776093e467"
      },
      {
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "Map",
        design: {
          baseLayer: "bing_road",
          layerViews: [],
          filters: {},
          bounds: {
            w: -40,
            n: 25,
            e: 40,
            s: -25
          }
        },
        id: "e5c308ec-4874-4fab-bd9c-c9bc253ef60e"
      }
    ]
  },
  layout: "blocks",
  style: "default"
}

const simpleBarChart = {
  items: {
    id: "root",
    type: "root",
    blocks: [
      {
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "LayeredChart",
        design: {
          version: 2,
          layers: [
            {
              axes: {
                x: {
                  expr: {
                    type: "field",
                    table: "entities.water_point",
                    column: "type"
                  }
                },
                y: {
                  expr: {
                    type: "op",
                    op: "count",
                    table: "entities.water_point",
                    exprs: []
                  }
                }
              },
              filter: null,
              table: "entities.water_point"
            }
          ],
          type: "bar",
          transpose: true
        },
        id: "f375fe0a-04ff-454e-8269-fbbafa7e3f8d"
      }
    ]
  },
  layout: "blocks",
  style: "greybg"
}

const simplePieChart = {
  items: {
    id: "root",
    type: "root",
    blocks: [
      {
        type: "widget",
        aspectRatio: 1.4,
        widgetType: "LayeredChart",
        design: {
          version: 2,
          layers: [
            {
              axes: {
                y: {
                  expr: {
                    type: "op",
                    op: "count",
                    table: "entities.water_point",
                    exprs: []
                  }
                },
                color: {
                  expr: {
                    type: "field",
                    table: "entities.water_point",
                    column: "type"
                  },
                  colorMap: [
                    {
                      value: "Protected dug well",
                      color: "#377eb8"
                    },
                    {
                      value: "Unprotected dug well",
                      color: "#4daf4a"
                    },
                    {
                      value: "Borehole or tubewell",
                      color: "#984ea3"
                    },
                    {
                      value: "Protected spring",
                      color: "#ff7f00"
                    },
                    {
                      value: "Unprotected spring",
                      color: "#ffff33"
                    },
                    {
                      value: "Rainwater",
                      color: "#a65628"
                    },
                    {
                      value: "Surface water",
                      color: "#f781bf"
                    },
                    {
                      value: "Piped into dwelling",
                      color: "#999999"
                    },
                    {
                      value: "Piped into yard/plot",
                      color: "#e41a1c"
                    },
                    {
                      value: "Piped into public tap or basin",
                      color: "#377eb8"
                    },
                    {
                      value: "Bottled water",
                      color: "#4daf4a"
                    },
                    {
                      value: "Tanker truck",
                      color: "#984ea3"
                    },
                    {
                      value: "Cart with small tank/drum",
                      color: "#ff7f00"
                    },
                    {
                      value: "other",
                      color: "#ffff33"
                    },
                    {
                      value: null,
                      color: "#aaaaaa"
                    }
                  ],
                  drawOrder: [
                    "Protected dug well",
                    "Unprotected dug well",
                    "Borehole or tubewell",
                    "Protected spring",
                    "Unprotected spring",
                    "Rainwater",
                    "Surface water",
                    "Piped into dwelling",
                    "Piped into yard/plot",
                    "Piped into public tap or basin",
                    "Bottled water",
                    "Tanker truck",
                    "Cart with small tank/drum",
                    "other",
                    null
                  ],
                  excludedValues: []
                }
              },
              filter: null,
              table: "entities.water_point"
            }
          ],
          type: "pie",
          transpose: true
        },
        id: "f375fe0a-04ff-454e-8269-fbbafa7e3f8d"
      }
    ]
  },
  layout: "blocks",
  style: "greybg",
  quickfilters: [
    {
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "type"
      },
      label: null
    }
  ]
}

var mapAndChartDashboard = {
  items: {
    id: "root",
    type: "root",
    blocks: [
      {
        id: "0a38cdac-aae2-4e2a-9f6c-020b3ce2745f",
        type: "horizontal",
        blocks: [
          {
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "Map",
            design: {
              baseLayer: "bing_road",
              layerViews: [],
              filters: {},
              bounds: {
                w: -40,
                n: 25,
                e: 40,
                s: -25
              }
            },
            id: "0a9afebf-516c-4538-9592-bb5806edb2c9"
          },
          {
            type: "widget",
            aspectRatio: 1.4,
            widgetType: "LayeredChart",
            design: {
              version: 2,
              layers: [
                {
                  axes: {
                    y: {
                      expr: {
                        type: "op",
                        op: "count",
                        table: "entities.water_point",
                        exprs: []
                      }
                    },
                    color: {
                      expr: {
                        type: "field",
                        table: "entities.water_point",
                        column: "type"
                      },
                      colorMap: [
                        {
                          value: "Protected dug well",
                          color: "#377eb8"
                        },
                        {
                          value: "Unprotected dug well",
                          color: "#4daf4a"
                        },
                        {
                          value: "Borehole or tubewell",
                          color: "#984ea3"
                        },
                        {
                          value: "Protected spring",
                          color: "#ff7f00"
                        },
                        {
                          value: "Unprotected spring",
                          color: "#ffff33"
                        },
                        {
                          value: "Rainwater",
                          color: "#a65628"
                        },
                        {
                          value: "Surface water",
                          color: "#f781bf"
                        },
                        {
                          value: "Piped into dwelling",
                          color: "#999999"
                        },
                        {
                          value: "Piped into yard/plot",
                          color: "#e41a1c"
                        },
                        {
                          value: "Piped into public tap or basin",
                          color: "#377eb8"
                        },
                        {
                          value: "Bottled water",
                          color: "#4daf4a"
                        },
                        {
                          value: "Tanker truck",
                          color: "#984ea3"
                        },
                        {
                          value: "Cart with small tank/drum",
                          color: "#ff7f00"
                        },
                        {
                          value: "other",
                          color: "#ffff33"
                        },
                        {
                          value: null,
                          color: "#aaaaaa"
                        }
                      ],
                      drawOrder: [
                        "Protected dug well",
                        "Unprotected dug well",
                        "Borehole or tubewell",
                        "Protected spring",
                        "Unprotected spring",
                        "Rainwater",
                        "Surface water",
                        "Piped into dwelling",
                        "Piped into yard/plot",
                        "Piped into public tap or basin",
                        "Bottled water",
                        "Tanker truck",
                        "Cart with small tank/drum",
                        "other",
                        null
                      ],
                      excludedValues: []
                    }
                  },
                  filter: null,
                  table: "entities.water_point"
                }
              ],
              type: "pie",
              transpose: true
            },
            id: "f375fe0a-04ff-454e-8269-fbbafa7e3f8d"
          }
        ]
      }
    ]
  },
  layout: "blocks",
  style: "greybg",
  quickfilters: [
    {
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "type"
      },
      label: null
    }
  ]
}

var doubleClickMap = {
  baseLayer: "cartodb_positron",
  layerViews: [
    {
      id: "82fbf0ef-b3b3-4506-b87e-6d727e593cbd",
      name: "Untitled Layer",
      desc: "",
      type: "Cluster",
      visible: true,
      opacity: 1,
      design: {
        textColor: "white",
        fillColor: "#337ab7",
        axes: {
          geometry: {
            expr: {
              type: "field",
              table: "entities.water_point",
              column: "location"
            }
          }
        },
        filter: null,
        table: "entities.water_point"
      }
    }
  ],
  filters: {
    "entities.water_point": null
  },
  bounds: {
    n: -1.71348600000001,
    e: 33.775625,
    s: -3.4254440000000197,
    w: 32.045458
  },
  autoBounds: true
}
