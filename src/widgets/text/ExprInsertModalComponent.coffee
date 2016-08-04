React = require 'react'
H = React.DOM
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require("mwater-expressions-ui").ExprComponent
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent")
TableSelectComponent = require '../../TableSelectComponent'

# Modal that displays an expression builder
module.exports = class ExprInsertModalComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    onInsert: React.PropTypes.func.isRequired   # Called with expr to insert and label if including label

  constructor: ->
    super

    @state = {
      open: false
      expr: null
      table: null
      includeLabel: true
    }

  open: ->
    @setState(open: true, expr: null)

  handleTableChange: (table) => @setState(table: table)

  handleInsert: (ev) =>
    if not @state.expr
      return

    # Close first to avoid strange effects when mixed with pojoviews
    @setState(open: false, =>
      label = new ExprUtils(@props.schema).summarizeExpr(@state.expr)

      @props.onInsert(@state.expr, if @state.includeLabel then label)
    )

  renderContents: ->
    H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @state.table, onChange: @handleTableChange })

      if @state.table
        H.div className: "form-group",
          H.label className: "text-muted", 
            "Field"
          ": "
          R ExprComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @state.table
            types: ['text', 'number', 'enum', 'date', 'datetime', 'boolean']
            value: @state.expr
            # TODO only individual if singleRowTable 
            aggrStatuses: ["individual", "literal", "aggregate"]
            onChange: (expr) => @setState(expr: expr)

      if @state.table
        H.label key: "includeLabel",
          H.input type: "checkbox", checked: @state.includeLabel, onChange: (ev) => @setState(includeLabel: ev.target.checked)
          " Include Label"


  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      actionLabel: "Insert"
      onAction: @handleInsert 
      onCancel: => @setState(open: false)
      title: "Insert Field",
        @renderContents()
