PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

RichTextComponent = require '../../richtext/RichTextComponent'
ExprInsertModalComponent = require './ExprInsertModalComponent'
ExprUpdateModalComponent = require './ExprUpdateModalComponent'

ExprItemsHtmlConverter = require '../../richtext/ExprItemsHtmlConverter'

# Text component which is provided with the data it needs, rather than loading it.
# Used by TextWidgetComponent and also by other components that embed text fields
module.exports = class TextComponent extends React.Component
  @propTypes: 
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly
    
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use for chart
    exprValues: PropTypes.object.isRequired # Expression values

    width: PropTypes.number
    height: PropTypes.number
    standardWidth: PropTypes.number

    singleRowTable: PropTypes.string  # Table that is filtered to have one row
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  createItemsHtmlConverter: ->
    return new ExprItemsHtmlConverter(
      @props.schema, 
      @props.onDesignChange?, 
      @props.exprValues, 
      # Display summaries if in design more and singleRowTable is set
      @props.onDesignChange? and @props.singleRowTable?,
      # Only replace named strings if not editing
      if not @props.onDesignChange? then @props.namedStrings,
      @context.locale
    )

  handleItemsChange: (items) =>
    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  handleInsertExpr: (item) =>
    html = '''<div data-embed="''' + _.escape(JSON.stringify(item)) + '''"></div>'''

    @editor.pasteHTML(html)

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
    @exprUpdateModal.open(item, (item) =>
      # Replace in items
      @replaceItem(item)
    )

  handleAddExpr: (ev) =>
    ev.preventDefault()
    @exprInsertModal.open()

  renderExtraPaletteButtons: ->
    R 'div', key: "expr", className: "mwater-visualization-text-palette-item", onMouseDown: @handleAddExpr,
      R 'i', className: "fa fa-plus"
      " Field"

  renderModals: ->
    [
      R ExprInsertModalComponent, key: "exprInsertModal", ref: ((c) => @exprInsertModal = c), schema: @props.schema, dataSource: @props.dataSource, onInsert: @handleInsertExpr, singleRowTable: @props.singleRowTable
      R ExprUpdateModalComponent, key: "exprUpdateModal", ref: ((c) => @exprUpdateModal = c), schema: @props.schema, dataSource: @props.dataSource, singleRowTable: @props.singleRowTable
    ]
  
  refRichTextComponent: (c) => @editor = c
  
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

    return R 'div', null,
      @renderModals()
      R RichTextComponent,
        ref: @refRichTextComponent
        className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}"
        style: style
        items: @props.design.items
        onItemsChange: if @props.onDesignChange then @handleItemsChange
        onItemClick: @handleItemClick
        itemsHtmlConverter: @createItemsHtmlConverter()
        includeHeadings: @props.design.style == "default" or not @props.design.style
        extraPaletteButtons: @renderExtraPaletteButtons()
