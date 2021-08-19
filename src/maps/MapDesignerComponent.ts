import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import TabbedComponent from "react-library/lib/TabbedComponent"
import NumberInputComponent from "react-library/lib/NumberInputComponent"
import CheckboxComponent from "../CheckboxComponent"
import ClickOutHandler from "react-onclickout"
import MapLayersDesignerComponent from "./MapLayersDesignerComponent"
import MapFiltersDesignerComponent from "./MapFiltersDesignerComponent"
import BaseLayerDesignerComponent from "./BaseLayerDesignerComponent"
import PopoverHelpComponent from "react-library/lib/PopoverHelpComponent"
import * as MapUtils from "./MapUtils"
import { ExprCompiler } from "mwater-expressions"
import * as ui from "react-library/lib/bootstrap"

interface MapDesignerComponentProps {
  /** Schema to use */
  schema: any
  /** Data source to use */
  dataSource: any
  /** See Map Design.md */
  design: any
  /** Called with new design */
  onDesignChange: any
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters?: any
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
    const design = _.extend({}, this.props.design, { attribution: text })
    return this.props.onDesignChange(design)
  }

  handleAutoBoundsChange = (value: any) => {
    const design = _.extend({}, this.props.design, { autoBounds: value })
    return this.props.onDesignChange(design)
  }

  handleShowLayerSwitcherChange = (value: any) => {
    const design = _.extend({}, this.props.design, { showLayerSwitcher: value })
    return this.props.onDesignChange(design)
  }

  handleConvertToClusterMap = () => {
    return this.props.onDesignChange(MapUtils.convertToClusterMap(this.props.design))
  }

  handleInitialLegendDisplayChange = (value: any) => {
    const design = _.extend({}, this.props.design, { initialLegendDisplay: value })
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
    const filters = (this.props.filters || []).concat(
      MapUtils.getCompiledFilters(
        this.props.design,
        this.props.schema,
        MapUtils.getFilterableTables(this.props.design, this.props.schema)
      )
    )

    return R(
      "div",
      { style: { padding: 5 } },
      R(TabbedComponent, {
        initialTabId: "layers",
        tabs: [
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
    let elem = R(
      "div",
      { style: { marginLeft: 5 } },
      this.state.editing
        ? this.renderEditor()
        : this.props.text
        ? R("span", { onClick: this.handleTextClick, style: { cursor: "pointer" } }, this.props.text)
        : R("a", { onClick: this.handleTextClick, className: "btn btn-link btn-sm" }, "+ Add attribution")
    )

    if (this.props.text || this.state.editing) {
      elem = R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Attribution"), elem)
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
          { className: "btn btn-link btn-xs", onClick: () => this.setState({ expanded: true }) },
          "Advanced options..."
        )
      )
    }

    return R(
      "div",
      { className: "form-group" },
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
