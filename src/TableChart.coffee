_ = require 'lodash'
React = require 'react'
H = React.DOM

Chart = require './Chart'
ExpressionBuilder = require './ExpressionBuilder'
ExpressionCompiler = require './ExpressionCompiler'
EditableLinkComponent = require './EditableLinkComponent'
PopoverComponent = require './PopoverComponent'
ScalarExprComponent = require './ScalarExprComponent'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by

column:
  headerText: heaer text
  expr: expression for column value
  aggr: aggregation function if needed

###
module.exports = class TableChart extends Chart
  # Options include
  #  schema: schema to use
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)

  cleanDesign: (design) ->
    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Always have at least one column
    design.columns = design.columns or []
    if design.columns.length == 0
      design.columns.push({})

    # Clean each column
    for columnId in [0...design.columns.length]
      column = design.columns[columnId]

      # Clean expression
      column.expr = @exprBuilder.cleanExpr(column.expr, design.table)

      # Remove invalid aggr
      if column.expr
        aggrs = @exprBuilder.getAggrs(column.expr)
        if column.aggr and column.aggr not in _.pluck(aggrs, "id")
          delete column.aggr


    if design.filter
      design.filter = @exprBuilder.cleanExpr(design.filter, design.table)
    return design

  validateDesign: (design) ->
    # Check that has table
    if not design.table
      return "Missing data source"

    error = null

    for column in design.columns
      # Check that has expr
      if not column.expr
        error = error or "Missing expression"

      error = error or @exprBuilder.validateExpr(column.xExpr)

    error = error or @exprBuilder.validateExpr(design.filter)

    return error

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    props = {
      schema: @schema
      design: @cleanDesign(options.design)
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design)
        options.onDesignChange(design)
    }
    return React.createElement(TableChartDesignerComponent, props)

  createQueries: (design, filters) ->
    # Determine if any aggregation
    hasAggr = _.any(design.columns, (c) -> c.aggr)

    # Create shell of query
    query = {
      type: "query"
      selects: []
      from: { type: "table", table: design.table, alias: "main" }
      groupBy: []
      orderBy: []
      limit: 1000
    }

    # For each column
    for colNum in [0...design.columns.length]
      column = design.columns[colNum]

      if column.aggr
        query.selects.push({ 
          type: "select"
          expr: { type: "op", op: column.aggr, exprs: [@compileExpr(column.expr)] }
          alias: "c#{colNum}" 
        })
      else
        query.selects.push({ 
          type: "select"
          expr: @compileExpr(column.expr)
          alias: "c#{colNum}"
        })

      # Add group by
      if not column.aggr and hasAggr
        query.groupBy.push(colNum + 1)

    # Get relevant filters
    filters = _.where(filters or [], table: design.table)
    if design.filter
      filters.push(design.filter)

    # Compile all filters
    filters = _.map(filters, @compileExpr)      

    # Wrap if multiple
    if filters.length > 1
      query.where = { type: "op", op: "and", exprs: filters }
    else
      query.where = filters[0]

    return { main: query }

  # Options include 
  # design: design of the chart
  # data: results from queries
  # width, height: size of the chart view
  # scope: current scope of the view element
  # onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    # Create chart
    props = {
      schema: @schema
      design: @cleanDesign(options.design)
      data: options.data

      width: options.width
      height: options.height

      scope: options.scope
      onScopeChange: options.onScopeChange
    }

    return React.createElement(TableChartViewComponent, props)

  compileExpr: (expr) =>
    exprCompiler = new ExpressionCompiler(@schema)
    return exprCompiler.compileExpr(expr: expr, tableAlias: "main")


class TableChartViewComponent extends React.Component
  render: ->
    return H.div null, "TABLE HERE"

