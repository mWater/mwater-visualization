_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement

uuid = require 'uuid'

ImplicitFilterBuilder = require '../ImplicitFilterBuilder'

DashboardUtils = require './DashboardUtils'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprCleaner = require('mwater-expressions').ExprCleaner
WidgetFactory = require '../widgets/WidgetFactory'
WidgetScoper = require '../widgets/WidgetScoper'
ReactElementPrinter = require 'react-library/lib/ReactElementPrinter'
LayoutManager = require '../layouts/LayoutManager'
WidgetScopesViewComponent = require '../widgets/WidgetScopesViewComponent'
getLayoutOptions = require('./layoutOptions').getLayoutOptions

WidgetComponent = require('./WidgetComponent').WidgetComponent

# Displays a dashboard, handling removing of widgets. No title bar or other decorations.
# Handles scoping and stores the state of scope
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    schema: PropTypes.object.isRequired # schema to use
    dataSource: PropTypes.object.isRequired # data source to use. Only used when designing, for display uses dashboardDataSource
    dashboardDataSource: PropTypes.object.isRequired # dashboard data source

    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func      # Leave unset for readonly

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Filters to add to the dashboard (includes extra filters and any quickfilters from the dashboard component. Does not include dashboard level filters)
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

    # Entry to scroll to initially when dashboard is loaded
    initialTOCEntryScroll: PropTypes.shape({ widgetId: PropTypes.string.isRequired, entryId: PropTypes.any })

    # True to hide scope display
    hideScopes: PropTypes.bool

    # True to render in print mode (prevents odd clipping issue)
    printMode: PropTypes.bool

  @childContextTypes:
    locale: PropTypes.string

  # Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
  getChildContext: -> { locale: @props.design.locale }

  constructor: (props) ->
    super(props)
    @state = {
      widgetScoper: new WidgetScoper() # Empty scoping
    }

    @widgetComps = {} # Lookup of widget components by id

  componentDidMount: ->
    if @props.initialTOCEntryScroll
      # Getting heights of widgets properly requires a 0 length timeout
      setTimeout () =>
        @handleScrollToTOCEntry(@props.initialTOCEntryScroll.widgetId, @props.initialTOCEntryScroll.entryId)
      , 0

    # Add listener to localstorage to update clipboard display
    window.addEventListener 'storage', @handleStorageChange

  componentWillUnmount: ->
    # Remove listener
    window.addEventListener 'storage', @handleStorageChange

  handleStorageChange: =>
    @forceUpdate()


  handleScopeChange: (id, scope) => 
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, scope))

  handleRemoveScope: (id) =>
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, null))    

  handleItemsChange: (items) =>
    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  # Handle a change of the clipboard and determine which tables the clipboard block uses
  handleClipboardChange: (block) => 
    try
      # If empty, just set it
      if not block
        window.localStorage.removeItem("DashboardViewComponent.clipboard")
        @forceUpdate()
        return
      
      # Determine which tables are used (just peek for any uses of the table name. Not ideal, but easy)
      tables = _.pluck(_.filter(@props.schema.getTables(), (table) => JSON.stringify(block).includes(JSON.stringify(table.id))), "id")

      # Store in clipboard
      window.localStorage.setItem("DashboardViewComponent.clipboard", JSON.stringify({ block: block, tables: tables }))
      @forceUpdate()
    catch err
      alert("Clipboard not available")

  getClipboardContents: ->
    try
      return JSON.parse(window.localStorage.getItem("DashboardViewComponent.clipboard") or "null")
    catch err
      return null

  # Call to print the dashboard
  print: =>
    # Create element at 1080 wide (use as standard printing width)
    elem = R 'div', style: { width: 1080 }, 
      R(DashboardViewComponent, _.extend({}, @props, { onDesignChange: null, printMode: true }))
    
    printer = new ReactElementPrinter()
    printer.print(elem, { delay: 5000 })

  # Get filters from props filters combined with dashboard filters
  getCompiledFilters: ->
    compiledFilters = DashboardUtils.getCompiledFilters(@props.design, @props.schema, DashboardUtils.getFilterableTables(@props.design, @props.schema))
    compiledFilters = compiledFilters.concat(@props.filters or [])
    return compiledFilters

  # Get list of TOC entries
  getTOCEntries: (layoutManager) ->
    entries = []

    for { id, type, design } in layoutManager.getAllWidgets(@props.design.items)
      widget = WidgetFactory.createWidget(type)
      # Add widgetId to each one
      for entry in widget.getTOCEntries(design, @props.namedStrings)
        entries.push(_.extend({}, entry, widgetId: id))

    return entries

  handleScrollToTOCEntry: (widgetId, entryId) =>
    widgetComp = @widgetComps[widgetId]
    if not widgetComp
      return

    # Call scrollToTOCEntry if present
    widgetComp.scrollToTOCEntry?(entryId)

  renderScopes: ->
    R(WidgetScopesViewComponent, scopes: @state.widgetScoper.getScopes(), onRemoveScope: @handleRemoveScope)

  compRef: (options) => (c) =>
    @widgetComps[options.id] = c

  render: ->
    layoutManager = LayoutManager.createLayoutManager(@props.design.layout)

    compiledFilters = @getCompiledFilters()

    # Get filterable tables
    filterableTables = DashboardUtils.getFilterableTables(@props.design, @props.schema)

    # Determine toc entries
    tocEntries = @getTOCEntries(layoutManager)

    # Get clipboard contents
    clipboardContents = @getClipboardContents()

    # Check if can't paste because of missing table
    if clipboardContents and not _.all(clipboardContents.tables, (table) => @props.schema.getTable(table))
      cantPasteMessage = "Dashboard is missing one or more data sources needed for the copied item."

    renderWidget = (options) =>
      widget = WidgetFactory.createWidget(options.type)

      # Get filters (passed in plus dashboard widget scoper filters)
      filters = compiledFilters.concat(@state.widgetScoper.getFilters(options.id))

      # Extend the filters to include implicit filters (filter children in 1-n relationships)
      if @props.design.implicitFiltersEnabled or not @props.design.implicitFiltersEnabled? # Default is true
        implicitFilterBuilder = new ImplicitFilterBuilder(@props.schema)
        filters = implicitFilterBuilder.extendFilters(filterableTables, filters)
      
      widgetElem = R(WidgetComponent, {
        key: options.id
        id: options.id
        type: options.type
        schema: @props.schema
        dataSource: @props.dataSource
        dashboardDataSource: @props.dashboardDataSource
        design: options.design
        scope: @state.widgetScoper.getScope(options.id)
        filters: filters
        onScopeChange: @handleScopeChange.bind(null, options.id)
        onDesignChange: options.onDesignChange
        width: options.width
        height: options.height
        onRowClick: @props.onRowClick
        namedStrings: @props.namedStrings
        tocEntries: tocEntries
        onScrollToTOCEntry: @handleScrollToTOCEntry
      })

      # Keep references to widget elements
      widgetElem = React.cloneElement(widgetElem, widgetRef: @compRef(options))
      return widgetElem

    style = {
      height: "100%"
      position: "relative"
    }

    if not @props.printMode
      # Prevent this block from taking up too much space. Scrolling handled by layout manager.
      # Setting overflow-x stops the inner div from becoming too tall
      style.overflowX = "auto"  

    # Render widget container
    return R "div", style: style, 
      if not @props.hideScopes
        @renderScopes()

      layoutManager.renderLayout({
        items: @props.design.items
        onItemsChange: if @props.onDesignChange? then @handleItemsChange
        style: @props.design.style
        layoutOptions: getLayoutOptions(@props.design)
        renderWidget: renderWidget
        clipboard: clipboardContents?.block
        onClipboardChange: @handleClipboardChange
        cantPasteMessage: cantPasteMessage
      })
