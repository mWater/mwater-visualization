import PropTypes from "prop-types"
import _ from "lodash"
import React, { ReactNode } from "react"
const R = React.createElement

import AutoSizeComponent from "react-library/lib/AutoSizeComponent"
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent"
import { DataSource, Expr, ExprUtils, FieldExpr, Schema } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import { ExprCleaner } from "mwater-expressions"
import DatagridViewComponent, { RowUpdate } from "./DatagridViewComponent"
import DatagridDesignerComponent from "./DatagridDesignerComponent"
import DatagridUtils from "./DatagridUtils"

import QuickfiltersComponent from "../quickfilter/QuickfiltersComponent"
import QuickfilterCompiler from "../quickfilter/QuickfilterCompiler"
import FindReplaceModalComponent from "./FindReplaceModalComponent"
import DatagridDataSource from "./DatagridDataSource"
import { DatagridDesign, JsonQLFilter } from ".."

export interface DatagridComponentProps {
  /** schema to use */
  schema: Schema

  /** dataSource to use */
  dataSource: DataSource

  /** datagrid dataSource to use */
  datagridDataSource: DatagridDataSource

  design: DatagridDesign
  /** Called when design changes */
  onDesignChange?: (design: DatagridDesign) => void

  /** Extra element to include in title at left */
  titleElem?: ReactNode
  /** Extra elements to add to right */
  extraTitleButtonsElem?: ReactNode

  /** Check if a value is editable by testing if underlying expression is editable */
  canEditExpr?: (tableId: string, rowId: any, expr: Expr) => Promise<boolean>
 
  /** Update cell values by updating set of expressions and values */
  updateExprValues?: (tableId: string, rowUpdates: RowUpdate[]) => Promise<void>
 
  /** Called when row is clicked with (tableId, rowId) */
  onRowClick?: (tableId: string, rowId: any) => void

  /** Called when row is double-clicked with (tableId, rowId) */
  onRowDoubleClick?: (tableId: string, rowId: any) => void

  /** Locked quickfilter values. See README in quickfilters */
  quickfilterLocks?: any[]

  // Filters to add to the datagrid
  filters?: JsonQLFilter[]
}

// Datagrid with decorations
// See README.md for description of datagrid format
// Design should be cleaned already before being passed in (see DatagridUtils)
export default class DatagridComponent extends React.Component<
  DatagridComponentProps,
  {
    /** is design being edited */
    editingDesign: boolean
    /** True if cells can be edited directly */
    cellEditingEnabled: boolean
    /** Height of quickfilters */
    quickfiltersHeight: number | null
    quickfiltersValues: null | any[]
  }
