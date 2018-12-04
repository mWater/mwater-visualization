PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
TabbedComponent = require 'react-library/lib/TabbedComponent'
ExprComponent = require('mwater-expressions-ui').ExprComponent
FilterExprComponent = require('mwater-expressions-ui').FilterExprComponent
OrderBysDesignerComponent = require './OrderBysDesignerComponent'
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")
QuickfiltersDesignComponent = require '../quickfilter/QuickfiltersDesignComponent'
LabeledExprGenerator = require './LabeledExprGenerator'

TableSelectComponent = require('../TableSelectComponent')

uuid = require 'uuid'
update = require 'update-object'
ui = require 'react-library/lib/bootstrap'

# Designer for the datagrid. Currenly allows only single-table designs (no subtable rows)
module.exports = class DatagridDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired     # schema to use
    dataSource: PropTypes.object.isRequired # dataSource to use
    design: PropTypes.object.isRequired     # Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func.isRequired # Called when design changes

  @contextTypes:
    globalFiltersElementFactory: PropTypes.func # Call with props { schema, dataSource, globalFilters, filterableTables, onChange, nullIfIrrelevant }. Displays a component to edit global filters

  handleTableChange: (table) =>
    design = {
      table: table
      columns: []
    }

    @props.onDesignChange(design)

  handleColumnsChange: (columns) =>
    @props.onDesignChange(update(@props.design, columns: { $set: columns }))

  handleFilterChange: (filter) =>
    @props.onDesignChange(update(@props.design, filter: { $set: filter }))

  handleGlobalFiltersChange: (globalFilters) =>
    @props.onDesignChange(update(@props.design, globalFilters: { $set: globalFilters }))

  handleOrderBysChange: (orderBys) =>
    @props.onDesignChange(update(@props.design, orderBys: { $set: orderBys }))

  # Render the tabs of the designer
  renderTabs: ->
    R TabbedComponent,
      initialTabId: "columns"
      tabs: [
        {
          id: "columns"
          label: "Columns"
          elem: R(ColumnsDesignerComponent, {
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.design.table
            columns: @props.design.columns
            onColumnsChange: @handleColumnsChange
          })
        }
        {
          id: "filter"
          label: "Filter"
          # Here because of modal scroll issue
          elem: R 'div', style: { marginBottom: 200 },
            R(FilterExprComponent, {
              schema: @props.schema
              dataSource: @props.dataSource
              table: @props.design.table
              value: @props.design.filter
              onChange: @handleFilterChange
            })
            if @context.globalFiltersElementFactory
              R 'div', style: { marginTop: 20 },
                @context.globalFiltersElementFactory({
                  schema: @props.schema
                  dataSource: @props.dataSource
                  filterableTables: [@props.design.table]
                  globalFilters: @props.design.globalFilters
                  onChange: @handleGlobalFiltersChange
                  nullIfIrrelevant: true
                })
        }
        {
          id: "order"
          label: "Sorting"
          elem: R 'div', style: { marginBottom: 200 },
            R(OrderBysDesignerComponent, {
              schema: @props.schema
              dataSource: @props.dataSource
              table: @props.design.table
              orderBys: @props.design.orderBys
              onChange: @handleOrderBysChange
            })
        }
        {
          id: "quickfilters"
          label: "Quickfilters"
          elem: R 'div', style: { marginBottom: 200 },
            R QuickfiltersDesignComponent, {
              design: @props.design.quickfilters
              onDesignChange: (design) => @props.onDesignChange(update(@props.design, { quickfilters: { $set: design } }))
              schema: @props.schema
              dataSource: @props.dataSource
              tables: [@props.design.table]
            }
        }
        {
          id: "options"
          label: "Options"
          elem: R 'div', style: { marginBottom: 200 },
            R DatagridOptionsComponent, {
              design: @props.design
              onDesignChange: @props.onDesignChange
            }
        }
      ]

  render: ->
    R 'div', null,
      R 'label', null, "Data Source:"
      R TableSelectComponent,
        schema: @props.schema
        value: @props.design.table
        onChange: @handleTableChange

      if @props.design.table
        @renderTabs()

