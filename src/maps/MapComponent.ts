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
import QuickfilterCompiler from "../quickfilter/QuickfilterCompiler"
import QuickfiltersComponent from "../quickfilter/QuickfiltersComponent"
import { getCompiledFilters, getFilterableTables } from "./MapUtils"

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

  /** True to enable quickfilters */
  enableQuickfilters?: boolean

  /** Locked quickfilter values. See README in quickfilters */
  quickfilterLocks?: any[]

  /** Initial quickfilter values */
  quickfiltersValues?: any[]

  /** True to hide title bar and related controls */
  hideTitleBar?: boolean
}

interface MapComponentState {
  undoStack: UndoStack
  transientDesign: MapDesign
  zoomLocked: boolean

  /** Values of quickfilters */
  quickfiltersValues: any[] | null

  /** True to hide quickfilters */
  hideQuickfilters: boolean
}

/** Map with designer on right */
export default class MapComponent extends React.Component<MapComponentProps, MapComponentState> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: MapComponentProps) {
    super(props)
    this.state = {
      undoStack: new UndoStack().push(props.design),
      transientDesign: props.design, // Temporary design for read-only maps
      zoomLocked: true,
      quickfiltersValues: props.quickfiltersValues ?? null,
      hideQuickfilters: false
    }
  }

  componentDidUpdate(prevProps: MapComponentProps) {
    // If design changes, save on stack and update transient design
    if (!_.isEqual(prevProps.design, this.props.design)) {
      // Save on stack
      this.setState({ undoStack: this.state.undoStack.push(this.props.design) })

      // Update transient design
      this.setState({ transientDesign: this.props.design })
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

  handleShowQuickfilters = () => {
    return this.setState({ hideQuickfilters: false })
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
      this.state.hideQuickfilters && this.props.design.quickfilters && this.props.design.quickfilters.length > 0
      ? R(
        "a",
        { key: "showQuickfilters", className: "btn btn-link btn-sm", onClick: this.handleShowQuickfilters },
        R("span", { className: "fa fa-filter" }),
        R("span", { className: "hide-600px" }, " Show Quickfilters")
      )
      : undefined,
      this.props.extraTitleButtonsElem,
      R("a", { key: "toggleDesign", className: "btn btn-link btn-sm", onClick: this.handleToggleDesignPanel, alt: "Toggle design panel" },
        this.getDesign().hideDesignPanel ?
          R("span", { className: "fas fa-angle-double-left" })
        : R("span", { className: "fas fa-angle-double-right" }))
    )
  }

  renderHeader() {
    return R(
      "div",
      {
        style: {
          padding: 4,
          borderBottom: "solid 1px #e8e8e8",
          gridArea: "header"
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

  handleToggleDesignPanel = () => {
    this.handleDesignChange({ ...this.getDesign(), hideDesignPanel: !this.getDesign().hideDesignPanel })
  }

  // Get the values of the quick filters
  getQuickfilterValues = () => {
    return this.state.quickfiltersValues || []
  }

  renderView() {
    let filters = this.props.extraFilters || []

    // Compile quickfilters
    filters = filters.concat(
      new QuickfilterCompiler(this.props.schema).compile(
        this.props.design.quickfilters || [],
        this.state.quickfiltersValues,
        this.props.quickfilterLocks
      )
    )

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
          extraFilters: filters,
          locale: this.context.locale,
          width: size.width!,
          height: size.height!
        })
      }
    )
  }

  // Get filters from props filters combined with maps filters
  getCompiledFilters() {
    let compiledFilters = getCompiledFilters(
      this.props.design,
      this.props.schema,
      getFilterableTables(this.props.design, this.props.schema)
    )
    compiledFilters = compiledFilters.concat(this.props.extraFilters || [])
    return compiledFilters
  }

  renderQuickfilter() {
    return R("div", { style: { gridArea: "quickfilters", borderBottom: "solid 1px #e8e8e8" } },
      R(QuickfiltersComponent, {
        design: this.props.design.quickfilters || [],
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        quickfiltersDataSource: this.props.mapDataSource.getQuickfiltersDataSource(),
        values: this.state.quickfiltersValues || undefined,
        onValuesChange: (values: any) => this.setState({ quickfiltersValues: values }),
        locks: this.props.quickfilterLocks,
        filters: this.getCompiledFilters(),
        hideTopBorder: this.props.hideTitleBar,
        onHide: () => this.setState({ hideQuickfilters: true })
      })
    )
  }

  renderDesigner() {
    return R("div", { style: { gridArea: "designer", borderLeft: "solid 2px #e8e8e8", overflowY: 'scroll' } },
      this.props.onDesignChange ?
        React.createElement(MapDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.getDesign(),
          onDesignChange: this.handleDesignChange,
          enableQuickfilters: this.props.enableQuickfilters
        })
        :
        React.createElement(MapControlComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.getDesign(),
          onDesignChange: this.handleDesignChange
        })
    )
  }

  render() {
    const designerVisible = !this.getDesign().hideDesignPanel
    console.log("designerVisible", designerVisible)
    return R(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: designerVisible ? "70% 30%" : "100%",
          gridTemplateRows: "auto auto 1fr",
          gridTemplateAreas: `"header designer" "quickfilters designer" "view designer"`
        }
      },
      this.renderHeader(),
      this.state.hideQuickfilters ? null : this.renderQuickfilter(),
      R("div", { style: { width: "100%", height: "100%", gridArea: "view", overflow: "hidden" } }, this.renderView()),
      designerVisible ? this.renderDesigner() : null
    )
  }
}
