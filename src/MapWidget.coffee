React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
LeafletMapComponent = require './LeafletMapComponent'

module.exports = class MapWidget extends Widget
  constructor: (design) ->
    @design = design

  # Creates a view of the widget
  # options:
  #  selected: true if selected
  #  onSelect: called when selected
  #  onRemove: called when widget is removed
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply (array of expressions)
  #  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  createViewElement: (options) ->
    dropdownItems = [{ node: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: options.onRemove }]

    # Wrap in a simple widget
    return React.createElement(SimpleWidgetComponent, 
      selected: options.selected
      onSelect: options.onSelect
      dropdownItems: dropdownItems,
        React.createElement(MapWidgetViewComponent, {
          design: @design
        })
      )

  # Creates a React element that is a designer for the widget
  # options:
  #  onDesignChange: called with new design if changed
  createDesignerElement: (options) ->
    return React.createElement(MapWidgetDesignerComponent, design: @design, onDesignChange: options.onDesignChange)

class MapWidgetViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    width: React.PropTypes.number
    height: React.PropTypes.number

  render: ->
    React.createElement(LeafletMapComponent, {
      baseLayerId: "bing_road"
      initialCenter: { lat: 0, lng: 10 }
      initialZoom: 5
      width: @props.width
      height: @props.height
    })

class MapWidgetDesignerComponent extends React.Component 
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  render: ->
    H.div null, "No options"
