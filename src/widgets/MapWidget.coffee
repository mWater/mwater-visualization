React = require 'react'
H = React.DOM
_ = require 'lodash'

Widget = require './Widget'
DropdownWidgetComponent = require './DropdownWidgetComponent'
ModalWindowComponent = require('react-library/lib/ModalWindowComponent')
LayerFactory = require '../maps/LayerFactory'

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
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  #  onSystemAction: Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"
  #  namedStrings: optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
  #  popups: array of dashboard popups
  #  onPopupsChange: called when popups are changed
  #  getSystemActions: Gets available system actions for a table. Called with (tableId). 
  #    Returns [{ id: id of action, name: name of action, multiple: true if for multiple rows support, false for single }]
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
      standardWidth: options.standardWidth
      onSystemAction: options.onSystemAction
      namedStrings: options.namedStrings
      popups: options.popups
      onPopupsChange: options.onPopupsChange
    )

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    # Get filterable tables
    filterableTables = []

    for layerView in design.layerViews
      # Create layer
      layer = LayerFactory.createLayer(layerView.type)

      # Get filterable tables
      filterableTables = filterableTables.concat(layer.getFilterableTables(layerView.design, schema))

    return _.uniq(_.compact(filterableTables))

class MapWidgetComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    widgetDataSource: React.PropTypes.object.isRequired

    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func # Called with new design.  null/undefined for readonly

    width: React.PropTypes.number
    height: React.PropTypes.number

    # scope of the widget (when the widget self-selects a particular scope)
    scope: React.PropTypes.shape({ 
      name: React.PropTypes.node.isRequired
      filter: React.PropTypes.shape({ table: React.PropTypes.string.isRequired, jsonql: React.PropTypes.object.isRequired })
      data: React.PropTypes.any
    }) 
    filters: React.PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"

    # Gets available system actions for a table. Called with (tableId). 
    # Returns [{ id: id of action, name: name of action, multiple: true if for multiple rows support, false for single }]
    getSystemActions: React.PropTypes.func 

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func # Sets popups of dashboard. If not set, readonly
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  constructor: (props) ->
    super
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
      onSystemAction: @props.onSystemAction
      getSystemActions: @props.getSystemActions
      namedStrings: @props.namedStrings
      popups: @props.popups
      onPopupsChange: @props.onPopupsChange
    )

    # Create map (maxing out at half of width of screen)
    width = Math.min(document.body.clientWidth/2, @props.width)
    height = @props.height * width / @props.width
    chart = @renderContent(@state.editDesign, @handleEditDesignChange, width, height)

    content = H.div style: { height: "100%", width: "100%" },
      H.div style: { position: "absolute", left: 0, top: 0, border: "solid 2px #EEE", borderRadius: 8, padding: 10, width: width + 20, height: height + 20 },
        chart
      H.div style: { width: "100%", height: "100%", paddingLeft: width + 40 },
        H.div style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" },
          editor

    React.createElement(ModalWindowComponent,
      isOpen: true
      onRequestClose: @handleEndEditing,
        content)

  renderContent: (design, onDesignChange, width, height) ->
    # Require here to prevent server require problems
    MapViewComponent = require '../maps/MapViewComponent'

    H.div style: { width: width, height: height, padding: 10 },
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
        onSystemAction: @props.onSystemAction
        getSystemActions: @props.getSystemActions
        namedStrings: @props.namedStrings
        popups: @props.popups
        onPopupsChange: @props.onPopupsChange
      })

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div null,
      if @props.onDesignChange?
        @renderEditor()
      React.createElement(DropdownWidgetComponent, 
        width: @props.width
        height: @props.height
        dropdownItems: dropdownItems,
          @renderContent(@props.design, null, @props.width, @props.height)
      )
