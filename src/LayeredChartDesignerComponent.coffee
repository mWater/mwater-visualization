React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ScalarExprComponent = require './ScalarExprComponent'
AggrScalarExprComponent = require './AggrScalarExprComponent'
LogicalExprComponent = require './LogicalExprComponent'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './EditableLinkComponent'
PopoverComponent = require './PopoverComponent'

module.exports = class LayeredDesignerComponent extends React.Component
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

  handleLayerChange: (index, layer) =>
    layers = @props.design.layers.slice()
    layers[index] = layer
    @updateDesign(layers: layers)

  handleRemoveLayer: (index) =>
    layers = @props.design.layers.slice().splice(index, 1)
    @updateDesign(layers: layers)

  handleAddSeries: =>
    layers = @props.design.layers.slice()
    layers.push({})
    @updateDesign(layers: layers)

  renderTitle: ->
    H.div className: "form-group",
      H.label className: "text-muted", "Title"
      H.input type: "text", className: "form-control", value: @props.design.titleText, onChange: @handleTitleChange, placeholder: "Untitled"

  renderLayer: (index) =>
    style = {
      borderTop: "solid 1px #AAA"
      borderBottom: "solid 1px #AAA"
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
      H.button className: "btn btn-link btn-sm", type: "button", onClick: @handleAddSeries,
        H.span className: "glyphicon glyphicon-plus"
        " Add Series"

  render: ->
    H.div null, 
      @renderTitle()
      @renderLayers()


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


  render: ->
    H.div null, 
      @renderRemove()
      @renderName()
      @renderTable()

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