> {
  datagridView?: DatagridViewComponent | null
  quickfilters?: HTMLElement | null
  findReplaceModal: FindReplaceModalComponent | null

  constructor(props: DatagridComponentProps) {
    super(props)

    this.state = {
      editingDesign: false, // is design being edited
      cellEditingEnabled: false, // True if cells can be edited directly
      quickfiltersHeight: null, // Height of quickfilters
      quickfiltersValues: null
    }
  }

  reload() {
    return this.datagridView?.reload()
  }

  componentDidMount() {
    return this.updateHeight()
  }

  componentDidUpdate() {
    return this.updateHeight()
  }

  updateHeight() {
    // Calculate quickfilters height
    if (this.quickfilters) {
      if (this.state.quickfiltersHeight !== this.quickfilters.offsetHeight) {
        return this.setState({ quickfiltersHeight: this.quickfilters.offsetHeight })
      }
    } else {
      return this.setState({ quickfiltersHeight: 0 })
    }
  }

  // Get the values of the quick filters
  getQuickfilterValues = () => {
    return this.state.quickfiltersValues || []
  }

  // Get filters that are applied by the quickfilters
  getQuickfilterFilters = () => {
    return new QuickfilterCompiler(this.props.schema).compile(
      this.props.design.quickfilters,
      this.state.quickfiltersValues,
      this.props.quickfilterLocks
    )
  }

  handleCellEditingToggle = () => {
    if (this.state.cellEditingEnabled) {
      return this.setState({ cellEditingEnabled: false })
    } else {
      if (confirm(T("Turn on cell editing? This will allow you to edit the live data and is an advanced feature."))) {
        return this.setState({ cellEditingEnabled: true })
      }
    }
  }

  handleEdit = () => {
    return this.setState({ editingDesign: true })
  }

  // Get datagrid filter compiled for quickfilter filtering
  getCompiledFilters(): JsonQLFilter[] {
    let jsonql
    const exprCompiler = new ExprCompiler(this.props.schema)
    const exprUtils = new ExprUtils(this.props.schema)
    const exprCleaner = new ExprCleaner(this.props.schema)

    const compiledFilters: JsonQLFilter[] = []

    if (this.props.design.filter) {
      jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" })
      if (jsonql) {
        compiledFilters.push({
          table: this.props.design.table!,
          jsonql
        })
      }
    }

    // Add global filters
    for (let filter of this.props.design.globalFilters || []) {
      // Check if exists and is correct type
      const column = this.props.schema.getColumn(this.props.design.table!, filter.columnId)
      if (!column) {
        continue
      }

      const columnExpr: Expr = { type: "field", table: this.props.design.table!, column: column.id }
      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue
      }

      // Create expr
      let expr: Expr = {
        type: "op",
        op: filter.op,
        table: this.props.design.table!,
        exprs: [columnExpr as Expr].concat(filter.exprs)
      }

      // Clean expr
      expr = exprCleaner.cleanExpr(expr, { table: this.props.design.table! })

      jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" })
      if (jsonql) {
        compiledFilters.push({
          table: this.props.design.table!,
          jsonql
        })
      }
    }

    return compiledFilters
  }

  // Toggle to allow cell editing
  renderCellEdit() {
    if (!this.props.canEditExpr) {
      return null
    }

    const label = [
      R("i", { className: this.state.cellEditingEnabled ? "fa fa-fw fa-check-square" : "fa fa-fw fa-square-o" }),
      " ",
      T("Cell Editing")
    ]

    return R(
      "a",
      {
        key: "cell-edit",
        className: "btn btn-link btn-sm",
        onClick: this.handleCellEditingToggle
      },
      label
    )
  }

  renderEditButton() {
    if (!this.props.onDesignChange) {
      return null
    }

    return R(
      "button",
      {
        type: "button",
        className: "btn btn-primary",
        onClick: this.handleEdit
      },
      R("span", { className: "fas fa-cog" }),
      " ",
      T("Settings")
    )
  }

  renderFindReplace() {
    if (!this.state.cellEditingEnabled) {
      return null
    }

    return R(
      "a",
      {
        key: "findreplace",
        className: "btn btn-link btn-sm",
        onClick: () => this.findReplaceModal!.show()
      },
      T("Find/Replace")
    )
  }

  renderTitleBar() {
    return R(
      "div",
      { style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4 } },
      R(
        "div",
        { style: { float: "right" } },
        this.renderFindReplace(),
        this.renderCellEdit(),
        this.renderEditButton(),
        this.props.extraTitleButtonsElem
      ),
      this.props.titleElem
    )
  }

  renderQuickfilter() {
    return R(
      "div",
      {
        style: { position: "absolute", top: 40, left: 0, right: 0 },
        ref: (c) => {
          this.quickfilters = c
        }
      },
      R(QuickfiltersComponent, {
        design: this.props.design.quickfilters!,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        quickfiltersDataSource: this.props.datagridDataSource.getQuickfiltersDataSource(),
        values: this.state.quickfiltersValues || [],
        onValuesChange: (values: any) => this.setState({ quickfiltersValues: values }),
        locks: this.props.quickfilterLocks,
        filters: this.getCompiledFilters()
      })
    )
  }

  // Renders the editor modal
  renderEditor() {
    if (!this.state.editingDesign) {
      return
    }

    return R(DatagridEditorComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.props.design,
      onDesignChange: (design: any) => {
        // If quickfilters have changed, reset values
        if (!_.isEqual(this.props.design.quickfilters, design.quickfilters)) {
          this.setState({ quickfiltersValues: null })
        }

        this.props.onDesignChange!(design)

        return this.setState({ editingDesign: false })
      },
      onCancel: () => this.setState({ editingDesign: false })
    })
  }

  renderFindReplaceModal(filters: any) {
    return R(FindReplaceModalComponent, {
      ref: (c: FindReplaceModalComponent | null) => {
        this.findReplaceModal = c
      },
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      datagridDataSource: this.props.datagridDataSource,
      design: this.props.design,
      filters,
      updateExprValues: this.props.updateExprValues!,
      onUpdate: () => {
        // Reload
        return this.datagridView?.reload()
      }
    })
  }

  render() {
    let filters = this.props.filters || []

    // Compile quickfilters
    filters = filters.concat(this.getQuickfilterFilters())

    const hasQuickfilters = this.props.design.quickfilters?.[0] != null

    return R(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          position: "relative",
          paddingTop: 40 + (this.state.quickfiltersHeight || 0)
        }
      },
      this.renderTitleBar(),
      this.renderQuickfilter(),

      this.renderEditor(),
      this.renderFindReplaceModal(filters),

      R(AutoSizeComponent, { injectWidth: true, injectHeight: true } as any, (size: any) => {
        // Clean before displaying
        const design = new DatagridUtils(this.props.schema).cleanDesign(this.props.design)

        if (!new DatagridUtils(this.props.schema).validateDesign(design)) {
          return R(DatagridViewComponent, {
            ref: (view: DatagridViewComponent | null) => {
              this.datagridView = view
            },
            width: size.width - 1, // minus 1 px to test if it solves the jitter with scroll
            height: size.height - 1,
            pageSize: 100,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            datagridDataSource: this.props.datagridDataSource,
            design,
            filters,
            onDesignChange: this.props.onDesignChange,
            onRowClick: this.props.onRowClick,
            onRowDoubleClick: this.props.onRowDoubleClick,
            canEditExpr: this.state.cellEditingEnabled ? this.props.canEditExpr : undefined,
            updateExprValues: this.state.cellEditingEnabled ? this.props.updateExprValues : undefined,
          })
        } else if (this.props.onDesignChange) {
          return R(
            "div",
            { style: { textAlign: "center", marginTop: size.height / 2 } },
            R("a", { className: "btn btn-link", onClick: this.handleEdit }, T("Click Here to Configure"))
          )
        } else {
          return null
        }
      })
    )
  }
}

interface DatagridEditorComponentProps {
  schema: Schema
  dataSource: DataSource
  design: DatagridDesign
  onDesignChange: (design: DatagridDesign) => void
  onCancel: () => void
}

/** Popup editor */
class DatagridEditorComponent extends React.Component<DatagridEditorComponentProps, { design: DatagridDesign }> {
  constructor(props: DatagridEditorComponentProps) {
    super(props)

    this.state = {
      design: props.design
    }
  }

  render() {
    return R(
      ActionCancelModalComponent,
      {
        onAction: () => {
          this.props.onDesignChange(this.state.design)
          return this.setState({ design: this.props.design })
        },
        onCancel: this.props.onCancel,
        size: "large"
      },
      R(DatagridDesignerComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        design: this.state.design,
        onDesignChange: (design: any) => this.setState({ design })
      })
    )
  }
}
