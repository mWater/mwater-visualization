_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ui = require('../UIComponents')
ColorComponent = require '../ColorComponent'
AxisComponent = require './AxisComponent'

# binds together the default color control and color map control
module.exports = class ColorAxisComponent extends React.Component
  @propTypes:
    defaultColor: React.PropTypes.string.isRequired # the default color
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object
    onColorChange: React.PropTypes.func
    onColorAxisChange: React.PropTypes.func
    table: React.PropTypes.string

    # directly passed on to AxisComponent
    showColorMap: React.PropTypes.bool # Shows the color map
    colorMapOptional: React.PropTypes.bool # Is the color map optional
    colorMapReorderable: React.PropTypes.bool # Is the color map reorderable
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired
    types: React.PropTypes.array # Optional types to limit to

  constructor: ->
    super
    @state = {
      mode: if @props.axis then "colorby" else "single"
      axis: @props.axis
    }

  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.axis, @props.axis) and @state.mode == "colorby"
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
        value: @state.mode
        options: [{label: 'Single color', value: 'single'},{label: 'Color by', value: 'colorby'}]
        onChange: @onModeChange
      H.div style: { marginTop: 8},
        if @state.mode == 'single'
          R ColorComponent,
            color: @props.defaultColor
            onChange: @props.onColorChange
        else
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
