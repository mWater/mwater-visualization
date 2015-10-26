React = require 'react'
H = React.DOM

LegoLayoutEngine = require './LegoLayoutEngine'
WidgetScoper = require './WidgetScoper'
WidgetContainerComponent = require './WidgetContainerComponent'
ReactElementPrinter = require './../ReactElementPrinter'

uuid = require 'node-uuid'

# Displays a dashboard, handling removing of widgets. No title bar or other decorations.
# Handles scoping
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

    width: React.PropTypes.number
    widgetFactory: React.PropTypes.object.isRequired # Factory of type WidgetFactory to make widgets

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
    # Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side)
    # We then double that and scale back down so that widgets have enough detail. Equivalent
    # to dashboard 1440px wide
    elem = H.div style: { transform: "scale(0.5)", transformOrigin: "top left" },
        React.createElement(DashboardViewComponent, 
          _.extend(@props, { width: 7.5*96*2 }))   
    
    printer = new ReactElementPrinter()
    printer.print(elem)

  renderScope: (id) =>
    style = {
      cursor: "pointer"
      borderRadius: 4
      border: "solid 1px #BBB"
      padding: "1px 5px 1px 5px"
      color: "#666"
      backgroundColor: "#EEE"
      display: "inline-block"
      marginLeft: 4
      marginRight: 4
    }

    scope = @state.widgetScoper.getScope(id) 
    if not scope
      return null

    return H.div key: id, style: style, onClick: @handleRemoveScope.bind(null, id),
      scope.name
      " "
      H.span className: "glyphicon glyphicon-remove"

  renderScopes: ->
    scopes = @state.widgetScoper.getScopes()
    if _.compact(_.values(scopes)).length == 0
      return null

    return H.div className: "alert alert-info", 
      H.span(className: "glyphicon glyphicon-filter")
      " Filters: "
      _.map(_.keys(scopes), @renderScope)

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

    # Create widgets indexed by id
    widgets = _.mapValues(@props.design.items, (item) =>
      @props.widgetFactory.createWidget(item.widget.type, item.widget.design)
      )

    # Create widget elems
    elems = _.mapValues widgets, (widget, id) =>
      widget.createViewElement({
        scope: @state.widgetScoper.getScope(id)
        filters: @state.widgetScoper.getFilters(id)
        onScopeChange: @handleScopeChange.bind(null, id)
        onRemove: @handleRemove.bind(null, id)
        onDuplicate: @handleDuplicate.bind(null, id)
        onDesignChange: @handleDesignChange.bind(null, id)
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
          onLayoutUpdate: @handleLayoutUpdate
          width: @props.width 
          standardWidth: 1440 # Standard width. Matches 8.5x11" paper with 0.5" margin at 192dpi
        )
        @renderPageBreaks(layoutEngine, layouts)
