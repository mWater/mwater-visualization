LegoLayoutEngine = require './LegoLayoutEngine'
WidgetScoper = require './WidgetScoper'

# Displays a dashboard, handling removing and passing up selection events
module.exports = class DashboardViewComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

    selectedWidgetId: React.PropTypes.string
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired

    isDesigning: React.PropTypes.bool.isRequired
    onIsDesigningChange React.PropTypes.func

    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    widgetFactory: React.PropTypes.object.isRequired # Factory of type WidgetFactory to make widgets

  constructor: (props) ->
    super
    @state = {
      widgetScoper: new WidgetScoper() # Empty scoping
    }

  handleLayoutUpdate: (layouts) =>
    # Update item layouts
    items = _.mapValues(@props.design.items, (item) =>
      return _.extend({}, item, layout: layouts[widget.id])
      )
    design = _.extend({}, @props.design, items: items)
    @onDesignChange(design: design)

  handleScopeChange: (scope, filter) => 
    @setState(widgetScoper: @state.widgetScoper.applyScope(id, scope, filter))
    
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
    elems = _.mapValues(widgets, (widget, id) =>
      widget.createViewElement({
        # width and height will be injected by widget container component
        selected: id == @props.selectedWidgetId
        onSelect: @props.onSelectedWidgetIdChange.bind(null, id)
        scope: @state.widgetScoper.getScope(id)
        filters: @state.widgetScoper.getFilters(id)
        onScopeChange: @handleScopeChange
      })  

    # Render widget container
    return React.createElement(WidgetContainerComponent, 
      layoutEngine: layoutEngine
      layouts: layouts
      elems: elems
      onLayoutUpdate: @handleLayoutUpdate
      width: @props.width 
      height: @props.height)

