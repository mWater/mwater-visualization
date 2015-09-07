React = require 'react'
H = React.DOM
uuid = require 'node-uuid'

UndoStack = require './../UndoStack'
DashboardViewComponent = require './DashboardViewComponent'
AutoSizeComponent = require './../AutoSizeComponent'
filesaver = require 'filesaver.js'
LegoLayoutEngine = require './LegoLayoutEngine'

# Dashboard component that includes an action bar at the top
# Manages undo stack
module.exports = class DashboardComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired
    widgetFactory: React.PropTypes.object.isRequired
    titleElem: React.PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: React.PropTypes.node              # Extra elements to add to right

  constructor: (props) ->
    super
    @state = { undoStack: new UndoStack().push(props.design) }

  componentWillReceiveProps: (nextProps) ->
    # Save on stack
    @setState(undoStack: @state.undoStack.push(nextProps.design))

  handlePrint: =>
    @refs.dashboardView.print()

  handleUndo: => 
    undoStack = @state.undoStack.undo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  handleRedo: =>
    undoStack = @state.undoStack.redo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  # Saves a json file to disk
  handleSaveDesignFile: =>
    # Make a blob and save
    blob = new Blob([JSON.stringify(@props.design, null, 2)], {type: "text/json"})
    filesaver(blob, "Dashboard.json")

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

  addWidget: (type, design, width, height) ->
    # Find place for new item
    layout = @findOpenLayout(width, height)

    # Create item
    item = {
      layout: layout
      widget: {
        type: type
        design: design
      }
    }

    id = uuid.v4()
    # Add item
    items = _.clone(@props.design.items)
    items[id] = item

    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  handleAddWidget: (wt) =>
    @addWidget(wt.type, wt.design, 8, 8)

  renderAddWidget: ->
    H.div key: "add", className: "btn-group",
      H.button type: "button", "data-toggle": "dropdown", className: "btn btn-link btn-sm dropdown-toggle",
        H.span className: "glyphicon glyphicon-plus"
        " Add Widget "
        H.span className: "caret"
      H.ul className: "dropdown-menu",
        _.map(@props.widgetFactory.getNewWidgetsTypes(), (wt) =>
          H.li key: wt.name,
            H.a onClick: @handleAddWidget.bind(null, wt), wt.name
          )

  renderActionLinks: ->
    H.div null,
      @renderAddWidget()
      H.a key: "undo", className: "btn btn-link btn-sm #{if not @state.undoStack.canUndo() then "disabled" else ""}", onClick: @handleUndo,
        H.span className: "glyphicon glyphicon-triangle-left"
        " Undo"
      " "
      H.a key: "redo", className: "btn btn-link btn-sm #{if not @state.undoStack.canRedo() then "disabled" else ""}", onClick: @handleRedo, 
        H.span className: "glyphicon glyphicon-triangle-right"
        " Redo"
      H.a key: "print", className: "btn btn-link btn-sm", onClick: @handlePrint,
        H.span(className: "glyphicon glyphicon-print")
        " Print"
      H.a key: "export", className: "btn btn-link btn-sm", onClick: @handleSaveDesignFile,
        H.span(className: "glyphicon glyphicon-download-alt")
        " Export"
      @props.extraTitleButtonsElem

  renderTitleBar: ->
    H.div style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4 },
      H.div style: { float: "right" },
        @renderActionLinks()
      @props.titleElem

  render: ->
    H.div key: "view", style: { height: "100%", paddingTop: 40, paddingRight: 20, paddingLeft: 5, position: "relative" },
      @renderTitleBar()
      # Dashboard view requires width, so use auto size component to inject it
      React.createElement(AutoSizeComponent, { injectWidth: true }, 
        React.createElement(DashboardViewComponent, {
          ref: "dashboardView"
          design: @props.design
          onDesignChange: @props.onDesignChange
          widgetFactory: @props.widgetFactory
        })
      )
