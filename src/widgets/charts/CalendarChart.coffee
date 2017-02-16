_ = require 'lodash'
React = require 'react'
H = React.DOM
moment = require 'moment'

injectTableAlias = require('mwater-expressions').injectTableAlias
Chart = require './Chart'
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './../../axes/AxisBuilder'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  dateAxis: date axis to use
  valueAxis: axis for value
  filter: optional logical expression to filter by

###
module.exports = class CalendarChart extends Chart
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Fill in defaults
    design.version = design.version or 1

    # Clean axes
    design.dateAxis = axisBuilder.cleanAxis(axis: design.dateAxis, table: design.table, aggrNeed: "none", types: ["date"])
    design.valueAxis = axisBuilder.cleanAxis(axis: design.valueAxis, table: design.table, aggrNeed: "required", types: ["number"])

    # Clean filter
    design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ["boolean"] })

    return design

  validateDesign: (design, schema) ->
    axisBuilder = new AxisBuilder(schema: schema)

    # Check that has table
    if not design.table
      return "Missing data source"

    # Check that has axes
    error = null

    if not design.dateAxis
      error = error or "Missing date"
    if not design.valueAxis
      error = error or "Missing value"

    error = error or axisBuilder.validateAxis(axis: design.dateAxis)
    error = error or axisBuilder.validateAxis(axis: design.valueAxis)

    return error

  isEmpty: (design) ->
    return not design.dateAxis or not design.valueAxis

  # Creates a design element with specified options
  # options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design 
  #   onDesignChange: function
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    CalendarChartDesignerComponent = require './CalendarChartDesignerComponent'

    props = {
      schema: options.schema
      design: @cleanDesign(options.design, options.schema)
      dataSource: options.dataSource
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design, options.schema)
        options.onDesignChange(design)
    }
    return React.createElement(CalendarChartDesignerComponent, props)

  # Get data for the chart asynchronously 
  # design: design of the chart
  # schema: schema to use
  # dataSource: data source to get data from
  # filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  # callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    exprCompiler = new ExprCompiler(schema)
    axisBuilder = new AxisBuilder(schema: schema)

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
    dateExpr = axisBuilder.compileAxis(axis: design.dateAxis, tableAlias: "main")

    query.selects.push({ 
      type: "select"
      expr: dateExpr
      alias: "date" 
    })

    # Add value axis
    query.selects.push({
      type: "select"      
      expr: axisBuilder.compileAxis(axis: design.valueAxis, tableAlias: "main")
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

    dataSource.performQuery(query, callback)

  # Create a view element for the chart
  # Options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design of the chart
  #   data: results from queries
  #   width, height, standardWidth: size of the chart view
  #   scope: current scope of the view element
  #   onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    # Require here to prevent server require problems
    CalendarChartViewComponent = require './CalendarChartViewComponent'
    
    # Create chart
    props = {
      schema: options.schema
      design: @cleanDesign(options.design, options.schema)
      data: options.data

      width: options.width
      height: options.height
      standardWidth: options.standardWidth

      scope: options.scope
      onScopeChange: options.onScopeChange
      cellStrokeColor: "#DDD"
    }

    return React.createElement(CalendarChartViewComponent, props)

  createDataTable: (design, schema, data) ->
    header = ["Date", "Value"]
    rows = _.map(data, (row) -> [moment(row.date).format("YYYY-MM-DD"), row.value])
    return [header].concat(rows)

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return _.compact([design.table])
    