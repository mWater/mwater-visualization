_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
moment = require 'moment'

ExprCompiler = require("mwater-expressions").ExprCompiler
ExprUtils = require("mwater-expressions").ExprUtils

{Table, Column, Cell} = require('fixed-data-table')

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

  @defaultProps:
    pageSize: 100

  constructor: (props) ->
    super
    @state = {
      rows: []
      entirelyLoaded: false
    }

  componentWillReceiveProps: (nextProps) ->
    # If design changed, delete all rows
    # TODO won't this reload on column resize?
    if not _.isEqual(nextProps.design, @props.design)
      @setState(rows: [], entirelyLoaded: false)

  # Create the select for a column in JsonQL format
  createColumnSelect: (column, columnIndex) ->
    # Get expression type
    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(column.expr)
    
    # Compile expression
    exprCompiler = new ExprCompiler(@props.schema)
    compiledExpr = exprCompiler.compileExpr(expr: column.expr, tableAlias: "main")

    # Handle special case of geometry, converting to GeoJSON
    if exprType == "geometry"
      # Convert to 4326 (lat/long)
      compiledExpr = { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [compiledExpr, 4326] }] }

    return { type: "select", expr: compiledExpr, alias: "c#{columnIndex}" }

  # Create selects to load given a design
  createLoadSelects: (design) ->
    return _.map(design.columns, (column, columnIndex) => @createColumnSelect(column, columnIndex))

  # Load more rows starting at a particular offset and with a specific design. Call callback with new rows
  performLoad: (loadState, callback) =>
    # Create query to get the page of rows at the specific offset
    design = loadState.design
    exprCompiler = new ExprCompiler(@props.schema)

    query = {
      type: "query"
      selects: @createLoadSelects(design)
      from: { type: "table", table: design.table, alias: "main" }
      offset: loadState.offset
      limit: loadState.pageSize
    }

    # Filter by filter
    if design.filter
      query.where = exprCompiler.compileExpr(expr: design.filter, tableAlias: "main")

    # Order by primary key to make unambiguous
    query.orderBy = [{ expr: { type: "field", tableAlias: "main", column: @props.schema.getTable(design.table).primaryKey }, direction: "asc" }]

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

  renderImage: (id) ->
    url = @props.dataSource.getImageUrl(id)
    return H.a(href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 }, "Image")

  renderCell: (column, columnIndex, exprType, cellProps) =>
    # If rendering placeholder row
    if cellProps.rowIndex >= @state.rows.length
      @loadMoreRows()
      return R Cell, cellProps,
        H.i className: "fa fa-spinner fa-spin"

    # Get value (columns are c0, c1, c2, etc.)
    value = @state.rows[cellProps.rowIndex]["c#{columnIndex}"]

    exprUtils = new ExprUtils(@props.schema)

    if not value?
      node = null
    else
      # Parse if should be JSON
      if exprType in ['image', 'imagelist', 'geometry', 'text[]'] and _.isString(value)
        value = JSON.parse(value)

      # Convert to node based on type
      switch exprType
        when "text", "number"
          node = value
        when "boolean", "enum", "enumset", "text[]"
          node = exprUtils.stringifyExprLiteral(column.expr, value)
        when "date"
          node = moment(value, "YYYY-MM-DD").format("ll")
        when "datetime"
          node = moment(value, moment.ISO_8601).format("lll")
        when "image"
          node = @renderImage(value.id)
        when "imagelist"
          node = _.map(value, (v) => @renderImage(v.id))
        when "geometry"
          node = "#{value.coordinates[1].toFixed(6)} #{value.coordinates[0].toFixed(6)}" 
        else
          node = "" + value

    return R Cell, { width: cellProps.width, height: cellProps.height, style: { whiteSpace: "nowrap" } }, 
      node

  # Render a single column
  renderColumn: (column, columnIndex) ->
    exprUtils = new ExprUtils(@props.schema)

    # Get expression type
    exprType = exprUtils.getExprType(column.expr)

    R Column,
      key: column.id
      header: R Cell, style: { whiteSpace: "nowrap" }, column.label or exprUtils.summarizeExpr(column.expr)
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

