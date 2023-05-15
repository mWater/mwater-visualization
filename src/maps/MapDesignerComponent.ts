import _ from "lodash"
import PropTypes from "prop-types"
import React, { ReactElement } from "react"
const R = React.createElement

import TabbedComponent, { TabbedComponentTab } from "react-library/lib/TabbedComponent"
import NumberInputComponent from "react-library/lib/NumberInputComponent"
import CheckboxComponent from "../CheckboxComponent"
import ClickOutHandler from "react-onclickout"
import MapLayersDesignerComponent from "./MapLayersDesignerComponent"
import MapFiltersDesignerComponent from "./MapFiltersDesignerComponent"
import BaseLayerDesignerComponent from "./BaseLayerDesignerComponent"
import PopoverHelpComponent from "react-library/lib/PopoverHelpComponent"
import * as MapUtils from "./MapUtils"
import { DataSource, ExprCompiler, Schema } from "mwater-expressions"
import * as ui from "react-library/lib/bootstrap"
import { MapDesign } from "./MapDesign"
import { JsonQLFilter } from "../JsonQLFilter"
import QuickfiltersDesignComponent from "../quickfilter/QuickfiltersDesignComponent"
import produce from "immer"

export interface MapDesignerComponentProps {
  /** Schema to use */
  schema: Schema
  /** Data source to use */
  dataSource: DataSource
  /** See Map Design.md */
  design: MapDesign
  /** Called with new design */
  onDesignChange: (design: MapDesign) => void
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters?: JsonQLFilter[]

  /** True to enable quickfilters */
  enableQuickFilters?: boolean
}

export default class MapDesignerComponent extends React.Component<MapDesignerComponentProps> {
  static childContextTypes = { activeTables: PropTypes.arrayOf(PropTypes.string.isRequired) }

  getChildContext() {
    return {
      // Pass active tables down to table select components so they can present a shorter list
      activeTables: MapUtils.getFilterableTables(this.props.design, this.props.schema)
    }
  }

  handleAttributionChange = (text: any) => {
    const design = { ...this.props.design, attribution: text }
    return this.props.onDesignChange(design)
  }

  handleAutoBoundsChange = (value: any) => {
    const design = { ...this.props.design, autoBounds: value }
    return this.props.onDesignChange(design)
  }

  handleShowLayerSwitcherChange = (value: any) => {
    const design = { ...this.props.design, showLayerSwitcher: value }
    return this.props.onDesignChange(design)
  }

  handleConvertToClusterMap = () => {
    return this.props.onDesignChange(MapUtils.convertToClusterMap(this.props.design))
  }

  handleConvertToMarkersMap = () => {
    return this.props.onDesignChange(MapUtils.convertToMarkersMap(this.props.design))
  }

  handleInitialLegendDisplayChange = (value: any) => {
    const design = { ...this.props.design, initialLegendDisplay: value }
    return this.props.onDesignChange(design)
  }

  renderOptionsTab() {
    return R(
      "div",
      null,
      R(BaseLayerDesignerComponent, {
        design: this.props.design,
        onDesignChange: this.props.onDesignChange
      }),

      R(
        CheckboxComponent,
        {
          checked: this.props.design.autoBounds,
          onChange: this.handleAutoBoundsChange
        },
        R(
          "span",
          { className: "text-muted" },
          "Automatic zoom ",
          R(
            PopoverHelpComponent,
            { placement: "left" },
            "Automatically zoom to the complete data whenever the map is loaded or the filters change"
          )
        )
      ),

      R(
        CheckboxComponent,
        {
          checked: this.props.design.showLayerSwitcher,
          onChange: this.handleShowLayerSwitcherChange
        },
        R(
          "span",
          { className: "text-muted" },
          "Show Layer Switcher ",
          R(PopoverHelpComponent, { placement: "left" }, "Show a control in the map allowing switching layers")
        )
      ),

      R(
        ui.FormGroup,
        { label: "Initial Legend Display", labelMuted: true },
        R(ui.Select, {
          value: this.props.design.initialLegendDisplay || "open",
          onChange: this.handleInitialLegendDisplayChange,
          options: [
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
            { value: "closedIfSmall", label: "Open if wide enough" }
          ],
          style: { width: "auto" }
        })
      ),

      MapUtils.canConvertToClusterMap(this.props.design)
        ? R(
          "div",
          { key: "tocluster" },
          R(
            "a",
            { onClick: this.handleConvertToClusterMap, className: "btn btn-link btn-sm" },
            "Convert to cluster map"
          )
        )
        : undefined,

      MapUtils.canConvertToMarkersMap(this.props.design)
        ? R(
          "div",
          { key: "toMarker" },
          R(
            "a",
            { onClick: this.handleConvertToMarkersMap, className: "btn btn-link btn-sm" },
            "Convert to markers map"
          )
        )
        : undefined,

      R(AttributionComponent, {
        text: this.props.design.attribution,
        onTextChange: this.handleAttributionChange
      }),

      R("br"),

      R(AdvancedOptionsComponent, {
        design: this.props.design,
        onDesignChange: this.props.onDesignChange
      })
    )
  }

