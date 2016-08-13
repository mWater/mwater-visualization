_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

uuid = require 'node-uuid'
LayerFactory = require './LayerFactory'

# Specific to mWater layer adding component
module.exports = class MWaterAddLayerComponent extends React.Component
  @propTypes:
    firstLayer: React.PropTypes.bool  # True if for first layer
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired

  constructor: (props) ->
    super(props)

    @state = {
      adding: false # If in adding mode
    }

  handleAddLayer: =>
    @setState(adding: false)

    layerView = {
      id: uuid.v4()
      name: "Water Points"
      desc: ""
      type: "Markers"
      visible: true
      opacity: 1
    }

    design = {
      "axes": {
        "geometry": {
          "expr": {
            "type": "field",
            "table": "entities.water_point",
            "column": "location"
          }
        }
      },
      "color": "#0088FF",
      "filter": null,
      "table": "entities.water_point",
    }

    # Clean design to make valid
    layer = LayerFactory.createLayer(layerView.type)
    layerView.design = layer.cleanDesign(design, @props.schema)

    @handleAddLayerView(layerView)

  handleAddLayerView: (layerView) =>
    # Add to list
    layerViews = @props.design.layerViews.slice()
    layerViews.push(layerView)

    design = _.extend({}, @props.design, layerViews: layerViews)
    @props.onDesignChange(design)

  render: ->
    if not @state.adding and not @props.firstLayer
      return H.button type: "button", className: "btn btn-primary", onClick: (=> @setState(adding: true)), style: { marginLeft: 5 },
        H.span className: "glyphicon glyphicon-plus"
        " Add"

    H.div style: { marginLeft: 5 },
      H.label null, 
        "What do you want to map?"
        if not @props.firstLayer
          H.button className: "btn btn-link btn-sm", onClick: (=> @setState(adding: false)),
            H.i className: "fa fa-remove"

      H.div style: { marginLeft: 5 },
        R ExpandingComponent, label: "Sites", initiallyOpen: true,
          R ExpandingComponent, label: "Water Points",
            R LinkComponent, onClick: @handleAddLayer, "All Water Points"
            R LinkComponent, onClick: @handleAddLayer, "Water Points By Type"
            R LinkComponent, onClick: @handleAddLayer, "Safe Water Access"
          R ExpandingComponent, label: "Communities"
          R ExpandingComponent, label: "Households"
          R ExpandingComponent, label: "Places of Worship"
          R ExpandingComponent, label: "Schools"
          R ExpandingComponent, label: "Sanitation Facilities"
        R ExpandingComponent, label: "Surveys",
          R ExpandingComponent, initiallyOpen: true, label: "My Surveys",
            R ExpandingComponent, label: "UWP Pre-Site Assessment",
              H.div className: "form-group",
                H.div null, "Location to map"
                H.select className: "form-control input-sm",
                  H.option value: "a", "Which water point is this associated with?"
                  H.option value: "b", "Enter Pre-Site location"
              H.div className: "form-group",
                H.div null, "Answer to visualize"
                H.select className: "form-control input-sm",
                  H.option value: "a", "None"
                  H.option value: "b", "What type of facility is this"
                  H.option value: "c", "Is it stable?"
              H.button className: "btn btn-sm btn-primary", type: "button",
                H.i className: "fa fa-plus"
                " Create"
            R ExpandingComponent, label: "GeMap 3"
          R ExpandingComponent, initiallyOpen: false, label: "Public Surveys",

      if @props.firstLayer
        H.div style: { marginTop: 40 }, 
          H.button className: "btn btn-default", type: "button",
            H.i className: "fa fa-magic"
            " Water P"
            H.i className: "fa fa-dot-circle-o", style: { color: "#337ab7", fontSize: "80%" }
            "int Mapper Wizard"

class ExpandingComponent extends React.Component
  constructor: (props) ->
    super(props)

    @state = {
      open: props.initiallyOpen
    }

  render: ->
    H.div style: { marginBottom: 5, marginTop: 3 },
      H.a style: { cursor: "pointer", fontSize: 16 }, onClick: (=> @setState(open: not @state.open)),
        if @state.open
          H.i className: "fa fa-caret-down"
        else
          H.i className: "fa fa-caret-right"
        " "
        @props.label
      if @state.open
        H.div style: { marginLeft: 10 },
          @props.children

class LinkComponent extends React.Component
  render: ->
    H.div style: { cursor: "pointer", padding: 3 }, 
      H.a onClick: @props.onClick,
        H.i className: "fa fa-plus"
        " "
        @props.children







