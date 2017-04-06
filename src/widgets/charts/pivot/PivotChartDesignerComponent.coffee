React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'uuid'

ui = require 'react-library/lib/bootstrap'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
TableSelectComponent = require '../../../TableSelectComponent'
AxisComponent = require '../../../axes/AxisComponent'

# Designer for overall chart. Has a special setup mode first time it is run
module.exports = class PivotChartDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  constructor: (props) ->
    super

    @state = {
      isNew: not props.design.table  # True if new pivot table
    }

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTableChange: (table) => 
    # Create default
    row = { id: uuid(), label: "" }
    column = { id: uuid(), label: "" }

    intersections = {}
    intersections["#{row.id}:#{column.id}"] = { valueAxis: { expr: { type: "op", op: "count", table: table, exprs: [] }}}

    @updateDesign({
      table: table
      rows: [row]
      columns: [column]
      intersections: intersections
    })

  handleColumnChange: (axis) =>
    @updateDesign(columns: [_.extend({}, @props.design.columns[0], valueAxis: axis)])

  handleRowChange: (axis) =>
    @updateDesign(rows: [_.extend({}, @props.design.rows[0], valueAxis: axis)])

  handleFilterChange: (filter) => @updateDesign(filter: filter)

  handleIntersectionValueAxisChange: (valueAxis) =>
    intersectionId = "#{@props.design.rows[0].id}:#{@props.design.columns[0].id}"

    intersections = {}
    intersections[intersectionId] = { valueAxis: valueAxis }
    @updateDesign(intersections: intersections)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " "
        "Filters"
      H.div style: { marginLeft: 8 }, 
        R(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  renderStriping: ->
    # If no table, hide
    if not @props.design.table
      return null

    R ui.FormGroup, 
      labelMuted: true
      label: "Striping",
        H.label key: "none", className: "radio-inline",
          H.input type: "radio", checked: not @props.design.striping, onClick: => @updateDesign(striping: null)
          "None"

        H.label key: "columns", className: "radio-inline",
          H.input type: "radio", checked: @props.design.striping == "columns", onClick: => @updateDesign(striping: "columns")
          "Columns"

        H.label key: "rows", className: "radio-inline",
          H.input type: "radio", checked: @props.design.striping == "rows", onClick: => @updateDesign(striping: "rows")
          "Rows"

  # Show setup options
  renderSetup: ->
    intersectionId = "#{@props.design.rows[0].id}:#{@props.design.columns[0].id}"

    H.div null,
      R ui.FormGroup,
        labelMuted: true
        label: "Columns"
        help: "Field to optionally make columns out of",
          R AxisComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.design.table
            types: ["enum", "text", "boolean", "date"]
            aggrNeed: "none"
            value: @props.design.columns[0].valueAxis
            onChange: @handleColumnChange

      R ui.FormGroup,
        labelMuted: true
        label: "Rows"
        help: "Field to optionally make rows out of",
          R AxisComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.design.table
            types: ["enum", "text", "boolean", "date"]
            aggrNeed: "none"
            value: @props.design.rows[0].valueAxis
            onChange: @handleRowChange


      R ui.FormGroup,
        labelMuted: true
        label: "Value"
        help: "Field show in cells",
          R AxisComponent, 
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.design.table
            types: ["enum", "text", "boolean", "date", "number"]
            aggrNeed: "required"
            value: @props.design.intersections[intersectionId].valueAxis
            onChange: @handleIntersectionAxisUpdate
            showFormat: true

  render: ->
    H.div null,
      @renderTable()
      if @state.isNew and @props.design.table
        @renderSetup()
      @renderFilter()
      @renderStriping()
