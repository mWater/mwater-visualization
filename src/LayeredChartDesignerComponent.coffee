React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ScalarExprComponent = require './ScalarExprComponent'
AggrScalarExprComponent = require './AggrScalarExprComponent'
LogicalExprComponent = require './LogicalExprComponent'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './EditableLinkComponent'
PopoverComponent = require './PopoverComponent'

module.exports = class LayeredChartDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTitleChange: (ev) =>
    @updateDesign(titleText: ev.target.value)

  handleTypeChange: (type) =>
    @updateDesign(type: type)

  handleTransposeChange: (val) =>
    @updateDesign(transpose: val)

  handleLayerChange: (index, layer) =>
    layers = @props.design.layers.slice()
    layers[index] = layer
    @updateDesign(layers: layers)

  handleRemoveLayer: (index) =>
    layers = @props.design.layers.slice()
    layers.splice(index, 1)
    @updateDesign(layers: layers)

  handleAddSeries: =>
    layers = @props.design.layers.slice()
    layers.push({})
    @updateDesign(layers: layers)

  renderTitle: ->
    H.div className: "form-group",
      H.label className: "text-muted", "Title"
      H.input type: "text", className: "form-control", value: @props.design.titleText, onChange: @handleTitleChange, placeholder: "Untitled"

  renderType: ->
    chartTypes =  [
      { id: "bar", name: "Bar Chart" }
      { id: "line", name: "Line Chart" }
      { id: "spline", name: "Smoothed Line Chart" }
      { id: "scatter", name: "Scatter Chart" }
      { id: "area", name: "Area Chart" }
    ]

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-th")
        " "
        "Type"
      ": "
      React.createElement(EditableLinkComponent, 
        dropdownItems: chartTypes
        onDropdownItemClicked: @handleTypeChange
        _.findWhere(chartTypes, { id: @props.design.type }).name
        )

  renderTranspose: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-retweet")
        " "
        "Orientation"
      ": "
      H.label className: "radio-inline",
        H.input type: "radio", checked: !@props.design.transpose, onChange: @handleTransposeChange.bind(null, false),
          "Vertical"
      H.label className: "radio-inline",
        H.input type: "radio", checked: @props.design.transpose, onChange: @handleTransposeChange.bind(null, true),
          "Horizontal"

  renderLayer: (index) =>
    style = {
      borderTop: "solid 1px #EEE"
      paddingTop: 10
      paddingBottom: 10
    }
    H.div style: style, 
      React.createElement(LayerDesignerComponent, {
        design: @props.design
        schema: @props.schema
        index: index
        onChange: @handleLayerChange.bind(null, index)
        onRemove: @handleRemoveLayer.bind(null, index)
        })

  renderLayers: ->
    H.div null, 
      _.map(@props.design.layers, (layer, i) => @renderLayer(i))
      H.button className: "btn btn-link", type: "button", onClick: @handleAddSeries,
        H.span className: "glyphicon glyphicon-plus"
        " Add Series"

  render: ->
    H.div null, 
      @renderType()
      @renderTranspose()
      @renderLayers()
      H.hr()
      @renderTitle()

class LayerDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    index: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired

  # Updates layer with the specified changes
  updateLayer: (changes) ->
    layer = _.extend({}, @props.design.layers[@props.index], changes)
    @props.onChange(layer)

  handleNameChange: (ev) =>
    @updateLayer(name: ev.target.value)

  handleTableChange: (table) =>
    @updateLayer(table: table)

  handleXExprChange: (expr) =>
    @updateLayer(xExpr: expr)

  handleColorExprChange: (expr) =>
    @updateLayer(colorExpr: expr)

  handleYExprChange: (expr) =>
    @updateLayer(yExpr: expr)

  handleYAggrExprChange: (val) =>
    @updateLayer(yExpr: val.expr, yAggr: val.aggr)

  handleStackedChange: (ev) =>
    @updateLayer(stacked: ev.target.checked)

  renderName: ->
    # Only if multiple
    if @props.design.layers.length <= 1
      return

    layer = @props.design.layers[@props.index]

    # H.div className: "form-group",
    #   H.label className: "text-muted", "Series Name"
    H.input type: "text", className: "form-control input-sm", value: layer.name, onChange: @handleNameChange, placeholder: "Series #{@props.index+1}"

  renderRemove: ->
    if @props.design.layers.length > 1
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderTable: ->
    layer = @props.design.layers[@props.index]

    if not layer.table
      popover = "Start by selecting a data source"

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
          onRemove: if layer.table then @handleTableChange.bind(this, null)
          if layer.table then @props.schema.getTable(layer.table).name else H.i(null, "Select...")
          )

  renderXAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = [H.span(className: "glyphicon glyphicon-resize-horizontal"), " Horizontal Axis"]

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        React.createElement(ScalarExprComponent, 
          editorTitle: title
          schema: @props.schema, 
          table: layer.table
          # types: ["enum", "text"]
          value: layer.xExpr, 
          onChange: @handleXExprChange)

  renderColorAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = [H.span(className: "glyphicon glyphicon-equalizer"), " Split Axis"]

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        React.createElement(ScalarExprComponent, 
          editorTitle: title
          schema: @props.schema, 
          table: layer.table
          types: ["enum", "text"]
          value: layer.colorExpr, 
          onChange: @handleColorExprChange)

  renderYAxis: ->
    layer = @props.design.layers[@props.index]
    if not layer.table
      return

    title = [H.span(className: "glyphicon glyphicon-resize-vertical"), " Vertical Axis"]

    H.div className: "form-group",
      H.label className: "text-muted", title
      H.div style: { marginLeft: 10 }, 
        # TODO aggr and non-aggr
        React.createElement(AggrScalarExprComponent, 
          editorTitle: title
          schema: @props.schema, 
          table: layer.table
          types: ["integer", "decimal"]
          value: { expr: layer.yExpr, aggr: layer.yAggr }
          onChange: @handleYAggrExprChange)

  renderStacked: ->
    layer = @props.design.layers[@props.index]

    # Can only stack if coloring
    if not layer.colorExpr
      return

    H.div className: "checkbox",
      H.label null,
        H.input type: "checkbox", value: layer.stacked, onChange: @handleStackedChange,
          "Stacked"

  render: ->
    H.div null, 
      @renderRemove()
      @renderTable()
      @renderXAxis()
      @renderYAxis()
      @renderColorAxis()
      @renderStacked()
      @renderName()

#   handleTableChange: (table) =>
#     @updateDesign(table: table)

#   handleAestheticChange: (aes, val) =>
#     aesthetics = _.clone(@props.design.aesthetics)
#     aesthetics[aes] = val
#     @updateDesign(aesthetics: aesthetics)

#   handleFilterChange: (val) =>
#     @updateDesign(filter: val)

#   handleTitleChange: (ev) =>
#     annotations = _.clone(@props.design.annotations)
#     annotations.title = ev.target.value
#     @updateDesign(annotations: annotations)


#   renderTable: ->
#     if not @props.design.table
#       popover = "Start by selecting a data source"

#     return H.div className: "form-group",
#       H.label className: "text-muted", 
#         H.span(className: "glyphicon glyphicon-file")
#         " "
#         "Data Source"
#       ": "
#       React.createElement PopoverComponent, html: popover, 
#         React.createElement(EditableLinkComponent, 
#           dropdownItems: @props.schema.getTables()
#           onDropdownItemClicked: @handleTableChange
#           onRemove: @handleTableChange.bind(this, null)
#           if @props.design.table then @props.schema.getTable(@props.design.table).name else H.i(null, "Select...")
#           )

#   renderXAesthetic: ->
#     React.createElement(AestheticComponent, 
#       title: [H.span(className: "glyphicon glyphicon-resize-horizontal"), " Horizontal Axis"]
#       schema: @props.schema, 
#       table: @props.design.table
#       types: ["enum", "text"]
#       value: @props.design.aesthetics.x, 
#       onChange: @handleAestheticChange.bind(this, "x"))

