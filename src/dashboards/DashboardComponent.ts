import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { ExprCompiler } from "mwater-expressions"
import { ExprCleaner } from "mwater-expressions"
import UndoStack from "../UndoStack"
import * as DashboardUtils from "./DashboardUtils"
import DashboardViewComponent from "./DashboardViewComponent"
import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import QuickfiltersComponent from "../quickfilter/QuickfiltersComponent"
import QuickfilterCompiler from "../quickfilter/QuickfilterCompiler"
import SettingsModalComponent from "./SettingsModalComponent"
import LayoutManager from "../layouts/LayoutManager"
import DashboardUpgrader from "./DashboardUpgrader"
import { LayoutOptionsComponent } from "./LayoutOptionsComponent"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import { getLayoutOptions } from "./layoutOptions"

// Dashboard component that includes an action bar at the top
// Manages undo stack and quickfilter value
export default class DashboardComponent extends React.Component {
  static propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func, // If not set, readonly
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    dashboardDataSource: PropTypes.object.isRequired, // dashboard data source

    titleElem: PropTypes.node, // Extra element to include in title at left
    extraTitleButtonsElem: PropTypes.node, // Extra elements to add to right
    undoStackKey: PropTypes.any, // Key that changes when the undo stack should be reset. Usually a document id or suchlike
    printScaling: PropTypes.bool, // True to scale for printing

    onRowClick: PropTypes.func, // Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object, // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    quickfilterLocks: PropTypes.array, // Locked quickfilter values. See README in quickfilters
    quickfiltersValues: PropTypes.array, // Initial quickfilter values

    // Filters to add to the dashboard
    filters: PropTypes.arrayOf(
      PropTypes.shape({
        table: PropTypes.string.isRequired, // id table to filter
        jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias
      })
    ),

