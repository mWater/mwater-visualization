_ = require 'lodash'
React = require 'react'
H = React.DOM

injectTableAlias = require('mwater-expressions').injectTableAlias
Chart = require './Chart'
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './../../axes/AxisBuilder'
CalendarChartDesignerComponent = require './CalendarChartDesignerComponent'
CalendarChartViewComponent = require './CalendarChartViewComponent'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  dateAxis: date axis to use
  valueAxis: axis for value
  filter: optional logical expression to filter by

###
module.exports = class CalendarChart extends Chart
  # Options include
  #  schema: schema to use
  #  dataSource: data source to use
  constructor: (options) ->
    @schema = options.schema
    @dataSource = options.dataSource
    @exprCleaner = new ExprCleaner(@schema)
    @axisBuilder = new AxisBuilder(schema: @schema)

  cleanDesign: (design) ->
    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Fill in defaults
    design.version = design.version or 1

    # Clean axes
    design.dateAxis = @axisBuilder.cleanAxis(axis: design.dateAxis, table: design.table, aggrNeed: "none", types: ["date"])
    design.valueAxis = @axisBuilder.cleanAxis(axis: design.dateAxis, table: design.table, aggrNeed: "required", types: ["number"])

    # Default value axis to count if date axis present
    if not design.valueAxis and design.dateAxis
      # Create count expr
      design.valueAxis = { expr: { type: "id", table: design.table }, aggr: "count", xform: null }

    # Clean filter
    design.filter = @exprCleaner.cleanExpr(design.filter, { table: design.table, types: ["boolean"] })

    return design

  validateDesign: (design) ->
    # Check that has table
    if not design.table
      return "Missing data source"

    # Check that has axes
    error = null

    if not design.dateAxis
      error = error or "Missing date"
    if not design.valueAxis
      error = error or "Missing value"

    error = error or @axisBuilder.validateAxis(axis: design.dateAxis)
    error = error or @axisBuilder.validateAxis(axis: design.valueAxis)

    return error

  isEmpty: (design) ->
    return not design.dateAxis or not design.valueAxis

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    props = {
      schema: @schema
      design: @cleanDesign(options.design)
      dataSource: @dataSource
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design)
        options.onDesignChange(design)
    }
    return React.createElement(CalendarChartDesignerComponent, props)

  getData: (design, filters, callback) ->
    exprCompiler = new ExprCompiler(@schema)

    # Create shell of query
    query = {
      type: "query"
      selects: []
      from: exprCompiler.compileTable(design.table, "main")
      groupBy: [1]
      orderBy: [{ ordinal: 1 }]
      limit: 5000
    }

    # Add date axis
    dateExpr = @axisBuilder.compileAxis(axis: design.dateAxis, tableAlias: "main")

    query.selects.push({ 
      type: "select"
      expr: dateExpr
      alias: "date" 
    })

    # Add value axis
    query.selects.push({
      type: "select"      
      expr: @axisBuilder.compileAxis(axis: design.valueAxis, tableAlias: "main")
      alias: "value"
    })

    # Get relevant filters
    filters = _.where(filters or [], table: design.table)
    whereClauses = _.map(filters, (f) -> injectTableAlias(f.jsonql, "main")) 

    # Compile filter
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Add null filter for date
    whereClauses.push({ type: "op", op: "is not null", exprs: [dateExpr] })

    whereClauses = _.compact(whereClauses)

    # Wrap if multiple
    if whereClauses.length > 1
      query.where = { type: "op", op: "and", exprs: whereClauses }
    else
      query.where = whereClauses[0]

    @dataSource.performQuery(query, callback)

  # Options include 
  # design: design of the chart
  # data: results from queries
  # width, height, standardWidth: size of the chart view
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
      standardWidth: options.standardWidth

      scope: options.scope
      onScopeChange: options.onScopeChange
    }

    return React.createElement(CalendarChartViewComponent, props)

  createDataTable: (design, data) ->
    super
    # TODO
    # renderHeaderCell = (column) =>
    #   column.headerText or @axisBuilder.summarizeAxis(column.textAxis)

    # header = _.map(design.columns, renderHeaderCell)
    # table = [header]
    # renderRow = (record) =>
    #   renderCell = (column, columnIndex) =>
    #     value = record["c#{columnIndex}"]
    #     return @axisBuilder.formatValue(column.textAxis, value)

    #   return _.map(design.columns, renderCell)

    # table = table.concat(_.map(data.main, renderRow))
    # return table

