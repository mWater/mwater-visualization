// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let OldMapViewComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import LeafletMapComponent from "./LeafletMapComponent"
import { ExprUtils } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import LayerFactory from "./LayerFactory"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import MapUtils from "./MapUtils"
import { LayerSwitcherComponent } from "./LayerSwitcherComponent"
import { default as LegendComponent } from "./LegendComponent"

// Component that displays just the map
export default OldMapViewComponent = (function () {
  OldMapViewComponent = class OldMapViewComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired, // data source to use

        // Url source for the map
        mapDataSource: PropTypes.shape({
          // Gets the data source for a layer
          getLayerDataSource: PropTypes.func.isRequired,

          // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
          getBounds: PropTypes.func.isRequired
        }).isRequired,

        design: PropTypes.object.isRequired, // See Map Design.md
        onDesignChange: PropTypes.func, // Called with new design. null/undefined to ignore bounds changes

        width: PropTypes.number, // Width in pixels
        height: PropTypes.number, // Height in pixels

        onRowClick: PropTypes.func, // Called with (tableId, rowId) when item is clicked

        extraFilters: PropTypes.arrayOf(
          PropTypes.shape({
            table: PropTypes.string.isRequired,
            jsonql: PropTypes.object.isRequired
          })
        ), // Extra filters to apply to view

        // scope of the map (when a layer self-selects a particular scope)
        scope: PropTypes.shape({
          name: PropTypes.string.isRequired,
          filter: PropTypes.shape({ table: PropTypes.string.isRequired, jsonql: PropTypes.object.isRequired }),
          data: PropTypes.shape({ layerViewId: PropTypes.string.isRequired, data: PropTypes.any }).isRequired
        }),
        onScopeChange: PropTypes.func, // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

        dragging: PropTypes.bool, // Whether the map be draggable with mouse/touch or not. Default true
        touchZoom: PropTypes.bool, // Whether the map can be zoomed by touch-dragging with two fingers. Default true
        scrollWheelZoom: PropTypes.bool, // Whether the map can be zoomed by using the mouse wheel. Default true
        zoomLocked: PropTypes.bool // Whether changes to zoom level should be persisted. Default false
      }

      this.contextTypes = { locale: PropTypes.string }
    }

    constructor(props) {
      super(props)

      const initialLegendDisplay = props.design.initialLegendDisplay || "open"

      this.state = {
        popupContents: null, // Element in the popup
        legendHidden:
          initialLegendDisplay === "closed" || (props.width < 500 && initialLegendDisplay === "closedIfSmall")
      }
    }

    componentDidMount() {
      // Autozoom
      if (this.props.design.autoBounds) {
        return this.performAutoZoom()
      }
    }

    componentDidUpdate(prevProps) {
      if (this.props.design.autoBounds) {
        // Autozoom if filters or autozoom changed
        if (
          !_.isEqual(this.props.design.filters, prevProps.design.filters) ||
          !_.isEqual(this.props.design.globalFilters, prevProps.design.globalFilters) ||
          !_.isEqual(this.props.extraFilters, prevProps.extraFilters) ||
          !prevProps.design.autoBounds
        ) {
          return this.performAutoZoom()
        }
      } else {
        // Update bounds
        if (!_.isEqual(this.props.design.bounds, prevProps.design.bounds)) {
          return this.leafletMap?.setBounds(this.props.design.bounds)
        }
      }
    }

    performAutoZoom() {
      return this.props.mapDataSource.getBounds(this.props.design, this.getCompiledFilters(), (error, bounds) => {
        if (bounds) {
          this.leafletMap?.setBounds(bounds, 0.2)

          // Also record if editable as part of bounds
          if (this.props.onDesignChange != null) {
            return this.props.onDesignChange(_.extend({}, this.props.design, { bounds }))
          }
        }
      })
    }

    handleBoundsChange = (bounds) => {
      // Ignore if readonly
      if (this.props.onDesignChange == null) {
        return
      }

      if (this.props.zoomLocked) {
        return
      }

      // Ignore if autoBounds
      if (this.props.design.autoBounds) {
        return
      }

      const design = _.extend({}, this.props.design, { bounds })
      return this.props.onDesignChange(design)
    }

    handleGridClick = (layerViewId, ev) => {
      const layerView = _.findWhere(this.props.design.layerViews, { id: layerViewId })

      // Create layer
      const layer = LayerFactory.createLayer(layerView.type)

      // Clean design (prevent ever displaying invalid/legacy designs)
      const design = layer.cleanDesign(layerView.design, this.props.schema)

      // Handle click of layer
      const results = layer.onGridClick(ev, {
        design,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        layerDataSource: this.props.mapDataSource.getLayerDataSource(layerViewId),
        scopeData: this.props.scope?.data?.layerViewId === layerViewId ? this.props.scope.data.data : undefined,
        filters: this.getCompiledFilters()
      })

      if (!results) {
        return
      }

      // Handle popup first
      if (results.popup) {
        this.setState({ popupContents: results.popup })
      }

      // Handle onRowClick case
      if (results.row && this.props.onRowClick) {
        this.props.onRowClick(results.row.tableId, results.row.primaryKey)
      }

      // Handle scoping
      if (this.props.onScopeChange && _.has(results, "scope")) {
        let scope
        if (results.scope) {
          // Encode layer view id into scope
          scope = {
            name: results.scope.name,
            filter: results.scope.filter,
            data: { layerViewId, data: results.scope.data }
          }
        } else {
          scope = null
        }

        return this.props.onScopeChange(scope)
      }
    }

    // Get filters from extraFilters combined with map filters
    getCompiledFilters() {
      return (this.props.extraFilters || []).concat(
        MapUtils.getCompiledFilters(
          this.props.design,
          this.props.schema,
          MapUtils.getFilterableTables(this.props.design, this.props.schema)
        )
      )
    }

    renderLegend() {
      if (this.state.legendHidden) {
        return R(HiddenLegend, { onShow: () => this.setState({ legendHidden: false }) })
      } else {
        return R(LegendComponent, {
          schema: this.props.schema,
          layerViews: this.props.design.layerViews,
          filters: this.getCompiledFilters(),
          dataSource: this.props.dataSource,
          locale: this.context.locale,
          onHide: () => this.setState({ legendHidden: true })
        })
      }
    }

    renderPopup() {
      if (!this.state.popupContents) {
        return null
      }

      return R(
        ModalPopupComponent,
        {
          onClose: () => this.setState({ popupContents: null }),
          showCloseX: true,
          size: "large"
        },
        // Render in fixed height div so that dashboard doesn't collapse to nothing
        R("div", { style: { height: "80vh" } }, this.state.popupContents),
        R(
          "div",
          { style: { textAlign: "right", marginTop: 10 } },
          R("button", { className: "btn btn-default", onClick: () => this.setState({ popupContents: null }) }, "Close")
        )
      )
    }

    render() {
      let design, scopedCompiledFilters
      const compiledFilters = this.getCompiledFilters()

      // Determine scoped filters
      if (this.props.scope) {
        scopedCompiledFilters = compiledFilters.concat([this.props.scope.filter])
      } else {
        scopedCompiledFilters = compiledFilters
      }

      // Convert to leaflet layers, if layers are valid
      const leafletLayers = []
      for (let index = 0; index < this.props.design.layerViews.length; index++) {
        // Create layer
        const layerView = this.props.design.layerViews[index]
        const layer = LayerFactory.createLayer(layerView.type)

        // Clean design (prevent ever displaying invalid/legacy designs)
        design = layer.cleanDesign(layerView.design, this.props.schema)

        // Ignore if invalid
        if (layer.validateDesign(design, this.props.schema)) {
          continue
        }

        // Get layer data source
        const layerDataSource = this.props.mapDataSource.getLayerDataSource(layerView.id)

        // If layer is scoping, fade opacity and add extra filtered version
        const isScoping = this.props.scope && this.props.scope.data.layerViewId === layerView.id

        // Create leafletLayer
        let leafletLayer = {
          tileUrl: layerDataSource.getTileUrl(design, isScoping ? compiledFilters : scopedCompiledFilters),
          utfGridUrl: layerDataSource.getUtfGridUrl(design, isScoping ? compiledFilters : scopedCompiledFilters),
          visible: layerView.visible,
          opacity: isScoping ? layerView.opacity * 0.3 : layerView.opacity,
          minZoom: layer.getMinZoom(design),
          maxZoom: layer.getMaxZoom(design),
          onGridClick: this.handleGridClick.bind(null, layerView.id)
        }

        leafletLayers.push(leafletLayer)

        // Add scoped layer if scoping
        if (isScoping) {
          leafletLayer = {
            tileUrl: layerDataSource.getTileUrl(design, scopedCompiledFilters),
            utfGridUrl: layerDataSource.getUtfGridUrl(design, scopedCompiledFilters),
            visible: layerView.visible,
            opacity: layerView.opacity,
            minZoom: layer.getMinZoom(design),
            maxZoom: layer.getMaxZoom(design),
            onGridClick: this.handleGridClick.bind(null, layerView.id)
          }

          leafletLayers.push(leafletLayer)
        }
      }

      return R(
        "div",
        { style: { width: this.props.width, height: this.props.height, position: "relative" } },
        this.renderPopup(),
        this.props.onDesignChange && this.props.design.showLayerSwitcher
          ? R(LayerSwitcherComponent, {
              design: this.props.design,
              onDesignChange: this.props.onDesignChange
            })
          : undefined,
        R(LeafletMapComponent, {
          ref: (c) => {
            return (this.leafletMap = c)
          },
          initialBounds: this.props.design.bounds,
          baseLayerId: this.props.design.baseLayer,
          baseLayerOpacity: this.props.design.baseLayerOpacity,
          layers: leafletLayers,
          width: this.props.width,
          height: this.props.height,
          legend: this.renderLegend(),
          dragging: this.props.dragging,
          touchZoom: this.props.touchZoom,
          scrollWheelZoom: this.props.scrollWheelZoom,
          onBoundsChange: this.handleBoundsChange,
          extraAttribution: this.props.design.attribution,
          loadingSpinner: true,
          maxZoom: this.props.design.maxZoom
        })
      )
    }
  }
  OldMapViewComponent.initClass()
  return OldMapViewComponent
})()

// Legend display tab at bottom right
class HiddenLegend extends React.Component {
  render() {
    const style = {
      zIndex: 1000,
      backgroundColor: "white",
      position: "absolute",
      bottom: 34,
      right: 0,
      fontSize: 14,
      color: "#337ab7",
      cursor: "pointer",
      paddingTop: 4,
      paddingBottom: 3,
      paddingLeft: 3,
      paddingRight: 3,
      borderRadius: "4px 0px 0px 4px",
      border: "solid 1px #AAA",
      borderRight: "none"
    }

    return R("div", { style, onClick: this.props.onShow }, R("i", { className: "fa fa-angle-double-left" }))
  }
}
