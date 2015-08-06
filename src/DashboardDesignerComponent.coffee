React = require 'react'
H = React.DOM
uuid = require 'node-uuid'
LegoLayoutEngine = require './LegoLayoutEngine'
UndoStack = require './UndoStack'

module.exports = class DashboardDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # Design of the dashboard
    onDesignChange: React.PropTypes.func.isRequired # Call when design changes
    selectedWidgetId: React.PropTypes.string  # Currently selected widget
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired # Call when change of widget (not used)
    isDesigning: React.PropTypes.bool.isRequired # Not used (since always designing)
    onIsDesigningChange: React.PropTypes.func
    widgetFactory: React.PropTypes.object.isRequired # Factory of type WidgetFactory to make widgets

  constructor: (props) ->
    super
    @state = { undoStack: new UndoStack().push(props.design) }

  componentWillReceiveProps: (nextProps) ->
    # Save on stack
    @setState(undoStack: @state.undoStack.push(nextProps.design))

  handleDesignChange: (widgetDesign) =>
    widget = @props.design.items[@props.selectedWidgetId].widget
    widget = _.extend({}, widget, design: widgetDesign)

    item = @props.design.items[@props.selectedWidgetId]
    item = _.extend({}, item, widget: widget)

    items = _.clone(@props.design.items)
    items[@props.selectedWidgetId] = item

    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  # Find a layout that the new widget fits in. width and height are in 24ths
  findOpenLayout: (width, height) ->
    # Create layout engine
    # TODO create from design
    # TODO uses fake width
    layoutEngine = new LegoLayoutEngine(100, 24)

    # Get existing layouts
    layouts = _.pluck(_.values(@props.design.items), "layout")

    # Find place for new item
    return layoutEngine.appendLayout(layouts, width, height)

  addWidget: (type, version, design, width, height) ->
    # Find place for new item
    layout = @findOpenLayout(12, 12)

    # Create item
    item = {
      layout: layout
      widget: {
        type: type
        version: version
        design: design
      }
    }

    id = uuid.v4()
    # Add item
    items = _.clone(@props.design.items)
    items[id] = item

    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)
    @props.onSelectedWidgetIdChange(id)

  handleAddWidget: (wt) =>
    @addWidget(wt.type, wt.version, wt.design, 12, 12)

  handleUndo: => 
    undoStack = @state.undoStack.undo()
    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  handleRedo: =>
    undoStack = @state.undoStack.redo()
    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  renderUndoRedo: ->
    H.div key: "undoredo",
      H.button key: "undo", type: "button", className: "btn btn-default btn-xs", onClick: @handleUndo, disabled: not @state.undoStack.canUndo(),
        H.span className: "glyphicon glyphicon-triangle-left"
        " Undo"
      " "
      H.button key: "redo", type: "button", className: "btn btn-default btn-xs", onClick: @handleRedo, disabled: not @state.undoStack.canRedo(),
        H.span className: "glyphicon glyphicon-triangle-right"
        " Redo"

  # Designer when no widgets displayed
  renderGeneralDesigner: ->
    return H.div null, 
      H.div null,
        H.i null, 
          H.span className:"glyphicon glyphicon-arrow-left"
          " Click on widgets to edit them"
      H.br()

      H.div className: "btn-group",
        H.button type: "button", "data-toggle": "dropdown", className: "btn btn-default dropdown-toggle",
          H.span className: "glyphicon glyphicon-plus"
          " Add Widget "
          H.span className: "caret"
        H.ul className: "dropdown-menu",
          _.map(@props.widgetFactory.getNewWidgetsTypes(), (wt) =>
            H.li key: wt.name,
              H.a onClick: @handleAddWidget.bind(null, wt), wt.name
            )

  renderWidgetDesigner: (item) ->
    # Get selected widget
    widgetDef = item.widget
    widget = @props.widgetFactory.createWidget(widgetDef.type, widgetDef.version, widgetDef.design)

    # Create design element
    return widget.createDesignerElement(onDesignChange: @handleDesignChange)

  render: ->
    # Get selected item
    if @props.selectedWidgetId
      item = @props.design.items[@props.selectedWidgetId]

    H.div null, 
      @renderUndoRedo()
      H.br()

      if item
        @renderWidgetDesigner(item)
      else
        @renderGeneralDesigner()

