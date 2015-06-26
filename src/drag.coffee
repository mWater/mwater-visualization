React = require 'react'
H = React.DOM
LegoLayoutEngine = require './LegoLayoutEngine'
WidgetContainerComponent = require './WidgetContainerComponent'
BarChartViewComponent = require './BarChartViewComponent'

data = [{"x":"broken","y":"48520"},{"x":null,"y":"2976"},{"x":"ok","y":"173396"},{"x":"maint","y":"12103"},{"x":"missing","y":"3364"}]

class Widget extends React.Component
  render: ->
    style = {
      width: @props.width
      height: @props.height
      # border: "solid 2px #35A"
      # borderRadius: 3
      padding: 5
      position: "absolute"
    }

    resizeHandleStyle = {
      position: "absolute"
      right: 0
      bottom: 0
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')"
      width: 10
      height: 10
      cursor: "nwse-resize"
    }

    myData = _.cloneDeep(data)
    myData[0].y = @props.data
    return @props.connectMoveHandle(
      H.div style: style, className: "widget", onClick: (=> console.log("clicked")),
        React.createElement(BarChartViewComponent, width: @props.width - 10, height: @props.height - 10, data: myData)
        @props.connectResizeHandle(
          H.div style: resizeHandleStyle, className: "widget-resize-handle"
          )
      )

class Root extends React.Component
  constructor: ->
    super
    @state = {
      widgets: [
        { id: "a", contents: 40000, layout: { x: 0, y: 0, w: 4, h: 3 } }
        { id: "b", contents: 80000, layout: { x: 4, y: 0, w: 4, h: 3 } }
        { id: "c", contents: 120000, layout: { x: 8, y: 0, w: 4, h: 3 } }
        { id: "d", contents: 40000, layout: { x: 0, y: 1, w: 4, h: 3 } }
        { id: "e", contents: 80000, layout: { x: 4, y: 1, w: 4, h: 3 } }
        { id: "f", contents: 120000, layout: { x: 8, y: 1, w: 4, h: 3 } }
      ] 
    }

  handleLayoutUpdate: (layouts) =>
    # Update widget layouts
    widgets = _.map(@state.widgets, (widget) =>
      return _.extend({}, widget, layout: layouts[widget.id])
      )
    @setState(widgets: widgets)

  render: ->
    layoutEngine = new LegoLayoutEngine(800, 12)

    # Create elems
    elems = {}
    for widget in @state.widgets
      elems[widget.id] = React.createElement(Widget, data: widget.contents)

    # Create layouts
    layouts = _.object(_.pluck(@state.widgets, "id"), _.pluck(@state.widgets, "layout"))

    H.div style: { border: "solid 1px #CCC", width: 800 }, 
      React.createElement(WidgetContainerComponent, 
        layoutEngine: layoutEngine
        layouts: layouts
        elems: elems
        onLayoutUpdate: @handleLayoutUpdate
        width: 800, 
        height: 600)

$ ->
  sample = React.createElement(Root)
  React.render(sample, document.getElementById('root'))
  # React.render(sample, document.getElementById('root2'))
