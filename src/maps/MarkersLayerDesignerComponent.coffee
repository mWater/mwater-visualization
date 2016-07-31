_ = require 'lodash'
React = require 'react'
H = React.DOM
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
AxisComponent = require './../axes/AxisComponent'
ColorComponent = require '../ColorComponent'
TableSelectComponent = require '../TableSelectComponent'
ReactSelect = require 'react-select'

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
      borderBottom: "solid 1px #EEE"
      paddingTop: 10
      paddingBottom: 10
      marginBottom: 10
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
      # Add if previous has table
      if _.last(@props.design.sublayers) and _.last(@props.design.sublayers).table
        H.button className: "btn btn-default btn-sm", type: "button", onClick: @handleAddSublayer,
          H.span className: "glyphicon glyphicon-plus"
          " Add Series"

  render: ->
    H.div null, 
      @renderSublayers()

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
  handleColorAxisChange: (axis) => @updateAxes(color: axis)
  handleFilterChange: (expr) => @update(filter: expr)
  handleColorChange: (color) => @update(color: color)
  handleSymbolChange: (symbol) => @update(symbol: symbol)
  handleNameChange: (e) => @update(name: e.target.value)

  renderRemove: ->
    if @props.onRemove
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      React.createElement(TableSelectComponent, { schema: @props.schema, value: @props.sublayer.table, onChange: @handleTableChange })
  
  renderGeometryAxis: ->
    if not @props.sublayer.table
      return

    title = H.span null,
      H.span className: "glyphicon glyphicon-map-marker"
      " Marker Position"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        React.createElement(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.sublayer.table
          types: ["geometry"]
          aggrNeed: "none"
          value: @props.sublayer.axes.geometry
          onChange: @handleGeometryAxisChange)

  renderColorAxis: ->
    if not @props.sublayer.axes.geometry
      return

    title = H.span null,
      H.span className: "glyphicon glyphicon glyphicon-tint"
      " Color By"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        React.createElement(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.sublayer.table
          types: ["text", "enum", "boolean"]
          aggrNeed: "none"
          value: @props.sublayer.axes.color
          showColorMap: true
          onChange: @handleColorAxisChange)

  renderColor: ->
    if not @props.sublayer.axes.geometry
      return

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span className: "glyphicon glyphicon glyphicon-tint"
        if @props.sublayer.axes.color then " Default Color" else " Color"
      H.div style: { marginLeft: 8 }, 
        React.createElement(ColorComponent, color: @props.sublayer.color, onChange: @handleColorChange)

  renderSymbol: ->
    if not @props.sublayer.axes.geometry
      return

    # Create options
    options = [
      { value: "font-awesome/star", label: "Star" }
      { value: "font-awesome/square", label: "Square" }
      { value: "font-awesome/check", label: "Check" }
      { value: "font-awesome/check-circle", label: "Check Circle" }
      { value: "font-awesome/times", label: "Removed" }
      { value: "font-awesome/ban", label: "Ban" }
      { value: "font-awesome/crosshairs", label: "Crosshairs" }
      { value: "font-awesome/flask", label: "Flask" }
      { value: "font-awesome/info-circle", label: "Info Circle" }
      { value: "font-awesome/male", label: "Male" }
      { value: "font-awesome/female", label: "Female" }
      { value: "font-awesome/user", label: "Person" }
      { value: "font-awesome/users", label: "Group" }
      { value: "font-awesome/home", label: "Home" }
      { value: "font-awesome/wheelchair", label: "Wheelchair" }
      { value: "font-awesome/h-square", label: "Hospital Symbol" }
    ]

    optionRenderer = (option) ->
      return H.span null,
        H.i className: "fa fa-#{option.value.substr(13)}" # Trim "font-awesome/"
        " #{option.label}"

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "fa fa-star")
        " "
        "Symbol"
      React.createElement ReactSelect, {
        placeholder: "Circle"
        value: @props.sublayer.symbol
        options: options
        optionRenderer: optionRenderer
        valueRenderer: optionRenderer
        onChange: @handleSymbolChange
      }

  renderFilter: ->
    # If no data, hide
    if not @props.sublayer.axes.geometry
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Filters"
      H.div style: { marginLeft: 8 }, 
        React.createElement(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.sublayer.table
          value: @props.sublayer.filter)

  renderName: ->
    return H.div className: "form-group",
      H.label className: "text-muted",
        H.span(className: "fa fa-tag")
        " "
        "Name"
      H.div style: { marginLeft: 8 },
        H.input {type: 'text', value: @props.sublayer.name, onChange: @handleNameChange, className: 'form-control'}

  render: ->
    H.div null,
      @renderRemove()
      @renderName()
      @renderTable()
      @renderGeometryAxis()
      @renderColor()
      @renderColorAxis()
      @renderSymbol()
      @renderFilter()

