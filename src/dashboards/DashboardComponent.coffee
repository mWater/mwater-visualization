PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
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

    hideTitleBar: PropTypes.bool    # True to hide title bar and related controls

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
    super(props)
    @state = { 
      undoStack: new UndoStack().push(props.design) 
      quickfiltersValues: props.quickfiltersValues
      editing: LayoutManager.createLayoutManager(props.design.layout).isEmpty(props.design.items) and props.onDesignChange?
    }

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
    FileSaver = require 'file-saver'
    FileSaver.saveAs(blob, "Dashboard.json")

  handleSettings: =>
    @settings.show(@props.design)

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
    R 'a', key: "edit", className: "btn btn-primary btn-sm #{if @state.editing then "active" else ""}", onClick: @handleToggleEditing,
      R('span', className: "glyphicon glyphicon-pencil")
      if @state.editing then " Editing" else " Edit"

  renderStyleItem: (style) ->
    isActive = (@props.design.style or "default") == style

    content = switch style
      when "default"
        [
          R 'h4', key: "name", className: "list-group-item-heading", "Classic Dashboard"
          R 'p', key: "description", className: "list-group-item-text", "Ideal for data display with minimal text"
        ]
      when "greybg"
        [
          R 'h4', key: "name", className: "list-group-item-heading", "Framed Dashboard"
          R 'p', key: "description", className: "list-group-item-text", "Each widget is white on a grey background"
        ]
      when "story"
        [
          R 'h4', key: "name", className: "list-group-item-heading", "Story"
          R 'p', key: "description", className: "list-group-item-text", "Ideal for data-driven storytelling with lots of text. Responsive and mobile-friendly"
        ]

    R 'a', 
      key: style
      className: "list-group-item #{if isActive then "active" else ""}"
      onClick: @handleStyleChange.bind(null, style),
       content

  renderStyle: ->
    return R 'div', key: "style", className: "btn-group",
      R 'button', type: "button", "data-toggle": "dropdown", className: "btn btn-link btn-sm dropdown-toggle",
        R 'span', className: "fa fa-th-large"
        " Layout "
        R 'span', className: "caret"
      R 'div', className: "dropdown-menu dropdown-menu-right list-group", style: { padding: 0, zIndex: 10000, width: 300 },
        @renderStyleItem("default")
        @renderStyleItem("greybg")
        @renderStyleItem("story")

  renderActionLinks: ->
    R 'div', null,
      if @state.editing and (@props.design.layout or "grid") == "grid"
        R 'a', key: "upgrade", className: "btn btn-info btn-sm", onClick: @handleUpgrade,
          "Upgrade Dashboard..."
      if @state.editing
        [
          R 'a', key: "undo", className: "btn btn-link btn-sm #{if not @state.undoStack.canUndo() then "disabled" else ""}", onClick: @handleUndo,
            R 'span', className: "glyphicon glyphicon-triangle-left"
            " Undo"
          " "
          R 'a', key: "redo", className: "btn btn-link btn-sm #{if not @state.undoStack.canRedo() then "disabled" else ""}", onClick: @handleRedo, 
            R 'span', className: "glyphicon glyphicon-triangle-right"
            " Redo"
        ]
      R 'a', key: "print", className: "btn btn-link btn-sm", onClick: @handlePrint,
        R('span', className: "glyphicon glyphicon-print")
        " Print"
      R 'a', key: "refresh", className: "btn btn-link btn-sm", onClick: @handleRefreshData,
        R('span', className: "glyphicon glyphicon-refresh")
        " Refresh"
      # R 'a', key: "export", className: "btn btn-link btn-sm", onClick: @handleSaveDesignFile,
      #   R('span', className: "glyphicon glyphicon-download-alt")
      #   " Export"
      if @state.editing
        R 'a', key: "settings", className: "btn btn-link btn-sm", onClick: @handleSettings,
          R('span', className: "glyphicon glyphicon-cog")
          " Settings"
      if @state.editing
        @renderStyle()
      @props.extraTitleButtonsElem
      if @props.onDesignChange?
        @renderEditingSwitch()

  renderTitleBar: ->
    R 'div', style: { height: 40, padding: 4 },
      R 'div', style: { float: "right" },
        @renderActionLinks()
      @props.titleElem

  renderQuickfilter: ->
    R 'div', style: { }, ref: ((c) => @quickfilters = c),
      R QuickfiltersComponent, {
        design: @props.design.quickfilters
        schema: @props.schema
        dataSource: @props.dataSource
        quickfiltersDataSource: @props.dashboardDataSource.getQuickfiltersDataSource()
        values: @state.quickfiltersValues
        onValuesChange: (values) => @setState(quickfiltersValues: values)
        locks: @props.quickfilterLocks
        filters: @getCompiledFilters()
        hideTopBorder: @props.hideTitleBar
      }

  refDashboardView: (el) =>
    @dashboardView = el

  render: ->
    filters = @props.filters or []

    # Compile quickfilters
    filters = filters.concat(new QuickfilterCompiler(@props.schema).compile(@props.design.quickfilters, @state.quickfiltersValues, @props.quickfilterLocks))

    return R 'div', style: { display: "grid", gridTemplateRows: (if @props.hideTitleBar then "auto 1fr" else "auto auto 1fr"), height: "100%" },
      if not @props.hideTitleBar
        @renderTitleBar()
      @renderQuickfilter()
      R DashboardViewComponent, {
        schema: @props.schema
        dataSource: @props.dataSource
        dashboardDataSource: @props.dashboardDataSource

        ref: @refDashboardView
        design: @props.design
        onDesignChange: if @state.editing then @props.onDesignChange
        filters: filters
        onRowClick: @props.onRowClick
        namedStrings: @props.namedStrings
      }
      if @props.onDesignChange?
        R SettingsModalComponent, { onDesignChange: @handleDesignChange, schema: @props.schema, dataSource: @props.dataSource, ref: (c) => @settings = c }