# Datagrid Options
class DatagridOptionsComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired       # Datagrid design. See README.md
    onDesignChange: PropTypes.func.isRequired # Called when design changes
    
  render: ->
    R ui.FormGroup, label: "Display Options",
      R ui.Checkbox, 
        value: @props.design.showRowNumbers
        onChange: ((showRowNumbers) => @props.onDesignChange(update(@props.design, { showRowNumbers: { $set: showRowNumbers } }))),
          "Show row numbers"

# Columns list
class ColumnsDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired     # schema to use
    dataSource: PropTypes.object.isRequired # dataSource to use
    table: PropTypes.string.isRequired
    columns: PropTypes.array.isRequired     # Columns list See README.md of this folder
    onColumnsChange: PropTypes.func.isRequired # Called when columns changes

  handleColumnChange: (columnIndex, column) =>
    columns = @props.columns.slice()

    # Handle remove
    if not column
      columns.splice(columnIndex, 1)
    else if _.isArray(column)
      # Handle array case
      Array.prototype.splice.apply(columns, [columnIndex, 1].concat(column))
    else
      columns[columnIndex] = column

    @props.onColumnsChange(columns)

  handleAddColumn: =>
    columns = @props.columns.slice()
    columns.push({ id: uuid(), type: "expr", width: 150 })
    @props.onColumnsChange(columns)

  handleAddIdColumn: =>
    columns = @props.columns.slice()
    # TODO we should display label when available but without breaking Peter's id downloads. Need format field to indicate raw id.
    columns.push({ id: uuid(), type: "expr", width: 150, expr: { type: "id", table: @props.table }, label: "Unique Id" })
    @props.onColumnsChange(columns)

  handleAddDefaultColumns: =>
    # Create labeled expressions
    labeledExprs = new LabeledExprGenerator(@props.schema).generate(@props.table, {
      headerFormat: "text"
    })

    columns = []
    for labeledExpr in labeledExprs
      columns.push({
        id: uuid()
        width: 150
        type: "expr"
        label: null # Use default label instead. # labeledExpr.label
        expr: labeledExpr.expr
      })

    columns = @props.columns.concat(columns)
    @props.onColumnsChange(columns)

  handleRemoveAllColumns: =>
    @props.onColumnsChange([])

  renderColumn: (column, columnIndex, connectDragSource, connectDragPreview, connectDropTarget) =>
    R ColumnDesignerComponent,
      key: columnIndex
      schema: @props.schema
      table: @props.table
      dataSource: @props.dataSource
      column: column
      onColumnChange: @handleColumnChange.bind(null, columnIndex)
      connectDragSource: connectDragSource
      connectDragPreview: connectDragPreview
      connectDropTarget: connectDropTarget

  render: ->
    R 'div', style: { height: "auto",overflowY: "auto",  overflowX: "hidden" },
      R 'div', style: { textAlign: "right" }, key: "options",
        R 'button',
          key: "addAll"
          type: "button"
          className: "btn btn-link btn-xs"
          onClick: @handleAddDefaultColumns,
            R 'span', className: "glyphicon glyphicon-plus"
            " Add Default Columns"
        R 'button',
          key: "removeAll"
          type: "button"
          className: "btn btn-link btn-xs"
          onClick: @handleRemoveAllColumns,
            R 'span', className: "glyphicon glyphicon-remove"
            " Remove All Columns"

      R ReorderableListComponent,
        items: @props.columns
        onReorder: @props.onColumnsChange
        renderItem: @renderColumn
        getItemId: (item) => item.id

      R 'button',
        key: "add"
        type: "button"
        className: "btn btn-link"
        onClick: @handleAddColumn,
          R 'span', className: "glyphicon glyphicon-plus"
          " Add Column"

      R 'button',
        key: "add-id"
        type: "button"
        className: "btn btn-link"
        onClick: @handleAddIdColumn,
          R 'span', className: "glyphicon glyphicon-plus"
          " Add Unique Id (advanced)"

