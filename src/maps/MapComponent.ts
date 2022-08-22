import PropTypes from "prop-types"
import _ from "lodash"
import React, { ReactNode } from "react"
const R = React.createElement

import { MapViewComponent } from "./MapViewComponent"
import MapDesignerComponent from "./MapDesignerComponent"
import MapControlComponent from "./MapControlComponent"
import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import UndoStack from "../UndoStack"
import PopoverHelpComponent from "react-library/lib/PopoverHelpComponent"
import { DataSource, Schema } from "mwater-expressions"
import { MapDataSource } from "./MapDataSource"
import { MapDesign } from "./MapDesign"
import { JsonQLFilter } from "../JsonQLFilter"

export interface MapComponentProps {
  schema: Schema
  dataSource: DataSource
  mapDataSource: MapDataSource

  design: MapDesign
  onDesignChange?: (design: MapDesign) => void

  /** Called with (tableId, rowId) when item is clicked */
  onRowClick?: (tableId: string, rowId: any) => void

  /** Extra filters to apply to view */
  extraFilters?: JsonQLFilter[]

  /** Extra element to include in title at left */
  titleElem?: ReactNode 

  /** Extra elements to add to right */
  extraTitleButtonsElem?: ReactNode 


  // /** scope of the map (when a layer self-selects a particular scope) */
  // scope?: MapScope

  // /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  // onScopeChange: (scope: MapScope | null) => void

  // /** Whether the map be draggable with mouse/touch or not. Default true */
  // dragging?: boolean

  // /** Whether the map can be zoomed by touch-dragging with two fingers. Default true */
  // touchZoom?: boolean

  // /** Whether the map can be zoomed by using the mouse wheel. Default true */
  // scrollWheelZoom?: boolean

  // /** Whether changes to zoom level should be persisted. Default false  */
  // zoomLocked?: boolean

  // /** Locale to use */
  // locale: string

}

interface MapComponentState {
  undoStack: UndoStack
  transientDesign: MapDesign
  zoomLocked: boolean
}

/** Map with designer on right */
export default class MapComponent extends React.Component<MapComponentProps, MapComponentState> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: MapComponentProps) {
    super(props)
    this.state = {
      undoStack: new UndoStack().push(props.design),
      transientDesign: props.design, // Temporary design for read-only maps
      zoomLocked: true
    }
  }

  componentWillReceiveProps(nextProps: any) {
    // Save on stack
    this.setState({ undoStack: this.state.undoStack.push(nextProps.design) })

    if (!_.isEqual(nextProps.design, this.props.design)) {
      return this.setState({ transientDesign: nextProps.design })
    }
  }

  handleUndo = () => {
    const undoStack = this.state.undoStack.undo()

    // We need to use callback as state is applied later
    return this.setState({ undoStack }, () => this.props.onDesignChange!(undoStack.getValue()))
  }

  handleRedo = () => {
    const undoStack = this.state.undoStack.redo()

    // We need to use callback as state is applied later
    return this.setState({ undoStack }, () => this.props.onDesignChange!(undoStack.getValue()))
  }

  handleZoomLockClick = () => {
    return this.setState({ zoomLocked: !this.state.zoomLocked })
  }

  renderActionLinks() {
    return R(
      "div",
      null,
      this.props.onDesignChange != null
        ? [
            R(
              "a",
              { key: "lock", className: "btn btn-link btn-sm", onClick: this.handleZoomLockClick },
              R("span", {
                className: `fa ${this.state.zoomLocked ? "fa-lock red" : "fa-unlock green"}`,
                style: { marginRight: 5 }
              }),
              R(PopoverHelpComponent, { placement: "bottom" }, "Changes to zoom level wont be saved in locked mode")
            ),
            R(
              "a",
              {
                key: "undo",
                className: `btn btn-link btn-sm ${!this.state.undoStack.canUndo() ? "disabled" : ""}`,
                onClick: this.handleUndo
              },
              R("span", { className: "fas fa-caret-left" }),
              R("span", { className: "hide-600px" }, " Undo")
            ),
            " ",
            R(
              "a",
              {
                key: "redo",
                className: `btn btn-link btn-sm ${!this.state.undoStack.canRedo() ? "disabled" : ""}`,
                onClick: this.handleRedo
              },
              R("span", { className: "fas fa-caret-right" }),
              R("span", { className: "hide-600px" }, " Redo")
            )
          ]
        : undefined,
      this.props.extraTitleButtonsElem
    )
  }

  renderHeader() {
    return R(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          padding: 4,
          borderBottom: "solid 2px #AAA"
        }
      },
      R("div", { style: { float: "right" } }, this.renderActionLinks()),
      this.props.titleElem
    )
  }

  handleDesignChange = (design: any) => {
    if (this.props.onDesignChange) {
      return this.props.onDesignChange(design)
    } else {
      return this.setState({ transientDesign: design })
    }
  }

  getDesign() {
    if (this.props.onDesignChange) {
      return this.props.design
    } else {
      return this.state.transientDesign || this.props.design
    }
  }

  renderView() {
    return React.createElement(
      AutoSizeComponent,
      { injectWidth: true, injectHeight: true },
      (size: {
          width?: number;
          height?: number;
      }) => {
        return React.createElement(MapViewComponent, {
          mapDataSource: this.props.mapDataSource,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.getDesign(),
          onDesignChange: this.handleDesignChange,
          zoomLocked: this.state.zoomLocked,
          onRowClick: this.props.onRowClick,
          extraFilters: this.props.extraFilters,
          locale: this.context.locale,
          width: size.width!,
          height: size.height!
        })
      }
    )
  }

  renderDesigner() {
    if (this.props.onDesignChange) {
      return React.createElement(MapDesignerComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        design: this.getDesign(),
        onDesignChange: this.handleDesignChange
      })
    } else {
      return React.createElement(MapControlComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        design: this.getDesign(),
        onDesignChange: this.handleDesignChange
      })
    }
  }

  render() {
    return R(
      "div",
      { style: { width: "100%", height: "100%", position: "relative" } },
      R(
        "div",
        { style: { position: "absolute", width: "70%", height: "100%", paddingTop: 40 } },
        this.renderHeader(),
        R("div", { style: { width: "100%", height: "100%" } }, this.renderView())
      ),
      R(
        "div",
        {
          style: {
            position: "absolute",
            left: "70%",
            width: "30%",
            height: "100%",
            borderLeft: "solid 3px #AAA",
            overflowY: "auto"
          }
        },
        this.renderDesigner()
      )
    )
  }
}
