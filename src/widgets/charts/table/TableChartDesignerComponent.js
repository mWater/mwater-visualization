PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
uuid = require 'uuid'

ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
LinkComponent = require('mwater-expressions-ui').LinkComponent
ExprComponent = require("mwater-expressions-ui").ExprComponent
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
OrderingsComponent = require './OrderingsComponent'
TableSelectComponent = require '../../../TableSelectComponent'
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")
ui = require('react-library/lib/bootstrap')
getFormatOptions = require('../../../valueFormatter').getFormatOptions
getDefaultFormat = require('../../../valueFormatter').getDefaultFormat

module.exports = class TableChartDesignerComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTitleTextChange: (ev) =>  @updateDesign(titleText: ev.target.value)
  handleTableChange: (table) => @updateDesign(table: table)
  handleFilterChange: (filter) => @updateDesign(filter: filter)
  handleOrderingsChange: (orderings) => @updateDesign(orderings: orderings)
  handleLimitChange: (limit) => @updateDesign(limit: limit)

  handleColumnChange: (index, column) =>
    columns = @props.design.columns.slice()
    columns[index] = column
    @updateDesign(columns: columns)

  handleRemoveColumn: (index) =>
    columns = @props.design.columns.slice()
    columns.splice(index, 1)
    @updateDesign(columns: columns)

  handleAddColumn: =>
    columns = @props.design.columns.slice()
    columns.push({id: uuid()})
    @updateDesign(columns: columns)

  renderTable: ->
    return R 'div', className: "form-group",
      R 'label', className: "text-muted",
        R('i', className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R TableSelectComponent, { 
        schema: @props.schema
        value: @props.design.table
        onChange: @handleTableChange 
        filter: @props.design.filter
        onFilterChange: @handleFilterChange
      }

  renderTitle: ->
    R 'div', className: "form-group",
      R 'label', className: "text-muted", "Title"
      R 'input', type: "text", className: "form-control input-sm", value: @props.design.titleText, onChange: @handleTitleTextChange, placeholder: "Untitled"

  renderColumn: (column, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    style = {
      borderTop: "solid 1px #EEE"
      paddingTop: 10
      paddingBottom: 10
    }

    connectDragPreview(connectDropTarget(R 'div', key: index, style: style,
      React.createElement(TableChartColumnDesignerComponent, {
        design: @props.design
        schema: @props.schema
        dataSource: @props.dataSource
        index: index
        onChange: @handleColumnChange.bind(null, index)
        onRemove: @handleRemoveColumn.bind(null, index)
        connectDragSource: connectDragSource
        })))

  handleReorder: (map) =>
    @updateDesign(columns: map)

  renderColumns: ->
    if not @props.design.table
      return

    R 'div', null,
      R ReorderableListComponent,
        items: @props.design.columns
        onReorder: @handleReorder
        renderItem: @renderColumn
        getItemId: (item) => item.id
      R 'button', className: "btn btn-default btn-sm", type: "button", onClick: @handleAddColumn,
        R 'span', className: "glyphicon glyphicon-plus"
        " Add Column"
    # return R 'div', className: "form-group",
    #   _.map(@props.design.columns, (column, i) => @renderColumn(i))
    #

  renderOrderings: ->
    # If no table, hide
    if not @props.design.table
      return null

    return R 'div', className: "form-group",
      R 'label', className: "text-muted",
        R('span', className: "glyphicon glyphicon-sort-by-attributes")
        " "
        "Ordering"
      R 'div', style: { marginLeft: 8 },
        React.createElement(OrderingsComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          orderings: @props.design.orderings
          onOrderingsChange: @handleOrderingsChange
          table: @props.design.table)

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return R 'div', className: "form-group",
      R 'label', className: "text-muted",
        R('span', className: "glyphicon glyphicon-filter")
        " "
        "Filters"
      R 'div', style: { marginLeft: 8 },
        React.createElement(FilterExprComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  renderLimit: ->
    # If no table, hide
    if not @props.design.table
      return null

    return R 'div', className: "form-group",
      R 'label', className: "text-muted",
        "Maximum Number of Rows (up to 1000)"
      R 'div', style: { marginLeft: 8 },
        R ui.NumberInput,
          value: @props.design.limit
          onChange: @handleLimitChange
          decimal: false
          placeholder: "1000"

  render: ->
    R 'div', null,
      @renderTable()
      @renderColumns()
      if @props.design.table then R('hr')
      @renderOrderings()
      @renderFilter()
      @renderLimit()
      R('hr')
      @renderTitle()

class TableChartColumnDesignerComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    index: PropTypes.number.isRequired
    onChange: PropTypes.func.isRequired
    onRemove: PropTypes.func.isRequired

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  # Updates column with the specified changes
  updateColumn: (changes) ->
    column = _.extend({}, @props.design.columns[@props.index], changes)
    @props.onChange(column)

  updateTextAxis: (changes) ->
    textAxis = _.extend({}, @props.design.columns[@props.index].textAxis, changes)
    @updateColumn(textAxis: textAxis)

  handleExprChange: (expr) => @updateTextAxis(expr: expr)
  handleHeaderTextChange: (ev) => @updateColumn(headerText: ev.target.value)
  handleAggrChange: (aggr) => @updateTextAxis(aggr: aggr)

  handleFormatChange: (ev) => @updateColumn(format: ev.target.value)

  renderRemove: ->
    if @props.design.columns.length > 1
      R 'button', className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        R 'span', className: "glyphicon glyphicon-remove"

  renderExpr: ->
    column = @props.design.columns[@props.index]

    title = "Value"

    R 'div', null,
      R 'label', className: "text-muted", title
      ": "
      React.createElement(ExprComponent,
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.design.table
        value: if column.textAxis then column.textAxis.expr
        onChange: @handleExprChange
        aggrStatuses: ["literal", "individual", "aggregate"]
      )

  renderFormat: ->
    column = @props.design.columns[@props.index]

    # Get type
    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(column.textAxis?.expr)

    formats = getFormatOptions(exprType)
    if not formats
      return null
   
    R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        "Format"
      ": "
      R 'select', value: (if column.format? then column.format else getDefaultFormat(exprType)), className: "form-control", style: { width: "auto", display: "inline-block" }, onChange: @handleFormatChange,
        _.map(formats, (format) -> R('option', key: format.value, value: format.value, format.label))

  renderHeader: ->
    column = @props.design.columns[@props.index]

    axisBuilder = new AxisBuilder(schema: @props.schema)
    placeholder = axisBuilder.summarizeAxis(column.textAxis, @context.locale)

    R 'div', null,
      R 'label', className: "text-muted", "Header"
      ": "
      R 'input',
        type: "text"
        className: "form-control input-sm"
        style: { display: "inline-block", width: "15em" }
        value: column.headerText
        onChange: @handleHeaderTextChange
        placeholder: placeholder

  render: ->
    iconStyle =
      cursor: "move"
      marginRight: 8
      opacity: 0.5
      fontSize: 12
      height: 20
    R 'div', null,
      @props.connectDragSource(R('i', className: "fa fa-bars", style: iconStyle))
      @renderRemove()
      R 'label', null, "Column #{@props.index+1}"
      R 'div', style: { marginLeft: 5 },
        @renderExpr()
        @renderFormat()
        @renderHeader()
