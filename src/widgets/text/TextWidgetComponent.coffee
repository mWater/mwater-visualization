React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

RichTextComponent = require '../../richtext/RichTextComponent'
ExprInsertModalComponent = require './ExprInsertModalComponent'
ExprUpdateModalComponent = require './ExprUpdateModalComponent'

ExprItemsHtmlConverter = require '../../richtext/ExprItemsHtmlConverter'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

module.exports = class TextWidgetComponent extends AsyncLoadComponent
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    filters: React.PropTypes.array
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row

  constructor: (props) ->
    super(props)

    @state = {
      # Map of expression id to expression value
      exprValues: {}
      error: null
    }

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    # Get expression items recursively
    getExprItems = (items) ->
      exprItems = []
      for item in (items or [])
        if item.type == "expr"
          exprItems.push(item)
        if item.items
          exprItems = exprItems.concat(getExprItems(item.items))
      return exprItems    

    # Reload if filters or expressions have changed
    return not _.isEqual(newProps.filters, oldProps.filters) or not _.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Get data
    props.widgetDataSource.getData(props.design, props.filters, (error, data) =>
      callback(error: error, exprValues: data or {})
    )

  createItemsHtmlConverter: ->
    # If loading, don't display old values
    exprValues = if not @state.loading then @state.exprValues else {}

    # Display summaries if in design more and singleRowTable is set
    return new ExprItemsHtmlConverter(@props.schema, @props.onDesignChange?, exprValues, @props.onDesignChange? and @props.singleRowTable?)

  handleItemsChange: (items) =>
    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  handleInsertExpr: (item) =>
    html = '''<div data-embed="''' + _.escape(JSON.stringify(item)) + '''"></div>'''

    @refs.editor.pasteHTML(html)

  replaceItem: (item) ->
    replaceItemInItems = (items, item) ->
      return _.map(items, (i) ->
        if i.id == item.id
          return item
        else if i.items
          return _.extend({}, i, items: replaceItemInItems(i.items, item))
        else
          return i
        )

    items = replaceItemInItems(@props.design.items or [], item)
    @props.onDesignChange(_.extend({}, @props.design, items: items))

  handleItemClick: (item) =>
    @refs.exprUpdateModal.open(item, (item) =>
      # Replace in items
      @replaceItem(item)
    )

  handleAddExpr: (ev) =>
    ev.preventDefault()
    @refs.exprInsertModal.open()

  renderExtraPaletteButtons: ->
    H.div key: "expr", className: "mwater-visualization-text-palette-item", onMouseDown: @handleAddExpr,
      H.i className: "fa fa-plus"
      " Field"

  renderModals: ->
    [
      R ExprInsertModalComponent, key: "exprInsertModal", ref: "exprInsertModal", schema: @props.schema, dataSource: @props.dataSource, onInsert: @handleInsertExpr, singleRowTable: @props.singleRowTable
      R ExprUpdateModalComponent, key: "exprUpdateModal", ref: "exprUpdateModal", schema: @props.schema, dataSource: @props.dataSource, singleRowTable: @props.singleRowTable
    ]
  
  render: ->
    style = { 
      position: "relative"
    }

    # Handle scaled case
    if @props.standardWidth and @props.standardWidth != @props.width
      style.width = @props.standardWidth
      style.height = @props.height * (@props.standardWidth / @props.width)
      style.transform = "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
      style.transformOrigin = "0 0"
    else
      style.width = @props.width
      style.height = @props.height

    return H.div null,
      @renderModals()
      R RichTextComponent,
        ref: "editor"
        className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}"
        style: style
        items: @props.design.items
        onItemsChange: if @props.onDesignChange then @handleItemsChange
        onItemClick: @handleItemClick
        itemsHtmlConverter: @createItemsHtmlConverter()
        includeHeadings: @props.design.style != "title"
        extraPaletteButtons: @renderExtraPaletteButtons()
