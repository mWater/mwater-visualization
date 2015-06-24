

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

  render: ->
    # Create layout engine

    # Render widget container