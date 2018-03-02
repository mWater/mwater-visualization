PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ExprCompiler = require("mwater-expressions").ExprCompiler
ExprCleaner = require('mwater-expressions').ExprCleaner

UndoStack = require '../UndoStack'
DashboardUtils = require './DashboardUtils'
DashboardViewComponent = require './DashboardViewComponent'
AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
QuickfiltersComponent = require '../quickfilter/QuickfiltersComponent'
QuickfilterCompiler = require '../quickfilter/QuickfilterCompiler'
SettingsModalComponent = require './SettingsModalComponent'
LayoutManager = require '../layouts/LayoutManager'
DashboardUpgrader = require './DashboardUpgrader'

# Dashboard component that includes an action bar at the top
# Manages undo stack and quickfilter value
module.exports = class DashboardComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func               # If not set, readonly
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    dashboardDataSource: PropTypes.object.isRequired # dashboard data source

    titleElem: PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: PropTypes.node         # Extra elements to add to right
    undoStackKey: PropTypes.any                   # Key that changes when the undo stack should be reset. Usually a document id or suchlike
    printScaling: PropTypes.bool                  # True to scale for printing

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    quickfilterLocks: PropTypes.array             # Locked quickfilter values. See README in quickfilters
    quickfiltersValues: PropTypes.array           # Initial quickfilter values

    # Filters to add to the dashboard
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  @defaultProps:
    printScaling: true

  @childContextTypes:
    locale: PropTypes.string
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired) # List of tables (ids) being used. Use this to present an initially short list to select from

  getChildContext: -> { 
    # Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
    locale: @props.design.locale 

    # Pass active tables down to table select components so they can present a shorter list
    activeTables: DashboardUtils.getFilterableTables(@props.design, @props.schema)
  }

  constructor: (props) ->
    super
    @state = { 
      undoStack: new UndoStack().push(props.design) 
      quickfiltersValues: props.quickfiltersValues
      quickfiltersHeight: null   # Height of quickfilters
      editing: LayoutManager.createLayoutManager(props.design.layout).isEmpty(props.design.items) and props.onDesignChange?
    }

  componentDidMount: -> 
    @updateHeight()

  componentDidUpdate: ->
    @updateHeight()

  updateHeight: ->
    # Calculate quickfilters height
    if @refs.quickfilters 
      if @state.quickfiltersHeight != @refs.quickfilters.offsetHeight
        @setState(quickfiltersHeight: @refs.quickfilters.offsetHeight)
    else
      @setState(quickfiltersHeight: 0)

  # Get the values of the quick filters
  getQuickfilterValues: =>
    return @state.quickfiltersValues or []

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
      @setState(quickfiltersValues: nextProps.quickfiltersValues)

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

  handleRefreshData: =>
    @props.dataSource.clearCache?()
    @forceUpdate()

  handleStyleChange: (style) =>
    @props.onDesignChange(_.extend({}, @props.design, { style: style or null }))

  handleDesignChange: (design) =>
    # If quickfilters have changed, reset values
    if not _.isEqual(@props.design.quickfilters, design.quickfilters)
      @setState(quickfiltersValues: null)

    @props.onDesignChange(design)

  handleUpgrade: =>
    if not confirm("This will upgrade your dashboard to the new kind with enhanced features. You can click Undo immediately afterwards if you wish to revert it. Continue?")
      return

    design = new DashboardUpgrader().upgrade(@props.design)
    @props.onDesignChange(design)

    alert("Upgrade completed. Some widgets may need to be resized. Click Undo to revert back to old dashboard style.")

  # Get filters from props filters combined with dashboard filters
  getCompiledFilters: ->
    compiledFilters = DashboardUtils.getCompiledFilters(@props.design, @props.schema, DashboardUtils.getFilterableTables(@props.design, @props.schema))
    compiledFilters = compiledFilters.concat(@props.filters or [])
    return compiledFilters

  renderEditingSwitch: ->
    H.a key: "edit", className: "btn btn-primary btn-sm #{if @state.editing then "active" else ""}", onClick: @handleToggleEditing,
      H.span(className: "glyphicon glyphicon-pencil")
      if @state.editing then " Editing" else " Edit"

  renderStyleItem: (style) ->
    isActive = (@props.design.style or "default") == style

    content = switch style
      when "default"
        [
          H.h4 key: "name", className: "list-group-item-heading", "Classic Dashboard"
          H.p key: "description", className: "list-group-item-text", "Ideal for data display with minimal text"
        ]
      when "greybg"
        [
          H.h4 key: "name", className: "list-group-item-heading", "Framed Dashboard"
          H.p key: "description", className: "list-group-item-text", "Each widget is white on a grey background"
        ]
      when "story"
        [
          H.h4 key: "name", className: "list-group-item-heading", "Story"
          H.p key: "description", className: "list-group-item-text", "Ideal for data-driven storytelling with lots of text. Responsive and mobile-friendly"
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
      if @state.editing and (@props.design.layout or "grid") == "grid"
        H.a key: "upgrade", className: "btn btn-info btn-sm", onClick: @handleUpgrade,
          "Upgrade Dashboard..."
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
      H.a key: "refresh", className: "btn btn-link btn-sm", onClick: @handleRefreshData,
        H.span(className: "glyphicon glyphicon-refresh")
        " Refresh"
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
    H.div style: { position: "absolute", top: 40, left: 0, right: 0 }, ref: "quickfilters",
      R QuickfiltersComponent, {
        design: @props.design.quickfilters
        schema: @props.schema
        quickfiltersDataSource: @props.dashboardDataSource.getQuickfiltersDataSource()
        values: @state.quickfiltersValues
        onValuesChange: (values) => @setState(quickfiltersValues: values)
        locks: @props.quickfilterLocks
        filters: @getCompiledFilters()
      }

  refDashboardView: (el) =>
    @dashboardView = el

  render: ->
    filters = @props.filters or []

    # Compile quickfilters
    filters = filters.concat(new QuickfilterCompiler(@props.schema).compile(@props.design.quickfilters, @state.quickfiltersValues, @props.quickfilterLocks))

    H.div key: "view", style: { height: "100%", paddingTop: 40 + (@state.quickfiltersHeight or 0), position: "relative" },
      @renderTitleBar()
      @renderQuickfilter()
      if @props.onDesignChange?
        R SettingsModalComponent, { onDesignChange: @handleDesignChange, schema: @props.schema, dataSource: @props.dataSource, ref: "settings" }

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
            namedStrings: @props.namedStrings
          }
      
