

Widget = require './Widget'

# A widget which is a chart
module.exports = class ChartWidget extends Widget
  constructor: (chart, design, dataSource) ->

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