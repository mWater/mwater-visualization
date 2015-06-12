ListComponent = require './ListComponent'
React = require 'react'
HoverMixin = require './HoverMixin'
H = React.DOM
DesignValidator = require './DesignValidator'

Schema = require './Schema'

ScalarExprComponent = require './ScalarExprComponent'
literalComponents = require './literalComponents'
ComparisonExprComponent = require './ComparisonExprComponent'
LogicalExprComponent = require './LogicalExprComponent'

createSchema = ->
  # Create simple schema with subtree
  schema = new Schema()
  schema.addTable({ id: "a", name: "A" })
  schema.addColumn("a", { id: "x", name: "X", type: "id" })
  schema.addColumn("a", { id: "y", name: "Y", type: "text" })
  schema.addColumn("a", { id: "integer", name: "Integer", type: "integer" })
  schema.addColumn("a", { id: "decimal", name: "Decimal", type: "decimal" })
  schema.addColumn("a", { id: "enum", name: "Enum", type: "enum", values: [
    { id: "apple", name: "Apple" }
    { id: "banana", name: "Banana" }
    ] })
  schema.addColumn("a", 
    { id: "b", name: "A to B", type: "join", join: {
      fromTable: "a", fromColumn: "x", toTable: "b", toColumn: "q", op: "=", multiple: true }})

  schema.addTable({ id: "b", name: "B" })
  schema.addColumn("b", { id: "q", name: "Q", type: "id" }) 
  schema.addColumn("b", { id: "r", name: "R", type: "integer" })
  schema.addColumn("b", { id: "s", name: "S", type: "text" })

  return schema


$ ->
  # Create simple schema
  schema = createSchema()
  designValidator = new DesignValidator(schema)

  expr = null

  # Holder = React.createClass {
  #   getInitialState: ->
  #     { expr: @props.initialExpr }

  #   handleChange: (expr) ->
  #     # Clean first
  #     expr = designValidator.cleanExpr(expr)
  #     @setState(expr: expr)

  #   render: ->
  #     H.div null,
  #       # React.createElement(literalComponents.DateComponent, expr: @state.expr, onChange: @handleChange)
  #       React.createElement LogicalExprComponent, 
  #         schema: schema,
  #         baseTableId: "a",
  #         expr: @state.expr, 
  #         onChange: @handleChange
  #       H.pre null, JSON.stringify(@state.expr, null, 2)
  # }

  sample = H.div className: "container",
    React.createElement(require("./ChartTestComponent"), schema: createSchema())
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


