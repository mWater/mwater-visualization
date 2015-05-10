SaveCancelModalComponent = require './SaveCancelModalComponent'
ListComponent = require './ListComponent'
React = require 'react'
HoverMixin = require './HoverMixin'
H = React.DOM
DesignValidator = require './DesignValidator'

Schema = require './Schema'

ScalarExprComponent = require './ScalarExprComponent'

createSchema = ->
  # Create simple schema with subtree
  schema = new Schema()
  schema.addTable({ id: "a", name: "A" })
  schema.addColumn("a", { id: "x", name: "X", type: "uuid", primary: true })
  schema.addColumn("a", { id: "y", name: "Y", type: "text" })
  schema.addColumn("a", { id: "z", name: "Z", type: "integer" })

  schema.addTable({ id: "b", name: "B" })
  schema.addColumn("b", { id: "q", name: "Q", type: "uuid", primary: true })
  schema.addColumn("b", { id: "r", name: "R", type: "text" })
  schema.addColumn("b", { id: "s", name: "S", type: "uuid" }) # a ref

  schema.addJoin({ id: "ab", name: "AB", fromTableId: "a", fromColumnId: "x", toTableId: "b", toColumnId: "s", op: "=", oneToMany: true })
  schema.addJoin({ id: "ba", name: "BA", fromTableId: "b", fromColumnId: "s", toTableId: "a", toColumnId: "x", op: "=", oneToMany: false })

  return schema

ComparisonExprComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    baseTableId: React.PropTypes.string.isRequired 
  }

  handleLhsChange: (lhs) ->
    @props.onChange(_.extend({}, @props.expr, lhs: lhs))

  handleOpChange: (ev) ->
    @props.onChange(_.extend({}, @props.expr, op: ev.target.value))

  handleRhsChange: (rhs) ->
    @props.onChange(_.extend({}, @props.expr, rhs: rhs))

  render: ->
    # Create LHS
    lhsControl = React.createElement(ScalarExprComponent, 
      schema: @props.schema, 
      baseTableId: @props.baseTableId, 
      expr: @props.expr.lhs,
      onChange: @handleLhsChange)

    # Create op if LHS present
    lhsType = @props.schema.getExprType(@props.expr.lhs)
    if lhsType
      ops = @props.schema.getComparisonOps(lhsType)
      opControl = H.select 
        className: "form-control input-sm",
        style: { width: "auto", display: "inline-block" }
        value: @props.expr.op
        onChange: @handleOpChange,
          _.map(ops, (op) -> H.option(value: op.id, op.name))

    if lhsType and @props.expr.op
      rhsType = @props.schema.getComparisonRhsType(lhsType, @props.expr.op)
      switch rhsType
        when "text"
          rhsControl = React.createElement(TextLiteralComponent, expr: @props.rhs, onChange: @handleRhsChange)

    return H.div null,
      lhsControl,
      opControl,
      rhsControl
}

TextLiteralComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
  }

  onChange: (ev) ->
    @props.onChange({ type: "literal", value: ev.target.value })
    
  render: ->
    H.input 
      className: "form-control input-sm",
      type: "text", 
      onChange: @handleChange
      value: if @props.expr then @props.expr.value
}

$ ->
  # $("body").css("background-color", "#EEE")
  # Create simple schema
  schema = createSchema()
  designValidator = new DesignValidator(schema)

  expr = {}

  Holder = React.createClass {
    getInitialState: ->
      { expr: @props.initialExpr }

    handleChange: (expr) ->
      # # Clean first
      # expr = designValidator.cleanExpr(expr)
      @setState(expr: expr)

    render: ->
      React.createElement ComparisonExprComponent, 
        schema: schema,
        baseTableId: "a",
        expr: @state.expr, 
        onChange: @handleChange
  }

  sample = React.createElement(Holder, initialExpr: expr)
  React.render(sample, document.getElementById('root'))

# Child = React.createClass {
#   handleClick: ->
#     @props.data.set(x: @props.data.x + 1)

#   render: ->
#     H.button 
#       type: "button"
#       onClick: @handleClick
#       className: "btn btn-default", 
#         "Button " + @props.data.x
# }


# # Sample = React.createClass {
# #   getInitialState: ->
# #     freezer = new Freezer({ x: 1 })
# #     freezer.get().getListener().on 'update', (q) => 
# #       @setState(data: q)

# #     freezer.get().reset(x:2)
# #     return { editing: false, data: freezer.get() }

# #   handleEditClick: ->
# #     @setState(editing: !@state.editing)

# #   render: ->
# #     if @state.editing
# #       modal = React.createElement(SaveCancelModalComponent, { 
# #         title: "Title"
# #         data: @state.data
# #         onClose: => @setState(editing: false)
# #         createContent: (data) => React.createElement(Child, data: data)
# #         })

# #     H.div null, 
# #       H.button className: "btn btn-default", onClick: @handleEditClick, "Edit"
# #       H.div null, @state.data.x
# #       modal
# # }

# Sample = React.createClass {
#   getInitialState: ->
#     { selected: null }

#   render: ->
#     editor = React.createElement(SaveCancelModalComponent, { 
#       title: "Select Data Source"
#       data: { selected: @state.selected }
#       onSave: (data) => @setState(selected: data.selected)
#       createContent: (data) => 
#         React.createElement(ListComponent, 
#           items: options,
#           selected: data.selected,
#           onSelect: (id) => data.set({selected: id}))
#       })

#     H.div null, 
#       "Data Source: "
#       React.createElement HoverEditComponent, 
#         editor: editor
#         @state.selected or H.i(null, "None")
# }

# GreenArrow = React.createClass {
#   render: ->
#     H.span className: "glyphicon glyphicon-arrow-left", style: { color: "#0A0", paddingLeft: 5}
# }

# options = [
#   { id: 'one', display: H.div(null, H.span(className:"glyphicon glyphicon-pencil"), ' One')}
#   { id: 'two', display: 'Two' }
# ]

# Sample2 = React.createClass {
#   render: ->
#     H.div null,
#       "test"
#       React.createElement(ReactSelect, { name: "x", value: "one", options: options })
# }


