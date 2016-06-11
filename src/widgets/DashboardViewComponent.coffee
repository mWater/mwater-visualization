React = require 'react'
H = React.DOM

LegoLayoutEngine = require './LegoLayoutEngine'
WidgetFactory = require './WidgetFactory'
WidgetScoper = require './WidgetScoper'
WidgetContainerComponent = require './WidgetContainerComponent'
ReactElementPrinter = require 'react-library/lib/ReactElementPrinter'

WidgetScopesViewComponent = require './WidgetScopesViewComponent'

uuid = require 'node-uuid'

# Displays a dashboard, handling removing of widgets. No title bar or other decorations.
# Handles scoping
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    schema: React.PropTypes.object.isRequired # schema to use
    dataSource: React.PropTypes.object.isRequired # data source to use

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

  handleLayoutUpdate: (layouts) =>
    # Update item layouts
    items = _.mapValues(@props.design.items, (item, id) =>
      return _.extend({}, item, layout: layouts[id])
      )
    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  handleScopeChange: (id, scope) => 
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, scope))

  handleRemove: (id) =>
    # Update item layouts
    items = _.omit(@props.design.items, id)
    design = _.extend({}, @props.design, items: items)

    @props.onDesignChange(design)

  handleDuplicate: (id) =>
    # Get item
    item = @props.design.items[id]

    # Make a copy (use same since immutable). It's in the same location, but 
    # the dashboard will lay it out correctly
    items = _.extend({}, @props.design.items)
    items[uuid.v4()] = item
    
    design = _.extend({}, @props.design, items: items)

    @props.onDesignChange(design)

  handleRemoveScope: (id) =>
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, null))    

  handleDesignChange: (id, widgetDesign) =>
    widget = @props.design.items[id].widget
    widget = _.extend({}, widget, design: widgetDesign)

    item = @props.design.items[id]
    item = _.extend({}, item, widget: widget)

    items = _.clone(@props.design.items)
    items[id] = item

    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  # Call to print the dashboard
  print: =>
    # Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side). 1440 is double, so scale down
    # props are immutable in React 0.14+
    elem = H.div style: { transform: "scale(0.5)", transformOrigin: "top left" },
        React.createElement(DashboardViewComponent, _.extend({}, @props, { width: 1440 }))
    
    printer = new ReactElementPrinter()
    printer.print(elem, { delay: 5000 })

  renderScopes: ->
    React.createElement(WidgetScopesViewComponent, scopes: @state.widgetScoper.getScopes(), onRemoveScope: @handleRemoveScope)

  renderPageBreaks: (layoutEngine, layouts) ->
    # Get height
    height = layoutEngine.calculateHeight(layouts)

    # Page breaks are 8.5x11 with 0.5" margin 
    pageHeight = @props.width / 7.5 * 10

    number = Math.floor(height/pageHeight)

    elems = []
    if number > 0
      for i in [1..number]
        elems.push(H.div(className: "mwater-visualization-page-break", style: { position: "absolute", top: i * pageHeight }))

    return elems

  render: ->
    # Create layout engine
    # TODO create from design
    layoutEngine = new LegoLayoutEngine(@props.width, 24)

    # Get layouts indexed by id
    layouts = _.mapValues(@props.design.items, "layout")

    # Create widget elems
    elems = _.mapValues @props.design.items, (item, id) =>
      widget = WidgetFactory.createWidget(item.widget.type)

      # Get filters (passed in plus widget scoper filters)
      filters = @props.filters or []
      filters = filters.concat(@state.widgetScoper.getFilters(id))

      return widget.createViewElement({
        schema: @props.schema
        dataSource: @props.dataSource
        design: item.widget.design
        scope: @state.widgetScoper.getScope(id)
        filters: filters
        onScopeChange: @handleScopeChange.bind(null, id)
        onRemove: if @props.onDesignChange? then @handleRemove.bind(null, id)
        onDuplicate: if @props.onDesignChange? then @handleDuplicate.bind(null, id)
        onDesignChange: if @props.onDesignChange? then @handleDesignChange.bind(null, id)
      })  

    style = {
      height: "100%"
      position: "relative"
    }

    # Render widget container
    return H.div style: style, className: "mwater-visualization-dashboard", onClick: @handleClick,
      H.div null,
        @renderScopes()
        React.createElement(WidgetContainerComponent, 
          layoutEngine: layoutEngine
          layouts: layouts
          elems: elems
          onLayoutUpdate: if @props.onDesignChange? then @handleLayoutUpdate
          width: @props.width 
          standardWidth: @props.standardWidth
        )
        @renderPageBreaks(layoutEngine, layouts)
