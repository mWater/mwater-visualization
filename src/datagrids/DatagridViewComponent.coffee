PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
moment = require 'moment'

{Table, Column, Cell} = require('fixed-data-table-2')

DatagridQueryBuilder = require './DatagridQueryBuilder'
ExprUtils = require("mwater-expressions").ExprUtils
ExprCellComponent = require './ExprCellComponent'
EditExprCellComponent = require './EditExprCellComponent'

# Datagrid table itself without decorations such as edit button etc.
# See README.md for description of datagrid format
# Design should be cleaned already before being passed in (see DatagridUtils)
module.exports = class DatagridViewComponent extends React.Component
  @propTypes:
    width: PropTypes.number.isRequired      # Width of control
    height: PropTypes.number.isRequired     # Height of control
    pageSize: PropTypes.number

    schema: PropTypes.object.isRequired     # schema to use
    dataSource: PropTypes.object.isRequired # dataSource to use
    datagridDataSource: PropTypes.object.isRequired # datagrid dataSource to use

    design: PropTypes.object.isRequired     # Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func           # Called when design changes

    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

    # Check if cell is editable
    # If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditCell: PropTypes.func             

    # Update cell value
    # Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateCell:  PropTypes.func

    # Called when row is double-clicked with (tableId, rowId, rowIndex)
    onRowDoubleClick: PropTypes.func
    
    # Called when a row is clicked with (tableId, rowId, rowIndex)
    onRowClick: PropTypes.func

  @defaultProps:
    pageSize: 100

  constructor: (props) ->
    super(props)
    @state = {
      rows: []
      entirelyLoaded: false
      editingCell: null     # set to { rowIndex: 0, 1, 2, columnIndex: 0, 1, 2... } if editing a cell 
      savingCell: false     # True when saving a cell's contents
    }

  componentWillReceiveProps: (nextProps) ->
    # If design or filters changed, delete all rows
    # TODO won't this reload on column resize?
    if not _.isEqual(nextProps.design, @props.design) or not _.isEqual(nextProps.filters, @props.filters)
      @setState(rows: [], entirelyLoaded: false)

  # Loads more rows because the placeholder last row has been rendered
  loadMoreRows: ->
    # Get the current load state (the values that determine what to load and if the loaded results can still be used or are stale)
    loadState = {
      design: @props.design
      offset: @state.rows.length
      limit: @props.pageSize
      filters: @props.filters
    }

    # If already loading what we want, return
    if _.isEqual(loadState, @loadState)
      return

    # Record what we're loading
    @loadState = loadState

    # Perform the actual load
    @props.datagridDataSource.getRows(loadState.design, loadState.offset, loadState.limit, loadState.filters, (error, newRows) =>
      if error
        console.error error
        alert("Error loading data")
        return

      # Check that the required load state has not changed
      if _.isEqual(loadState, @loadState)
        # Load is complete
        @loadState = null

        # Add rows, setting entirelyLoaded based on whether fewer than requested were returned
        rows = @state.rows.concat(newRows)
        @setState(rows: rows, entirelyLoaded: newRows.length < @props.pageSize)
      )

  # Reloads all data
  reload: =>
    @setState(rows: [], entirelyLoaded: false)    


  deleteRow: (rowIndex, callback) ->
    newRows = @state.rows.slice()
    _.pullAt newRows, rowIndex
    @setState(rows: newRows)
    callback()

  # Reload a single row
  reloadRow: (rowIndex, callback) ->
    @props.datagridDataSource.getRows(@props.design, rowIndex, 1, @props.filters, (error, rows) =>
      if error or not rows[0]
        console.error error
        alert("Error loading data")
        callback()
        return

      # Set row
      newRows = @state.rows.slice()
      newRows[rowIndex] = rows[0]
      @setState(rows: newRows)
      callback()
    )

  handleColumnResize: (newColumnWidth, columnKey) =>
    # Find index of column
    columnIndex = _.findIndex(@props.design.columns, { id: columnKey })

    # Set new width
    column = @props.design.columns[columnIndex]
    column = _.extend({}, column, width: newColumnWidth)

    # Re-add to list
    columns = @props.design.columns.slice()
    columns[columnIndex] = column

    @props.onDesignChange(_.extend({}, @props.design, { columns: columns }))

  handleCellClick: (rowIndex, columnIndex) =>
    # Ignore if already editing
    if @state.editingCell?.rowIndex == rowIndex and @state.editingCell?.columnIndex == columnIndex
      return 

    # Ignore if saving
    if @state.savingCell
      return

    # Save editing if editing and return
    if @state.editingCell 
      @handleSaveEdit()
      return

    # Check if can edit
    if not @props.canEditCell
      return

    # Get column
    column = @props.design.columns[columnIndex]

    # If not expr, return
    if not column.type == "expr"
      return

    # Get expression type
    exprType = new ExprUtils(@props.schema).getExprType(column.expr)

    # If cannot edit type, return
    if exprType not in ['text', 'number', 'enum']
      return

    @props.canEditCell(@props.design.table, @state.rows[rowIndex].id, column.expr, (error, canEdit) =>
      # TODO handle error
      if error
        throw error

      if canEdit
        # Start editing 
        @setState(editingCell: { rowIndex: rowIndex, columnIndex: columnIndex })
    )

  # Called to save 
  handleSaveEdit: =>
    # Ignore if not changed
    if not @editCellComp or not @editCellComp.hasChanged()
      @setState(editingCell: null, savingCell: false)
      return

    rowId = @state.rows[@state.editingCell.rowIndex].id
    expr = @props.design.columns[@state.editingCell.columnIndex].expr
    value = @editCellComp.getValue()

    @setState(savingCell: true, =>
      @props.updateCell(@props.design.table, rowId, expr, value, (error) =>
        # TODO handle error

        # Reload row
        @reloadRow(@state.editingCell.rowIndex, =>
          @setState(editingCell: null, savingCell: false)
        )
      )
    )

  handleCancelEdit: =>
    @setState(editingCell: null, savingCell: false)

  # Called with current ref edit. Save
  refEditCell: (comp) =>
    @editCellComp = comp

  handleRowDoubleClick: (ev, rowIndex) =>
    if @props.onRowDoubleClick? and @state.rows[rowIndex].id
      @props.onRowDoubleClick(@props.design.table, @state.rows[rowIndex].id, rowIndex)
  
  handleRowClick: (ev, rowIndex) =>
    if @props.onRowClick? and @state.rows[rowIndex].id
      @props.onRowClick(@props.design.table, @state.rows[rowIndex].id, rowIndex)

  # Render a single cell. exprType is passed in for performance purposes and is calculated once per column
  renderCell: (column, columnIndex, exprType, cellProps) =>
    # If rendering placeholder row
    if cellProps.rowIndex >= @state.rows.length
      # Load next tick as cannot update while rendering
      _.defer () =>
        @loadMoreRows()
      return R Cell, cellProps,
        R 'i', className: "fa fa-spinner fa-spin"

    # Special case for row number
    if columnIndex == -1
      return R Cell, 
        width: cellProps.width
        height: cellProps.height
        style: { 
          whiteSpace: "nowrap" 
          textAlign: "right"
        }, 
          cellProps.rowIndex + 1

    # Get value (columns are c0, c1, c2, etc.)
    value = @state.rows[cellProps.rowIndex]["c#{columnIndex}"]

    # Render special if editing
    if @state.editingCell?.rowIndex == cellProps.rowIndex and @state.editingCell?.columnIndex == columnIndex
      # Special if saving
      if @state.savingCell
        return R Cell, cellProps,
          R 'i', className: "fa fa-spinner fa-spin"

      return R EditExprCellComponent, 
        ref: @refEditCell
        schema: @props.schema
        dataSource: @props.dataSource
        locale: @props.design.locale
        width: cellProps.width
        height: cellProps.height
        value: value
        expr: column.expr
        onSave: @handleSaveEdit
        onCancel: @handleCancelEdit

    if column.type == "expr"
      # Muted if from main and are displaying subtable
      muted = not column.subtable and @state.rows[cellProps.rowIndex].subtable >= 0

      return R ExprCellComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        locale: @props.design.locale
        width: cellProps.width
        height: cellProps.height
        value: value
        expr: column.expr
        exprType: exprType
        muted: muted
        onClick: @handleCellClick.bind(null, cellProps.rowIndex, columnIndex)

  # Render a single column
  renderColumn: (column, columnIndex) ->
    exprUtils = new ExprUtils(@props.schema)

    # Get expression type
    exprType = exprUtils.getExprType(column.expr)

    R Column,
      key: column.id
      header: R Cell, style: { whiteSpace: "nowrap" }, column.label or exprUtils.summarizeExpr(column.expr, @props.design.locale)
      width: column.width
      allowCellsRecycling: true
      cell: @renderCell.bind(null, column, columnIndex, exprType)
      columnKey: column.id
      isResizable: @props.onDesignChange?

  # Render all columns
  renderColumns: ->
    columns = _.map(@props.design.columns, (column, columnIndex) => @renderColumn(column, columnIndex))    

    if @props.design.showRowNumbers
      columns.unshift(
        @renderColumn({
          label: "#"
          width: 50
        }, -1)
      )

    columns

  render: ->
    rowsCount = @state.rows.length

    # Add loading row if not entirely loaded
    if not @state.entirelyLoaded
      rowsCount += 1

    R Table,
      rowsCount: rowsCount
      rowHeight: 40
      headerHeight: 40
      width: @props.width
      height: @props.height
      onRowDoubleClick: @handleRowDoubleClick
      onRowClick: @handleRowClick
      isColumnResizing: false
      allowCellsRecycling: true
      onColumnResizeEndCallback: @handleColumnResize,
        @renderColumns()
