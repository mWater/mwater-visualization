import MWaterServerLayer from "./MWaterServerLayer"
import { default as MarkersLayer } from "./MarkersLayer"
import { default as BufferLayer } from "./BufferLayer"
import { default as ChoroplethLayer } from "./ChoroplethLayer"
import { default as ClusterLayer } from "./ClusterLayer"
import TileUrlLayer from "./TileUrlLayer"
import { default as SwitchableTileUrlLayer } from "./SwitchableTileUrlLayer"
import { default as GridLayer } from "./GridLayer"

export default class LayerFactory {
  static createLayer(type: any) {
    switch (type) {
      case "MWaterServer":
        return new MWaterServerLayer()
        break

      case "Markers":
        return new MarkersLayer()
        break

      case "Buffer":
        return new BufferLayer()
        break

      // Uses a legacy type name
      case "AdminChoropleth":
        return new ChoroplethLayer()
        break

      case "Cluster":
        return new ClusterLayer()
        break

      case "TileUrl":
        return new TileUrlLayer()
        break

      case "SwitchableTileUrl":
        return new SwitchableTileUrlLayer()
        break

      case "Grid":
        return new GridLayer()
        break
    }

    throw new Error(`Unknown type ${type}`)
  }
}