    hideTitleBar: PropTypes.bool // True to hide title bar and related controls
  }

  static defaultProps = { printScaling: true }

  static childContextTypes = {
    locale: PropTypes.string,
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  }

  getChildContext() {
    return {
      // Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
      locale: this.props.design.locale,

      // Pass active tables down to table select components so they can present a shorter list
      activeTables: DashboardUtils.getFilterableTables(this.props.design, this.props.schema)
    }
  }

  constructor(props: any) {
    super(props)

    const layoutOptions = getLayoutOptions(props.design)

    this.state = {
      undoStack: new UndoStack().push(props.design),
      quickfiltersValues: props.quickfiltersValues,
      editing:
        LayoutManager.createLayoutManager(props.design.layout).isEmpty(props.design.items) &&
        props.onDesignChange != null,
      layoutOptionsOpen: false,
      hideQuickfilters:
        layoutOptions.hideQuickfiltersWidth != null && layoutOptions.hideQuickfiltersWidth > document.body.clientWidth,
      refreshKey: 1
    }
  }

  // Get the values of the quick filters
  getQuickfilterValues = () => {
    return this.state.quickfiltersValues || []
  }

  componentWillReceiveProps(nextProps: any) {
    let { undoStack } = this.state

    // Clear stack if key changed
    if (nextProps.undoStackKey !== this.props.undoStackKey) {
      undoStack = new UndoStack()
    }

    // Save on stack
    undoStack = undoStack.push(nextProps.design)
    this.setState({ undoStack })

    // Clear quickfilters if definition changed
    if (!_.isEqual(this.props.design.quickfilters, nextProps.design.quickfilters)) {
      this.setState({ quickfiltersValues: nextProps.quickfiltersValues })
    }

    if (nextProps.onDesignChange == null) {
      return this.setState({ editing: false })
    }
  }

  handlePrint = () => {
    return this.dashboardView.print()
  }

  handleUndo = () => {
    const undoStack = this.state.undoStack.undo()

    // We need to use callback as state is applied later
    return this.setState({ undoStack }, () => this.props.onDesignChange(undoStack.getValue()))
  }

  handleRedo = () => {
    const undoStack = this.state.undoStack.redo()

    // We need to use callback as state is applied later
    return this.setState({ undoStack }, () => this.props.onDesignChange(undoStack.getValue()))
  }

  // Saves a json file to disk
  handleSaveDesignFile = () => {
    // Make a blob and save
    const blob = new Blob([JSON.stringify(this.props.design, null, 2)], { type: "text/json" })
    // Require at use as causes server problems
    const FileSaver = require("file-saver")
    return FileSaver.saveAs(blob, "Dashboard.json")
  }

  handleSettings = () => {
    return this.settings.show(this.props.design)
  }

  handleToggleEditing = () => {
    return this.setState({ editing: !this.state.editing })
  }

  handleOpenLayoutOptions = () => {
    return this.setState({ layoutOptionsOpen: true })
  }

  handleRefreshData = () => {
    this.props.dataSource.clearCache?.()
    return this.setState({ refreshKey: this.state.refreshKey + 1 })
  }

  handleStyleChange = (style: any) => {
    return this.props.onDesignChange(_.extend({}, this.props.design, { style: style || null }))
  }

  handleDesignChange = (design: any) => {
    // If quickfilters have changed, reset values
    if (!_.isEqual(this.props.design.quickfilters, design.quickfilters)) {
      this.setState({ quickfiltersValues: null })
    }

    return this.props.onDesignChange(design)
  }

  handleShowQuickfilters = () => {
    return this.setState({ hideQuickfilters: false })
  }

  handleUpgrade = () => {
    if (
      !confirm(
        "This will upgrade your dashboard to the new kind with enhanced features. You can click Undo immediately afterwards if you wish to revert it. Continue?"
      )
    ) {
      return
    }

    const design = new DashboardUpgrader().upgrade(this.props.design)
    this.props.onDesignChange(design)

    return alert(
      "Upgrade completed. Some widgets may need to be resized. Click Undo to revert back to old dashboard style."
    )
  }

  // Get filters from props filters combined with dashboard filters
  getCompiledFilters() {
    let compiledFilters = DashboardUtils.getCompiledFilters(
      this.props.design,
      this.props.schema,
      DashboardUtils.getFilterableTables(this.props.design, this.props.schema)
    )
    compiledFilters = compiledFilters.concat(this.props.filters || [])
    return compiledFilters
  }

  renderEditingSwitch() {
    return R(
      "a",
      {
        key: "edit",
        className: `btn btn-primary btn-sm ${this.state.editing ? "active" : ""}`,
        onClick: this.handleToggleEditing
      },
      R("span", { className: "glyphicon glyphicon-pencil" }),
      this.state.editing ? " Editing" : " Edit"
    )
  }

  renderStyleItem(style: any) {
    const isActive = (this.props.design.style || "default") === style

    const content = (() => {
      switch (style) {
        case "default":
          return [
            R("h4", { key: "name", className: "list-group-item-heading" }, "Classic Dashboard"),
            R(
              "p",
              { key: "description", className: "list-group-item-text" },
              "Ideal for data display with minimal text"
            )
          ]
        case "greybg":
          return [
            R("h4", { key: "name", className: "list-group-item-heading" }, "Framed Dashboard"),
            R(
              "p",
              { key: "description", className: "list-group-item-text" },
              "Each widget is white on a grey background"
            )
          ]
        case "story":
          return [
            R("h4", { key: "name", className: "list-group-item-heading" }, "Story"),
            R(
              "p",
              { key: "description", className: "list-group-item-text" },
              "Ideal for data-driven storytelling with lots of text. Responsive and mobile-friendly"
            )
          ]
      }
    })()

    return R(
      "a",
      {
        key: style,
        className: `list-group-item ${isActive ? "active" : ""}`,
        onClick: this.handleStyleChange.bind(null, style)
      },
      content
    )
  }

  renderStyle() {
    return R(
      "button",
      { type: "button", key: "style", className: "btn btn-link btn-sm", onClick: this.handleOpenLayoutOptions },
      R("span", { className: "fa fa-mobile" }),
      R("span", { className: "hide-600px" }, " Layout ")
    )
  }

  renderActionLinks() {
    return R(
      "div",
      null,
      this.state.editing && (this.props.design.layout || "grid") === "grid"
        ? R(
            "a",
            { key: "upgrade", className: "btn btn-info btn-sm", onClick: this.handleUpgrade },
            "Upgrade Dashboard..."
          )
        : undefined,
      this.state.editing
        ? [
            R(
              "a",
              {
                key: "undo",
                className: `btn btn-link btn-sm ${!this.state.undoStack.canUndo() ? "disabled" : ""}`,
                onClick: this.handleUndo
              },
              R("span", { className: "glyphicon glyphicon-triangle-left" }),
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
              R("span", { className: "glyphicon glyphicon-triangle-right" }),
              R("span", { className: "hide-600px" }, " Redo")
            )
          ]
        : undefined,
      R(
        "a",
        { key: "print", className: "btn btn-link btn-sm", onClick: this.handlePrint },
        R("span", { className: "glyphicon glyphicon-print" }),
        R("span", { className: "hide-600px" }, " Print")
      ),
      R(
        "a",
        { key: "refresh", className: "btn btn-link btn-sm", onClick: this.handleRefreshData },
        R("span", { className: "glyphicon glyphicon-refresh" }),
        R("span", { className: "hide-600px" }, " Refresh")
      ),
      this.state.hideQuickfilters && this.props.design.quickfilters && this.props.design.quickfilters.length > 0
        ? R(
            "a",
            { key: "showQuickfilters", className: "btn btn-link btn-sm", onClick: this.handleShowQuickfilters },
            R("span", { className: "fa fa-filter" }),
            R("span", { className: "hide-600px" }, " Show Filters")
          )
        : undefined,

      // R 'a', key: "export", className: "btn btn-link btn-sm", onClick: @handleSaveDesignFile,
      //   R('span', className: "glyphicon glyphicon-download-alt")
      //   " Export"
      this.state.editing
        ? R(
            "a",
            { key: "settings", className: "btn btn-link btn-sm", onClick: this.handleSettings },
            R("span", { className: "glyphicon glyphicon-cog" }),
            R("span", { className: "hide-600px" }, " Settings")
          )
        : undefined,
      this.state.editing ? this.renderStyle() : undefined,
      this.props.extraTitleButtonsElem,
      this.props.onDesignChange != null ? this.renderEditingSwitch() : undefined
    )
  }

  renderTitleBar() {
    return R(
      "div",
      { style: { height: 40, padding: 4 } },
      R("div", { style: { float: "right" } }, this.renderActionLinks()),
      this.props.titleElem
    )
  }

  renderQuickfilter() {
    return R(QuickfiltersComponent, {
      design: this.props.design.quickfilters,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      quickfiltersDataSource: this.props.dashboardDataSource.getQuickfiltersDataSource(),
      values: this.state.quickfiltersValues,
      onValuesChange: (values: any) => this.setState({ quickfiltersValues: values }),
      locks: this.props.quickfilterLocks,
      filters: this.getCompiledFilters(),
      hideTopBorder: this.props.hideTitleBar,
      onHide: () => this.setState({ hideQuickfilters: true })
    })
  }

  refDashboardView = (el: any) => {
    return (this.dashboardView = el)
  }

  render() {
    let filters = this.props.filters || []

    // Compile quickfilters
    filters = filters.concat(
      new QuickfilterCompiler(this.props.schema).compile(
        this.props.design.quickfilters,
        this.state.quickfiltersValues,
        this.props.quickfilterLocks
      )
    )

    const dashboardView = R(DashboardViewComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      dashboardDataSource: this.props.dashboardDataSource,
      ref: this.refDashboardView,
      design: this.props.design,
      onDesignChange: this.state.editing ? this.props.onDesignChange : undefined,
      filters,
      onRowClick: this.props.onRowClick,
      namedStrings: this.props.namedStrings,
      hideScopes: this.state.hideQuickfilters,
      refreshKey: this.state.refreshKey
    })

    const readonlyDashboardView = R(DashboardViewComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      dashboardDataSource: this.props.dashboardDataSource,
      ref: this.refDashboardView,
      design: this.props.design,
      filters,
      onRowClick: this.props.onRowClick,
      namedStrings: this.props.namedStrings,
      hideScopes: this.state.hideQuickfilters
    })

    return R(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateRows: this.props.hideTitleBar ? "auto 1fr" : "auto auto 1fr",
          height: "100%"
        }
      },
      !this.props.hideTitleBar ? this.renderTitleBar() : undefined,
      R("div", null, !this.state.hideQuickfilters ? this.renderQuickfilter() : undefined),
      dashboardView,
      this.props.onDesignChange != null
        ? R(SettingsModalComponent, {
            onDesignChange: this.handleDesignChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            ref: (c: any) => {
              return (this.settings = c)
            }
          })
        : undefined,
      this.state.layoutOptionsOpen
        ? R(
            ModalWindowComponent,
            { isOpen: true, outerPadding: 10, innerPadding: 10 },
            R(LayoutOptionsComponent, {
              design: this.props.design,
              onDesignChange: this.props.onDesignChange,
              onClose: () => this.setState({ layoutOptionsOpen: false }),
              dashboardView: readonlyDashboardView,
              quickfiltersView: this.renderQuickfilter()
            })
          )
        : undefined
    )
  }
}
