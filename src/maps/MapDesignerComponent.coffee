PropTypes = require('prop-types')
React = require 'react'
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
ExprCompiler = require('mwater-expressions').ExprCompiler

module.exports = class MapDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func.isRequired # Called with new design
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  @childContextTypes:
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired) # List of tables (ids) being used. Use this to present an initially short list to select from

  getChildContext: -> { 
    # Pass active tables down to table select components so they can present a shorter list
    activeTables: MapUtils.getFilterableTables(@props.design, @props.schema)
  }

  handleAttributionChange: (text) =>
    design = _.extend({}, @props.design, {attribution: text})
    @props.onDesignChange(design)

  handleAutoBoundsChange: (value) =>
    design = _.extend({}, @props.design, {autoBounds: value})
    @props.onDesignChange(design)

  handleConvertToClusterMap: =>
    @props.onDesignChange(MapUtils.convertToClusterMap(@props.design)) 

  renderOptionsTab: ->
    R 'div', null,
      R 'div', className: "form-group",
        R 'label', className: "text-muted", 
          "Map Style"
  
        R BaseLayerDesignerComponent,
          design: @props.design
          onDesignChange: @props.onDesignChange

      R CheckboxComponent, 
        checked: @props.design.autoBounds
        onChange: @handleAutoBoundsChange,
          R 'span', className: "text-muted", 
            "Automatic zoom "
            R PopoverHelpComponent, placement: "left",
              '''Automatically zoom to the complete data whenever the map is loaded or the filters change'''

      if MapUtils.canConvertToClusterMap(@props.design)
        R 'div', key: "tocluster",
          R 'a', onClick: @handleConvertToClusterMap, className: "btn btn-link btn-sm",
            "Convert to cluster map"

      R AttributionComponent,
        text: @props.design.attribution
        onTextChange: @handleAttributionChange

      R('br')
      
      R AdvancedOptionsComponent, 
        design: @props.design
        onDesignChange: @props.onDesignChange

  render: ->
    filters = (@props.filters or []).concat(MapUtils.getCompiledFilters(@props.design, @props.schema, MapUtils.getFilterableTables(@props.design, @props.schema)))

    R 'div', style: { padding: 5 },
      R TabbedComponent,
        initialTabId: "layers"
        tabs: [
          {
            id: "layers"
            label: [R('i', className: "fa fa-bars"), " Layers"]
            elem: R MapLayersDesignerComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              design: @props.design
              onDesignChange: @props.onDesignChange
              allowEditingLayers: true
              filters: _.compact(filters)
          }
          {
            id: "filters"
            label: [R('i', className: "fa fa-filter"), " Filters"]
            elem: R MapFiltersDesignerComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              design: @props.design
              onDesignChange: @props.onDesignChange
          }
          {
            id: "options"
            label: [R('i', className: "fa fa-cog"), " Options"]
            elem: @renderOptionsTab()
          }
        ]
 

# Attribution inline editing
class AttributionComponent extends React.Component
  @propTypes:
    text: PropTypes.string
    onTextChange: PropTypes.func.isRequired

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
      R 'input', { onChange: @handleTextChange, value: @props.text, className: 'form-control'}

  handleTextClick: =>
    @setState(editing: true)

  render: ->
    elem = R 'div', style: { marginLeft: 5 }, 
      if @state.editing
        @renderEditor()
      else
        if @props.text
          R 'span', onClick: @handleTextClick, style: { cursor: "pointer" },
            @props.text
        else
          R 'a', onClick: @handleTextClick, className: "btn btn-link btn-sm",
            "+ Add attribution"

    if @props.text or @state.editing
      elem = R 'div', className: "form-group",
        R 'label', className: "text-muted",
          "Attribution"
        elem

    return elem

# Advanced options control
class AdvancedOptionsComponent extends React.Component
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
      return R 'div', null,
        R 'a', className: "btn btn-link btn-xs", onClick: (=> @setState(expanded: true)),
          "Advanced options..."

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", "Advanced"

      R 'div', null,
        R 'span', className: "text-muted", "Maximum Zoom Level: "
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.maxZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, maxZoom: v))

