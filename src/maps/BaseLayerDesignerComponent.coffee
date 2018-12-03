PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

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

  render: ->
    R 'div', style: { marginLeft: 10 }, 
      @renderBaseLayer("cartodb_positron", "Light")
      @renderBaseLayer("cartodb_dark_matter", "Dark")
      @renderBaseLayer("bing_road", "Roads")
      @renderBaseLayer("bing_aerial", "Satellite")

  # handleBaseLayerChange: (ev) =>
  #   @updateDesign(baseLayer: ev.target.value)

  # render: ->
  #   R 'select', className: "form-control", value: @props.design.baseLayer, onChange: @handleBaseLayerChange,
  #     R 'option', key: "bing_road", value: "bing_road",
  #       "Roads"
  #     R 'option', key: "bing_aerial", value: "bing_aerial",
  #       "Satellite"
  #     R 'option', key: "cartodb_positron", value: "cartodb_positron",
  #       "Light"
  #     R 'option', key: "cartodb_dark_matter", value: "cartodb_dark_matter",
  #       "Dark"
