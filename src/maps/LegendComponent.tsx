import _ from "lodash"
import { DataSource, Schema } from "mwater-expressions"
import React, { CSSProperties } from "react"
import { JsonQLFilter } from ".."
import LayerFactory from "./LayerFactory"
import { MapLayerView } from "./MapDesign"

// Displays legends
export default function LegendComponent(props: {
  schema: Schema
  dataSource: DataSource
  layerViews: MapLayerView[]
  // Current zoom level
  zoom: number | null
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters: JsonQLFilter[]
  locale: string
  onHide: () => void
}) {
    const legendItems = _.compact(
      _.map(props.layerViews, layerView => { 
        // Ignore if legend hidden
        if (layerView.hideLegend) {
          return
        }

        // Create layer
        const layer = LayerFactory.createLayer(layerView.type)

        const design = layer.cleanDesign(layerView.design, props.schema)

        // Ignore if invalid
        if (layer.validateDesign(design, props.schema)) {
          return null
        }

        // Ignore if not visible
        if (!layerView.visible) {
          return null
        }

        // Ignore if zoom out of range
        const minZoom = layer.getMinZoom(design)
        const maxZoom = layer.getMaxZoom(design)
        if ((minZoom != null) && (props.zoom != null) && (props.zoom < minZoom)) {
          return null
        }

        if ((maxZoom != null) && (props.zoom != null) && (props.zoom > maxZoom)) {
          return null
        }

        return { key: layerView.id, legend: layer.getLegend(design, props.schema, layerView.name, props.dataSource, props.locale, props.filters) }
      })
    )

    if (legendItems.length === 0) {
      return null
    }

    const legendStyle: CSSProperties = {
      padding: 7,
      background: "rgba(255,255,255,0.8)",
      boxShadow: "0 0 15px rgba(0,0,0,0.2)",
      borderRadius: 5,
      position: 'absolute',
      right: 10,
      bottom: 35,
      maxHeight: '85%',
      overflowY: 'auto',
      zIndex: 1000,
      fontSize: 12
    }

    const hideStyle: CSSProperties = {
      position: "absolute",
      bottom: 34,
      right: 11,
      zIndex: 1001,
      fontSize: 10,
      color: "#337ab7",
      cursor: "pointer"
    }

    return <div>
      <div style={legendStyle}>
        {
          _.map(legendItems, (item, i) => {
            return [
              <div key={item!.key}>
                {item!.legend}
              </div>
            ]
          })
        }
    </div>
    <div key="hide" style={hideStyle} onClick={props.onHide}>
      <i className="fa fa-angle-double-right"/>
    </div>
  </div>
}

