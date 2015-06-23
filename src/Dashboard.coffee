LegoLayoutEngine = require './LegoLayoutEngine'

class Dashboard
  # Pass in
  # design: Dashboard design
  # viewNode: DOM node to show dashboard view in
  # designing: initial designing state. True to show designer
  # onShowDesigner: called to show the designer pane, returns DOM node
  # onHideDesigner: called to hide the designer pane
  # onDesignChanged: called when design is changed (optional). Should save dashboard if desired
  constructor: (options) ->
    @design = options.design
    @viewNode = options.viewNode
    @designing = options.designing
    @onShowDesigner = options.onShowDesigner
    @onHideDesigner = options.onHideDesigner

    # Show designer if editing
    if @editing
      @designerNode = @onShowDesigner()

    # Create lego layout engine
    @layoutEngine = new LegoLayoutEngine()


  # Renders components
  render: ->
    # Create elements
    viewElem = React.createElement(WidgetContainerComponent, )

        layoutEngine: React.PropTypes.object.isRequired
    blocks: React.PropTypes.array.isRequired # Array of { id, widget, layout }
    elems: React.PropTypes.object.isRequired # Lookup of id -> elem
    width: React.PropTypes.number.isRequired # width in pixels
    height: React.PropTypes.number.isRequired # height in pixels
    connectDropTarget: React.PropTypes.func.isRequired # Injected by react-dnd wrapper
    onLayoutUpdate: React.PropTypes.func.isRequired # Called with array of { id, widget, layout }
