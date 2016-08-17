React = require 'react'
H = React.DOM
R = React.createElement

uuid = require 'node-uuid'

HTML5Backend = require('react-dnd-html5-backend')
NestableDragDropContext = require  "react-library/lib/NestableDragDropContext"

WidgetFactory = require '../widgets/WidgetFactory'
WidgetScoper = require '../widgets/WidgetScoper'
ReactElementPrinter = require 'react-library/lib/ReactElementPrinter'
LayoutManager = require '../layouts/LayoutManager'
WidgetScopesViewComponent = require '../widgets/WidgetScopesViewComponent'

# Displays a dashboard, handling removing of widgets. No title bar or other decorations.
# Handles scoping
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    schema: React.PropTypes.object.isRequired # schema to use
    dataSource: React.PropTypes.object.isRequired # data source to use. Only used when designing, for display uses dashboardDataSource
    dashboardDataSource: React.PropTypes.object.isRequired # dashboard data source

    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func      # Leave unset for readonly

    width: React.PropTypes.number
    standardWidth: React.PropTypes.number   # Width for scaling

    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired    # id table to filter
      jsonql: React.PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  @defaultProps:
    standardWidth: 1440 # Standard width. Matches 8.5x11" paper with 0.5" margin at 192dpi

  constructor: (props) ->
    super
    @state = {
      widgetScoper: new WidgetScoper() # Empty scoping
    }

  handleScopeChange: (id, scope) => 
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, scope))

  handleRemoveScope: (id) =>
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, null))    

  handleItemsChange: (items) =>
    console.log JSON.stringify(items, null, 2)
    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  # Call to print the dashboard
  print: =>
    # Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side). 1440 is double, so scale down
    # props are immutable in React 0.14+
    elem = H.div style: { transform: "scale(0.5)", transformOrigin: "top left" },
        R(DashboardViewComponent, _.extend({}, @props, { width: 1440 }))
    
    printer = new ReactElementPrinter()
    printer.print(elem, { delay: 5000 })

  renderScopes: ->
    R(WidgetScopesViewComponent, scopes: @state.widgetScoper.getScopes(), onRemoveScope: @handleRemoveScope)

  render: ->
    layoutManager = LayoutManager.createLayoutManager(@props.design.layout)

    renderWidget = (options) =>
      widget = WidgetFactory.createWidget(options.type)

      # Get filters (passed in plus widget scoper filters)
      filters = @props.filters or []
      filters = filters.concat(@state.widgetScoper.getFilters(options.id))

      return widget.createViewElement({
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
        standardWidth: options.standardWidth # TODO doc
      })  

    style = {
      height: "100%"
      position: "relative"
    }

    # Render widget container
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
    return H.div @props
        
DragDropContextComponent = NestableDragDropContext(HTML5Backend)(DragDropContextComponent)
