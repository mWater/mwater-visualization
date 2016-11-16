_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ReactSelect = require 'react-select'

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
DatagridViewComponent = require './DatagridViewComponent'

DirectDatagridDataSource = require './DirectDatagridDataSource'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler

# Modal to perform find/replace on datagrid
module.exports = class FindReplaceModalComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired     # schema to use
    dataSource: React.PropTypes.object.isRequired # dataSource to use

    design: React.PropTypes.object.isRequired     # Design of datagrid. See README.md of this folder

    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired    # id table to filter
      jsonql: React.PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

    # Check if expression of table row is editable
    # If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditValue: React.PropTypes.func             

    # Update table row expression with a new value
    # Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateValue:  React.PropTypes.func

  constructor: (props) ->
    super
    @state = {
      open: false  # True if modal is open
      replaceColumn: null # Column id to replace
      withExpr: null  # Replace with expression
      conditionExpr: null # Condition expr
    }

  show: ->
    @setState(open: true)

  renderPreview: ->
    exprUtils = new ExprUtils(@props.schema)

    # Replace "replace" column with fake case statement to simulate change
    design = _.clone(@props.design)
    design.columns = _.map(design.columns, (column) =>
      # Unchanged if not replace column 
      if column.id != @state.replaceColumn
        return column

      expr = {
        type: "case"
        table: @props.design.table
        cases: [
          when: @state.conditionExpr or { type: "literal", valueType: "boolean", value: true }
          then: @state.withExpr
        ]
        # Unchanged
        else: column.expr
      }

      # Specify label to prevent strange titles
      return _.extend({}, column, expr: expr, label: column.label or exprUtils.summarizeExpr(column.expr, @props.design.locale))
    )

    R AutoSizeComponent, injectWidth: true,
      (size) =>
        R DatagridViewComponent,
          width: size.width
          height: 400
          schema: @props.schema
          dataSource: @props.dataSource
          datagridDataSource: new DirectDatagridDataSource(schema: @props.schema, dataSource: @props.dataSource)
          design: design
          filters: @props.filters
  
  renderContents: ->
    exprUtils = new ExprUtils(@props.schema)

    # Determine which columns are replace-able. Excludes subtables
    replaceColumns = _.filter(@props.design.columns, (column) -> not column.subtable)
    replaceColumnOptions = _.map(replaceColumns, (column) => { value: column.id, label: column.label or exprUtils.summarizeExpr(column.expr, @props.design.locale)})

    H.div null,
      H.div key: "replace", className: "form-group",
        H.label null, "Replace: "
        H.select value: @state.replaceColumn, onChange: ((ev) => @setState(replaceColumn: ev.target.value)), className: "form-control",
          H.option key: "_none", value: "", "Select..."
          _.map(replaceColumnOptions, (option) => H.option(key: option.value, value: option.value, option.label))

        # R ReactSelect, 
        #   value: @state.replaceColumn
        #   options: replaceColumnOptions
        #   clearable: false
        #   onChange: (value) => @setState(replaceColumn: value)

      if @state.replaceColumn
        # Get expr of replace column
        replaceExpr = _.findWhere(@props.design.columns, id: @state.replaceColumn).expr

        H.div key: "with", className: "form-group",
          H.label null, "With: "
          R ExprComponent,
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.design.table
            value: @state.withExpr
            onChange: (value) => @setState(withExpr: value)
            types: [exprUtils.getExprType(replaceExpr)]
            enumValues: exprUtils.getExprEnumValues(replaceExpr)
            idTable: exprUtils.getExprIdTable(replaceExpr)
            preferLiteral: true

      H.div key: "condition", className: "form-group",
        H.label null, "In rows that: "
        R ExprComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          value: @state.conditionExpr
          onChange: (value) => @setState(conditionExpr: value)
          types: ["boolean"]
          placeholder: "All Rows"

      H.div key: "preview",
        H.h4 null, "Preview"
        @renderPreview()

  render: ->
    if not @state.open
      return null

    R ModalPopupComponent,
      size: "large"
      header: "Find/Replace"
      footer: [
        H.button 
          key: "cancel"
          type: "button"
          onClick: => @setState(open: false)
          className: "btn btn-default", 
            "Cancel"
        H.button 
          key: "apply"
          type: "button"
          disabled: not @state.replaceColumn
          onClick: @props.onAction
          className: "btn btn-primary",
            "Apply"
      ],
        @renderContents()
