React = require 'react'
H = React.DOM
R = React.createElement

uuid = require 'node-uuid'

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require("mwater-expressions-ui").ExprComponent
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent")
TableSelectComponent = require '../../TableSelectComponent'

# Modal that displays an expression builder
module.exports = class ExprInsertModalComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    onInsert: React.PropTypes.func.isRequired   # Called with expr item to insert
    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row

  constructor: ->
    super

    @state = {
      open: false
      expr: null
      table: null
      includeLabel: false
      labelText: null
    }

  open: ->
    @setState(open: true, expr: null, table: @props.singleRowTable, labelText: null)

  handleTableChange: (table) => @setState(table: table)

  handleInsert: (ev) =>
    if not @state.expr
      return

    # Close first to avoid strange effects when mixed with pojoviews
    @setState(open: false, =>
      item = { type: "expr", id: uuid.v4(), expr: @state.expr, includeLabel: @state.includeLabel, labelText: (if @state.includeLabel then @state.labelText) }

      @props.onInsert(item)
    )

  renderContents: ->
    H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @state.table, onChange: @handleTableChange })
      H.br()

      if @state.table
        H.div className: "form-group",
          H.label className: "text-muted", 
            "Field"
          ": "
          R ExprComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @state.table
            types: ['text', 'number', 'enum', 'date', 'datetime', 'boolean', 'enumset']
            value: @state.expr
            aggrStatuses: ["individual", "literal", "aggregate"]
            onChange: (expr) => @setState(expr: expr)

      if @state.table and @state.expr
        H.label key: "includeLabel",
          H.input type: "checkbox", checked: @state.includeLabel, onChange: (ev) => @setState(includeLabel: ev.target.checked)
          " Include Label"

      if @state.table and @state.expr and @state.includeLabel
        H.input 
          key: "labelText"
          className: "form-control"
          type: "text"
          value: @state.labelText or ""
          onChange: (ev) => @setState(labelText: ev.target.value or null)
          placeholder: new ExprUtils(@props.schema).summarizeExpr(@state.expr) + ": "


  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      actionLabel: "Insert"
      onAction: @handleInsert 
      onCancel: => @setState(open: false)
      title: "Insert Field",
        @renderContents()