class TableChartDesignerComponent extends React.Component
  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTitleTextChange: (ev) =>  @updateDesign(titleText: ev.target.value)
  handleTableChange: (table) => @updateDesign(table: table)

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
    columns.push({})
    @updateDesign(columns: columns)

  renderTable: ->
    if not @props.design.table
      popover = "Start by selecting a data source"

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-file")
        " "
        "Data Source"
      ": "
      React.createElement PopoverComponent, html: popover, 
        React.createElement(EditableLinkComponent, 
          dropdownItems: @props.schema.getTables()
          onDropdownItemClicked: @handleTableChange
          onRemove: if @props.design.table then @handleTableChange.bind(this, null)
          if @props.design.table then @props.schema.getTable(@props.design.table).name else H.i(null, "Select...")
          )

  renderTitle: ->
    H.div className: "form-group",
      H.label className: "text-muted", "Title"
      H.input type: "text", className: "form-control input-sm", value: @props.design.titleText, onChange: @handleTitleTextChange, placeholder: "Untitled"

  renderColumn: (index) ->
    style = {
      borderTop: "solid 1px #EEE"
      paddingTop: 10
      paddingBottom: 10
    }

    H.div style: style, 
      React.createElement(TableChartColumnDesignerComponent, {
        design: @props.design
        schema: @props.schema
        index: index
        onChange: @handleColumnChange.bind(null, index)
        onRemove: @handleRemoveColumn.bind(null, index)
        })

  renderColumns: ->
    if not @props.design.table
      return

    return H.div className: "form-group",
      _.map(@props.design.columns, (column, i) => @renderColumn(i))
      H.button className: "btn btn-default btn-sm", type: "button", onClick: @handleAddColumn,
        H.span className: "glyphicon glyphicon-plus"
        " Add Column"

  render: ->
    H.div null,
      @renderTable()
      @renderColumns()
      H.hr()
      @renderTitle()

class TableChartColumnDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    index: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired

  # Updates column with the specified changes
  updateColumn: (changes) ->
    column = _.extend({}, @props.design.columns[@props.index], changes)
    @props.onChange(column)

  handleExprChange: (expr) => @updateColumn(expr: expr)
  handleHeaderTextChange: (ev) => @updateColumn(headerText: ev.target.value)
  handleAggrChange: (aggr) => @updateColumn(aggr: aggr)

  renderRemove: ->
    if @props.design.columns.length > 1
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderExpr: ->
    column = @props.design.columns[@props.index]

    title = "Value"

    H.div className: "form-group",
      H.label className: "text-muted", title
      ": "
      React.createElement(ScalarExprComponent, 
        editorTitle: title
        schema: @props.schema 
        table: @props.design.table
        value: column.expr
        onChange: @handleExprChange)

  renderHeader: ->
    column = @props.design.columns[@props.index]

    exprBuilder = new ExpressionBuilder(@props.schema)
    placeholder = exprBuilder.summarizeExpr(column.expr)

    H.div className: "form-group",
      H.label className: "text-muted", "Header"
      ": "
      H.input 
        type: "text"
        className: "form-control input-sm"
        style: { display: "inline-block", width: "15em" }
        value: column.headerText
        onChange: @handleHeaderTextChange
        placeholder: placeholder

  renderAggr: ->
    column = @props.design.columns[@props.index]
    exprBuilder = new ExpressionBuilder(@props.schema)

    if not column.expr
      return

    # Get aggregations
    aggrs = exprBuilder.getAggrs(column.expr)

    # Remove latest, as it is tricky to group by. TODO
    aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")
    aggrs = [{ id: null, name: "None" }].concat(aggrs)
    currentAggr = _.findWhere(aggrs, id: column.aggr)

    return H.div className: "form-group",
      H.label className: "text-muted", "Summarize"
      ": "
      React.createElement(EditableLinkComponent, 
        dropdownItems: aggrs
        onDropdownItemClicked: @handleAggrChange
        if currentAggr then currentAggr.name else "None"
      )

  render: ->
    H.div null, 
      @renderRemove()
      H.label null, "Column #{@props.index+1}"
      H.div style: { marginLeft: 5 }, 
        @renderExpr()
        @renderHeader()
        @renderAggr()
