React = require 'react'
H = React.DOM

MapViewComponent = require './MapViewComponent'
MapDesignerComponent = require './MapDesignerComponent'
AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
UndoStack = require '../UndoStack'

# Map with designer on right
module.exports = class MapComponent extends React.Component
  @propTypes:
    layerFactory: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use

    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func  # Null/undefined for readonly

    titleElem: React.PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: React.PropTypes.node              # Extra elements to add to right

  constructor: (props) ->
    super
    @state = { undoStack: new UndoStack().push(props.design) }

  componentWillReceiveProps: (nextProps) ->
    # Save on stack
    @setState(undoStack: @state.undoStack.push(nextProps.design))

  handleUndo: => 
    undoStack = @state.undoStack.undo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  handleRedo: =>
    undoStack = @state.undoStack.redo()

    # We need to use callback as state is applied later
    @setState(undoStack: undoStack, => @props.onDesignChange(undoStack.getValue()))

  renderActionLinks: ->
    H.div null,
      H.a key: "undo", className: "btn btn-link btn-sm #{if not @state.undoStack.canUndo() then "disabled" else ""}", onClick: @handleUndo,
        H.span className: "glyphicon glyphicon-triangle-left"
        " Undo"
      " "
      H.a key: "redo", className: "btn btn-link btn-sm #{if not @state.undoStack.canRedo() then "disabled" else ""}", onClick: @handleRedo, 
        H.span className: "glyphicon glyphicon-triangle-right"
        " Redo"
      @props.extraTitleButtonsElem

  renderHeader: ->
    H.div style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4, borderBottom: "solid 2px #AAA" },
      H.div style: { float: "right" },
        @renderActionLinks()
      @props.titleElem

  render: ->
    H.div style: { width: "100%", height: "100%", position: "relative" },
      H.div style: { position: "absolute", width: "70%", height: "100%", paddingTop: 40 }, 
        @renderHeader()
        H.div style: { width: "100%", height: "100%" }, 
          React.createElement(AutoSizeComponent, injectWidth: true, injectHeight: true, 
            React.createElement(MapViewComponent, 
              schema: @props.schema, 
              design: @props.design
              onDesignChange: @props.onDesignChange
              layerFactory: @props.layerFactory)
          )
      H.div style: { position: "absolute", left: "70%", width: "30%", height: "100%", borderLeft: "solid 3px #AAA", overflowY: "auto" }, 
        React.createElement(MapDesignerComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design, 
          onDesignChange: @props.onDesignChange
          layerFactory: @props.layerFactory)