Freezer = require 'freezer-js'
SaveCancelModalComponent = require './SaveCancelModalComponent'
ListComponent = require './ListComponent'
ReactSelect = require 'react-select'
React = require 'react'
HoverMixin = require './HoverMixin'
H = React.DOM

Schema = require './Schema'
DesignValidator = require './DesignValidator'

JoinExprTreeComponent = require './JoinExprTreeComponent' 

ScalarExprEditorComponent = React.createClass {
  handleJoinExprSelect: (joinExpr) ->
    @props.scalar.set(expr: joinExpr.expr, joinIds: joinExpr.joinIds)

  handleAggrSelect: (aggrId) ->
    @props.scalar.set(aggrId: aggrId)

  render: ->
    # Create tree 
    tree = @props.schema.getJoinExprTree({ baseTableId: @props.scalar.baseTableId })

    # Create list of aggregates
    if @props.scalar.expr and @props.schema.isAggrNeeded(@props.scalar.joinIds)
      options = _.map(@props.schema.getAggrs(@props.scalar.expr), (aggr) -> { value: aggr.id, label: aggr.name })
      aggrs = H.div null,
        H.br()
        H.br()
        H.label null, "Aggregate by"
        React.createElement(ReactSelect, { 
          value: @props.scalar.aggrId, 
          options: options 
          onChange: @handleAggrSelect
        })

    H.div null, 
      H.label null, "Expression"
      React.createElement(JoinExprTreeComponent, tree: tree, onSelect: @handleJoinExprSelect, selectedValue: { expr: @props.scalar.expr, joinIds: @props.scalar.joinIds })
      H.div style: { width: "20em" }, aggrs
}

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

$ ->
  `
  var freezer = new Freezer({ x: 1 });
  var trans = freezer.get().transact();
  trans.x = 2;
  freezer.get().run();
  freezer.get().getListener().once('update', function(val) {
    console.log("Why does this get called?");
    });

  `

  return
  onUpdate = (expr) =>
    # Clean
    transExpr = expr.transact()
    transExpr.x = 2
    console.log transExpr
    newExpr = expr.run()
    console.log newExpr
    freezer.get().getListener().once("update", onUpdate)

  # Listen to changes
  listener.once("update", onUpdate)

  freezer.get().set(x:3)


  listener = freezer.get().getListener()

  onUpdate = (expr) =>
    # Clean
    transExpr = expr.transact()
    transExpr.x = 2
    console.log transExpr
    newExpr = expr.run()
    console.log newExpr
    freezer.get().getListener().once("update", onUpdate)

  # Listen to changes
  listener.once("update", onUpdate)

  freezer.get().set(x:3)

  return

  # freezer = new Freezer({ x: { y: 4 }})
  # # Listen to changes
  # freezer.get().getListener().on("update", (ev) => 
  #   console.log(ev)
  # )
  # freezer.get().set(x: { y: 4 })
  # freezer.get().set(x:5)
  # freezer.get().set(x:6)

  # $("body").css("background-color", "#EEE")
  # Create simple schema
  schema = createSchema()
  designValidator = new DesignValidator(schema)

  expr = { type: "scalar", baseTableId: "a" }
  Holder = React.createClass {
    getInitialState: ->
      freezer = new Freezer(expr)

      listener = freezer.get().getListener()

      onUpdate = (expr) =>
        # Clean
        transExpr = expr.transact()
        designValidator.cleanExpr(transExpr)
        newExpr = expr.run()
        console.log newExpr
        @setState(expr: freezer.get())
        freezer.get().getListener().once("update", onUpdate)

      # Listen to changes
      listener.once("update", onUpdate)

      return { expr: freezer.get() }

    render: ->
      React.createElement(ScalarExprEditorComponent, schema: schema, scalar: @state.expr)
  }

  sample = React.createElement(Holder)
  React.render(sample, document.getElementById('root'))

Child = React.createClass {
  handleClick: ->
    @props.data.set(x: @props.data.x + 1)

  render: ->
    H.button 
      type: "button"
      onClick: @handleClick
      className: "btn btn-default", 
        "Button " + @props.data.x
}


# Sample = React.createClass {
#   getInitialState: ->
#     freezer = new Freezer({ x: 1 })
#     freezer.get().getListener().on 'update', (q) => 
#       @setState(data: q)

#     freezer.get().reset(x:2)
#     return { editing: false, data: freezer.get() }

#   handleEditClick: ->
#     @setState(editing: !@state.editing)

#   render: ->
#     if @state.editing
#       modal = React.createElement(SaveCancelModalComponent, { 
#         title: "Title"
#         data: @state.data
#         onClose: => @setState(editing: false)
#         createContent: (data) => React.createElement(Child, data: data)
#         })

#     H.div null, 
#       H.button className: "btn btn-default", onClick: @handleEditClick, "Edit"
#       H.div null, @state.data.x
#       modal
# }

Sample = React.createClass {
  getInitialState: ->
    { selected: null }

  render: ->
    editor = React.createElement(SaveCancelModalComponent, { 
      title: "Select Data Source"
      data: { selected: @state.selected }
      onSave: (data) => @setState(selected: data.selected)
      createContent: (data) => 
        React.createElement(ListComponent, 
          items: options,
          selected: data.selected,
          onSelect: (id) => data.set({selected: id}))
      })

    H.div null, 
      "Data Source: "
      React.createElement HoverEditComponent, 
        editor: editor
        @state.selected or H.i(null, "None")
}

GreenArrow = React.createClass {
  render: ->
    H.span className: "glyphicon glyphicon-arrow-left", style: { color: "#0A0", paddingLeft: 5}
}

options = [
  { id: 'one', display: H.div(null, H.span(className:"glyphicon glyphicon-pencil"), ' One')}
  { id: 'two', display: 'Two' }
]

Sample2 = React.createClass {
  render: ->
    H.div null,
      "test"
      React.createElement(ReactSelect, { name: "x", value: "one", options: options })
}


HoverEditComponent = React.createClass {
  getInitialState: -> { hover: false, editing: false }
  mouseOver: -> @setState(hover: true)
  mouseOut: -> @setState(hover: false)

  handleEditorClose: -> @setState(editing: false)
  render: ->
    if @state.editing
      editor = React.cloneElement(@props.editor, onClose: @handleEditorClose)

    highlighted = @state.hover or @state.editing

    H.div style: { display: "inline-block" },
      editor
      H.div
        onMouseOver: @mouseOver
        onMouseOut: @mouseOut
        onClick: => @setState(editing: true)
        style: { 
          display: "inline-block"
          padding: 3
          cursor: "pointer"
          # border: if highlighted then "solid 1px rgba(128, 128, 128, 0.3)" else "solid 1px transparent"
          borderRadius: 4
          backgroundColor: if highlighted then "rgba(0, 0, 0, 0.1)"
        },
          @props.children
          # H.span 
          #   style: { 
          #     color: if highlighted then "#08A" else "transparent"
          #     paddingLeft: 7
          #   }
          #   className: "glyphicon glyphicon-pencil"
} 