#   renderYAesthetic: ->
#     React.createElement(AestheticComponent, 
#       title: [H.span(className: "glyphicon glyphicon-resize-vertical"), " Vertical Axis"]
#       schema: @props.schema, 
#       table: @props.design.table
#       # types: ["decimal", "integer"]
#       # TODO should limit aggregated value to numeric
#       aggrRequired: true
#       value: @props.design.aesthetics.y
#       onChange: @handleAestheticChange.bind(this, "y"))

#   renderFilter: ->
#     # If no table, hide
#     if not @props.design.table
#       return null

#     return H.div className: "form-group",
#       H.label className: "text-muted", 
#         H.span(className: "glyphicon glyphicon-filter")
#         " "
#         "Filters"
#       H.div style: { marginLeft: 8 }, 
#         React.createElement(LogicalExprComponent, 
#           schema: @props.schema
#           onChange: @handleFilterChange
#           table: @props.design.table
#           value: @props.design.filter)

#   renderTitle: ->
#     H.div className: "form-group",
#       H.label className: "text-muted", "Title"
#       H.input type: "text", className: "form-control", value: @props.design.annotations.title, onChange: @handleTitleChange, placeholder: "Untitled"

#   render: ->
#     H.div null,
#       # if error 
#       #   H.div className: "text-warning", 
#       #     H.span className: "glyphicon glyphicon-info-sign"
#       #     " "
#       #     error
#       @renderTable()
#       if @props.design.table
#         [
#           @renderXAesthetic()
#           @renderYAesthetic()
#           @renderFilter()
#         ]
#       H.hr()
#       @renderTitle()

# # Wraps a child with an optional popover
# class PopoverComponent extends React.Component
#   @propTypes: 
#     html: React.PropTypes.string # html to display
#     placement: React.PropTypes.string # See http://getbootstrap.com/javascript/#popovers

#   componentDidMount: ->
#     @updatePopover(@props, null)

#   componentWillUnmount: ->
#     @updatePopover(null, @props)

#   componentDidUpdate: (prevProps) ->
#     @updatePopover(@props, prevProps)

#   updatePopover: (props, oldProps) ->
#     # Destroy old popover
#     if oldProps and oldProps.html
#       $(React.findDOMNode(@refs.child)).popover("destroy")      
      
#     if props and props.html
#       $(React.findDOMNode(@refs.child)).popover({
#         content: props.html
#         html: true
#         trigger: "manual"
#         placement: @props.placement
#         })
#       $(React.findDOMNode(@refs.child)).popover("show")

#   render: ->
#     React.cloneElement(React.Children.only(@props.children), ref: "child")

# class AestheticComponent extends React.Component
#   @propTypes:
#     title: React.PropTypes.any.isRequired # Title for display and popups. Any element
#     schema: React.PropTypes.object.isRequired # schema to use

#     table: React.PropTypes.string # Limits table to this table
#     types: React.PropTypes.array # Optional types to limit to

#     value: React.PropTypes.object # Current value of expression
#     onChange: React.PropTypes.func.isRequired # Called when changes
#     aggrRequired: React.PropTypes.bool # True to require aggregation

#   handleExprChange: (expr) =>
#     @props.onChange(_.extend({}, @props.value, { expr: expr }))

#   handleExprAggrChange: (exprAggr) =>
#     @props.onChange(_.extend({}, @props.value, exprAggr))

#   renderComponent: ->
#     if @props.aggrRequired
#       return React.createElement(AggrScalarExprComponent,
#         editorTitle: @props.title
#         schema: @props.schema
#         table: @props.table
#         types: @props.types 
#         onChange: @handleExprAggrChange
#         value: if @props.value then @props.value)
#     else
#       return React.createElement(ScalarExprComponent, 
#         editorTitle: @props.title
#         schema: @props.schema
#         table: @props.table
#         types: @props.types 
#         onChange: @handleExprChange
#         value: if @props.value then @props.value.expr)    

#   render: ->
#     return H.div className: "form-group",
#       H.label className: "text-muted", @props.title
#       H.div style: { marginLeft: 10 }, 
#         @renderComponent()
