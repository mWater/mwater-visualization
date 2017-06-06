PropTypes = require('prop-types')
React = require 'react'
H = React.DOM

# Pretty checkbox component
module.exports = class CheckboxComponent extends React.Component
  @propTypes:
    checked: PropTypes.bool # True to check
    onClick: PropTypes.func # Called when clicked
    onChange: PropTypes.func # Called with new value

  handleClick: =>
    if @props.onChange 
      @props.onChange(not @props.checked)
    if @props.onClick
      @props.onClick()

  render: ->
    H.div 
      className: (if @props.checked then "mwater-visualization-checkbox checked" else "mwater-visualization-checkbox")
      onClick: @handleClick,
        @props.children
