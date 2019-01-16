$ = require 'jquery'
PropTypes = require('prop-types')
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement

# Widget wrapper that adds a dropdown menu in a gear floating
module.exports = class DropdownWidgetComponent extends React.Component
  @propTypes:
    width: PropTypes.any    # Width specification
    height: PropTypes.any    # Height specification

    dropdownItems: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired
      icon: PropTypes.string # Glyphicon string. e.g. "remove"
      onClick: PropTypes.func.isRequired
      })).isRequired # A list of {label, icon, onClick} actions for the dropdown

  renderDropdownItem: (item, i) =>
    return R 'li', key: "#{i}",
      R 'a', onClick: item.onClick, 
        if item.icon then R('span', className: "glyphicon glyphicon-#{item.icon} text-muted")
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

    elem = R 'div', style: dropdownStyle, "data-toggle": "dropdown",
      R 'div', className: "mwater-visualization-simple-widget-gear-button",
        R 'span', className: "glyphicon glyphicon-cog"

    return R 'div', style: dropdownStyle,
      elem
      R 'ul', className: "dropdown-menu dropdown-menu-right", style: { top: 25 },
        _.map(@props.dropdownItems, @renderDropdownItem)        

  closeMenu: =>
    $(ReactDOM.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open')

  render: ->
    return R 'div', className: "mwater-visualization-simple-widget", onMouseLeave: @closeMenu, style: { width: @props.width, height: @props.height },
      @props.children
      @renderDropdown()
