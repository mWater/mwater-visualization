PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

Widget = require './Widget'
DropdownWidgetComponent = require './DropdownWidgetComponent'
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')
LayerFactory = require '../maps/LayerFactory'
MapUtils = require '../maps/MapUtils'

# Design is the map design specified in maps/Map Design.md
module.exports = class MapWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement: (options) ->
    return React.createElement(MapWidgetComponent,
      schema: options.schema
      dataSource: options.dataSource
      widgetDataSource: options.widgetDataSource

      design: options.design
      onDesignChange: options.onDesignChange
      scope: options.scope
      filters: options.filters
      onScopeChange: options.onScopeChange
      width: options.width
      height: options.height
      onRowClick: options.onRowClick
    )

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    # Get filterable tables
    return MapUtils.getFilterableTables(design, schema)

class MapWidgetComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use
    widgetDataSource: PropTypes.object.isRequired

    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func # Called with new design.  null/undefined for readonly

    width: PropTypes.number
    height: PropTypes.number

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked

  constructor: (props) ->
    super(props)
    @state = { 
      # Design that is being edited. Change is propagated on closing window
      editDesign: null
    }  

  handleStartEditing: =>
    @setState(editDesign: @props.design)

  handleEndEditing: =>
    @props.onDesignChange(@state.editDesign)
    @setState(editDesign: null)

  handleEditDesignChange: (design) =>
    @setState(editDesign: design)

  renderEditor: ->
    if not @state.editDesign
      return null

    # Require here to prevent server require problems
    MapDesignerComponent = require '../maps/MapDesignerComponent'

    # Create editor
    editor = React.createElement(MapDesignerComponent, 
      schema: @props.schema
      dataSource: @props.dataSource
      design: @state.editDesign
      onDesignChange: @handleEditDesignChange
      filters: @props.filters
    )

    # Create map (maxing out at half of width of screen)
    width = Math.min(document.body.clientWidth/2, @props.width)
    height = @props.height * width / @props.width
    chart = @renderContent(@state.editDesign, @handleEditDesignChange, width, height)

    content = R 'div', style: { height: "100%", width: "100%" },
      R 'div', style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: width + 20, height: height + 20 },
        chart
      R 'div', style: { width: "100%", height: "100%", paddingLeft: width + 40 },
        R 'div', style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
          editor

    React.createElement(ModalWindowComponent,
      isOpen: true
      onRequestClose: @handleEndEditing,
        content)

  renderContent: (design, onDesignChange, width, height) ->
    # Require here to prevent server require problems
    MapViewComponent = require '../maps/MapViewComponent'

    R 'div', style: { width: width, height: height, padding: 10 },
      React.createElement(MapViewComponent, {
        schema: @props.schema
        design: design
        dataSource: @props.dataSource
        mapDataSource: @props.widgetDataSource.getMapDataSource(design)
        onDesignChange: onDesignChange
        scope: @props.scope
        onScopeChange: @props.onScopeChange
        extraFilters: @props.filters
        width: width - 20
        height: height - 20
        scrollWheelZoom: false # Prevent accidental zooming
        onRowClick: @props.onRowClick
      })

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return R 'div', null,
      if @props.onDesignChange?
        @renderEditor()
      React.createElement(DropdownWidgetComponent, 
        width: @props.width
        height: @props.height
        dropdownItems: dropdownItems,
          @renderContent(@props.design, null, @props.width, @props.height)
      )
