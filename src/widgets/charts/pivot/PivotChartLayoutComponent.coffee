_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
H = React.DOM

# Displays a pivot chart from a layout
module.exports = class PivotChartLayoutComponent extends React.Component
  @propTypes: 
    layout: React.PropTypes.object.isRequired  # See PivotChart Design.md

    editable: React.PropTypes.bool   # If true, all below must be present
    onEditSegment: React.PropTypes.func  # Called with id of section (not segment id!)
    onRemoveSegment: React.PropTypes.func  # Called with id of section (not segment id!)
    onInsertBeforeSegment: React.PropTypes.func  # Called with id of section (not segment id!)
    onInsertAfterSegment: React.PropTypes.func  # Called with id of section (not segment id!)
    onAddChildSegment: React.PropTypes.func  # Called with id of section (not segment id!)

  constructor: (props) ->
    super

    @state = {
      hoverSection: null # Current section being hovered over
    }

  renderRow: (row, rowIndex) ->
    H.tr key: rowIndex,
      _.map row.cells, (cell, columnIndex) =>
        R LayoutCellComponent,
          key: columnIndex
          layout: @props.layout
          rowIndex: rowIndex
          columnIndex: columnIndex
          onHover: if @props.editable then (=> @setState(hoverSection: cell.section))
          hoverSection: if @props.editable then @state.hoverSection
          onEditSegment: if @props.onEditSegment then @props.onEditSegment.bind(null, cell.section)
          onRemoveSegment: if @props.onRemoveSegment then @props.onRemoveSegment.bind(null, cell.section)
          onInsertBeforeSegment: if @props.onInsertBeforeSegment then @props.onInsertBeforeSegment.bind(null, cell.section)
          onInsertAfterSegment: if @props.onInsertAfterSegment then @props.onInsertAfterSegment.bind(null, cell.section)
          onAddChildSegment: if @props.onAddChildSegment then @props.onAddChildSegment.bind(null, cell.section)

  render: ->
    style = {
      width: "100%"
    }

    H.table style: style, className: "table table-bordered",
      H.tbody onMouseLeave: (=> @setState(hoverSection: null)),
        _.map @props.layout.rows, (row, rowIndex) =>
          @renderRow(row, rowIndex)

# Single layout cell
class LayoutCellComponent extends React.Component
  @propTypes:
    layout: React.PropTypes.object.isRequired  # See PivotChart Design.md
    rowIndex: React.PropTypes.number.isRequired  
    columnIndex: React.PropTypes.number.isRequired
    hoverSection: React.PropTypes.string       # Which section is currently hovered over
    onHover: React.PropTypes.func # Called when hovered over

    onEditSegment: React.PropTypes.func
    onRemoveSegment: React.PropTypes.func
    onInsertBeforeSegment: React.PropTypes.func
    onInsertAfterSegment: React.PropTypes.func
    onAddChildSegment: React.PropTypes.func

  handleDoubleClick: (ev) =>
    if @props.onEditSegment
      ev.stopPropagation()
      @props.onEditSegment()


  renderMenuItems: (cell) ->
    [
      if @props.onEditSegment
        H.li key: "edit",
          H.a onClick: @props.onEditSegment, "Edit"
      if @props.onRemoveSegment and cell.type in ["rowLabel", "rowSegment", "columnLabel", "columnSegment"]
        H.li key: "remove",
          H.a onClick: @props.onRemoveSegment, "Remove"
      if @props.onInsertBeforeSegment and cell.type in ["rowLabel", "rowSegment"]
        H.li key: "before",
          H.a onClick: @props.onInsertBeforeSegment, "Insert Above"
      if @props.onInsertAfterSegment and cell.type in ["rowLabel", "rowSegment"]
        H.li key: "after",
          H.a onClick: @props.onInsertAfterSegment, "Insert Below"
      if @props.onInsertBeforeSegment and cell.type in ["columnLabel", "columnSegment"]
        H.li key: "before",
          H.a onClick: @props.onInsertBeforeSegment, "Insert Left"
      if @props.onInsertAfterSegment and cell.type in ["columnLabel", "columnSegment"]
        H.li key: "after",
          H.a onClick: @props.onInsertAfterSegment, "Insert Right"
      if @props.onAddChildSegment and cell.type in ["rowLabel", "rowSegment", "columnLabel", "columnSegment"]
        H.li key: "child",
          H.a onClick: @props.onAddChildSegment, "Subdivide"
    ]

  renderMenu: (cell) ->
    outerStyle = {
      position: "absolute"
      top: 5
      right: 5
      zIndex: 1000
    }

    innerStyle = {
      backgroundColor: "white"
      border: "solid 1px #337ab7"
      opacity: 0.7
      color: "#337ab7" 
      cursor: "pointer" 
    }

    H.div className: "dropdown", style: outerStyle,
      H.div style: innerStyle, "data-toggle": "dropdown",
        H.i className: "fa fa-pencil fa-fw"
      H.ul className: "dropdown-menu dropdown-menu-right", style: { top: 20 },
        @renderMenuItems(cell)

  render: ->
    cell = @props.layout.rows[@props.rowIndex].cells[@props.columnIndex]

    if cell.type == "skip"
      return null

    # Determine if top right of section
    isTop = cell.section and (@props.rowIndex == 0 or @props.layout.rows[@props.rowIndex - 1].cells[@props.columnIndex].section != cell.section) 
    isRight = cell.section and (@props.columnIndex >= @props.layout.rows[0].cells.length - 1 or @props.layout.rows[@props.rowIndex].cells[@props.columnIndex + 1].section != cell.section)

    isHover = @props.hoverSection and cell.section == @props.hoverSection

    style = {
      backgroundColor: if isHover then "#F8F8F8"
      position: "relative"
      textAlign: cell.align
    }

    H.td 
      onMouseEnter: @props.onHover, 
      onDoubleClick: @handleDoubleClick
      style: style,
      colSpan: cell.columnSpan or 1
      rowSpan: cell.rowSpan or 1,
        if isTop and isRight and isHover
          @renderMenu(cell)

        cell.text
