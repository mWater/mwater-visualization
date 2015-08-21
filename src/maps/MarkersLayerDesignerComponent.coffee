React = require 'react'
H = React.DOM
LogicalExprComponent = require '../expressions/LogicalExprComponent'
ExpressionBuilder = require '../expressions/ExpressionBuilder'
EditableLinkComponent = require '../EditableLinkComponent'
AxisComponent = require './../expressions/axes/AxisComponent'

# Designer for a markers layer
module.exports = class MarkersLayerDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  # Apply updates to design
  update: (updates) ->
    @props.onDesignChange(_.extend({}, @props.design, updates))

  # Update axes with specified changes
  updateAxes: (changes) ->
    axes = _.extend({}, @props.design.axes, changes)
    @update(axes: axes)

  handleTableChange: (table) => @update(table: table)
  handleGeometryAxisChange: (axis) => @updateAxes(geometry: axis)
  handleFilterChange: (expr) => @update(filter: expr)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-file")
        " "
        "Data Source"
      ": "
      React.createElement(EditableLinkComponent, 
        dropdownItems: @props.schema.getTables()
        onDropdownItemClicked: @handleTableChange
        onRemove: if @props.design.table then @handleTableChange.bind(this, null)
        if @props.design.table then @props.schema.getTable(@props.design.table).name else H.i(null, "Select...")
        )

  renderGeometryAxis: ->
    if not @props.design.table
      return

    title = H.span null,
      H.span className: ("glyphicon glyphicon-map-marker")
      " Marker Position"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        React.createElement(AxisComponent, 
          editorTitle: title
          schema: @props.schema
          table: @props.design.table
          types: ["geometry"]
          aggrNeed: "none"
          value: @props.design.axes.geometry
          onChange: @handleGeometryAxisChange)

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Filters"
      H.div style: { marginLeft: 8 }, 
        React.createElement(LogicalExprComponent, 
          schema: @props.schema
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  render: ->
    H.div null,
      @renderTable()
      @renderGeometryAxis()
      @renderFilter()

