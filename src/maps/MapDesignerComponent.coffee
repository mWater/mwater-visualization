React = require 'react'
H = React.DOM
R = React.createElement

TabbedComponent = require 'react-library/lib/TabbedComponent'
NumberInputComponent = require('react-library/lib/NumberInputComponent')

CheckboxComponent = require '../CheckboxComponent'
ClickOutHandler = require('react-onclickout')
MapLayersDesignerComponent = require './MapLayersDesignerComponent'
MapFiltersDesignerComponent = require './MapFiltersDesignerComponent'
BaseLayerDesignerComponent = require './BaseLayerDesignerComponent'
PopoverHelpComponent = require 'react-library/lib/PopoverHelpComponent'
MapUtils = require './MapUtils'

module.exports = class MapDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"

    # Gets available system actions for a table. Called with (tableId). 
    # Returns [{ id: id of action, name: name of action, multiple: true if for multiple rows support, false for single }]
    getSystemActions: React.PropTypes.func 

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func # Sets popups of dashboard. If not set, readonly
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  handleAttributionChange: (text) =>
    design = _.extend({}, @props.design, {attribution: text})
    @props.onDesignChange(design)

  handleAutoBoundsChange: (value) =>
    design = _.extend({}, @props.design, {autoBounds: value})
    @props.onDesignChange(design)

  handleConvertToClusterMap: =>
    @props.onDesignChange(MapUtils.convertToClusterMap(@props.design)) 

  renderOptionsTab: ->
    H.div null,
      H.div className: "form-group",
        H.label className: "text-muted", 
          "Map Style"
  
        R BaseLayerDesignerComponent,
          design: @props.design
          onDesignChange: @props.onDesignChange

      R CheckboxComponent, 
        checked: @props.design.autoBounds
        onChange: @handleAutoBoundsChange,
          H.span className: "text-muted", 
            "Automatic zoom "
            R PopoverHelpComponent, placement: "left",
              '''Automatically zoom to the complete data whenever the map is loaded or the filters change'''

      if MapUtils.canConvertToClusterMap(@props.design)
        H.div key: "tocluster",
          H.a onClick: @handleConvertToClusterMap, className: "btn btn-link btn-sm",
            "Convert to cluster map"

      R AttributionComponent,
        text: @props.design.attribution
        onTextChange: @handleAttributionChange

      H.br()
      
      R AdvancedOptionsComponent, 
        design: @props.design
        onDesignChange: @props.onDesignChange

  render: ->
    H.div style: { padding: 5 },
      R TabbedComponent,
        initialTabId: "layers"
        tabs: [
          {
            id: "layers"
            label: [H.i(className: "fa fa-bars"), " Layers"]
            elem: R MapLayersDesignerComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              design: @props.design
              onDesignChange: @props.onDesignChange
              allowEditingLayers: true
          }
          {
            id: "filters"
            label: [H.i(className: "fa fa-filter"), " Filters"]
            elem: R MapFiltersDesignerComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              design: @props.design
              onDesignChange: @props.onDesignChange
          }
          {
            id: "options"
            label: [H.i(className: "fa fa-cog"), " Options"]
            elem: @renderOptionsTab()
          }
        ]
 

# Attribution inline editing
class AttributionComponent extends React.Component
  @propTypes:
    text: React.PropTypes.string
    onTextChange: React.PropTypes.func.isRequired

  @defaultProps:
    text: null

  constructor: ->
    super

    @state = {
      editing: false
    }

  handleTextChange: (e) =>
    @props.onTextChange(e.target.value)

  handleClickOut: () =>
    @setState(editing: false)

  renderEditor: ->
    R ClickOutHandler, onClickOut: @handleClickOut,
      H.input { ref: "attributionInput", onChange: @handleTextChange, value: @props.text, className: 'form-control'}

  handleTextClick: =>
    @setState(editing: true)

  render: ->
    elem = H.div style: { marginLeft: 5 }, 
      if @state.editing
        @renderEditor()
      else
        if @props.text
          H.span onClick: @handleTextClick, style: { cursor: "pointer" },
            @props.text
        else
          H.a onClick: @handleTextClick, className: "btn btn-link btn-sm",
            "+ Add attribution"

    if @props.text or @state.editing
      elem = H.div className: "form-group",
        H.label className: "text-muted",
          "Attribution"
        elem

    return elem

# Advanced options control
class AdvancedOptionsComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

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

      H.div null,
        H.span className: "text-muted", "Maximum Zoom Level: "
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.maxZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, maxZoom: v))

