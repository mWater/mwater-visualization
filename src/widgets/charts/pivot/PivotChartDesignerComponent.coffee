PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
uuid = require 'uuid'

ui = require 'react-library/lib/bootstrap'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
TableSelectComponent = require '../../../TableSelectComponent'
AxisComponent = require '../../../axes/AxisComponent'

# Designer for overall chart. Has a special setup mode first time it is run
module.exports = class PivotChartDesignerComponent extends React.Component
  @propTypes: 
    design: PropTypes.object.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

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
    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R('i', className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R TableSelectComponent, { 
        schema: @props.schema
        value: @props.design.table
        onChange: @handleTableChange 
        filter: @props.design.filter
        onFilterChange: @handleFilterChange
      }

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R('span', className: "glyphicon glyphicon-filter")
        " "
        "Filters"
      R 'div', style: { marginLeft: 8 }, 
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
        R 'label', key: "none", className: "radio-inline",
          R 'input', type: "radio", checked: not @props.design.striping, onClick: => @updateDesign(striping: null)
          "None"

        R 'label', key: "columns", className: "radio-inline",
          R 'input', type: "radio", checked: @props.design.striping == "columns", onClick: => @updateDesign(striping: "columns")
          "Columns"

        R 'label', key: "rows", className: "radio-inline",
          R 'input', type: "radio", checked: @props.design.striping == "rows", onClick: => @updateDesign(striping: "rows")
          "Rows"

  # Show setup options
  renderSetup: ->
    intersectionId = "#{@props.design.rows[0].id}:#{@props.design.columns[0].id}"

    R 'div', null,
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
            filters: @props.filters

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
            filters: @props.filters


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
            onChange: @handleIntersectionValueAxisChange
            showFormat: true
            filters: @props.filters

  render: ->
    R 'div', null,
      @renderTable()
      if @state.isNew and @props.design.table
        @renderSetup()
      @renderFilter()
      @renderStriping()
