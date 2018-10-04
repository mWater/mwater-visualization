PropTypes = require('prop-types')
React = require 'react'
R = React.createElement

uuid = require 'uuid'

HTML5Backend = require('react-dnd-html5-backend')
NestableDragDropContext = require  "react-library/lib/NestableDragDropContext"
ImplicitFilterBuilder = require '../ImplicitFilterBuilder'

DashboardUtils = require './DashboardUtils'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprCleaner = require('mwater-expressions').ExprCleaner
WidgetFactory = require '../widgets/WidgetFactory'
WidgetScoper = require '../widgets/WidgetScoper'
ReactElementPrinter = require 'react-library/lib/ReactElementPrinter'
LayoutManager = require '../layouts/LayoutManager'
WidgetScopesViewComponent = require '../widgets/WidgetScopesViewComponent'

# Displays a dashboard, handling removing of widgets. No title bar or other decorations.
# Handles scoping and stores the state of scope
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    schema: PropTypes.object.isRequired # schema to use
    dataSource: PropTypes.object.isRequired # data source to use. Only used when designing, for display uses dashboardDataSource
    dashboardDataSource: PropTypes.object.isRequired # dashboard data source

    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func      # Leave unset for readonly

    width: PropTypes.number
    standardWidth: PropTypes.number   # Width for scaling

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Filters to add to the dashboard (includes extra filters and any quickfilters from the dashboard component. Does not include dashboard level filters)
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

    # Entry to scroll to initially when dashboard is loaded
    initialTOCEntryScroll: PropTypes.shape({ widgetId: PropTypes.string.isRequired, entryId: PropTypes.any })

  @defaultProps:
    standardWidth: 1440 # Standard width. Matches 8.5x11" paper with 0.5" margin at 192dpi

  @childContextTypes:
    locale: PropTypes.string

  # Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
  getChildContext: -> { locale: @props.design.locale }

  constructor: (props) ->
    super
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

  handleScopeChange: (id, scope) => 
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, scope))

  handleRemoveScope: (id) =>
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, null))    

  handleItemsChange: (items) =>
    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  # Call to print the dashboard
  print: =>
    # Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side). 1440 is double, so scale down
    # props are immutable in React 0.14+
    elem = R 'div', style: { transform: "scale(0.5)", transformOrigin: "top left" },
      R 'div', style: { width: 1440 }, 
        R(DashboardViewComponent, _.extend({}, @props, { width: 1440, standardWidth: 1440, onDesignChange: null }))
    
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

  render: ->
    layoutManager = LayoutManager.createLayoutManager(@props.design.layout)

    compiledFilters = @getCompiledFilters()

    # Get filterable tables
    filterableTables = DashboardUtils.getFilterableTables(@props.design, @props.schema)

    # Determine toc entries
    tocEntries = @getTOCEntries(layoutManager)

    renderWidget = (options) =>
      widget = WidgetFactory.createWidget(options.type)

      # Get filters (passed in plus dashboard widget scoper filters)
      filters = compiledFilters.concat(@state.widgetScoper.getFilters(options.id))

      # Extend the filters to include implicit filters (filter children in 1-n relationships)
      if @props.design.implicitFiltersEnabled or not @props.design.implicitFiltersEnabled? # Default is true
        implicitFilterBuilder = new ImplicitFilterBuilder(@props.schema)
        filters = implicitFilterBuilder.extendFilters(filterableTables, filters)
      
      widgetElem = widget.createViewElement({
        schema: @props.schema
        dataSource: @props.dataSource
        widgetDataSource: @props.dashboardDataSource.getWidgetDataSource(options.id)
        design: options.design
        scope: @state.widgetScoper.getScope(options.id)
        filters: filters
        onScopeChange: @handleScopeChange.bind(null, options.id)
        onDesignChange: options.onDesignChange
        width: options.width
        height: options.height
        standardWidth: options.standardWidth 
        onRowClick: @props.onRowClick
        namedStrings: @props.namedStrings
        tocEntries: tocEntries
        onScrollToTOCEntry: @handleScrollToTOCEntry
      })  

      # Keep references to widget elements
      widgetElem = React.cloneElement(widgetElem, ref: ((c) => @widgetComps[options.id] = c))
      return widgetElem

    style = {
      height: "100%"
      position: "relative"
    }

    # Render widget container
    # TODO REMOVE DragDropContextComponent and change to R 'div', when grid layout is gone.
    return R DragDropContextComponent, style: style, 
      @renderScopes()

      layoutManager.renderLayout({
        width: @props.width 
        standardWidth: @props.standardWidth
        items: @props.design.items
        onItemsChange: if @props.onDesignChange? then @handleItemsChange
        style: @props.design.style
        renderWidget: renderWidget
      })

# Wrapper that has a nestable drag drop context
class DragDropContextComponent extends React.Component
  render: ->
    return R 'div', @props
        
DragDropContextComponent = NestableDragDropContext(HTML5Backend)(DragDropContextComponent)
