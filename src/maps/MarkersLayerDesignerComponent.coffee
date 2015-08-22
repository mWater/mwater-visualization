React = require 'react'
H = React.DOM
LogicalExprComponent = require '../expressions/LogicalExprComponent'
ExpressionBuilder = require '../expressions/ExpressionBuilder'
EditableLinkComponent = require '../EditableLinkComponent'
AxisComponent = require './../expressions/axes/AxisComponent'

ColorPicker = require('react-color')

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
  handleColorChange: (color) => @update(color: color)

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

  renderColor: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Color"
      H.div style: { marginLeft: 8 }, 
        React.createElement(ColorComponent, color: @props.design.color, onChange: @handleColorChange)

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
      @renderColor()
      @renderFilter()

class ColorComponent extends React.Component
  @propTypes: 
    color: React.PropTypes.string
    onChange: React.PropTypes.func

  constructor: ->
    super
    @state = { open: false }

  handleClick: =>
    @setState(open: not @state.open)

  handleClose: (color) =>
    @setState(open: false)
    @props.onChange("#" + color.hex)

  render: ->
    style = {
      height: 30
      width: 30
      border: "solid 2px #888"
      borderRadius: 4
      backgroundColor: @props.color
    }

    popupPosition = {
      position: 'absolute'
      top: 0
      left: 30
    }

    H.div style: { position: "relative" },
      H.div(style: style, onClick: @handleClick)
      React.createElement(ColorPicker, display: @state.open, positionCSS: popupPosition, onClose: @handleClose)


