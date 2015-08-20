_ = require 'lodash'
React = require 'react'
H = React.DOM

Chart = require './Chart'
LayeredChartCompiler = require './LayeredChartCompiler'
ExpressionBuilder = require './../../expressions/ExpressionBuilder'
AxisBuilder = require './../../expressions/axes/AxisBuilder'
LayeredChartDesignerComponent = require './LayeredChartDesignerComponent'
LayeredChartViewComponent = require './LayeredChartViewComponent'
LayeredChartSvgFileSaver = require './LayeredChartSvgFileSaver'

###
Design is:
  
  type: bar/line/spline/scatter/area/pie/donut
  layers: array of layers
  titleText: title text
  xAxisLabelText: text of x axis label
  yAxisLabelText: text of y axis label
  transpose: true to flip axes

layer:
  type: bar/line/spline/scatter/area/pie/donut (overrides main one)
  name: label for layer (optional)
  axes: axes (see below)
  stacked: true to stack
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800)

axes:
  x: x axis
  y: y axis
  color: color axis (to split into series based on a color)

axis: 
  expr: expression of axis
  aggr: aggregation for axis

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

      layer.axes = layer.axes or {}

      for axisKey, axis of layer.axes
        layer.axes[axisKey] = @cleanAxis(
          design, layer, axis, 
          axisKey == "y" and compiler.doesLayerNeedGrouping(design, layerId))

      # Remove x axis if not required
      if not compiler.canLayerUseXExpr(design, layerId) and layer.axes.x
        delete layer.axes.x

      layer.filter = @exprBuilder.cleanExpr(layer.filter, layer.table)

    return design

  # TODO move to AxisBuilder
  cleanAxis: (design, layer, axis, shouldAggr) ->
    if not axis
      return

    # TODO does in place
    axis.expr = @exprBuilder.cleanExpr(axis.expr, layer.table)

    # Default aggr if grouping
    if shouldAggr and axis
      # Remove latest, as it is tricky to group by. TODO
      aggrs = @exprBuilder.getAggrs(axis.expr)
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")

      # Remove existing
      if axis.aggr and axis.aggr not in _.pluck(aggrs, "id")
        delete axis.aggr

      if not axis.aggr
        axis.aggr = aggrs[0].id
    else
      delete axis.aggr

    return axis

  validateDesign: (design) ->
    # Check that layers have same x axis type
    xAxisTypes = _.uniq(_.map(design.layers, (l) => 
      axisBuilder = new AxisBuilder(schema: @schema)
      return axisBuilder.getAxisType(l.axes.x)))

    if xAxisTypes.length > 1
      return "All x axes must be of same type"

    for layer in design.layers
      axisBuilder = new AxisBuilder(schema: @schema)

      # Check that has table
      if not layer.table
        return "Missing data source"

      # Check that has y axis
      if not layer.axes.y
        return "Missing Axis"

      error = null

      # Validate axes
      error = error or axisBuilder.validateAxis(layer.axes.x)
      error = error or axisBuilder.validateAxis(layer.axes.y)
      error = error or axisBuilder.validateAxis(layer.axes.color)

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
    return compiler.createQueries(design, filters)

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
    # TODO validate design before allowing save
    save = =>
      design = @cleanDesign(design)
      queries = @createQueries(design, filters)
      dataSource.performQueries(queries, (err, data) =>
        if err
          alert("Unable to load data")
        else
          LayeredChartSvgFileSaver.save(design, data, @schema))

    return [{ label: "Save Image", icon: "camera", onClick: save }]

  createDataTable: (design, data) ->
    # Export only first layer
    headers = []
    if design.layers[0].xExpr
      headers.push(@exprBuilder.summarizeExpr(design.layers[0].xExpr))
    if design.layers[0].colorExpr
      headers.push(@exprBuilder.summarizeExpr(design.layers[0].colorExpr))
    if design.layers[0].yExpr
      headers.push(@exprBuilder.summarizeAggrExpr(design.layers[0].yExpr, design.layers[0].yAggr))
    table = [headers]

    for row in data.layer0
      r = []
      if design.layers[0].xExpr
        r.push(@exprBuilder.stringifyExprLiteral(design.layers[0].xExpr, row.x))
      if design.layers[0].colorExpr
        r.push(@exprBuilder.stringifyExprLiteral(design.layers[0].colorExpr, row.color))
      if design.layers[0].yExpr
        r.push(@exprBuilder.stringifyExprLiteral(design.layers[0].yExpr, row.y))
      table.push(r)

    return table
  #   if data.length > 0
  #   fields = Object.getOwnPropertyNames(data[0])
  #   table = [fields] # header
  #   renderRow = (record) ->
  #      _.map(fields, (field) -> record[field])
  #   table.concat(_.map(data, renderRow))
  # else []

