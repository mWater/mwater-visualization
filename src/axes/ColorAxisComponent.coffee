_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ui = require('../UIComponents')
ColorComponent = require '../ColorComponent'
AxisComponent = require './AxisComponent'

module.exports = class ColorAxisComponent extends React.Component
  @propTypes:
    defaultColor: React.PropTypes.string.isRequired # the default color
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object
    handleColorChange: React.PropTypes.func
    handleColorAxisChange: React.PropTypes.func
    table: React.PropTypes.string

  constructor: ->
    super
    @state = {
      mode: if @props.axis then "colorby" else "single"
    }

  onModeChange: (mode) =>
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
            onChange: @props.handleColorChange
        else
          R AxisComponent,
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            types: ["text", "enum", "boolean"]
            aggrNeed: "none"
            value: @props.axis
            showColorMap: true
            onChange: @props.handleColorAxisChange
