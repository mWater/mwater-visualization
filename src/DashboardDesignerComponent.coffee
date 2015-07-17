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
    # TODO uses fake width
    layoutEngine = new LegoLayoutEngine(100, 24)

    # Get existing layouts
    layouts = _.pluck(_.values(@props.design.items), "layout")

    # Find place for new item
    layout = layoutEngine.appendLayout(layouts, 12, 12)

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
    @props.onSelectedWidgetIdChange(id)

  # Designer when no widgets displayed
  renderGeneralDesigner: ->
    return H.div null, 
      H.div className: "well well-sm", 
        "Click on widgets to edit them"

      H.div className: "btn-group",
        H.button type: "button", "data-toggle": "dropdown", className: "btn btn-default dropdown-toggle",
          H.span className: "glyphicon glyphicon-plus"
          " Add Widget "
          H.span className: "caret"
        H.ul className: "dropdown-menu",
          H.li null,
            H.a onClick: @handleAddBarChart, "Bar Chart"

  render: ->
    if not @props.selectedWidgetId
      return @renderGeneralDesigner()

    # Get selected widget
    widgetDef = @props.design.items[@props.selectedWidgetId].widget
    widget = @props.widgetFactory.createWidget(widgetDef.type, widgetDef.version, widgetDef.design)

    # Create design element
    return widget.createDesignerElement(onDesignChange: @handleDesignChange)

