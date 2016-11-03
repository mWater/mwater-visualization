_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ui = require('../UIComponents')
ColorComponent = require '../ColorComponent'
AxisComponent = require './AxisComponent'

# Binds together the default color control and color map control
module.exports = class ColorAxisComponent extends React.Component
  @propTypes:
    defaultColor: React.PropTypes.string # the default color
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object
    onColorChange: React.PropTypes.func
    onColorAxisChange: React.PropTypes.func
    table: React.PropTypes.string

    # directly passed on to AxisComponent
    showColorMap: React.PropTypes.bool # Shows the color map TODO how can this be false??
    colorMapOptional: React.PropTypes.bool # Is the color map optional
    colorMapReorderable: React.PropTypes.bool # Is the color map reorderable
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired
    types: React.PropTypes.array # Optional types to limit to
    allowExcludedValues: React.PropTypes.bool # True to allow excluding of values via checkboxes

  constructor: ->
    super
    @state = {
      mode: if @props.axis then "multicolor" else "single"
      axis: @props.axis
    }

  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.axis, @props.axis)
      @setState(axis: nextProps.axis)

  onModeChange: (mode) =>
    if mode == "single"
      @props.onColorAxisChange(null)
    else
      @props.onColorAxisChange(@state.axis)
    @setState(mode: mode)

  render: ->
    H.div null,
      R ui.ButtonToggleComponent,
        value: if @props.axis then 'multicolor' else @state.mode
        options: [{label: 'Single color', value: 'single'},{label: 'Multiple Colors', value: 'multicolor'}]
        onChange: @onModeChange
      H.div style: { marginTop: 8},
        if not @props.axis and @state.mode == 'single'
          R ColorComponent,
            color: @props.defaultColor
            onChange: @props.onColorChange
        else
          H.div null,
            H.label className: "text-muted", style: {fontSize: 12},
              "Color by"
            R AxisComponent,
              schema: @props.schema
              dataSource: @props.dataSource
              table: @props.table
              types: @props.types
              aggrNeed: @props.aggrNeed
              value: @state.axis
              defaultColor: @props.defaultColor
              showColorMap: @props.showColorMap
              colorMapOptional: @props.colorMapOptional
              colorMapReorderable: @props.colorMapReorderable
              onChange: @props.onColorAxisChange
              allowExcludedValues: @props.allowExcludedValues
