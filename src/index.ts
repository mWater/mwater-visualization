import { Schema, DataSource, Expr } from "mwater-expressions"
import { ReactElement } from "react"
import React from "react"

export {
  default as LeafletMapComponent,
  MapBounds,
  TileLayer,
  GeoJsonLayer,
  MapLayer
} from "./maps/LeafletMapComponent"

export { default as DateRangeComponent } from "./DateRangeComponent"

export { default as RegionSelectComponent } from "./maps/RegionSelectComponent"

export * from "./datagrids/DatagridDesign"

export { default as TableSelectComponent } from "./TableSelectComponent"

export * from "./JsonQLFilter"

export { default as DashboardComponent } from "./dashboards/DashboardComponent"
export { default as DashboardDataSource } from "./dashboards/DashboardDataSource"
export { default as DirectDashboardDataSource } from "./dashboards/DirectDashboardDataSource"
export * from "./dashboards/DashboardDesign"
export { MapDesign, MapLayerView } from "./maps/MapDesign"

export { default as compressJson } from "./compressJson"

export { default as LocaleContextInjector } from "./LocaleContextInjector"

export * from "./WidgetScope"

export { default as WidgetFactory } from "./widgets/WidgetFactory"
export { default as Widget } from "./widgets/Widget"

export { default as DatagridUtils } from "./datagrids/DatagridUtils"

export * from "./maps/MapViewComponent"
export { MapScope } from "./maps/MapUtils"

export class MWaterLoaderComponent extends React.Component<{
  apiUrl: string
  client?: string
  share?: string
  /**  user id of logged in user */
  user?: string
  /**  Load schema as a specific user (for shared dashboards, etc) */
  asUser?: string
  /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */
  extraTables?: string[]
  /**  Called when extra tables are changed and schema will be reloaded */
  onExtraTablesChange?: (extraTables: string[]) => void
  /**  Override default add layer component. See AddLayerComponent for details */
  addLayerElementFactory?: any
  children: (error: any, config: { schema: Schema; dataSource: DataSource }) => ReactElement<any>
}> {}

export class MWaterContextComponent extends React.Component<{
  apiUrl: string
  client?: string
  /**  user id of logged in user */
  user?: string
  schema: Schema
  /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */
  extraTables?: string[]
  /**  Called when extra tables are changed and schema will be reloaded */
  onExtraTablesChange?: (extraTables: string[]) => void
  /**  Override default add layer component. See AddLayerComponent for details */
  addLayerElementFactory?: any
}> {}

export { default as mWaterLoader } from "./mWaterLoader"

export { default as DirectWidgetDataSource } from "./widgets/DirectWidgetDataSource"

import "leaflet/dist/leaflet.css"
import "fixed-data-table-2/dist/fixed-data-table.min.css"
import "rc-slider/assets/index.css"
import "./layouts/decorated-block.css"
import "react-datepicker/dist/react-datepicker.css"
import "c3/c3.css"
import "./index.css"
export { default as CachingDataSource } from "./CachingDataSource"
export { default as UndoStack } from "./UndoStack"
export { default as DashboardViewComponent } from "./dashboards/DashboardViewComponent"
export { default as BingLayer } from "./maps/BingLayer"
export { default as UtfGridLayer } from "./maps/UtfGridLayer"
export { default as LayerFactory } from "./maps/LayerFactory"
export { default as MapDesignerComponent } from "./maps/MapDesignerComponent"
export { default as MapComponent } from "./maps/MapComponent"
export { default as VerticalLayoutComponent } from "./VerticalLayoutComponent"
export { default as RadioButtonComponent } from "./RadioButtonComponent"
export { default as CheckboxComponent } from "./CheckboxComponent"
export { default as LayeredChart } from "./widgets/charts/layered/LayeredChart"
export { default as TableChart } from "./widgets/charts/table/TableChart"
export { default as CalendarChart } from "./widgets/charts/calendar/CalendarChart"
export { default as ImageMosaicChart } from "./widgets/charts/imagemosaic/ImageMosaicChart"
export { default as ChartViewComponent } from "./widgets/charts/ChartViewComponent"
export { default as WidgetScoper } from "./widgets/WidgetScoper"
export { default as WidgetScopesViewComponent } from "./widgets/WidgetScopesViewComponent"
export { default as AxisBuilder } from "./axes/AxisBuilder"
export { default as ColorSchemeFactory } from "./ColorSchemeFactory"
export { default as DatagridComponent } from "./datagrids/DatagridComponent"
export { default as DatagridViewComponent } from "./datagrids/DatagridViewComponent"
export { default as ServerDashboardDataSource } from "./dashboards/ServerDashboardDataSource"
export { default as ServerMapDataSource } from "./maps/ServerMapDataSource"
export { default as DirectMapDataSource } from "./maps/DirectMapDataSource"
export { default as ServerDatagridDataSource } from "./datagrids/ServerDatagridDataSource"
export { default as DirectDatagridDataSource } from "./datagrids/DirectDatagridDataSource"
export { default as LabeledExprGenerator } from "./datagrids/LabeledExprGenerator"
export { default as LayoutManager } from "./layouts/LayoutManager"
export { default as DetailLevelSelectComponent } from "./maps/DetailLevelSelectComponent"
export { default as MarkerSymbolSelectComponent } from "./maps/MarkerSymbolSelectComponent"
export { default as AxisColorEditorComponent } from "./axes/AxisColorEditorComponent"
export { default as RichTextComponent } from "./richtext/RichTextComponent"
export { default as ItemsHtmlConverter } from "./richtext/ItemsHtmlConverter"
export { default as DropdownWidgetComponent } from "./widgets/DropdownWidgetComponent"
export { default as QuickfilterCompiler } from "./quickfilter/QuickfilterCompiler"
export { MapViewComponent } from "./maps/MapViewComponent"

// Polyfill pathseg https://github.com/masayuki0812/c3/issues/1529
import "./pathseg-polyfill.js"

// http://stackoverflow.com/questions/19305821/multiple-modals-overlay
import $ from "jquery"

$(document).on("show.bs.modal", ".modal", function () {
  const zIndex = 1040 + 10 * $(".modal:visible").length
  $(this).css("z-index", zIndex)
  setTimeout(function () {
    $(".modal-backdrop")
      .not(".modal-stack")
      .css("z-index", zIndex - 1)
      .addClass("modal-stack")
  }, 0)
})
$(document).on("hidden.bs.modal", ".modal", function () {
  $(".modal:visible").length && $(document.body).addClass("modal-open")
})
