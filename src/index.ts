// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import "leaflet/dist/leaflet.css"
import "fixed-data-table-2/dist/fixed-data-table.min.css"
import "rc-slider/assets/index.css"
import "./layouts/decorated-block.css"
import "react-datepicker/dist/react-datepicker.css"
import "c3/c3.css"
import "./index.css"
export let CachingDataSource = require("./CachingDataSource")
export let WidgetFactory = require("./widgets/WidgetFactory")
export let UndoStack = require("./UndoStack")
export let DashboardComponent = require("./dashboards/DashboardComponent")
export let DashboardViewComponent = require("./dashboards/DashboardViewComponent")
export let BingLayer = require("./maps/BingLayer")
export let UtfGridLayer = require("./maps/UtfGridLayer")
export let LeafletMapComponent = require("./maps/LeafletMapComponent")
export let LayerFactory = require("./maps/LayerFactory")

export let { MapViewComponent } = require("./maps/MapViewComponent")

export let MapDesignerComponent = require("./maps/MapDesignerComponent")
export let MapComponent = require("./maps/MapComponent")
export let VerticalLayoutComponent = require("./VerticalLayoutComponent")
export let RadioButtonComponent = require("./RadioButtonComponent")
export let CheckboxComponent = require("./CheckboxComponent")
export let mWaterLoader = require("./mWaterLoader")
export let MWaterLoaderComponent = require("./MWaterLoaderComponent")
export let MWaterContextComponent = require("./MWaterContextComponent")
export let LayeredChart = require("./widgets/charts/layered/LayeredChart")
export let TableChart = require("./widgets/charts/table/TableChart")
export let CalendarChart = require("./widgets/charts/calendar/CalendarChart")
export let ImageMosaicChart = require("./widgets/charts/imagemosaic/ImageMosaicChart")
export let ChartViewComponent = require("./widgets/charts/ChartViewComponent")
export let WidgetScoper = require("./widgets/WidgetScoper")
export let WidgetScopesViewComponent = require("./widgets/WidgetScopesViewComponent")
export let TableSelectComponent = require("./TableSelectComponent")
export let AxisBuilder = require("./axes/AxisBuilder")
export let ColorSchemeFactory = require("./ColorSchemeFactory")
export let DatagridComponent = require("./datagrids/DatagridComponent")
export let DatagridViewComponent = require("./datagrids/DatagridViewComponent")
export let DatagridUtils = require("./datagrids/DatagridUtils").default
export let ServerDashboardDataSource = require("./dashboards/ServerDashboardDataSource").default
export let DirectDashboardDataSource = require("./dashboards/DirectDashboardDataSource")
export let DirectWidgetDataSource = require("./widgets/DirectWidgetDataSource")
export let ServerMapDataSource = require("./maps/ServerMapDataSource").default
export let DirectMapDataSource = require("./maps/DirectMapDataSource").default
export let ServerDatagridDataSource = require("./datagrids/ServerDatagridDataSource")
export let DirectDatagridDataSource = require("./datagrids/DirectDatagridDataSource")
export let LabeledExprGenerator = require("./datagrids/LabeledExprGenerator")
export let LayoutManager = require("./layouts/LayoutManager")
export let RegionSelectComponent = require("./maps/RegionSelectComponent")
export let DetailLevelSelectComponent = require("./maps/DetailLevelSelectComponent")
export let MarkerSymbolSelectComponent = require("./maps/MarkerSymbolSelectComponent")
export let AxisColorEditorComponent = require("./axes/AxisColorEditorComponent")
export let RichTextComponent = require("./richtext/RichTextComponent")
export let ItemsHtmlConverter = require("./richtext/ItemsHtmlConverter")
export let DropdownWidgetComponent = require("./widgets/DropdownWidgetComponent")
export let QuickfilterCompiler = require("./quickfilter/QuickfilterCompiler")
export let DateRangeComponent = require("./DateRangeComponent")
export let LocaleContextInjector = require("./LocaleContextInjector").default
export let compressJson = require("./compressJson")

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
