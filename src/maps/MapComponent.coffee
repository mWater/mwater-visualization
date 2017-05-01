_ = require 'lodash'
React = require 'react'
H = React.DOM

MapViewComponent = require './MapViewComponent'
MapDesignerComponent = require './MapDesignerComponent'
MapControlComponent = require './MapControlComponent'
AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
UndoStack = require '../UndoStack'

# Map with designer on right
module.exports = class MapComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use

    # Data source for the map
    mapDataSource: React.PropTypes.shape({
      # Gets the data source for a layer
      getLayerDataSource: React.PropTypes.func.isRequired
    }).isRequired

    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func  # Null/undefined for readonly

    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"

    titleElem: React.PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: React.PropTypes.node              # Extra elements to add to right

  constructor: (props) ->
    super
    @state = { 
      undoStack: new UndoStack().push(props.design) 
      transientDesign: props.design  # Temporary design for read-only maps
    }

  componentWillReceiveProps: (nextProps) ->
    # Save on stack
    @setState(undoStack: @state.undoStack.push(nextProps.design))

    if not _.isEqual(nextProps.design, @props.design)
      @setState(transientDesign: nextProps.design)

  handlePrint: (scale) =>
    @mapView.print(scale)

  handleUndo: => 
    undoStack = @state.undoStack.undo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  handleRedo: =>
    undoStack = @state.undoStack.redo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  renderPrint: ->
    return H.div key: "print", className: "btn-group",
      H.button type: "button", "data-toggle": "dropdown", className: "btn btn-link btn-sm dropdown-toggle",
        H.span className: "glyphicon glyphicon-print"
        " Print "
        H.span className: "caret"
      H.ul className: "dropdown-menu",
        H.li key: "scale2",
          H.a onClick: @handlePrint.bind(null, 2), "Normal"
        H.li key: "scale3",
          H.a onClick: @handlePrint.bind(null, 3), "High-Resolution"

  renderActionLinks: ->
    H.div null,
      if @props.onDesignChange?
        [
          H.a key: "undo", className: "btn btn-link btn-sm #{if not @state.undoStack.canUndo() then "disabled" else ""}", onClick: @handleUndo,
            H.span className: "glyphicon glyphicon-triangle-left"
            " Undo"
          " "
          H.a key: "redo", className: "btn btn-link btn-sm #{if not @state.undoStack.canRedo() then "disabled" else ""}", onClick: @handleRedo, 
            H.span className: "glyphicon glyphicon-triangle-right"
            " Redo"
        ]
      @renderPrint()
      @props.extraTitleButtonsElem

  renderHeader: ->
    H.div style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4, borderBottom: "solid 2px #AAA" },
      H.div style: { float: "right" },
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
      React.createElement(MapViewComponent, 
        ref: @refMapView
        mapDataSource: @props.mapDataSource
        schema: @props.schema, 
        dataSource: @props.dataSource
        design: @getDesign()
        onDesignChange: @handleDesignChange
        onSystemAction: @props.onSystemAction
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
    return H.div style: { width: "100%", height: "100%", position: "relative" },
      H.div style: { position: "absolute", width: "70%", height: "100%", paddingTop: 40 }, 
        @renderHeader()
        H.div style: { width: "100%", height: "100%" }, 
          @renderView()
      H.div style: { position: "absolute", left: "70%", width: "30%", height: "100%", borderLeft: "solid 3px #AAA", overflowY: "auto" }, 
        @renderDesigner()
