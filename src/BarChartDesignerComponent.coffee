React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ScalarExprComponent = require './ScalarExprComponent'
LogicalExprComponent = require './LogicalExprComponent'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './EditableLinkComponent'
BarChart = require './BarChart'

module.exports = class BarChartDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired

  handleTableChange: (table) =>
    @updateDesign(table: table)

  handleAestheticChange: (aes, val) =>
    aesthetics = _.clone(@props.design.aesthetics)
    aesthetics[aes] = val
    @updateDesign(aesthetics: aesthetics)

  handleFilterChange: (val) =>
    @updateDesign(filter: val)

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  # renderYAxis: ->
  #   H.div className: "form-group",
  #     H.label null, "Bar size"
  #     H.div null, 
  #       React.createElement(ScalarExprComponent, 
  #         editorTitle: "Bar size"
  #         schema: @props.schema
  #         onChange: @handleYAxisChange
  #         value: @props.value.yAxis)
  #     H.p className: "help-block", "Field to use for the size of the bars"

  # renderXAxis: ->
  #   # If no y axis, hide
  #   if not @props.value.yAxis
  #     return null

  #   # Expression is limited to same table as y-axis
  #   return H.div className: "form-group",
  #     H.label null, "Group By"
  #     H.div null, 
  #       React.createElement(ScalarExprComponent, 
  #         editorTitle: "Group By"
  #         schema: @props.schema
  #         table: @props.value.yAxis.table
  #         onChange: @handleXAxisChange
  #         value: @props.value.xAxis)
  #     H.p className: "help-block", "Field to group by"

  renderTable: ->
    return H.div className: "form-group",
      H.label null, "Table"
      H.div null, 
       React.createElement(EditableLinkComponent, 
          dropdownItems: @props.schema.getTables()
          onDropdownItemClicked: @handleTableChange
          onRemove: @handleTableChange.bind(this, null)
          if @props.design.table then @props.schema.getTable(@props.design.table).name else H.i(null, "Select...")
          )
        # React.createElement(ReactSelect, { 
        #   value: @props.design.table, 
        #   options: _.map(@props.schema.getTables(), (t) => { value: t.id, label: t.name }) 
        #   onChange: @handleTableChange
        # })


  renderXAesthetic: ->
    React.createElement(AestheticComponent, 
      title: "Category (X) Axis"
      schema: @props.schema, 
      table: @props.design.table
      types: ["enum", "text"]
      value: @props.design.aesthetics.x, 
      onChange: @handleAestheticChange.bind(this, "x"))

  renderYAesthetic: ->
    React.createElement(AestheticComponent, 
      title: "Value (Y) Axis"
      schema: @props.schema, 
      table: @props.design.table
      # types: ["decimal", "integer"]
      # TODO should limit aggregated value to numeric
      aggrRequired: true
      value: @props.design.aesthetics.y
      onChange: @handleAestheticChange.bind(this, "y"))

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label null, "Filter"
      React.createElement(LogicalExprComponent, 
        schema: @props.schema
        onChange: @handleFilterChange
        table: @props.design.table
        value: @props.design.filter)

  render: ->
    H.div null,
      # if error 
      #   H.div className: "text-warning", 
      #     H.span className: "glyphicon glyphicon-info-sign"
      #     " "
      #     error
      @renderTable()
      if @props.design.table
        [
          @renderXAesthetic()
          @renderYAesthetic()
          @renderFilter()
        ]

class AestheticComponent extends React.Component
  @propTypes:
    title: React.PropTypes.string.isRequired # Title for display and popups
    schema: React.PropTypes.object.isRequired # schema to use

    table: React.PropTypes.string # Limits table to this table
    types: React.PropTypes.array # Optional types to limit to

    value: React.PropTypes.object # Current value of expression
    onChange: React.PropTypes.func.isRequired # Called when changes
    aggrRequired: React.PropTypes.bool # True to require aggregation

  handleExprChange: (expr) =>
    @props.onChange(_.extend({}, @props.value, { expr: expr }))

  handleAggrChange: (aggr) =>
    @props.onChange(_.extend({}, @props.value, { aggr: aggr }))

  renderAggr: ->
    if @props.value and @props.aggrRequired and @props.value.expr
      exprBuilder = new ExpressionBuilder(@props.schema)
      aggrs = exprBuilder.getAggrs(@props.value.expr)

      # Remove latest, as it is tricky to group by. TODO
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")
      currentAggr = _.findWhere(aggrs, id: @props.value.aggr)

      # Do not display number of for id column
      if exprBuilder.getExprType(@props.value.expr) == "id"
        return

      return React.createElement(EditableLinkComponent, 
        dropdownItems: aggrs
        onDropdownItemClicked: @handleAggrChange
        if currentAggr then currentAggr.name + " of\u00A0"
        )

  render: ->
    return H.div className: "form-group",
      H.label null, @props.title
      H.div null, 
        @renderAggr()
        React.createElement(ScalarExprComponent, 
          editorTitle: @props.title
          schema: @props.schema
          table: @props.table
          types: @props.types # TODO
          onChange: @handleExprChange
          value: if @props.value then @props.value.expr)