React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ExpressionCompiler = require './ExpressionCompiler'
ExpressionBuilder = require './ExpressionBuilder'

# Displays a combo box that allows selecting multiple text values from an expression
module.exports = class TextArrayComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
    expr: React.PropTypes.object.isRequired # Expression for the text values to select from
    schema: React.PropTypes.object.isRequired # Schema of the database
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

  handleChange: (val) =>
    value = if val then val.split("\n") else []
    @props.onChange({ type: "literal", valueType: "text[]", value: value })

  escapeRegex: (s) ->
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

  getOptions: (input, cb) =>
    # Create query to get matches ordered by most frequent to least
    exprBuilder = new ExpressionBuilder(@props.schema)
    exprCompiler = new ExpressionCompiler(@props.schema)

    # select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 50
    query = {
      type: "query"
      selects: [
        { type: "select", expr: exprCompiler.compileExpr(expr: @props.expr, tableAlias: "main"), alias: "value" }
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
      ]
      from: exprCompiler.compileTable(exprBuilder.getExprTable(@props.expr), "main") 
      where: {
        type: "op"
        op: "~*"
        exprs: [
          exprCompiler.compileExpr(expr: @props.expr, tableAlias: "main")
          "^" + @escapeRegex(input)
        ]
      }
      groupBy: [1]
      orderBy: [{ ordinal: 2, direction: "desc" }, { ordinal: 1, direction: "asc" }]
      limit: 50
    }

    # Execute query
    @props.dataSource.performQuery query, (err, rows) =>
      if err
        cb(err)
        return 

      # Filter null and blank
      rows = _.filter(rows, (r) -> r.value)

      cb(null, {
        options: _.map(rows, (r) -> { value: r.value, label: r.value })
        complete: false # TODO rows.length < 50 # Complete if didn't hit limit
      })

  render: ->
    value = ""
    if @props.value and @props.value.value.length > 0 
      value = @props.value.value.join("\n")

    options = _.map(@props.enumValues, (val) -> { value: val.id, label: val.name })
    H.div style: { width: "100%" },
      React.createElement(ReactSelect, { 
        value: value
        multi: true
        delimiter: "\n"
        asyncOptions: @getOptions
        onChange: @handleChange
      })

