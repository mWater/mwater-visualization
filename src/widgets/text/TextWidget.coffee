React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

async = require 'async'

ExprCompiler = require('mwater-expressions').ExprCompiler
ExprCleaner = require('mwater-expressions').ExprCleaner
injectTableAlias = require('mwater-expressions').injectTableAlias

Widget = require '../Widget'

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
    # Put here so TextWidget can be created on server
    TextWidgetComponent = require './TextWidgetComponent'
    
    return R TextWidgetComponent,
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
    # Evaluates a single exprItem
    evalExprItem = (exprItem, cb) =>
      if not exprItem.expr
        return cb(null)

      table = exprItem.expr.table

      exprCompiler = new ExprCompiler(schema)

      # Clean expression
      exprCleaner = new ExprCleaner(schema)
      expr = exprCleaner.cleanExpr(exprItem.expr, aggrStatuses: ["individual", "literal", "aggregate"])

      # Get two distinct examples to know if unique
      query = {
        distinct: true
        selects: [
          { type: "select", expr: exprCompiler.compileExpr(expr: expr, tableAlias: "main"), alias: "value" }
        ]
        from: { type: "table", table: table, alias: "main" }
        limit: 2
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
          cb(error)
        else
          # If multiple, use null
          if rows.length != 1
            cb(null, null)
          else 
            cb(null, rows[0].value)
      )

    # Map of value by id
    exprValues = {}

    async.each @getExprItems(design.items), (exprItem, cb) =>
      evalExprItem(exprItem, (error, value) =>
        if error
          cb(error)
        else
          exprValues[exprItem.id] = value
          cb(null)
        )
    , (error) =>
      if error
        callback(error)
      else
        callback(null, exprValues)

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> true

  # Get expression items recursively
  getExprItems: (items) ->
    exprItems = []
    for item in (items or [])
      if item.type == "expr"
        exprItems.push(item)
      if item.items
        exprItems = exprItems.concat(@getExprItems(item.items))
    return exprItems

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    exprItems = @getExprItems(design.items)

    filterableTables = _.map(exprItems, (exprItem) -> exprItem.expr)

    filterableTables = _.uniq(_.compact(filterableTables))
    return filterableTables

