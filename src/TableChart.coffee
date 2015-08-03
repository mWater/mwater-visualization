_ = require 'lodash'
React = require 'react'

Chart = require './Chart'
ExpressionBuilder = require './ExpressionBuilder'
ExpressionCompiler = require './ExpressionCompiler'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  columns: array of layers
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
    # compiler = new LayeredChartCompiler(schema: @schema)

    # # Clone deep for now # TODO
    # design = _.cloneDeep(design)

    # # Clean each column
    # for layerId in [0...design.layers.length]
    #   layer = design.layers[layerId]

    #   layer.xExpr = @exprBuilder.cleanExpr(layer.xExpr, layer.table)
    #   layer.yExpr = @exprBuilder.cleanExpr(layer.yExpr, layer.table)
    #   layer.colorExpr = @exprBuilder.cleanExpr(layer.colorExpr, layer.table)

    #   # Remove x axis if not required
    #   if not compiler.canLayerUseXExpr(design, layerId) and layer.xExpr
    #     delete layer.xExpr

    #   # Default y aggr
    #   if compiler.doesLayerNeedGrouping(design, layerId) and layer.yExpr
    #     # Remove latest, as it is tricky to group by. TODO
    #     aggrs = @exprBuilder.getAggrs(layer.yExpr)
    #     aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")

    #     if layer.yAggr and layer.yAggr not in _.pluck(aggrs, "id")
    #       delete layer.yAggr

    #     if not layer.yAggr
    #       layer.yAggr = aggrs[0].id
    #   else
    #     delete layer.yAggr

    #   layer.filter = @exprBuilder.cleanExpr(layer.filter, layer.table)

    return design

  validateDesign: (design) ->
    # # Check that all have same xExpr type
    # xExprTypes = _.uniq(_.map(design.layers, (l) => @exprBuilder.getExprType(l.xExpr)))

    # if xExprTypes.length > 1
    #   return "All x axes must be of same type"

    # for layer in design.layers
    #   # Check that has table
    #   if not layer.table
    #     return "Missing data source"

    #   # Check that has y
    #   if not layer.yExpr
    #     return "Missing Axis"

    #   error = null
    #   error = error or @exprBuilder.validateExpr(layer.xExpr)
    #   error = error or @exprBuilder.validateExpr(layer.yExpr)
    #   error = error or @exprBuilder.validateExpr(layer.colorExpr)
    #   error = error or @exprBuilder.validateExpr(layer.filter)

    # return error

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    # props = {
    #   schema: @schema
    #   design: @cleanDesign(options.design)
    #   onDesignChange: (design) =>
    #     # Clean design
    #     design = @cleanDesign(design)
    #     options.onDesignChange(design)
    # }
    # return React.createElement(LayeredChartDesignerComponent, props)

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
    # # Create chart
    # props = {
    #   schema: @schema
    #   design: @cleanDesign(options.design)
    #   data: options.data

    #   width: options.width
    #   height: options.height

    #   scope: options.scope
    #   onScopeChange: options.onScopeChange
    # }

    # return React.createElement(LayeredChartViewComponent, props)

  compileExpr: (expr) =>
    exprCompiler = new ExpressionCompiler(@schema)
    return exprCompiler.compileExpr(expr: expr, tableAlias: "main")
