React = require 'react'
H = React.DOM

# Simple widget that can be selected, dragged and resized
# Injects inner width and height to child element
module.exports = class SimpleWidgetComponent extends React.Component
  @propTypes:
    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    selected: React.PropTypes.bool # true if selected
    onSelect: React.PropTypes.func # called when selected
    onRemove: React.PropTypes.func # called when widget is removed
    
    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)
    dropdownItems: React.PropTypes.arrayOf(React.PropTypes.shape({name: React.PropTypes.string.isRequired, onClick: React.PropTypes.func.isRequired})).isRequired # A list of {name, onClick} actions for the dropdown

  handleClick: (ev) =>
    ev.stopPropagation()
    @props.onSelect()

  handleRemove: (ev) =>
    ev.stopPropagation()
    @props.onRemove()

  renderResizeHandle: ->
    resizeHandleStyle = {
      position: "absolute"
      right: 0
      bottom: 0
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')"
      backgroundRepeat: "no-repeat"
      backgroundPosition: "right bottom"
      width: 30
      height: 30
      cursor: "nwse-resize"
    }

    if @props.connectResizeHandle
      return @props.connectResizeHandle(
        H.div style: resizeHandleStyle, className: "mwater-visualization-simple-widget-resize-handle"
        )

  renderDropdownItem: (item) =>
    return H.li key: item.name,
      H.a onClick: item.onClick, item.name

  renderDropdown: ->
    dropdownStyle = {
      position: "absolute"
      right: 5
      top: 5
      cursor: "pointer"
    }

    elem = H.div style: dropdownStyle, "data-toggle": "dropdown",
      H.div {},
        H.div className: "mwater-visualization-simple-widget-gear-button", onClick: @handleGear,
          H.span className: "glyphicon glyphicon-cog"

    return H.div style: dropdownStyle,
      elem
      H.ul className: "dropdown-menu dropdown-menu-right", style: { top: 25 },
        _.map(@props.dropdownItems, @renderDropdownItem)        
        @renderDropdownItem({ name: "Remove", onClick: @handleRemove })

  closeMenu: ->
    $('[data-toggle="dropdown"]').parent().removeClass('open')

  render: ->
    style = { 
      width: @props.width
      height: @props.height 
      padding: 10
    }
    
    if @props.selected
      style.border = "dashed 2px #AAA"

    contents = H.div style: { position: "absolute", left: 10, top: 10, right: 10, bottom: 10 }, 
      React.cloneElement(React.Children.only(@props.children), 
        width: @props.width - 20, height: @props.height - 20)

    elem = H.div className: "mwater-visualization-simple-widget", style: style, onClick: @handleClick, onMouseLeave: @closeMenu,
      contents
      @renderResizeHandle()
      @renderDropdown()

    if @props.connectMoveHandle
      elem = @props.connectMoveHandle(elem)

    return elem
