_ = require 'lodash'
React = require 'react'
H = React.DOM

Chart = require './Chart'
LayeredChartCompiler = require './LayeredChartCompiler'
ExpressionBuilder = require './ExpressionBuilder'
LayeredChartDesignerComponent = require './LayeredChartDesignerComponent'
LayeredChartViewComponent = require './LayeredChartViewComponent'
LayeredChartSvgFileSaver = require './LayeredChartSvgFileSaver'
CsvFileSaver = require './CsvFileSaver'

###
Design is:
  
  type: bar/line/spline/scatter/area/pie/donut
  layers: array of layers
  titleText: title text
  xAxisLabelText: text of x axis label
  yAxisLabelText: text of y axis label
  transpose: true to flip axes

layer:
  name: label for layer (optional)
  xExpr: x-axis expression
  colorExpr: expression to split into series, each with a color
  yExpr: y-axis expression
  yAggr: aggregation function if needed for y
  stacked: true to stack
  type: bar/line/spline/scatter/area/pie/donut (overrides main one)
  filter: optional logical expression to filter by

###
module.exports = class LayeredChart extends Chart
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)

  cleanDesign: (design) ->
    compiler = new LayeredChartCompiler(schema: @schema)

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Fill in defaults
    design.type = design.type or "line"
    design.layers = design.layers or [{}]

    # Clean each layer
    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]

      layer.xExpr = @exprBuilder.cleanExpr(layer.xExpr, layer.table)
      layer.yExpr = @exprBuilder.cleanExpr(layer.yExpr, layer.table)
      layer.colorExpr = @exprBuilder.cleanExpr(layer.colorExpr, layer.table)

      # Remove x axis if not required
      if not compiler.canLayerUseXExpr(design, layerId) and layer.xExpr
        delete layer.xExpr

      # Default y aggr
      if compiler.doesLayerNeedGrouping(design, layerId) and layer.yExpr
        # Remove latest, as it is tricky to group by. TODO
        aggrs = @exprBuilder.getAggrs(layer.yExpr)
        aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")

        if layer.yAggr and layer.yAggr not in _.pluck(aggrs, "id")
          delete layer.yAggr

        if not layer.yAggr
          layer.yAggr = aggrs[0].id
      else
        delete layer.yAggr

      layer.filter = @exprBuilder.cleanExpr(layer.filter, layer.table)

    return design

  validateDesign: (design) ->
    # Check that all have same xExpr type
    xExprTypes = _.uniq(_.map(design.layers, (l) => @exprBuilder.getExprType(l.xExpr)))

    if xExprTypes.length > 1
      return "All x axes must be of same type"

    for layer in design.layers
      # Check that has table
      if not layer.table
        return "Missing data source"

      # Check that has y
      if not layer.yExpr
        return "Missing Axis"

      error = null
      error = error or @exprBuilder.validateExpr(layer.xExpr)
      error = error or @exprBuilder.validateExpr(layer.yExpr)
      error = error or @exprBuilder.validateExpr(layer.colorExpr)
      error = error or @exprBuilder.validateExpr(layer.filter)

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
    return React.createElement(LayeredChartDesignerComponent, props)

  createQueries: (design, filters) ->
    compiler = new LayeredChartCompiler(schema: @schema)
    return compiler.getQueries(design, filters)

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

    return React.createElement(LayeredChartViewComponent, props)

  createDropdownItems: (design, dataSource, filters) ->
    save = =>
      design = @cleanDesign(design)
      queries = @createQueries(design, filters)
      dataSource.performQueries(queries, (err, data) =>
        if err
          alert(err)# TODO
        else
          LayeredChartSvgFileSaver.save(design, data, @schema))
    saveAsCsv = =>
      design = @cleanDesign(design)
      queries = @createQueries(design, filters)
      dataSource.performQueries(queries, (err, data) =>
        if err
          alert(err)# TODO
        else
          table = CsvFileSaver.tableFromLayeredChart(data.layer0)          
          CsvFileSaver.saveTable(table, design.titleText))
    return [{ label: [H.span(className: "glyphicon glyphicon-camera"), " Save Image"], onClick: save }
            { label: [H.span(className: "glyphicon glyphicon-floppy-save"), " Save Data"], onClick: saveAsCsv }]
