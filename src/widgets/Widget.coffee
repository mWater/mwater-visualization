

# All logic needed to display and design a particular widget
module.exports = class Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply (array of expressions)
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design
  # Element will have the following props injected:
  #  width: width in pixels
  #  height: height in pixels
  #  connectMoveHandle:  Connects move handle for dragging (see WidgetContainerComponent)
  #  connectResizeHandle: Connects resize handle for dragging (see WidgetContainerComponent)
  createViewElement: (options) ->
    throw new Error("Not implemented")

  # Creates a React element that is a designer for the widget
  # options:
  #  onDesignChange: called with new design if changed
  createDesignerElement: (options) ->
    throw new Error("Not implemented")