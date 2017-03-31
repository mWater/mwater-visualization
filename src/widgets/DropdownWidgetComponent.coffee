React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM

# Widget wrapper that adds a dropdown menu in a gear floating
module.exports = class DropdownWidgetComponent extends React.Component
  @propTypes:
    width: React.PropTypes.any    # Width specification
    height: React.PropTypes.any    # Height specification

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
      right: 3
      top: 3
      cursor: "pointer"
      zIndex: 10000
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
    return H.div className: "mwater-visualization-simple-widget", onMouseLeave: @closeMenu, style: { width: @props.width, height: @props.height },
      @props.children
      @renderDropdown()