  render() {
    const filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema)
    const filters = (this.props.filters || []).concat(
      MapUtils.getCompiledFilters(
        this.props.design,
        this.props.schema,
        filterableTables
      )
    )

    const tabs: TabbedComponentTab[] = [
      {
        id: "layers",
        label: [R("i", { className: "fa fa-bars" }), " Layers"],
        elem: R(MapLayersDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.props.design,
          onDesignChange: this.props.onDesignChange,
          allowEditingLayers: true,
          filters: _.compact(filters)
        })
      },
      {
        id: "filters",
        label: [R("i", { className: "fa fa-filter" }), " Filters"],
        elem: R(MapFiltersDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        })
      },
      {
        id: "options",
        label: [R("i", { className: "fa fa-cog" }), " Options"],
        elem: this.renderOptionsTab()
      }
    ]

    if (this.props.enableQuickFilters) {
      tabs.splice(2, 0, {
        id: "quickfilters",
        label: T("Quickfilters"),
        elem: R(
          "div",
          { style: { marginBottom: 200 } },
          R(QuickfiltersDesignComponent, {
            design: this.props.design.quickfilters || [],
            onDesignChange: (qfDesign) => {
              this.props.onDesignChange(produce(this.props.design, (draft) => {
                draft.quickfilters = qfDesign
              }))
            },
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            tables: filterableTables
          })
        )
      })
    }


    return R(
      "div",
      { style: { padding: 5 } },
      R(TabbedComponent, {
        initialTabId: "layers",
        tabs
      })
    )
  }
}

interface AttributionComponentProps {
  text?: string
  onTextChange: any
}

interface AttributionComponentState {
  editing: any
}

// Attribution inline editing
class AttributionComponent extends React.Component<AttributionComponentProps, AttributionComponentState> {
  static defaultProps = { text: null }

  constructor(props: any) {
    super(props)

    this.state = {
      editing: false
    }
  }

  handleTextChange = (e: any) => {
    return this.props.onTextChange(e.target.value)
  }

  handleClickOut = () => {
    return this.setState({ editing: false })
  }

  renderEditor() {
    return R(
      ClickOutHandler,
      { onClickOut: this.handleClickOut },
      R("input", { onChange: this.handleTextChange, value: this.props.text, className: "form-control" })
    )
  }

  handleTextClick = () => {
    return this.setState({ editing: true })
  }

  render() {
    let elem: ReactElement = R(
      "div",
      { style: { marginLeft: 5 } },
      this.state.editing
        ? this.renderEditor()
        : this.props.text
          ? R("span", { onClick: this.handleTextClick, style: { cursor: "pointer" } }, this.props.text)
          : R("a", { onClick: this.handleTextClick, className: "btn btn-link btn-sm" }, "+ Add attribution")
    )

    if (this.props.text || this.state.editing) {
      elem = R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Attribution"), elem)
    }

    return elem
  }
}

interface AdvancedOptionsComponentProps {
  design: any
  onDesignChange: any
}

interface AdvancedOptionsComponentState {
  expanded: any
}

// Advanced options control
class AdvancedOptionsComponent extends React.Component<AdvancedOptionsComponentProps, AdvancedOptionsComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  render() {
    if (!this.state.expanded) {
      return R(
        "div",
        null,
        R(
          "a",
          { className: "btn btn-link btn-sm", onClick: () => this.setState({ expanded: true }) },
          "Advanced options..."
        )
      )
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, "Advanced"),

      R(
        "div",
        null,
        R("span", { className: "text-muted" }, "Maximum Zoom Level: "),
        " ",
        R(NumberInputComponent, {
          small: true,
          style: { display: "inline-block" },
          placeholder: "None",
          value: this.props.design.maxZoom,
          onChange: (v: any) => this.props.onDesignChange(_.extend({}, this.props.design, { maxZoom: v }))
        })
      )
    )
  }
}
