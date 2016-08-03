React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM

# Simple widget that can be dragged and resized
# Injects inner width and height to child element
# Contains a dropdown menu 
module.exports = class SimpleWidgetComponent extends React.Component
  @propTypes:
    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number # Standard width to use for scaling

    highlighted: React.PropTypes.bool # true if highlighted
    
    dropdownItems: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired
      icon: React.PropTypes.string # Glyphicon string. e.g. "remove"
      onClick: React.PropTypes.func.isRequired
      })).isRequired # A list of {label, icon, onClick} actions for the dropdown

  renderDropdownItem: (item, i) =>
    return H.li key: "#{i}",
      H.a onClick: item.onClick, 
        if item.icon then H.span(className: "glyphicon glyphicon-#{item.icon} text-muted")
        if item.icon then " "
        item.label

  renderDropdown: ->
    if @props.dropdownItems.length == 0 
      return null

    dropdownStyle = {
      position: "absolute"
      right: 5
      top: 5
      cursor: "pointer"
    }

    elem = H.div style: dropdownStyle, "data-toggle": "dropdown",
      H.div className: "mwater-visualization-simple-widget-gear-button",
        H.span className: "glyphicon glyphicon-cog"

    return H.div style: dropdownStyle,
      elem
      H.ul className: "dropdown-menu dropdown-menu-right", style: { top: 25 },
        _.map(@props.dropdownItems, @renderDropdownItem)        

  closeMenu: =>
    $(ReactDOM.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open')

  render: ->
    style = { 
      width: @props.width
      height: @props.height 
      padding: 5
    }
    
    if @props.highlighted
      style.border = "dashed 2px #337ab7"

    # Inject width, height and standardWidth into child element, leaving a 5px border
    contents = H.div style: { position: "absolute", left: 5, top: 5, right: 5, bottom: 5 }, 
      React.cloneElement(React.Children.only(@props.children), 
        width: @props.width - 10, height: @props.height - 10, standardWidth: @props.standardWidth - 10)

    elem = H.div className: "mwater-visualization-simple-widget", style: style, onMouseLeave: @closeMenu,
      contents
      @renderDropdown()

    return elem
