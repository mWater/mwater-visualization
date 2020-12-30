PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

# MapViewComponent = require './MapViewComponent'
NewMapViewComponent = require('./NewMapViewComponent').NewMapViewComponent
MapDesignerComponent = require './MapDesignerComponent'
MapControlComponent = require './MapControlComponent'
AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
UndoStack = require '../UndoStack'
PopoverHelpComponent = require 'react-library/lib/PopoverHelpComponent'

# Map with designer on right
module.exports = class MapComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use

    # Data source for the map
    mapDataSource: PropTypes.shape({
      # Gets the data source for a layer
      getLayerDataSource: PropTypes.func.isRequired
    }).isRequired

    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func  # Null/undefined for readonly

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked

    extraFilters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired
      jsonql: PropTypes.object.isRequired
    })) # Extra filters to apply to view

    titleElem: PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: PropTypes.node              # Extra elements to add to right

  constructor: (props) ->
    super(props)
    @state = { 
      undoStack: new UndoStack().push(props.design) 
      transientDesign: props.design  # Temporary design for read-only maps
      zoomLocked: true
    }

  componentWillReceiveProps: (nextProps) ->
    # Save on stack
    @setState(undoStack: @state.undoStack.push(nextProps.design))

    if not _.isEqual(nextProps.design, @props.design)
      @setState(transientDesign: nextProps.design)

  handleUndo: => 
    undoStack = @state.undoStack.undo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  handleRedo: =>
    undoStack = @state.undoStack.redo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  # Gets the current design, whether prop or transient
  getDesign: ->
    return @state.transientDesign or @props.design
  
  handleZoomLockClick: => 
    @setState(zoomLocked: not @state.zoomLocked)

  renderActionLinks: ->
    R 'div', null,
      if @props.onDesignChange?
        [
          R 'a', key: "lock", className: "btn btn-link btn-sm", onClick: @handleZoomLockClick, 
            R 'span', className: "fa #{if @state.zoomLocked then "fa-lock red" else "fa-unlock green"}", style: {marginRight: 5}
            R PopoverHelpComponent, placement: "bottom",
              '''Changes to zoom level wont be saved in locked mode'''
          R 'a', key: "undo", className: "btn btn-link btn-sm #{if not @state.undoStack.canUndo() then "disabled" else ""}", onClick: @handleUndo,
            R 'span', className: "glyphicon glyphicon-triangle-left"
            R 'span', className: "hide-600px", " Undo"
          " "
          R 'a', key: "redo", className: "btn btn-link btn-sm #{if not @state.undoStack.canRedo() then "disabled" else ""}", onClick: @handleRedo, 
            R 'span', className: "glyphicon glyphicon-triangle-right"
            R 'span', className: "hide-600px", " Redo"
        ]
      @props.extraTitleButtonsElem

  renderHeader: ->
    R 'div', style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4, borderBottom: "solid 2px #AAA" },
      R 'div', style: { float: "right" },
        @renderActionLinks()
      @props.titleElem

  handleDesignChange: (design) =>
    if @props.onDesignChange
      @props.onDesignChange(design)
    else
      @setState(transientDesign: design)

  getDesign: ->
    if @props.onDesignChange
      return @props.design
    else
      return @state.transientDesign

  refMapView: (el) =>
    @mapView = el

  renderView: ->
    React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
      React.createElement(NewMapViewComponent, 
        ref: @refMapView
        mapDataSource: @props.mapDataSource
        schema: @props.schema, 
        dataSource: @props.dataSource
        design: @getDesign()
        onDesignChange: @handleDesignChange
        zoomLocked: @state.zoomLocked
        onRowClick: @props.onRowClick
        extraFilters: @props.extraFilters
      )
    )

  renderDesigner: ->
    if @props.onDesignChange
      React.createElement(MapDesignerComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        design: @getDesign()
        onDesignChange: @handleDesignChange
      )
    else
      React.createElement(MapControlComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        design: @getDesign()
        onDesignChange: @handleDesignChange 
      )

  render: ->
    return R 'div', style: { width: "100%", height: "100%", position: "relative" },
      R 'div', style: { position: "absolute", width: "70%", height: "100%", paddingTop: 40 }, 
        @renderHeader()
        R 'div', style: { width: "100%", height: "100%" }, 
          @renderView()
      R 'div', style: { position: "absolute", left: "70%", width: "30%", height: "100%", borderLeft: "solid 3px #AAA", overflowY: "auto" }, 
        @renderDesigner()
