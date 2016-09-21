_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

UndoStack = require '../UndoStack'
DashboardViewComponent = require './DashboardViewComponent'
AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
QuickfiltersComponent = require '../quickfilter/QuickfiltersComponent'
QuickfilterCompiler = require '../quickfilter/QuickfilterCompiler'
SettingsModalComponent = require './SettingsModalComponent'
LayoutManager = require '../layouts/LayoutManager'

# Dashboard component that includes an action bar at the top
# Manages undo stack and quickfilter value
module.exports = class DashboardComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func               # If not set, readonly
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    dashboardDataSource: React.PropTypes.object.isRequired # dashboard data source

    titleElem: React.PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: React.PropTypes.node         # Extra elements to add to right
    undoStackKey: React.PropTypes.any                   # Key that changes when the undo stack should be reset. Usually a document id or suchlike
    printScaling: React.PropTypes.bool                  # True to scale for printing

    onRowClick: React.PropTypes.func     # Called with (tableId, rowId) when item is clicked

  @defaultProps:
    printScaling: true

  constructor: (props) ->
    super
    @state = { 
      undoStack: new UndoStack().push(props.design) 
      quickfiltersValues: null
      editing: LayoutManager.createLayoutManager(props.design.layout).isEmpty(props.design.items) 
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

    if not nextProps.onDesignChange?
      @setState(editing: false)

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
    # Require at use as causes server problems
    filesaver = require 'filesaver.js'
    filesaver(blob, "Dashboard.json")

  handleSettings: =>
    @refs.settings.show(@props.design)

  handleToggleEditing: =>
    @setState(editing: not @state.editing)

  handleStyleChange: (style) =>
    @props.onDesignChange(_.extend({}, @props.design, { style: style or null }))

  renderEditingSwitch: ->
    # H.a key: "edit", className: "btn btn-link btn-sm", onClick: @handleToggleEditing,
    #   if @state.editing
    #     H.i className: "fa fa-fw fa-check-square"
    #   else
    #     H.i className: "fa fa-fw fa-square-o"
    #   if @state.editing then " Editing" else " Edit Dashboard"
    H.a key: "edit", className: "btn btn-primary btn-sm #{if @state.editing then "active" else ""}", onClick: @handleToggleEditing,
      H.span(className: "glyphicon glyphicon-pencil")
      if @state.editing then " Editing" else " Edit"

  renderStyleItem: (style) ->
    isActive = (@props.design.style or "default") == style

    content = switch style
      when "default"
        [
          H.h4 className: "list-group-item-heading", "Classic Dashboard"
          H.p className: "list-group-item-text", "Ideal for data display with minimal text"
        ]
      when "greybg"
        [
          H.h4 className: "list-group-item-heading", "Framed Dashboard"
          H.p className: "list-group-item-text", "Each widget is white on a grey background"
        ]
      when "story"
        [
          H.h4 className: "list-group-item-heading", "Story"
          H.p className: "list-group-item-text", "Ideal for data-driven storytelling with lots of text. Responsive and mobile-friendly"
        ]

    H.a 
      key: style
      className: "list-group-item #{if isActive then "active" else ""}"
      onClick: @handleStyleChange.bind(null, style),
       content

  renderStyle: ->
    return H.div key: "style", className: "btn-group",
      H.button type: "button", "data-toggle": "dropdown", className: "btn btn-link btn-sm dropdown-toggle",
        H.span className: "fa fa-th-large"
        " Layout "
        H.span className: "caret"
      H.div className: "dropdown-menu dropdown-menu-right list-group", style: { padding: 0, zIndex: 10000, width: 300 },
        @renderStyleItem("default")
        @renderStyleItem("greybg")
        @renderStyleItem("story")


  renderActionLinks: ->
    H.div null,
      if @state.editing
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
      # H.a key: "export", className: "btn btn-link btn-sm", onClick: @handleSaveDesignFile,
      #   H.span(className: "glyphicon glyphicon-download-alt")
      #   " Export"
      if @state.editing
        H.a key: "settings", className: "btn btn-link btn-sm", onClick: @handleSettings,
          H.span(className: "glyphicon glyphicon-cog")
          " Settings"
      if @state.editing
        @renderStyle()
      @props.extraTitleButtonsElem
      if @props.onDesignChange?
        @renderEditingSwitch()

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

    hasQuickfilters = @props.design.quickfilters?[0]?

    H.div key: "view", style: { height: "100%", paddingTop: (if hasQuickfilters then 90 else 40), position: "relative" },
      @renderTitleBar()
      @renderQuickfilter()
      if @props.onDesignChange?
        R SettingsModalComponent, { onDesignChange: @props.onDesignChange, schema: @props.schema, dataSource: @props.dataSource, ref: "settings" }

      # Dashboard view requires width, so use auto size component to inject it
      R AutoSizeComponent, { injectWidth: true, injectHeight: true }, 
        (size) =>
          R DashboardViewComponent, {
            schema: @props.schema
            dataSource: @props.dataSource
            dashboardDataSource: @props.dashboardDataSource

            ref: @refDashboardView
            design: @props.design
            onDesignChange: if @state.editing then @props.onDesignChange
            filters: filters
            width: size.width
            standardWidth: if @props.printScaling then 1440 else size.width
            onRowClick: @props.onRowClick
          }
      
