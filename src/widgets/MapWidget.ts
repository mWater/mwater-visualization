import React from "react"
const R = React.createElement
import _ from "lodash"
import Widget, { CreateViewElementOptions } from "./Widget"
import DropdownWidgetComponent from "./DropdownWidgetComponent"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import * as MapUtils from "../maps/MapUtils"
import { DataSource, Schema } from "mwater-expressions"
import { WidgetDataSource } from "./WidgetDataSource"

// Design is the map design specified in maps/Map Design.md
export default class MapWidget extends Widget {
  // Creates a React element that is a view of the widget
  // options:
  //  schema: schema to use
  //  dataSource: data source to use
  //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  //  design: widget design
  //  scope: scope of the widget (when the widget self-selects a particular scope)
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  onScopeChange: called with scope of widget
  //  onDesignChange: called with new design. null/undefined for readonly
  //  width: width in pixels on screen
  //  height: height in pixels on screen
  //  onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement(options: CreateViewElementOptions) {
    return React.createElement(MapWidgetComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      widgetDataSource: options.widgetDataSource,

      design: options.design,
      onDesignChange: options.onDesignChange,
      scope: options.scope,
      filters: options.filters,
      onScopeChange: options.onScopeChange,
      width: options.width,
      height: options.height,
      onRowClick: options.onRowClick
    })
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: Schema) {
    // Get filterable tables
    return MapUtils.getFilterableTables(design, schema)
  }
}

interface MapWidgetComponentProps {
  /** Schema to use */
  schema: Schema
  /** Data source to use */
  dataSource: DataSource
  widgetDataSource: WidgetDataSource
  /** See Map Design.md */
  design: any
  /** Called with new design.  null/undefined for readonly */
  onDesignChange?: any
  width?: number
  height?: number
  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: any
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters?: any
  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: any
  onRowClick?: any
}

interface MapWidgetComponentState {
  editDesign: any
  transientDesign: any
}

class MapWidgetComponent extends React.Component<MapWidgetComponentProps, MapWidgetComponentState> {
  constructor(props: any) {
    super(props)
    this.state = {
      // Design that is being edited. Change is propagated on closing window
      editDesign: null,

      transientDesign: props.design // Temporary design for read-only maps
    }
  }

  componentDidUpdate(prevProps: any) {
    if (!_.isEqual(prevProps.design, this.props.design)) {
      return this.setState({ transientDesign: this.props.design })
    }
  }

  handleStartEditing = () => {
    return this.setState({ editDesign: this.props.design })
  }

  handleEndEditing = () => {
    this.props.onDesignChange(this.state.editDesign)
    return this.setState({ editDesign: null })
  }

  handleEditDesignChange = (design: any) => {
    return this.setState({ editDesign: design })
  }

  renderEditor() {
    if (!this.state.editDesign) {
      return null
    }

    // Require here to prevent server require problems
    const MapDesignerComponent = require("../maps/MapDesignerComponent").default

    // Create editor
    const editor = React.createElement(MapDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.state.editDesign,
      onDesignChange: this.handleEditDesignChange,
      filters: this.props.filters
    })

    // Create map (maxing out at half of width of screen)
    const width = Math.min(document.body.clientWidth / 2, this.props.width)
    const height = (this.props.height * width) / this.props.width
    const chart = this.renderContent(this.state.editDesign, this.handleEditDesignChange, width, height)

    const content = R(
      "div",
      { style: { height: "100%", width: "100%" } },
      R(
        "div",
        {
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            border: "solid 2px #EEE",
            borderRadius: 8,
            padding: 10,
            width: width + 20,
            height: height + 20
          }
        },
        chart
      ),
      R(
        "div",
        { style: { width: "100%", height: "100%", paddingLeft: width + 40 } },
        R(
          "div",
          {
            style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" }
          },
          editor
        )
      )
    )

    return React.createElement(
      ModalWindowComponent,
      {
        isOpen: true,
        onRequestClose: this.handleEndEditing
      },
      content
    )
  }

  renderContent(design: any, onDesignChange: any, width: any, height: any) {
    // Require here to prevent server require problems
    const { MapViewComponent } = require("../maps/MapViewComponent")

    return R(
      "div",
      { style: { width, height, padding: 10 } },
      React.createElement(MapViewComponent, {
        schema: this.props.schema,
        design,
        dataSource: this.props.dataSource,
        mapDataSource: this.props.widgetDataSource.getMapDataSource(design),
        onDesignChange,
        scope: this.props.scope,
        onScopeChange: this.props.onScopeChange,
        extraFilters: this.props.filters,
        width: width - 20,
        height: height - 20,
        scrollWheelZoom: false, // Prevent accidental zooming
        onRowClick: this.props.onRowClick
      })
    )
  }

  render() {
    const dropdownItems = []
    if (this.props.onDesignChange != null) {
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing })
    }

    const handleDesignChange = (d: any) => this.setState({ transientDesign: d })

    // Wrap in a simple widget
    return R(
      "div",
      null,
      this.props.onDesignChange != null ? this.renderEditor() : undefined,
      // Use transient design (as it may be affected by toggling layers)
      React.createElement(
        DropdownWidgetComponent,
        {
          width: this.props.width,
          height: this.props.height,
          dropdownItems
        },
        this.renderContent(this.state.transientDesign, handleDesignChange, this.props.width, this.props.height)
      )
    )
  }
}
