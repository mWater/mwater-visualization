React = require 'react'
H = React.DOM

# Pretty radio button component
module.exports = class RadioButtonComponent extends React.Component
  @propTypes:
    checked: React.PropTypes.bool # True to check
    onClick: React.PropTypes.func # Called when clicked
    onChange: React.PropTypes.func # Called with new value

  handleClick: =>
    if @props.onChange 
      @props.onChange(not @props.checked)
    if @props.onClick
      @props.onClick()

  render: ->
    H.div 
      className: (if @props.checked then "mwater-visualization-radio checked" else "mwater-visualization-radio")
      onClick: @handleClick,
        @props.children
