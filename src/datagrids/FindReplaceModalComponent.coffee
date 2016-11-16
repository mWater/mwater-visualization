_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
async = require 'async'

ReactSelect = require 'react-select'

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
DatagridViewComponent = require './DatagridViewComponent'

DirectDatagridDataSource = require './DirectDatagridDataSource'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias

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
      progress: null # 0-100 when working
    }

  show: ->
    @setState(open: true)

  performReplace: ->
    exprUtils = new ExprUtils(@props.schema)
    exprCompiler = new ExprCompiler(@props.schema)

    # Get expr of replace column
    replaceExpr = _.findWhere(@props.design.columns, id: @state.replaceColumn).expr

    # Get ids and with value, filtered by filters, design.filter and conditionExpr (if present)
    query = {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: @props.schema.getTable(@props.design.table).primaryKey }, alias: "id" }
        { type: "select", expr: exprCompiler.compileExpr(expr: @state.withExpr, tableAlias: "main"), alias: "withValue" }
      ]
      from: { type: "table", table: @props.design.table, alias: "main" }
    }

    # Filter by filter
    wheres = []
    if @props.design.filter
      wheres.push(exprCompiler.compileExpr(expr: @props.design.filter, tableAlias: "main"))

    # Filter by conditionExpr
    if @state.conditionExpr
      wheres.push(exprCompiler.compileExpr(expr: @state.conditionExpr, tableAlias: "main"))

    # Add extra filters
    for extraFilter in (@props.filters or [])
      if extraFilter.table == @props.design.table
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))

    query.where = { type: "op", op: "and", exprs: _.compact(wheres) }

    @setState(progress: 0)
    # Number completed (twice for each row, once to check can edit and other to perform)
    completed = 0
    @props.dataSource.performQuery query, (error, rows) =>
      if error
        @setState(progress: null)
        alert("Error: #{error.message}")
        return

      # Check canEditValue on each one
      async.mapLimit rows, 10, (row, cb) => 
        # Abort if closed
        if not @state.open
          return 

        # Prevent stack overflow
        _.defer () =>
          # First half
          completed += 1
          @setState(progress: completed * 50 / rows.length)

          @props.canEditValue(@props.design.table, row.id, replaceExpr, cb)
      , (error, canEdits) =>
        if error
          @setState(progress: null)
          alert("Error: #{error.message}")
          return

        if not _.all(canEdits)
          @setState(progress: null)
          alert("You not have permission to replace all values")
          return

        # Confirm
        if not confirm("Replace #{canEdits.length} values? This cannot be undone.")
          @setState(progress: null)
          return

        # Perform updateValue on each one
        async.eachLimit rows, 10, (row, cb) => 
          # Abort if closed
          if not @state.open
            return 

          # Prevent stack overflow
          _.defer () =>
            # First half
            completed += 1
            @setState(progress: completed * 50 / rows.length)

            @props.updateValue(@props.design.table, row.id, replaceExpr, row.withValue, cb)
        , (error) =>
          if error
            @setState(progress: null)
            alert("Error: #{error.message}")
            return

          alert("Success")
          @setState(progress: null, open: false)

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

    # Determine which columns are replace-able. Excludes subtables and aggregates
    replaceColumns = _.filter(@props.design.columns, (column) -> not column.subtable and exprUtils.getExprAggrStatus(column.expr) == "individual")
    replaceColumnOptions = _.map(replaceColumns, (column) => { value: column.id, label: column.label or exprUtils.summarizeExpr(column.expr, @props.design.locale)})

    # Show progress
    if @state.progress?
      return H.div null,
        H.h3 null, "Working..."
        H.div className: 'progress',
          H.div className: 'progress-bar', style: { width: "#{@state.progress}%" }

    H.div null,
      H.div key: "replace", className: "form-group",
        H.label null, "Replace: "
        H.select value: @state.replaceColumn, onChange: ((ev) => @setState(replaceColumn: ev.target.value)), className: "form-control",
          H.option key: "_none", value: "", "Select..."
          _.map(replaceColumnOptions, (option) => H.option(key: option.value, value: option.value, option.label))

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
            placeholder: "Blank"

      if @state.replaceColumn
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

      if @state.replaceColumn
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
          disabled: not @state.replaceColumn or @state.progress?
          onClick: => @performReplace()
          className: "btn btn-primary",
            "Apply"
      ],
        @renderContents()
