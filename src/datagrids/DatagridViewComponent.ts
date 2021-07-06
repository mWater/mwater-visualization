import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import moment from "moment"
import { Table, Column, Cell } from "fixed-data-table-2"
import DatagridQueryBuilder from "./DatagridQueryBuilder"
import { ExprUtils } from "mwater-expressions"
import ExprCellComponent from "./ExprCellComponent"
import EditExprCellComponent from "./EditExprCellComponent"

// Datagrid table itself without decorations such as edit button etc.
// See README.md for description of datagrid format
// Design should be cleaned already before being passed in (see DatagridUtils)
export default class DatagridViewComponent extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired, // Width of control
    height: PropTypes.number.isRequired, // Height of control
    pageSize: PropTypes.number,

    schema: PropTypes.object.isRequired, // schema to use
    dataSource: PropTypes.object.isRequired, // dataSource to use
    datagridDataSource: PropTypes.object.isRequired, // datagrid dataSource to use

    design: PropTypes.object.isRequired, // Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func, // Called when design changes

    filters: PropTypes.arrayOf(
      PropTypes.shape({
        table: PropTypes.string.isRequired, // id table to filter
        jsonql: PropTypes.object.isRequired // jsonql filter with {alias} for tableAlias
      })
    ),

    // Check if cell is editable
    // If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditCell: PropTypes.func,

    // Update cell value
    // Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateCell: PropTypes.func,

    // Called when row is double-clicked with (tableId, rowId, rowIndex)
    onRowDoubleClick: PropTypes.func,

    // Called when a row is clicked with (tableId, rowId, rowIndex)
    onRowClick: PropTypes.func
  }

  static defaultProps = { pageSize: 100 }

  constructor(props: any) {
    super(props)
    this.state = {
      rows: [],
      entirelyLoaded: false,
      editingCell: null, // set to { rowIndex: 0, 1, 2, columnIndex: 0, 1, 2... } if editing a cell
      savingCell: false // True when saving a cell's contents
    }
  }

  componentWillReceiveProps(nextProps: any) {
    // If design or filters changed, delete all rows
    // TODO won't this reload on column resize?
    if (!_.isEqual(nextProps.design, this.props.design) || !_.isEqual(nextProps.filters, this.props.filters)) {
      return this.setState({ rows: [], entirelyLoaded: false })
    }
  }

  // Loads more rows because the placeholder last row has been rendered
  loadMoreRows() {
    // Get the current load state (the values that determine what to load and if the loaded results can still be used or are stale)
    const loadState = {
      design: this.props.design,
      offset: this.state.rows.length,
      limit: this.props.pageSize,
      filters: this.props.filters
    }

    // If already loading what we want, return
    if (_.isEqual(loadState, this.loadState)) {
      return
    }

    // Record what we're loading
    this.loadState = loadState

    // Perform the actual load
    return this.props.datagridDataSource.getRows(
      loadState.design,
      loadState.offset,
      loadState.limit,
      loadState.filters,
      (error: any, newRows: any) => {
        if (error) {
          console.error(error)
          alert("Error loading data")
          return
        }

        // Check that the required load state has not changed
        if (_.isEqual(loadState, this.loadState)) {
          // Load is complete
          this.loadState = null

          // Add rows, setting entirelyLoaded based on whether fewer than requested were returned
          const rows = this.state.rows.concat(newRows)
          return this.setState({ rows, entirelyLoaded: newRows.length < this.props.pageSize })
        }
      }
    )
  }

  // Reloads all data
  reload = () => {
    return this.setState({ rows: [], entirelyLoaded: false })
  }

  deleteRow(rowIndex: any, callback: any) {
    const newRows = this.state.rows.slice()
    _.pullAt(newRows, rowIndex)
    this.setState({ rows: newRows })
    return callback()
  }

  // Reload a single row
  reloadRow(rowIndex: any, callback: any) {
    return this.props.datagridDataSource.getRows(
      this.props.design,
      rowIndex,
      1,
      this.props.filters,
      (error: any, rows: any) => {
        if (error || !rows[0]) {
          console.error(error)
          alert("Error loading data")
          callback()
          return
        }

        // Set row
        const newRows = this.state.rows.slice()
        newRows[rowIndex] = rows[0]
        this.setState({ rows: newRows })
        return callback()
      }
    )
  }

  handleColumnResize = (newColumnWidth: any, columnKey: any) => {
    // Find index of column
    const columnIndex = _.findIndex(this.props.design.columns, { id: columnKey })

    // Set new width
    let column = this.props.design.columns[columnIndex]
    column = _.extend({}, column, { width: newColumnWidth })

    // Re-add to list
    const columns = this.props.design.columns.slice()
    columns[columnIndex] = column

    return this.props.onDesignChange(_.extend({}, this.props.design, { columns }))
  }

  handleCellClick = (rowIndex: any, columnIndex: any) => {
    // Ignore if already editing
    if (this.state.editingCell?.rowIndex === rowIndex && this.state.editingCell?.columnIndex === columnIndex) {
      return
    }

    // Ignore if saving
    if (this.state.savingCell) {
      return
    }

    // Save editing if editing and return
    if (this.state.editingCell) {
      this.handleSaveEdit()
      return
    }

    // Check if can edit
    if (!this.props.canEditCell) {
      return
    }

    // Get column
    const column = this.props.design.columns[columnIndex]

    // If not expr, return
    if (!column.type === "expr") {
      return
    }

    // Get expression type
    const exprType = new ExprUtils(this.props.schema).getExprType(column.expr)

    // If cannot edit type, return
    if (!["text", "number", "enum"].includes(exprType)) {
      return
    }

    return this.props.canEditCell(
      this.props.design.table,
      this.state.rows[rowIndex].id,
      column.expr,
      (error: any, canEdit: any) => {
        // TODO handle error
        if (error) {
          throw error
        }

        if (canEdit) {
          // Start editing
          return this.setState({ editingCell: { rowIndex, columnIndex } })
        }
      }
    )
  }

  // Called to save
  handleSaveEdit = () => {
    // Ignore if not changed
    if (!this.editCellComp || !this.editCellComp.hasChanged()) {
      this.setState({ editingCell: null, savingCell: false })
      return
    }

    const rowId = this.state.rows[this.state.editingCell.rowIndex].id
    const { expr } = this.props.design.columns[this.state.editingCell.columnIndex]
    const value = this.editCellComp.getValue()

    return this.setState({ savingCell: true }, () => {
      return this.props.updateCell(this.props.design.table, rowId, expr, value, (error: any) => {
        // TODO handle error

        // Reload row
        return this.reloadRow(this.state.editingCell.rowIndex, () => {
          return this.setState({ editingCell: null, savingCell: false })
        })
      })
    })
  }

  handleCancelEdit = () => {
    return this.setState({ editingCell: null, savingCell: false })
  }

  // Called with current ref edit. Save
  refEditCell = (comp: any) => {
    return (this.editCellComp = comp)
  }

  handleRowDoubleClick = (ev: any, rowIndex: any) => {
    if (this.props.onRowDoubleClick != null && this.state.rows[rowIndex].id) {
      return this.props.onRowDoubleClick(this.props.design.table, this.state.rows[rowIndex].id, rowIndex)
    }
  }

  handleRowClick = (ev: any, rowIndex: any) => {
    if (this.props.onRowClick != null && this.state.rows[rowIndex].id) {
      return this.props.onRowClick(this.props.design.table, this.state.rows[rowIndex].id, rowIndex)
    }
  }

  // Render a single cell. exprType is passed in for performance purposes and is calculated once per column
  renderCell = (column: any, columnIndex: any, exprType: any, cellProps: any) => {
    // If rendering placeholder row
    if (cellProps.rowIndex >= this.state.rows.length) {
      // Load next tick as cannot update while rendering
      _.defer(() => {
        return this.loadMoreRows()
      })
      return R(Cell, cellProps, R("i", { className: "fa fa-spinner fa-spin" }))
    }

    // Special case for row number
    if (columnIndex === -1) {
      return R(
        Cell,
        {
          width: cellProps.width,
          height: cellProps.height,
          style: {
            whiteSpace: "nowrap",
            textAlign: "right"
          }
        },
        cellProps.rowIndex + 1
      )
    }

    // Get value (columns are c0, c1, c2, etc.)
    const value = this.state.rows[cellProps.rowIndex][`c${columnIndex}`]

    // Render special if editing
    if (
      this.state.editingCell?.rowIndex === cellProps.rowIndex &&
      this.state.editingCell?.columnIndex === columnIndex
    ) {
      // Special if saving
      if (this.state.savingCell) {
        return R(Cell, cellProps, R("i", { className: "fa fa-spinner fa-spin" }))
      }

      return R(EditExprCellComponent, {
        ref: this.refEditCell,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        locale: this.props.design.locale,
        width: cellProps.width,
        height: cellProps.height,
        value,
        expr: column.expr,
        onSave: this.handleSaveEdit,
        onCancel: this.handleCancelEdit
      })
    }

    if (column.type === "expr") {
      // Muted if from main and are displaying subtable
      const muted = !column.subtable && this.state.rows[cellProps.rowIndex].subtable >= 0

      return R(ExprCellComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        locale: this.props.design.locale,
        width: cellProps.width,
        height: cellProps.height,
        value,
        expr: column.expr,
        format: column.format,
        exprType,
        muted,
        onClick: this.handleCellClick.bind(null, cellProps.rowIndex, columnIndex)
      })
    }
  }

  // Render a single column
  renderColumn(column: any, columnIndex: any) {
    const exprUtils = new ExprUtils(this.props.schema)

    // Get expression type
    const exprType = exprUtils.getExprType(column.expr)

    return R(Column, {
      key: column.id,
      header: R(
        Cell,
        { style: { whiteSpace: "nowrap" } },
        column.label || exprUtils.summarizeExpr(column.expr, this.props.design.locale)
      ),
      width: column.width,
      allowCellsRecycling: true,
      cell: this.renderCell.bind(null, column, columnIndex, exprType),
      columnKey: column.id,
      isResizable: this.props.onDesignChange != null
    })
  }

  // Render all columns
  renderColumns() {
    const columns = _.map(this.props.design.columns, (column, columnIndex) => this.renderColumn(column, columnIndex))

    if (this.props.design.showRowNumbers) {
      columns.unshift(
        this.renderColumn(
          {
            label: "#",
            width: 50
          },
          -1
        )
      )
    }

    return columns
  }

  render() {
    let rowsCount = this.state.rows.length

    // Add loading row if not entirely loaded
    if (!this.state.entirelyLoaded) {
      rowsCount += 1
    }

    return R(
      Table,
      {
        rowsCount,
        rowHeight: 40,
        headerHeight: 40,
        width: this.props.width,
        height: this.props.height,
        onRowDoubleClick: this.handleRowDoubleClick,
        onRowClick: this.handleRowClick,
        isColumnResizing: false,
        allowCellsRecycling: true,
        onColumnResizeEndCallback: this.handleColumnResize
      },
      this.renderColumns()
    )
  }
}
