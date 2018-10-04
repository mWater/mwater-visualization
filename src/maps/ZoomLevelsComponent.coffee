PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

NumberInputComponent = require('react-library/lib/NumberInputComponent')

# Zoom level min and max control
module.exports = class ZoomLevelsComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired

  constructor: (props) ->
    super(props)

    @state = {
      expanded: false
    }

  render: ->
    if not @state.expanded
      return R 'div', null,
        R 'a', className: "btn btn-link btn-xs", onClick: (=> @setState(expanded: true)),
          "Advanced options..."

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", "Advanced"
      R 'div', key: "min",
        R 'span', className: "text-muted", "Minimum Zoom Level:"
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.minZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, minZoom: v))

      R 'div', key: "max",
        R 'span', className: "text-muted", "Maximum Zoom Level: "
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.maxZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, maxZoom: v))

