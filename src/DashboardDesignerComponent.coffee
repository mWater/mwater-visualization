React = require 'react'
H = React.DOM
uuid = require 'node-uuid'
LegoLayoutEngine = require './LegoLayoutEngine'

module.exports = class DashboardDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # Design of the dashboard
    onDesignChange: React.PropTypes.func.isRequired # Call when design changes
    selectedWidgetId: React.PropTypes.string  # Currently selected widget
    onSelectedWidgetIdChange: React.PropTypes.func.isRequired # Call when change of widget (not used)
    isDesigning: React.PropTypes.bool.isRequired # Not used (since always designing)
    onIsDesigningChange: React.PropTypes.func
    width: React.PropTypes.number.isRequired # Width of dashboard
    widgetFactory: React.PropTypes.object.isRequired # Factory of type WidgetFactory to make widgets

  handleDesignChange: (widgetDesign) =>
    widget = @props.design.items[@props.selectedWidgetId].widget
    widget = _.extend({}, widget, design: widgetDesign)

    item = @props.design.items[@props.selectedWidgetId]
    item = _.extend({}, item, widget: widget)

    items = _.clone(@props.design.items)
    items[@props.selectedWidgetId] = item

    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  handleAddBarChart: =>
    # Create layout engine
    # TODO create from design
    layoutEngine = new LegoLayoutEngine(@props.width, 12)

    # Get existing layouts
    layouts = _.pluck(_.values(@props.design.items), "layout")

    # Find place for new item
    layout = layoutEngine.appendLayout(layouts, 4, 4)

    # Create item
    item = {
      layout: layout
      widget: {
        type: "BarChart"
        version: "0.0.0"
        design: {}
      }
    }

    id = uuid.v4()
    # Add item
    items = _.clone(@props.design.items)
    items[id] = item

    design = _.extend({}, @props.design, items: items)
    @props.onDesignChange(design)

  # Designer when no widgets displayed
  renderGeneralDesigner: ->
    return H.div null, 
      H.div null, "Click on widgets to edit them"
      H.a className: "btn btn-link", onClick: @handleAddBarChart,
        H.span className: "glyphicon glyphicon-plus"
        " "
        "Add Bar Chart"

  render: ->
    if not @props.selectedWidgetId
      return @renderGeneralDesigner()

    # Get selected widget
    widgetDef = @props.design.items[@props.selectedWidgetId].widget
    widget = @props.widgetFactory.createWidget(widgetDef.type, widgetDef.version, widgetDef.design)

    # Create design element
    return widget.createDesignerElement(onDesignChange: @handleDesignChange)

