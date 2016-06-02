_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
moment = require 'moment'

{Table, Column, Cell} = require('fixed-data-table')

DatagridQueryBuilder = require './DatagridQueryBuilder'
ExprUtils = require("mwater-expressions").ExprUtils
ExprCellComponent = require './ExprCellComponent'
EditExprCellComponent = require './EditExprCellComponent'

# Datagrid table itself without decorations such as edit button etc.
# See README.md for description of datagrid format
module.exports = class DatagridComponent extends React.Component
  @propTypes:
    width: React.PropTypes.number.isRequired      # Width of control
    height: React.PropTypes.number.isRequired     # Height of control
    pageSize: React.PropTypes.number
    schema: React.PropTypes.object.isRequired     # schema to use
    dataSource: React.PropTypes.object.isRequired # dataSource to use
    design: React.PropTypes.object.isRequired     # Design of datagrid. See README.md of this folder
    onDesignChange: React.PropTypes.func.isRequired # Called when design changes

    # Check if cell is editable
    # If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditCell: React.PropTypes.func             

    # Update cell value
    # Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateCell:  React.PropTypes.func

  @defaultProps:
    pageSize: 100

  constructor: (props) ->
    super
    @state = {
      rows: []
      entirelyLoaded: false
      editingCell: null     # set to { rowIndex: 0, 1, 2, columnIndex: 0, 1, 2... } if editing a cell 
      savingCell: false     # True when saving a cell's contents
    }

  componentWillReceiveProps: (nextProps) ->
    # If design changed, delete all rows
    # TODO won't this reload on column resize?
    if not _.isEqual(nextProps.design, @props.design)
      @setState(rows: [], entirelyLoaded: false)

  # Load more rows starting at a particular offset and with a specific design. Call callback with new rows
  performLoad: (loadState, callback) =>
    # Create query to get the page of rows at the specific offset
    query = new DatagridQueryBuilder(@props.schema).createQuery(loadState.design, { offset: loadState.offset, limit: loadState.pageSize })

    @props.dataSource.performQuery(query, (error, rows) =>
      if error
        # TODO what to do?
        throw error

      callback(rows)      
      )

  # Loads more rows because the placeholder last row has been rendered
  loadMoreRows: ->
    # Get the current load state (the values that determine what to load and if the loaded results can still be used or are stale)
    loadState = {
      design: @props.design
      offset: @state.rows.length
      pageSize: @props.pageSize
    }

    # If already loading what we want, return
    if _.isEqual(loadState, @loadState)
      return

    # Record what we're loading
    @loadState = loadState

    # Perform the actual load
    @performLoad(loadState, (newRows) =>
      # Check that the required load state has not changed
      if _.isEqual(loadState, @loadState)
        # Load is complete
        @loadState = null

        # Add rows, setting entirelyLoaded based on whether fewer than requested were returned
        rows = @state.rows.concat(newRows)
        @setState(rows: rows, entirelyLoaded: newRows.length < @props.pageSize)
      )

  # Reload a single row
  reloadRow: (rowIndex, callback) ->
    # Create query to get a single row
    query = new DatagridQueryBuilder(@props.schema).createQuery(@props.design, { offset: rowIndex, limit: 1 })

    @props.dataSource.performQuery(query, (error, rows) =>
      if error
        # TODO what to do?
        throw error

      if not rows[0]
        # TODO what to do?
        throw new Error("Missing row")

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
    if not @editCellComp.hasChanged()
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

  # Render a single cell. exprType is passed in for performance purposes and is calculated once per column
  renderCell: (column, columnIndex, exprType, cellProps) =>
    # If rendering placeholder row
    if cellProps.rowIndex >= @state.rows.length
      @loadMoreRows()
      return R Cell, cellProps,
        H.i className: "fa fa-spinner fa-spin"

    # Get value (columns are c0, c1, c2, etc.)
    value = @state.rows[cellProps.rowIndex]["c#{columnIndex}"]

    # Render special if editing
    if @state.editingCell?.rowIndex == cellProps.rowIndex and @state.editingCell?.columnIndex == columnIndex
      # Special if saving
      if @state.savingCell
        return R Cell, cellProps,
          H.i className: "fa fa-spinner fa-spin"

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
      isResizable: true

  # Render all columns
  renderColumns: ->
    _.map(@props.design.columns, (column, columnIndex) => @renderColumn(column, columnIndex))    

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
      isColumnResizing: false
      onColumnResizeEndCallback: @handleColumnResize,
        @renderColumns()

