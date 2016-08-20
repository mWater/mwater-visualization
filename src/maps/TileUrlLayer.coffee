_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

Layer = require './Layer'
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
injectTableAlias = require('mwater-expressions').injectTableAlias
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')

###
Layer that is a custom Leaflet-style url tile layer
Design is:
  tileUrl: Url with {s}, {z}, {x}, {y}
###
module.exports = class TileUrlLayer extends Layer
  # Get min and max zoom levels
  getMinZoom: (design) -> return null
  getMaxZoom: (design) -> return null

  # True if layer can be edited
  isEditable: () ->
    return true

  # True if layer is incomplete (e.g. brand new) and should be editable immediately
  isIncomplete: (design, schema) ->
    return @validateDesign(@cleanDesign(design, schema), schema)?

  # Creates a design element with specified options.
  # Design should be cleaned on the way in and on way out.
  # options:
  #   design: design of layer
  #   schema: schema to use
  #   dataSource: data source to use
  #   onDesignChange: function called when design changes
  createDesignerElement: (options) ->
    return R TileUrlLayerDesignerComponent, design: options.design, onDesignChange: options.onDesignChange

  # Returns a cleaned design
  cleanDesign: (design, schema) ->
    return design

  # Validates design. Null if ok, message otherwise
  validateDesign: (design, schema) ->
    if not design.tileUrl
      return "Missing Url"
    return null


class TileUrlLayerDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  handleTileUrlChange: (ev) =>
    @props.onDesignChange(_.extend({}, @props.design, tileUrl: ev.target.value))

  render: ->
    H.div className: "form-group",
      H.label className: "text-muted", "Url (containing {z}, {x} and {y})"
      H.input type: "text", className: "form-control", value: @props.design.tileUrl or "", onChange: @handleTileUrlChange
