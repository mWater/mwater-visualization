

# All logic needed to display and design a particular widget
module.exports = class Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  width: width in pixels
  #  height: height in pixels
  #  selected: true if selected
  #  onSelect: called when selected
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply (array of expressions)
  #  onScopeChange: called with (scope, filter) as a scope to apply to self and filter to apply to other widgets
  createViewElement: (options) ->
    throw new Error("Not implemented")

  # Creates a React element that is a designer for the widget
  # options:
  #  onDesignChange: called with new design if changed
  createDesignerElement: (options) ->
    throw new Error("Not implemented")