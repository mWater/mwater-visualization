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
  #  namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
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
      namedStrings: options.namedStrings

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

      # Get relevant filters
      if table
        relevantFilters = _.where(filters or [], table: table)
        whereClauses = _.map(relevantFilters, (f) -> injectTableAlias(f.jsonql, "main")) 
      else 
        whereClauses = []

      # In case of "sum where"/"count where", extract where clause to make faster
      if expr?.op == 'sum where'
        whereClauses.push(exprCompiler.compileExpr(expr: expr.exprs[1], tableAlias: "main"))
        expr = { type: "op", table: expr.table, op: "sum", exprs: [expr.exprs[0]] }
      else if expr?.op == 'count where'
        whereClauses.push(exprCompiler.compileExpr(expr: expr.exprs[0], tableAlias: "main"))
        expr = { type: "op", table: expr.table, op: "count", exprs: [] }

      # Get two distinct examples to know if unique
      query = {
        distinct: true
        selects: [
          { type: "select", expr: exprCompiler.compileExpr(expr: expr, tableAlias: "main"), alias: "value" }
        ]
        from: if table then exprCompiler.compileTable(table, "main")
        limit: 2
      }

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

    filterableTables = _.map(exprItems, (exprItem) -> exprItem.expr?.table)

    filterableTables = _.uniq(_.compact(filterableTables))
    return filterableTables

  # Get table of contents entries for the widget, entries that should be displayed in the TOC.
  # returns `[{ id: "id that is unique within widget", text: "text of TOC entry", level: 1, 2, etc. }]
  # For simplicity, the h1, h2, etc. have ids of 0, 1, 2 in the order they appear. h1, h2 will be given ids 0, 1 respectively.
  getTOCEntries: (design) ->
    # Find all items that are h1, h2, etc
    entries = []

    # Convert items into flat text
    flattenText = (items) ->
      return _.map(items, (item) ->
        if _.isString(item)
          return item
        if item?.items
          return flattenText(item.items)
        ).join("")

    findRecursive = (items) ->
      for item in (items or [])
        if item?.type == "element" and item.tag.match(/^h[1-9]$/)
          entries.push({ id: entries.length, level: parseInt(item.tag.substr(1)), text: flattenText(item.items) })
        if item?.items
          findRecursive(item.items)

    findRecursive(design.items)

    return entries
