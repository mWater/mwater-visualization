React = require 'react'
H = React.DOM

LegoLayoutEngine = require './LegoLayoutEngine'
WidgetScoper = require './WidgetScoper'
WidgetContainerComponent = require './WidgetContainerComponent'
AutoWidthComponent = require './AutoWidthComponent'

# Displays a dashboard, handling removing and passing up selection events
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

    selectedWidgetId: React.PropTypes.string
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired

    isDesigning: React.PropTypes.bool.isRequired
    onIsDesigningChange: React.PropTypes.func

    widgetFactory: React.PropTypes.object.isRequired # Factory of type WidgetFactory to make widgets

  render: ->
    React.createElement(AutoWidthComponent, null, 
      React.createElement(InnerDashboardViewComponent, @props))

# Dashboard component that requires width. Wrapped to inject width automatically
class InnerDashboardViewComponent extends React.Component
  # @propTypes: 
  #   design: React.PropTypes.object.isRequired
  #   onDesignChange: React.PropTypes.func.isRequired

  #   selectedWidgetId: React.PropTypes.string
  #   onSelectedWidgetIdChange: React.PropTypes.func.isRequired

  #   isDesigning: React.PropTypes.bool.isRequired
  #   onIsDesigningChange: React.PropTypes.func

  #   width: React.PropTypes.number.isRequired

  #   widgetFactory: React.PropTypes.object.isRequired # Factory of type WidgetFactory to make widgets

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

  handleScopeChange: (scope, filter) => 
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, scope, filter))

  handleClick: (ev) =>
    # Deselect
    ev.stopPropagation()
    @props.onSelectedWidgetIdChange(null)

  handleRemove: (id) =>
    # Update item layouts
    items = _.omit(@props.design.items, id)
    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  render: ->
    # Create layout engine
    # TODO create from design
    layoutEngine = new LegoLayoutEngine(@props.width, 12)

    # Get layouts indexed by id
    layouts = _.mapValues(@props.design.items, "layout")

    # Create widgets indexed by id
    widgets = _.mapValues(@props.design.items, (item) =>
      @props.widgetFactory.createWidget(item.widget.type, item.widget.version, item.widget.design)
      )

    # Create widget elems
    elems = _.mapValues widgets, (widget, id) =>
      widget.createViewElement({
        # width and height will be injected by widget container component
        width: 0
        height: 0
        selected: id == @props.selectedWidgetId
        onSelect: @props.onSelectedWidgetIdChange.bind(null, id)
        scope: @state.widgetScoper.getScope(id)
        filters: @state.widgetScoper.getFilters(id)
        onScopeChange: @handleScopeChange
        onRemove: @handleRemove.bind(null, id)
      })  

    style = {
    }

    # Render widget container
    return H.div style: style, onClick: @handleClick,
      React.createElement(WidgetContainerComponent, 
        layoutEngine: layoutEngine
        layouts: layouts
        elems: elems
        onLayoutUpdate: @handleLayoutUpdate
        width: @props.width 
      )

