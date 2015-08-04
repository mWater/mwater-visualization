React = require 'react'
H = React.DOM

LegoLayoutEngine = require './LegoLayoutEngine'
WidgetScoper = require './WidgetScoper'
WidgetContainerComponent = require './WidgetContainerComponent'

# Displays a dashboard, handling removing and passing up selection events
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

    selectedWidgetId: React.PropTypes.string
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired

    isDesigning: React.PropTypes.bool.isRequired
    onIsDesigningChange: React.PropTypes.func

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

  handleClick: (ev) =>
    # Deselect
    ev.stopPropagation()
    @props.onSelectedWidgetIdChange(null)

  handleRemove: (id) =>
    # First unselect widgets
    @props.onSelectedWidgetIdChange(null)
    
    # Update item layouts
    items = _.omit(@props.design.items, id)
    design = _.extend({}, @props.design, items: items)

    @props.onDesignChange(design)

  handleRemoveScope: (id) =>
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, null))    

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

    return H.div style: style, onClick: @handleRemoveScope.bind(null, id),
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

  render: ->
    # Create layout engine
    # TODO create from design
    layoutEngine = new LegoLayoutEngine(@props.width, 24)

    # Get layouts indexed by id
    layouts = _.mapValues(@props.design.items, "layout")

    # Create widgets indexed by id
    widgets = _.mapValues(@props.design.items, (item) =>
      @props.widgetFactory.createWidget(item.widget.type, item.widget.version, item.widget.design)
      )

    # Create widget elems
    elems = _.mapValues widgets, (widget, id) =>
      widget.createViewElement({
        selected: id == @props.selectedWidgetId
        onSelect: @props.onSelectedWidgetIdChange.bind(null, id)
        scope: @state.widgetScoper.getScope(id)
        filters: @state.widgetScoper.getFilters(id)
        onScopeChange: @handleScopeChange.bind(null, id)
        onRemove: @handleRemove.bind(null, id)
      })  

    style = {
      height: "100%"
    }

    # Render widget container
    return H.div style: style, onClick: @handleClick,
      @renderScopes()
      React.createElement(WidgetContainerComponent, 
        layoutEngine: layoutEngine
        layouts: layouts
        elems: elems
        onLayoutUpdate: @handleLayoutUpdate
        width: @props.width 
      )