# Column item
class ColumnDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired     # schema to use
    dataSource: PropTypes.object.isRequired # dataSource to use
    table: PropTypes.string.isRequired
    column: PropTypes.object.isRequired     # Column See README.md of this folder
    onColumnChange: PropTypes.func.isRequired # Called when column changes. Null to remove. Array to replace with multiple entries
    connectDragSource: PropTypes.func.isRequired # Connect drag source (handle) here       
    connectDragPreview: PropTypes.func.isRequired # Connect drag preview here
    connectDropTarget: PropTypes.func.isRequired # Connect drop target

  handleExprChange: (expr) =>
    @props.onColumnChange(update(@props.column, expr: { $set: expr }))

  handleLabelChange: (label) =>
    @props.onColumnChange(update(@props.column, label: { $set: label }))

  handleSplitEnumset: =>
    exprUtils = new ExprUtils(@props.schema)

    @props.onColumnChange(_.map(exprUtils.getExprEnumValues(@props.column.expr), (enumVal) =>
      {
        id: uuid()
        type: "expr"
        width: 150
        expr: {
          type: "op"
          op: "contains"
          table: @props.table
          exprs: [
            @props.column.expr
            { type: "literal", valueType: "enumset", value: [enumVal.id] }
          ]
        }
      }
    ))

  handleSplitGeometry: =>
    @props.onColumnChange([
      {
        id: uuid()
        type: "expr"
        width: 150
        expr: {
          type: "op"
          op: "latitude"
          table: @props.table
          exprs: [@props.column.expr]
        }
      }
      {
        id: uuid()
        type: "expr"
        width: 150
        expr: {
          type: "op"
          op: "longitude"
          table: @props.table
          exprs: [@props.column.expr]
        }
      }
    ])

  # Render options to split a column, such as an enumset to booleans or geometry to lat/lng
  renderSplit: ->
    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(@props.column.expr)

    switch exprType
      when "enumset"
        return R 'a', className: "btn btn-xs btn-link", onClick: @handleSplitEnumset,
          R 'i', className: "fa fa-chain-broken"
          " Split by options"
      when "geometry"
        return R 'a', className: "btn btn-xs btn-link", onClick: @handleSplitGeometry,
          R 'i', className: "fa fa-chain-broken"
          " Split by lat/lng"

    return null

  render: =>
    exprUtils = new ExprUtils(@props.schema)

    # Get type of current expression
    type = exprUtils.getExprType(@props.column.expr)

    # Determine allowed types
    allowedTypes = ['text', 'number', 'enum', 'enumset', 'boolean', 'date', 'datetime', 'image', 'imagelist', 'text[]', 'geometry']

    # If type id, allow id (e.g. don't allow to be added directly, but keep if present)
    if type == "id"
      allowedTypes.push("id")

    elem = R 'div', className: "row",
      R 'div', className: "col-xs-1",
        @props.connectDragSource(R('span', className: "text-muted fa fa-bars"))

      R 'div', className: "col-xs-5", # style: { border: "solid 1px #DDD", padding: 4 },
        R ExprComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          value: @props.column.expr
          aggrStatuses: ['literal', 'individual', 'aggregate']
          types: allowedTypes
          onChange: @handleExprChange
        @renderSplit()

      R 'div', className: "col-xs-5",
        R 'input',
          type: "text"
          className: "form-control"
          placeholder: exprUtils.summarizeExpr(@props.column.expr)
          value: @props.column.label
          onChange: (ev) => @handleLabelChange(ev.target.value)

      R 'div', className: "col-xs-1",
        R 'a', onClick: @props.onColumnChange.bind(null, null),
          R 'span', className: "glyphicon glyphicon-remove"

    return @props.connectDropTarget(@props.connectDragPreview(elem))