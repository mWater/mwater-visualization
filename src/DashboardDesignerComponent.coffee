React = require 'react'
H = React.DOM

module.exports = class DashboardDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # Design of the dashboard
    onDesignChange: React.PropTypes.func.isRequired # Call when design changes
    selectedWidgetId: React.PropTypes.string  # Currently selected widget
    # onSelectedWidgetIdChange: React.PropTypes.func.isRequired # Call when change of widget (not used)
    # isDesigning: React.PropTypes.bool.isRequired # Not used (since always designing)
    # onIsDesigningChange: React.PropTypes.func
    widgetFactory: React.PropTypes.object.isRequired # Factory of type WidgetFactory to make widgets

  handleDesignChange: (widgetDesign) =>
    items = _.clone(@props.design.items)
    items[@props.selectedWidgetId] = _.extend({}, items[@props.selectedWidgetId], design: widgetDesign)
    @props.onDesignChange(_.extend({}, @props.design, items: items))


  render: ->
    if not @props.selectedWidgetId
      return H.div null, 
        H.i null, "Select a widget to begin"

    # Get selected widget
    widgetDef = @props.design.items[@props.selectedWidgetId].widget
    widget = @props.widgetFactory.createWidget(widgetDef.type, widgetDef.version, widgetDef.design)

    # Create design element
    return widget.createDesignerElement(onDesignChange: @handleDesignChange)

