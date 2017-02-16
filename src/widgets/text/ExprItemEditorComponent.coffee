_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require("mwater-expressions-ui").ExprComponent
TableSelectComponent = require '../../TableSelectComponent'

# Expression editor that allows changing an expression item
module.exports = class ExprItemEditorComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    exprItem: React.PropTypes.object.isRequired  # Expression item to edit
    onChange: React.PropTypes.func.isRequired   # Called with expr item 
    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row

  constructor: (props) ->
    super

    # Keep table in state as it can be set before the expression
    @state = {
      table: props.exprItem.expr?.table or props.singleRowTable
    }

  handleTableChange: (table) => @setState(table: table)

  handleExprChange: (expr) =>
    exprItem = _.extend({}, @props.exprItem, expr: expr)
    @props.onChange(exprItem)

  handleIncludeLabelChange: (ev) =>
    exprItem = _.extend({}, @props.exprItem, includeLabel: ev.target.checked, labelText: if ev.target.checked then @props.exprItem.labelText)
    @props.onChange(exprItem)

  handleLabelTextChange: (ev) =>
    exprItem = _.extend({}, @props.exprItem, labelText: ev.target.value or null)
    @props.onChange(exprItem)

  render: ->
    H.div style: { paddingBottom: 200 },
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
            value: @props.exprItem.expr
            aggrStatuses: ["individual", "literal", "aggregate"]
            onChange: @handleExprChange

      if @state.table and @props.exprItem.expr
        H.label key: "includeLabel",
          H.input type: "checkbox", checked: @props.exprItem.includeLabel, onChange: @handleIncludeLabelChange
          " Include Label"

      if @state.table and @props.exprItem.expr and @props.exprItem.includeLabel
        H.input 
          key: "labelText"
          className: "form-control"
          type: "text"
          value: @props.exprItem.labelText or ""
          onChange: @handleLabelTextChange 
          placeholder: new ExprUtils(@props.schema).summarizeExpr(@props.exprItem.expr) + ": "

