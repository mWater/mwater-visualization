PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
Rcslider = require('rc-slider').default

# Designer for config
module.exports = class BaseLayerDesignerComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func.isRequired # Called with new design

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleBaseLayerChange: (baseLayer) =>
    @updateDesign(baseLayer: baseLayer)

  renderBaseLayer: (id, name) ->
    className = "mwater-visualization-layer"
    if id == @props.design.baseLayer
      className += " checked"
    
    R 'div', 
      key: id
      className: className
      style: { display: "inline-block" },
      onClick: @handleBaseLayerChange.bind(null, id),
        name

  handleOpacityChange: (newValue) =>
    @updateDesign(baseLayerOpacity: newValue/100)

  renderOpacityControl: ->
    if @props.design.baseLayerOpacity?
      opacity = @props.design.baseLayerOpacity
    else
      opacity = 1

    R 'div', className: 'form-group', style: { paddingTop: 10 },
      R 'label', className: 'text-muted',
        R 'span', null,
          "Opacity: #{Math.round(opacity * 100) }%"
      R 'div', style: {padding: '10px'},
        React.createElement(Rcslider,
          min: 0
          max: 100
          step: 1
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: opacity * 100,
          onChange: @handleOpacityChange
        )

  render: ->
    R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        "Background Map"

      R 'div', style: { marginLeft: 10 }, 
        R 'div', null, 
          @renderBaseLayer("cartodb_positron", "Light")
          @renderBaseLayer("cartodb_dark_matter", "Dark")
          @renderBaseLayer("bing_road", "Roads")
          @renderBaseLayer("bing_aerial", "Satellite")
          @renderBaseLayer("blank", "Blank")
  
        @renderOpacityControl()
