_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
H = React.DOM

Color = require 'color'

# Displays a pivot chart from a layout
module.exports = class PivotChartLayoutComponent extends React.Component
  @propTypes: 
    layout: React.PropTypes.object.isRequired  # See PivotChart Design.md

    editable: React.PropTypes.bool   # If true, all below must be present. If false, none must be present
    onEditSection: React.PropTypes.func  # Called with id of section (segment id or intersection id)
    onRemoveSegment: React.PropTypes.func  # Called with id of segment
    onInsertBeforeSegment: React.PropTypes.func  # Called with id of segment
    onInsertAfterSegment: React.PropTypes.func  # Called with id of segment
    onAddChildSegment: React.PropTypes.func  # Called with id of segment

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
          onEditSection: if @props.onEditSection then @props.onEditSection.bind(null, cell.section)
          onRemoveSegment: if @props.onRemoveSegment then @props.onRemoveSegment.bind(null, cell.section)
          onInsertBeforeSegment: if @props.onInsertBeforeSegment then @props.onInsertBeforeSegment.bind(null, cell.section)
          onInsertAfterSegment: if @props.onInsertAfterSegment then @props.onInsertAfterSegment.bind(null, cell.section)
          onAddChildSegment: if @props.onAddChildSegment then @props.onAddChildSegment.bind(null, cell.section)

  render: ->
    style = {
      width: "100%"
      borderSpacing: 0
      borderCollapse: "collapse"
    }

    H.table style: style, # className: "table table-bordered",
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

    onEditSection: React.PropTypes.func
    onRemoveSegment: React.PropTypes.func
    onInsertBeforeSegment: React.PropTypes.func
    onInsertAfterSegment: React.PropTypes.func
    onAddChildSegment: React.PropTypes.func

  handleClick: (ev) =>
    # Ignore if part of dropdown
    elem = ev.target
    while elem 
      if elem == @menuEl
        return
      elem = elem.parentElement

    # Ignore blanks
    cell = @props.layout.rows[@props.rowIndex].cells[@props.columnIndex]
    if not cell.section
      return 

    if @props.onEditSection
      @props.onEditSection()

  renderMenuItems: (cell) ->
    [
      if @props.onEditSection
        H.li key: "edit",
          H.a onClick: @props.onEditSection, "Edit"
      if @props.onRemoveSegment and cell.type in ["row", "column"]
        H.li key: "remove",
          H.a onClick: @props.onRemoveSegment, "Remove"
      if @props.onInsertBeforeSegment and cell.type == "row"
        H.li key: "before",
          H.a onClick: @props.onInsertBeforeSegment, "Insert Above"
      if @props.onInsertAfterSegment and cell.type == "row"
        H.li key: "after",
          H.a onClick: @props.onInsertAfterSegment, "Insert Below"
      if @props.onInsertBeforeSegment and cell.type == "column"
        H.li key: "before",
          H.a onClick: @props.onInsertBeforeSegment, "Insert Left"
      if @props.onInsertAfterSegment and cell.type == "column"
        H.li key: "after",
          H.a onClick: @props.onInsertAfterSegment, "Insert Right"
      if @props.onAddChildSegment and cell.type in ["row", "column"]
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

    H.div className: "dropdown", style: outerStyle, ref: ((el) => @menuEl = el),
      H.div style: innerStyle, "data-toggle": "dropdown",
        H.i className: "fa fa-pencil fa-fw"
      H.ul className: "dropdown-menu dropdown-menu-right", style: { top: 20 },
        @renderMenuItems(cell)

  render: ->
    cell = @props.layout.rows[@props.rowIndex].cells[@props.columnIndex]

    if cell.skip
      return null

    isHover = @props.hoverSection and cell.section == @props.hoverSection

    # Determine background color
    backgroundColor = if cell.unconfigured and @props.onEditSection
      "#eff5fb"
    else if cell.subtype == "filler"
      "#DDD"
    else
      cell.backgroundColor or "#FFFFFF"

    if isHover
      backgroundColor = Color(backgroundColor).darken(0.03)

    # Add striping
    if @props.layout.striping == "columns" and cell.type in ['column', 'intersection'] and @props.columnIndex % 2 == 0
      backgroundColor = Color(backgroundColor).darken(0.03)
    else if @props.layout.striping == "rows" and cell.type in ['row', 'intersection'] and @props.rowIndex % 2 == 0
      backgroundColor = Color(backgroundColor).darken(0.03)

    borderWeights = [null, "solid 1px #f4f4f4", "solid 1px #ccc", "solid 1px #888"]

    style = {
      padding: 5
      verticalAlign: "top"
      backgroundColor: backgroundColor
      position: "relative"
      textAlign: cell.align
      cursor: if isHover then "pointer"
      borderTop: borderWeights[cell.borderTop or 0]
      borderBottom: borderWeights[cell.borderBottom or 0]
      borderLeft: borderWeights[cell.borderLeft or 0]
      borderRight: borderWeights[cell.borderRight or 0]
    }

    # Style that should not affect popup menu
    innerStyle = {
      fontWeight: if cell.bold then "bold"
      fontStyle: if cell.italic then "italic"
      marginLeft: if cell.indent then cell.indent * 5
    }

    H.td 
      onMouseEnter: @props.onHover
      onClick: @handleClick
      style: style,
      colSpan: cell.columnSpan or 1
      rowSpan: cell.rowSpan or 1,
        if cell.sectionTop and cell.sectionRight and isHover
          @renderMenu(cell)

        H.span style: innerStyle,
          if cell.unconfigured and @props.onEditSection
            "Click to configure"
          cell.text or "\u00A0" # Placeholder
