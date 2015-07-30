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
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

    selectedWidgetId: React.PropTypes.string
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired

    isDesigning: React.PropTypes.bool.isRequired
    onIsDesigningChange: React.PropTypes.func

    width: React.PropTypes.number.isRequired

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

  handlePrint: =>

    $("body").append('''
      <style>
@media print {
   body {
     visibility: hidden;
   }

   #print_xyz {
     display: block !important;
     visibility: visible;
/*     background-color: #EEE;*/
     border: solid 4px blue;
   }
 }
 #print_xyz {
  display: none;
 }
    </style>
  ''')

    # Add to body
    $("body").append('''
      <div id="print_xyz">
      </div>
      ''')

    elem = H.div null, 
      React.createElement(InnerDashboardViewComponent, @props)
    # window.print()

    React.render(elem, $("#print_xyz").get(0), =>
      _.delay () =>
        window.print()
        React.unmountComponentAtNode($("#print_xyz").get(0))
        $("#print_xyz").remove()
      , 1000
      )

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
        # width and height will be injected by widget container component
        width: 0
        height: 0
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

#     embeddedCss = '''
# @media print {
#   body {
#     visibility: hidden;
#   }
#   .mwater-visualization-dashboard {
#     visibility: visible;
#     background-color: #EEE;
#     border: solid 4px green;
# /*    position: fixed;
#     left: 0;
#     right: 0;
#     top: 0;
#     width: 100%;*/
#   }
# /*  .mwater-visualization-dashboard {
#   #   position: absolute;
#   #   left: 0;
#   #   top: 0;
#   # }*/
# }
#     '''

    # Render widget container
    return H.div style: style, className: "mwater-visualization-dashboard", onClick: @handleClick,
      H.button type: "button", onClick: @handlePrint, "Print"
      @renderScopes()
      React.createElement(WidgetContainerComponent, 
        layoutEngine: layoutEngine
        layouts: layouts
        elems: elems
        onLayoutUpdate: @handleLayoutUpdate
        width: @props.width 
      )

