_ = require 'lodash'
React = require 'react'
H = React.DOM

ExpressionBuilder = require './../../expressions/ExpressionBuilder'
AxisBuilder = require './../../expressions/axes/AxisBuilder'
EditableLinkComponent = require './../../EditableLinkComponent'
PopoverComponent = require './../../PopoverComponent'
ScalarExprComponent = require './../../expressions/ScalarExprComponent'

module.exports = class TableChartDesignerComponent extends React.Component
  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTitleTextChange: (ev) =>  @updateDesign(titleText: ev.target.value)
  handleTableChange: (table) => @updateDesign(table: table)

  handleColumnChange: (index, column) =>
    columns = @props.design.columns.slice()
    columns[index] = column
    @updateDesign(columns: columns)

  handleRemoveColumn: (index) =>
    columns = @props.design.columns.slice()
    columns.splice(index, 1)
    @updateDesign(columns: columns)

  handleAddColumn: =>
    columns = @props.design.columns.slice()
    columns.push({})
    @updateDesign(columns: columns)

  renderTable: ->
    # Popover removed due to problems positioning in modal window
    popover = null
    # if not @props.design.table
    #   popover = "Start by selecting a data source"

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-file")
        " "
        "Data Source"
      ": "
      React.createElement PopoverComponent, html: popover, 
        React.createElement(EditableLinkComponent, 
          dropdownItems: @props.schema.getTables()
          onDropdownItemClicked: @handleTableChange
          onRemove: if @props.design.table then @handleTableChange.bind(this, null)
          if @props.design.table then @props.schema.getTable(@props.design.table).name else H.i(null, "Select...")
          )

  renderTitle: ->
    H.div className: "form-group",
      H.label className: "text-muted", "Title"
      H.input type: "text", className: "form-control input-sm", value: @props.design.titleText, onChange: @handleTitleTextChange, placeholder: "Untitled"

  renderColumn: (index) ->
    style = {
      borderTop: "solid 1px #EEE"
      paddingTop: 10
      paddingBottom: 10
    }

    H.div key: index, style: style,
      React.createElement(TableChartColumnDesignerComponent, {
        design: @props.design
        schema: @props.schema
        index: index
        onChange: @handleColumnChange.bind(null, index)
        onRemove: @handleRemoveColumn.bind(null, index)
        })

  renderColumns: ->
    if not @props.design.table
      return

    return H.div className: "form-group",
      _.map(@props.design.columns, (column, i) => @renderColumn(i))
      H.button className: "btn btn-default btn-sm", type: "button", onClick: @handleAddColumn,
        H.span className: "glyphicon glyphicon-plus"
        " Add Column"

  render: ->
    H.div null,
      @renderTable()
      @renderColumns()
      H.hr()
      @renderTitle()

class TableChartColumnDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    index: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired

  # Updates column with the specified changes
  updateColumn: (changes) ->
    column = _.extend({}, @props.design.columns[@props.index], changes)
    @props.onChange(column)

  updateTextAxis: (changes) ->
    textAxis = _.extend({}, @props.design.columns[@props.index].textAxis, changes)
    @updateColumn(textAxis: textAxis)

  handleExprChange: (expr) => @updateTextAxis(expr: expr)
  handleHeaderTextChange: (ev) => @updateColumn(headerText: ev.target.value)
  handleAggrChange: (aggr) => @updateTextAxis(aggr: aggr)

  renderRemove: ->
    if @props.design.columns.length > 1
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderExpr: ->
    column = @props.design.columns[@props.index]

    title = "Value"

    H.div null,
      H.label className: "text-muted", title
      ": "
      React.createElement(ScalarExprComponent, 
        editorTitle: title
        schema: @props.schema 
        table: @props.design.table
        value: column.expr
        includeCount: true # Can include simple counts
        onChange: @handleExprChange)

  renderHeader: ->
    column = @props.design.columns[@props.index]

    axisBuilder = new AxisBuilder(schema: @props.schema)
    placeholder = axisBuilder.summarizeAxis(column.textAxis)

    H.div null,
      H.label className: "text-muted", "Header"
      ": "
      H.input 
        type: "text"
        className: "form-control input-sm"
        style: { display: "inline-block", width: "15em" }
        value: column.headerText
        onChange: @handleHeaderTextChange
        placeholder: placeholder

  renderAggr: ->
    column = @props.design.columns[@props.index]
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Don't show if no expression or if has no type (count)
    if not column.textAxis.expr or not exprBuilder.getExprType(column.textAxis.expr)
      return

    # Get aggregations
    aggrs = exprBuilder.getAggrs(column.textAxis.expr)

    # Remove latest, as it is tricky to group by. TODO
    aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")
    aggrs = [{ id: null, name: "None" }].concat(aggrs)
    currentAggr = _.findWhere(aggrs, id: column.textAxis.aggr)

    return H.div null,
      H.label className: "text-muted", "Summarize"
      ": "
      React.createElement(EditableLinkComponent, 
        dropdownItems: aggrs
        onDropdownItemClicked: @handleAggrChange
        if currentAggr then currentAggr.name else "None"
      )

  render: ->
    H.div null, 
      @renderRemove()
      H.label null, "Column #{@props.index+1}"
      H.div style: { marginLeft: 5 }, 
        @renderExpr()
        @renderHeader()
        @renderAggr()
