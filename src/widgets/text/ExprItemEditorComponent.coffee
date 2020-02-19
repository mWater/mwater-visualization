PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require("mwater-expressions-ui").ExprComponent
TableSelectComponent = require '../../TableSelectComponent'

# Expression editor that allows changing an expression item
module.exports = class ExprItemEditorComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired   # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    exprItem: PropTypes.object.isRequired  # Expression item to edit
    onChange: PropTypes.func.isRequired   # Called with expr item 
    singleRowTable: PropTypes.string  # Table that is filtered to have one row

  constructor: (props) ->
    super(props)

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

  handleFormatChange: (ev) =>
    exprItem = _.extend({}, @props.exprItem, format: ev.target.value or null)
    @props.onChange(exprItem)

  render: ->
    formats = [
      { value: "", label: "Normal: 1234.567" }
      { value: ",.0f", label: "Rounded: 1,234"  }
      { value: ",.2f", label: "Two decimals: 1,234.56" }
      { value: "$,.2f", label: "Currency: $1,234.56" }
      { value: "$,.0f", label: "Currency rounded: $1,234" }
      { value: ".0%", label: "Percent rounded: 12%" }
      { value: ".2%", label: "Percent decimal: 12.34%" }
    ]

    exprUtils = new ExprUtils(@props.schema)

    R 'div', style: { paddingBottom: 200 },
      R 'div', className: "form-group",
        R 'label', className: "text-muted", 
          R('i', className: "fa fa-database")
          " "
          "Data Source"
        ": "
        R(TableSelectComponent, { schema: @props.schema, value: @state.table, onChange: @handleTableChange })
        R('br')

      if @state.table
        R 'div', className: "form-group",
          R 'label', className: "text-muted", 
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
        R 'div', className: "form-group",
          R 'label', key: "includeLabel",
            R 'input', type: "checkbox", checked: @props.exprItem.includeLabel, onChange: @handleIncludeLabelChange
            " Include Label"

          if @props.exprItem.includeLabel
            R 'input', 
              key: "labelText"
              className: "form-control"
              type: "text"
              value: @props.exprItem.labelText or ""
              onChange: @handleLabelTextChange 
              placeholder: new ExprUtils(@props.schema).summarizeExpr(@props.exprItem.expr) + ": "

      if @props.exprItem.expr and exprUtils.getExprType(@props.exprItem.expr) == "number"
        R 'div', className: "form-group",
          R 'label', className: "text-muted", 
            "Format"
          ": "
          R 'select', value: @props.exprItem.format or "", className: "form-control", style: { width: "auto", display: "inline-block" }, onChange: @handleFormatChange,
            _.map(formats, (format) -> R('option', key: format.value, value: format.value, format.label))



