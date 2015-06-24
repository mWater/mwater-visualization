

# All logic needed to display and design a particular widget
module.exports = class Widget
  # Creates a view of the widget
  # options:
  #  width: width in pixels
  #  height: height in pixels
  #  selected: true if selected
  #  onSelect: called when selected
  createViewElement: (options) ->
    throw new Error("Not implemented")

  createDesignerElement: (options) ->
    throw new Error("Not implemented")