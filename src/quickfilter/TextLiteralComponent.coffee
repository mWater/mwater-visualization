React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ExprCompiler = require("mwater-expressions").ExprCompiler

# Displays a combo box that allows selecting single text value from an expression
module.exports = class TextLiteralComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.string
    onChange: React.PropTypes.func
    refExpr: React.PropTypes.object.isRequired # Expression for the text values to select from
    schema: React.PropTypes.object.isRequired # Schema of the database
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values

  handleChange: (val) =>
    value = if val then val else null # Blank is null
    @props.onChange(value)

  escapeRegex: (s) ->
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

  getOptions: (input, cb) =>
    # Create query to get matches ordered by most frequent to least
    exprCompiler = new ExprCompiler(@props.schema)

    # select <compiled expr> as value, count(*) as number from <table> where <compiled expr> like 'input%' group by value order by number desc limit 250
    query = {
      type: "query"
      selects: [
        { type: "select", expr: exprCompiler.compileExpr(expr: @props.refExpr, tableAlias: "main"), alias: "value" }
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "number" }
      ]
      from: exprCompiler.compileTable(@props.refExpr.table, "main") 
      where: {
        type: "op"
        op: "~*"
        exprs: [
          exprCompiler.compileExpr(expr: @props.refExpr, tableAlias: "main")
          "^" + @escapeRegex(input)
        ]
      }
      groupBy: [1]
      orderBy: [{ ordinal: 2, direction: "desc" }, { ordinal: 1, direction: "asc" }]
      limit: 250
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
      
    return

  render: ->
    value = @props.value or "" 

    H.div style: { width: "100%" },
      React.createElement(ReactSelect, { 
        placeholder: "All"
        value: value
        asyncOptions: @getOptions
        onChange: if @props.onChange then @handleChange
        disabled: not @props.onChange?
      })

