H = React.DOM
ComparisonExprComponent = require './ComparisonExprComponent'

module.exports = LogicalExprComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    baseTableId: React.PropTypes.string.isRequired 
  }

  handleExprChange: (i, expr) ->
    # Replace exprs
    exprs = @props.expr.exprs.slice()
    exprs[i] = expr
    @props.onChange(_.extend({}, @props.expr, exprs: exprs))

  handleAdd: ->
    expr = @props.expr or { type: "logical", op: "and", exprs: [] }
    exprs = expr.exprs.concat([{ type: "comparison" }])
    @props.onChange(_.extend({}, expr, exprs: exprs))

  handleRemove: (i) ->
    exprs = @props.expr.exprs.slice()
    exprs.splice(i, 1)
    @props.onChange(_.extend({}, @props.expr, exprs: exprs))    

  render: ->
    if @props.expr
      childElems = _.map @props.expr.exprs, (e, i) =>
        H.div null,
          React.createElement(ComparisonExprComponent, 
            expr: e, 
            schema: @props.schema, 
            baseTableId: @props.baseTableId, 
            onChange: @handleExprChange.bind(null, i))
          H.button 
            type: "button", 
            className: "btn btn-sm btn-link", 
            onClick: @handleRemove.bind(null, i),
              H.span(className: "glyphicon glyphicon-remove")
 
    # Render all expressions (comparisons for now)
    H.div null,
      childElems
      H.button className: "btn btn-sm btn-link", type: "button", onClick: @handleAdd,
        H.span className: "glyphicon glyphicon-plus"
        " Add Filter"
}

