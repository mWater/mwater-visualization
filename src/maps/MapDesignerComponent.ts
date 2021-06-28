// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MapDesignerComponent
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
import MapUtils from "./MapUtils"
import { ExprCompiler } from "mwater-expressions"
import ui from "react-library/lib/bootstrap"

export default MapDesignerComponent = (function () {
  MapDesignerComponent = class MapDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired, // Data source to use
        design: PropTypes.object.isRequired, // See Map Design.md
        onDesignChange: PropTypes.func.isRequired, // Called with new design
        filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
      }

      this.childContextTypes = { activeTables: PropTypes.arrayOf(PropTypes.string.isRequired) }
      // List of tables (ids) being used. Use this to present an initially short list to select from
    }

    getChildContext() {
      return {
        // Pass active tables down to table select components so they can present a shorter list
        activeTables: MapUtils.getFilterableTables(this.props.design, this.props.schema)
      }
    }

    handleAttributionChange = (text) => {
      const design = _.extend({}, this.props.design, { attribution: text })
      return this.props.onDesignChange(design)
    }

    handleAutoBoundsChange = (value) => {
      const design = _.extend({}, this.props.design, { autoBounds: value })
      return this.props.onDesignChange(design)
    }

    handleShowLayerSwitcherChange = (value) => {
      const design = _.extend({}, this.props.design, { showLayerSwitcher: value })
      return this.props.onDesignChange(design)
    }

    handleConvertToClusterMap = () => {
      return this.props.onDesignChange(MapUtils.convertToClusterMap(this.props.design))
    }

    handleInitialLegendDisplayChange = (value) => {
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
  MapDesignerComponent.initClass()
  return MapDesignerComponent
})()

// Attribution inline editing
class AttributionComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      text: PropTypes.string,
      onTextChange: PropTypes.func.isRequired
    }

    this.defaultProps = { text: null }
  }

  constructor(props) {
    super(props)

    this.state = {
      editing: false
    }
  }

  handleTextChange = (e) => {
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
AttributionComponent.initClass()

// Advanced options control
class AdvancedOptionsComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      design: PropTypes.object.isRequired,
      onDesignChange: PropTypes.func.isRequired
    }
  }

  constructor(props) {
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
          onChange: (v) => this.props.onDesignChange(_.extend({}, this.props.design, { maxZoom: v }))
        })
      )
    )
  }
}
AdvancedOptionsComponent.initClass()
