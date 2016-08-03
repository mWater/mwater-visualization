React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

uuid = require 'node-uuid'

ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent
ExprInsertModalComponent = require './ExprInsertModalComponent'
ExprUpdateModalComponent = require './ExprUpdateModalComponent'

ItemsHtmlConverter = require './ItemsHtmlConverter'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'
ClickOutHandler = require('react-onclickout')

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

  constructor: (props) ->
    super(props)

    @state = {
      # Map of expression id to expression value
      exprValues: {}
      error: null
      focused: false
    }

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    return not _.isEqual(_.pick(newProps, "filters", "design"), _.pick(oldProps, "filters", "design"))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Get data
    props.widgetDataSource.getData(props.filters, (error, data) =>
      callback(error: error, exprValues: data or {})
    )

  createHtml: ->
    # If loading, don't display old values
    exprValues = if not @state.loading then @state.exprValues else {}

    new ItemsHtmlConverter(@props.schema, @props.onDesignChange?, exprValues).itemsToHtml(@props.design.items)

  handleChange: (elem) =>
    design = _.extend({}, @props.design, items: new ItemsHtmlConverter(@props.schema, @props.onDesignChange?, (if not @state.loading then @state.exprValues else {})).elemToItems(elem))
    if not _.isEqual(design, @props.design)
      @props.onDesignChange(design)
    else
      # Re-render as HTML may have been mangled and needs a round-trip
      @forceUpdate()

  handleFocus: => @setState(focused: true)
  handleClickOut: => @setState(focused: false)

  handleCommand: (command, ev) =>
    # Don't lose focus
    ev.preventDefault()
    document.execCommand(command)

  handleInsertExpr: (expr) =>
    @handleInsertEmbed({ type: "expr", id: uuid.v4(), expr: expr })

  # Put in an embedded item
  handleInsertEmbed: (item) =>
    @refs.contentEditable.pasteHTML('''
      <div data-embed="''' + _.escape(JSON.stringify(item)) + '''"></div>
    ''')

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

  handleClick: (ev) =>
    if ev.target.dataset?.embed
      item = JSON.parse(ev.target.dataset?.embed)
      @refs.exprUpdateModal.open(item.expr, (expr) =>
        item.expr = expr

        # Replace in items
        @replaceItem(item)
      )

  renderMenu: ->
    H.div key: "palette", className: "mwater-visualization-text-palette",
      H.div key: "bold", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "bold"),
        H.b null, "B"
      H.div key: "italic", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "italic"),
        H.i null, "I"
      H.div key: "underline", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "underline"),
        H.span style: { textDecoration: "underline" }, "U"
      H.div key: "justifyLeft", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyLeft"),
        H.i className: "fa fa-align-left"
      H.div key: "justifyCenter", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyCenter"),
        H.i className: "fa fa-align-center"
      H.div key: "justifyRight", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyRight"),
        H.i className: "fa fa-align-right"
      H.div key: "justifyFull", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyFull"),
        H.i className: "fa fa-align-justify"
      H.div key: "insertUnorderedList", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertUnorderedList"),
        H.i className: "fa fa-list-ul"
      H.div key: "insertOrderedList", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertOrderedList"),
        H.i className: "fa fa-list-ol"
      H.div key: "expr", className: "mwater-visualization-text-palette-item", onClick: (ev) =>
        @refs.exprInsertModal.open()
      , H.span(null, "f", H.sub(null, "x"))
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "undo"),
      #   H.i className: "fa fa-undo"
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "redo"),
      #   H.i className: "fa fa-repeat"
      # if @props.onStopEditing
      #   H.div className: "mwater-visualization-text-palette-item", onClick: @props.onStopEditing,
      #     "Close"

  renderModals: ->
    [
      R ExprInsertModalComponent, key: "exprInsertModal", ref: "exprInsertModal", schema: @props.schema, dataSource: @props.dataSource, onInsert: @handleInsertExpr
      R ExprUpdateModalComponent, key: "exprUpdateModal", ref: "exprUpdateModal", schema: @props.schema, dataSource: @props.dataSource
    ]
  
  renderHtml: ->
    if @props.onDesignChange?
      return H.div key: "contents", className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}", 
        R ContentEditableComponent, 
          ref: "contentEditable"
          style: { outline: "none" }
          html: @createHtml()
          onChange: @handleChange
          onClick: @handleClick
          onFocus: @handleFocus
        if not @props.design.items?[0]?
          H.div key: "placeholder", style: { color: "#DDD", position: "absolute", top: 0, left: 0 }, "Click to Edit"

    else
      return H.div key: "contents", className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}", dangerouslySetInnerHTML: { __html: @createHtml() }

  render: ->
    R ClickOutHandler, onClickOut: @handleClickOut,
      H.div style: { position: "relative", width: @props.width, height: @props.height },
        @renderModals()
        @renderHtml()
        if @state.focused
          @renderMenu()
