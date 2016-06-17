_ = require 'lodash'
React = require 'react'
H = React.DOM

injectTableAlias = require('mwater-expressions').injectTableAlias
Chart = require './Chart'
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './../../axes/AxisBuilder'
ImageMosaicChartDesignerComponent = require './ImageMosaicChartDesignerComponent'
ImageMosaicChartViewComponent = require './ImageMosaicChartViewComponent'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  imageAxis: image axis to use
  filter: optional logical expression to filter by

###
module.exports = class ImageMosaicChart extends Chart
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Fill in defaults
    design.version = design.version or 1

    # Clean axis
    design.imageAxis = axisBuilder.cleanAxis(axis: design.imageAxis, table: design.table, aggrNeed: "none", types: ["image", "imagelist"])

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

    if not design.imageAxis
      error = error or "Missing image"

    error = error or axisBuilder.validateAxis(axis: design.imageAxis)

    return error

  isEmpty: (design) ->
    return not design.imageAxis

  # Creates a design element with specified options
  # options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design 
  #   onDesignChange: function
  createDesignerElement: (options) ->
    props = {
      schema: options.schema
      design: @cleanDesign(options.design, options.schema)
      dataSource: options.dataSource
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design, options.schema)
        options.onDesignChange(design)
    }
    return React.createElement(ImageMosaicChartDesignerComponent, props)

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
      limit: 500
    }

    # Add image axis
    imageExpr = axisBuilder.compileAxis(axis: design.imageAxis, tableAlias: "main")

    query.selects.push({ 
      type: "select"
      expr: imageExpr
      alias: "image" 
    })

    # Get relevant filters
    filters = _.where(filters or [], table: design.table)
    whereClauses = _.map(filters, (f) -> injectTableAlias(f.jsonql, "main")) 

    # Compile filter
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    # Add null filter for image
    whereClauses.push({ type: "op", op: "is not null", exprs: [imageExpr] })

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
    # Create chart
    props = {
      schema: options.schema
      design: @cleanDesign(options.design, options.schema)
      data: options.data
      dataSource: options.dataSource

      width: options.width
      height: options.height
      standardWidth: options.standardWidth

      scope: options.scope
      onScopeChange: options.onScopeChange
    }

    return React.createElement(ImageMosaicChartViewComponent, props)

  createDataTable: (design, data) ->
    alert("Not available for Image Mosaics")
    return null
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

