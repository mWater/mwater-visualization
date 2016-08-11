React = require 'react'
H = React.DOM
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require("mwater-expressions-ui").ExprComponent
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent")
TableSelectComponent = require '../../TableSelectComponent'

# Modal that displays an expression builder for updating an expression
module.exports = class ExprUpdateModalComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row

  constructor: ->
    super

    @state = {
      open: false
      id: null
      expr: null
      table: null
      includeLabel: false
      labelText: null
    }

  open: (item, onUpdate) ->
    @setState(open: true, id: item.id, expr: item.expr, table: item.expr.table, includeLabel: item.includeLabel, labelText: item.labelText, onUpdate: onUpdate)

  handleTableChange: (table) => @setState(table: table)

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
            types: ['text', 'number', 'enum', 'date', 'datetime', 'boolean']
            value: @state.expr
            # Only individual if singleRowTable 
            aggrStatuses: if @state.table == @props.singleRowTable then ["individual", "literal"] else ['literal', "aggregate"]
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
          placeholder: new ExprUtils(@props.schema).summarizeExpr(@state.expr)

  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      actionLabel: "Update"
      onAction: => 
        # Close first to avoid strange effects when mixed with pojoviews
        @setState(open: false, =>
          @state.onUpdate({ type: "expr", id: @state.id, expr: @state.expr, includeLabel: @state.includeLabel, labelText: @state.labelText })
        )
      onCancel: => @setState(open: false)
      title: "Update Field",
        @renderContents()
