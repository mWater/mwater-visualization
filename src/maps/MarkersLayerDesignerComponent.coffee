_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
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
  update: (updates) ->
    @props.onDesignChange(_.extend({}, @props.design, updates))

  # Update axes with specified changes
  updateAxes: (changes) ->
    axes = _.extend({}, @props.design.axes, changes)
    @update(axes: axes)

  handleTableChange: (table) => @update(table: table)
  handleGeometryAxisChange: (axis) => @updateAxes(geometry: axis)
  handleColorAxisChange: (axis) => @updateAxes(color: axis)
  handleFilterChange: (expr) => @update(filter: expr)
  handleColorChange: (color) => @update(color: color)
  handleSymbolChange: (symbol) => @update(symbol: symbol)
  handleNameChange: (e) => @update(name: e.target.value)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })
  
  renderGeometryAxis: ->
    if not @props.design.table
      return

    title = H.span null,
      H.span className: "glyphicon glyphicon-map-marker"
      " Marker Position"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          types: ["geometry"]
          aggrNeed: "none"
          value: @props.design.axes.geometry
          onChange: @handleGeometryAxisChange)

  renderColorAxis: ->
    if not @props.design.axes.geometry
      return

    title = H.span null,
      H.span className: "glyphicon glyphicon glyphicon-tint"
      " Color By"

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        R(AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.design.table
          types: ["text", "enum", "boolean"]
          aggrNeed: "none"
          value: @props.design.axes.color
          showColorMap: true
          onChange: @handleColorAxisChange)

  renderColor: ->
    if not @props.design.axes.geometry
      return

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span className: "glyphicon glyphicon glyphicon-tint"
        if @props.design.axes.color then " Default Color" else " Color"
      H.div style: { marginLeft: 8 }, 
        R(ColorComponent, color: @props.design.color, onChange: @handleColorChange)

  renderSymbol: ->
    if not @props.design.axes.geometry
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
      R ReactSelect, {
        placeholder: "Circle"
        value: @props.design.symbol
        options: options
        optionRenderer: optionRenderer
        valueRenderer: optionRenderer
        onChange: @handleSymbolChange
      }

  renderFilter: ->
    # If no data, hide
    if not @props.design.axes.geometry
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " Filters"
      H.div style: { marginLeft: 8 }, 
        R(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

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
#      @renderName()
      @renderTable()
      @renderGeometryAxis()
      @renderColor()
      @renderColorAxis()
      @renderSymbol()
      @renderFilter()
      R EditPopupComponent, design: @props.design, onChange: @props.onChange, schema: @props.schema, dataSource: @props.dataSource


# Modal for editing design of popup
ModalWindowComponent = require 'react-library/lib/ModalWindowComponent'
BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
WidgetFactory = require '../widgets/WidgetFactory'
DirectWidgetDataSource = require '../widgets/DirectWidgetDataSource'

class EditPopupComponent extends React.Component
  constructor: ->
    super
    @state = { editing: false }

  handleItemsChange: (items) =>
    popup = @props.design.popup or {}
    popup = _.extend({}, popup, items: items)
    design = _.extend({}, @props.design, popup: popup)
    @props.onChange(design)

  render: ->
    H.div null, 
      H.a className: "btn btn-link", onClick: (=> @setState(editing: true)),
        "Customize Popup"
      if @state.editing
        R ModalWindowComponent, isOpen: true, onRequestClose: (=> @setState(editing: false)),
          new BlocksLayoutManager().renderLayout({
            items: @props.design.popup?.items
            onItemsChange: @handleItemsChange
            renderWidget: (options) =>
              # TODO abstract to popup renderer in map data source
              widget = WidgetFactory.createWidget(options.type)

              widgetDataSource = new DirectWidgetDataSource({
                apiUrl: "https://api.mwater.co/v3/" # TODO
                widget: widget
                design: options.design
                schema: @props.schema
                dataSource: @props.dataSource
                client: null # TODO
              })

              return widget.createViewElement({
                schema: @props.schema
                dataSource: @props.dataSource
                # TODO get widget data source for map
                widgetDataSource: widgetDataSource
                design: options.design
                scope: null
                filters: []
                onScopeChange: null
                onDesignChange: options.onDesignChange
                width: null
                height: null
                standardWidth: null
              })  
            })

