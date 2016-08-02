React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

async = require 'async'

ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias

ClickOutHandler = require('react-onclickout')
Widget = require '../Widget'
TextWidgetViewComponent = require './TextWidgetViewComponent'
TextWidgetDesignerComponent = require './TextWidgetDesignerComponent'

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
  createViewElement: (options) ->
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

  # Get the data that the widget needs. This will be called on the server, typically.
  #   design: design of the chart
  #   schema: schema to use
  #   dataSource: data source to get data from
  #   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  #   callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    # Get expression items recursively
    getExprItems = (items) ->
      exprItems = []
      for item in (items or [])
        if item.type == "expr"
          exprItems.push(item)
        if item.items
          exprItems = exprItems.concat(getExprItems(item.items))
      return exprItems

    # Evaluates a single exprItem
    evalExprItem = (exprItem, cb) =>
      table = exprItem.expr.table

      exprCompiler = new ExprCompiler(schema)

      query = {
        selects: [
          { type: "select", expr: exprCompiler.compileExpr(expr: exprItem.expr, tableAlias: "main"), alias: "value" }
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
          cb(error)
        else
          cb(null, rows[0]?.value)
      )

    # Map of value by id
    exprValues = {}

    async.each getExprItems(design.items), (exprItem, cb) =>
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

class TextWidgetComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly

    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    filters: React.PropTypes.array

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

  constructor: (props) ->
    super
    @state = { 
      # True when editing
      editing: false
    }  

  handleStartEditing: =>
    if @props.onDesignChange? and not @state.editing
      @setState(editing: true)

  handleStopEditing: => 
    @setState(editing: false)

  refEditor: (elem) ->
    if elem
      elem.focus()

  renderEditor: ->
    R TextWidgetDesignerComponent,
      ref: @refEditor
      design: @props.design
      onDesignChange: @props.onDesignChange
      schema: @props.schema
      dataSource: @props.dataSource
      onStopEditing: @handleStopEditing

  renderView: ->
    R TextWidgetViewComponent, 
      design: @props.design
      schema: @props.schema
      filters: @props.filters
      widgetDataSource: @props.widgetDataSource

  render: ->
    return H.div onClick: @handleStartEditing, style: { width: @props.width, height: @props.height },
      if @state.editing
        # R ClickOutHandler, onClickOut: @handleStopEditing, # Removed as triggers on modal
        @renderEditor()
      else
        @renderView()



