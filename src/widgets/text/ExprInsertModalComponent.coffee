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
    onInsert: React.PropTypes.func.isRequired   # Called with expr to insert

  constructor: ->
    super

    @state = {
      open: false
      expr: null
      table: null
    }

  open: ->
    @setState(open: true, expr: null)

  handleTableChange: (table) => @setState(table: table)

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
            aggrStatuses: ["literal", "aggregate"]
            onChange: (expr) => @setState(expr: expr)


  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      size: "large"
      actionLabel: "Insert"
      onAction: => 
        # Close first to avoid strange effects when mixed with pojoviews
        @setState(open: false, =>
          @props.onInsert(@state.expr)
        )
      onCancel: => @setState(open: false)
      title: "Insert Field",
        @renderContents()
