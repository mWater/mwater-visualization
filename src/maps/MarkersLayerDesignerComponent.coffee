React = require 'react'
H = React.DOM
LogicalExprComponent = require '../expressions/LogicalExprComponent'
ExpressionBuilder = require '../expressions/ExpressionBuilder'
EditableLinkComponent = require '../EditableLinkComponent'
AxisComponent = require './../axes/AxisComponent'
ColorComponent = require '../ColorComponent'

# Designer for a markers layer
module.exports = class MarkersLayerDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  # Apply updates to design
  updateDesign: (updates) ->
    @props.onDesignChange(_.extend({}, @props.design, updates))

  handleSublayerChange: (index, sublayer) =>
    sublayers = @props.design.sublayers.slice()
    sublayers[index] = sublayer
    @updateDesign(sublayers: sublayers)

  handleRemoveSublayer: (index) =>
    sublayers = @props.design.sublayers.slice()
    sublayers.splice(index, 1)
    @updateDesign(sublayers: sublayers)

  handleAddSublayer: =>
    sublayers = @props.design.sublayers.slice()
    sublayers.push({})
    @updateDesign(sublayers: sublayers)

  renderSublayer: (index) =>
    style = {
      borderTop: "solid 1px #EEE"
      paddingTop: 10
      paddingBottom: 10
    }

    H.div style: style, key: index,
      React.createElement(MarkersLayerSublayerDesignerComponent, {
        schema: @props.schema
        dataSource: @props.dataSource
        sublayer: @props.design.sublayers[index]
        onChange: @handleSublayerChange.bind(null, index)
        onRemove: if index > 0 then @handleRemoveSublayer.bind(null, index)
        })

  renderSublayers: ->
    H.div null, 
      _.map(@props.design.sublayers, (layer, i) => @renderSublayer(i))
      H.button className: "btn btn-default", type: "button", onClick: @handleAddSublayer,
        H.span className: "glyphicon glyphicon-plus"
        " Add Series"

  render: ->
    H.div null, 
      @renderSublayers()
      H.hr()

# Designer for a markers layer sublayer
class MarkersLayerSublayerDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    sublayer: React.PropTypes.object.isRequired  # Design of the sublayer
    onChange: React.PropTypes.func.isRequired # Called with new sublayer
    onRemove: React.PropTypes.func

  # Apply updates to sublayer
  update: (updates) ->
    @props.onChange(_.extend({}, @props.sublayer, updates))

  # Update axes with specified changes
  updateAxes: (changes) ->
    axes = _.extend({}, @props.sublayer.axes, changes)
    @update(axes: axes)

  handleTableChange: (table) => @update(table: table)
  handleGeometryAxisChange: (axis) => @updateAxes(geometry: axis)
  handleFilterChange: (expr) => @update(filter: expr)
  handleColorChange: (color) => @update(color: color)

  renderRemove: ->
    if @props.onRemove
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-file")
        " "
        "Data Source"
      ": "
      @props.schema.createTableSelectElement(@props.sublayer.table, @handleTableChange)
  
  renderGeometryAxis: ->
    if not @props.sublayer.table
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
          dataSource: @props.dataSource
          table: @props.sublayer.table
          types: ["geometry"]
          aggrNeed: "none"
          value: @props.sublayer.axes.geometry
          onChange: @handleGeometryAxisChange)

  renderColor: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Color"
      H.div style: { marginLeft: 8 }, 
        React.createElement(ColorComponent, color: @props.sublayer.color, onChange: @handleColorChange)

  renderFilter: ->
    # If no table, hide
    if not @props.sublayer.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Filters"
      H.div style: { marginLeft: 8 }, 
        React.createElement(LogicalExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.sublayer.table
          value: @props.sublayer.filter)

  render: ->
    H.div null,
      @renderRemove()
      @renderTable()
      @renderGeometryAxis()
      @renderColor()
      @renderFilter()

