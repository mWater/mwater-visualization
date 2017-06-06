PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

NumberInputComponent = require('react-library/lib/NumberInputComponent')

# Zoom level min and max control
module.exports = class ZoomLevelsComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired

  constructor: (props) ->
    super

    @state = {
      expanded: false
    }

  render: ->
    if not @state.expanded
      return H.div null,
        H.a className: "btn btn-link btn-xs", onClick: (=> @setState(expanded: true)),
          "Advanced options..."

    return H.div className: "form-group",
      H.label className: "text-muted", "Advanced"
      H.div key: "min",
        H.span className: "text-muted", "Minimum Zoom Level:"
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.minZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, minZoom: v))

      H.div key: "max",
        H.span className: "text-muted", "Maximum Zoom Level: "
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.maxZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, maxZoom: v))

