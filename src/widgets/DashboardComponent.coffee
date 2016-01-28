_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

UndoStack = require './../UndoStack'
DashboardViewComponent = require './DashboardViewComponent'
AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
filesaver = require 'filesaver.js'
DashboardUtils = require './DashboardUtils'
QuickfiltersComponent = require '../quickfilter/QuickfiltersComponent'
QuickfilterCompiler = require '../quickfilter/QuickfilterCompiler'
SettingsModalComponent = require './SettingsModalComponent'

# Dashboard component that includes an action bar at the top
# Manages undo stack and quickfilter value
module.exports = class DashboardComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func               # If not set, readonly
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    widgetFactory: React.PropTypes.object.isRequired
    titleElem: React.PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: React.PropTypes.node         # Extra elements to add to right
    undoStackKey: React.PropTypes.any                   # Key that changes when the undo stack should be reset. Usually a document id or suchlike
    printScaling: React.PropTypes.bool                  # True to scale for printing

  @defaultProps:
    printScaling: true

  constructor: (props) ->
    super
    @state = { 
      undoStack: new UndoStack().push(props.design) 
      quickfiltersValues: null
    }

  componentWillReceiveProps: (nextProps) ->
    undoStack = @state.undoStack

    # Clear stack if key changed
    if nextProps.undoStackKey != @props.undoStackKey
      undoStack = new UndoStack()

    # Save on stack
    undoStack = undoStack.push(nextProps.design)
    @setState(undoStack: undoStack)

    # Clear quickfilters if definition changed
    if not _.isEqual(@props.design.quickfilters, nextProps.design.quickfilters)
      @setState(quickfiltersValues: null)

  handlePrint: =>
    @dashboardView.print()

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

  handleAddWidget: (wt) =>
    design = DashboardUtils.addWidget(@props.design, wt.type, wt.design, 8, 8)
    @props.onDesignChange(design)

  handleSettings: =>
    @refs.settings.show(@props.design)

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
      if @props.onDesignChange?
        @renderAddWidget()
      if @props.onDesignChange?
        [
          H.a key: "undo", className: "btn btn-link btn-sm #{if not @state.undoStack.canUndo() then "disabled" else ""}", onClick: @handleUndo,
            H.span className: "glyphicon glyphicon-triangle-left"
            " Undo"
          " "
          H.a key: "redo", className: "btn btn-link btn-sm #{if not @state.undoStack.canRedo() then "disabled" else ""}", onClick: @handleRedo, 
            H.span className: "glyphicon glyphicon-triangle-right"
            " Redo"
        ]
      H.a key: "print", className: "btn btn-link btn-sm", onClick: @handlePrint,
        H.span(className: "glyphicon glyphicon-print")
        " Print"
      H.a key: "export", className: "btn btn-link btn-sm", onClick: @handleSaveDesignFile,
        H.span(className: "glyphicon glyphicon-download-alt")
        " Export"
      if @props.onDesignChange?
        H.a key: "settings", className: "btn btn-link btn-sm", onClick: @handleSettings,
          H.span(className: "glyphicon glyphicon-cog")
          " Settings"
      @props.extraTitleButtonsElem

  renderTitleBar: ->
    H.div style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4 },
      H.div style: { float: "right" },
        @renderActionLinks()
      @props.titleElem

  renderQuickfilter: ->
    R QuickfiltersComponent, {
      design: @props.design.quickfilters
      schema: @props.schema
      dataSource: @props.dataSource
      values: @state.quickfiltersValues
      onValuesChange: (values) => @setState(quickfiltersValues: values)
    }

  refDashboardView: (el) =>
    @dashboardView = el

  render: ->
    # Compile quickfilters
    filters = new QuickfilterCompiler(@props.schema).compile(@props.design.quickfilters, @state.quickfiltersValues)

    H.div key: "view", style: { height: "100%", paddingTop: 40, paddingRight: 20, paddingLeft: 5, position: "relative" },
      @renderTitleBar()
      @renderQuickfilter()
      if @props.onDesignChange?
        R SettingsModalComponent, { onDesignChange: @props.onDesignChange, schema: @props.schema, dataSource: @props.dataSource, ref: "settings" }

      # Dashboard view requires width, so use auto size component to inject it
      R AutoSizeComponent, { injectWidth: true }, 
        (size) =>
          R DashboardViewComponent, {
            ref: @refDashboardView
            design: @props.design
            onDesignChange: @props.onDesignChange
            widgetFactory: @props.widgetFactory
            filters: filters
            width: size.width
            standardWidth: if @props.printScaling then 1440 else size.width
          }
      
