React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias

Widget = require './Widget'

module.exports = class TextWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  #  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
  createViewElement: (options) ->
    # Put here so ImageWidget can be created on server
    ImageWidgetComponent = require './ImageWidgetComponent'
    
    return R ImageWidgetComponent,
      schema: options.schema
      dataSource: options.dataSource
      widgetDataSource: options.widgetDataSource
      filters: options.filters
      design: options.design
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height
      standardWidth: options.standardWidth 
      singleRowTable: options.singleRowTable

  # Get the data that the widget needs. This will be called on the server, typically.
  #   design: design of the chart
  #   schema: schema to use
  #   dataSource: data source to get data from
  #   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  #   callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    # TODO! Should get expression value if using expression

    table = design.expr.table

    exprCompiler = new ExprCompiler(schema)

    query = {
      selects: [
        { type: "select", expr: exprCompiler.compileExpr(expr: design.expr, tableAlias: "main"), alias: "value" }
      ]
      from: { type: "table", table: table, alias: "main" }
      limit: 1
    }

    # Get relevant filters
    filters = _.where(filters or [], table: table)
    whereClauses = _.map(filters, (f) -> injectTableAlias(f.jsonql, "main")) 

    whereClauses = _.compact(whereClauses)

    # Wrap if multiple
    if whereClauses.length > 1
      query.where = { type: "op", op: "and", exprs: whereClauses }
    else
      query.where = whereClauses[0]

    # Execute query
    dataSource.performQuery(query, (error, rows) =>
      if error
        callback(error)
      else
        callback(null, rows[0]?.value)
    )

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> false
