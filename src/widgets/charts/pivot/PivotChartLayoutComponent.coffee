PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement

Color = require 'color'
ui = require 'react-library/lib/bootstrap'
classNames = require('classnames')

# Displays a pivot chart from a layout
module.exports = class PivotChartLayoutComponent extends React.Component
  @propTypes: 
    layout: PropTypes.object.isRequired  # See README.md

    editable: PropTypes.bool   # If true, all below must be present. If false, none must be present
    onEditSection: PropTypes.func  # Called with id of section (segment id or intersection id)
    onRemoveSegment: PropTypes.func  # Called with id of segment
    onInsertBeforeSegment: PropTypes.func  # Called with id of segment
    onInsertAfterSegment: PropTypes.func  # Called with id of segment
    onAddChildSegment: PropTypes.func  # Called with id of segment
    onSummarizeSegment: PropTypes.func  # Called with id of segment. Summarizes the segment

  constructor: (props) ->
    super(props)

    @state = {
      hoverSection: null # Current section being hovered over
    }

    # Index of cell components by "<rowIndex>:<columnIndex>"
    @cellComps = {}

  # Records the cell components. This is to be able to calculate the bounds of sections
  # to allow floating hover controls
  recordCellComp: (rowIndex, columnIndex, comp) =>
    key = "#{rowIndex}:#{columnIndex}"
    if comp
      @cellComps[key] = comp
    else
      delete @cellComps[key]

  renderRow: (row, rowIndex) ->
    R 'tr', key: rowIndex,
      _.map row.cells, (cell, columnIndex) =>
        R LayoutCellComponent,
          ref: @recordCellComp.bind(null, rowIndex, columnIndex)
          key: columnIndex
          layout: @props.layout
          rowIndex: rowIndex
          columnIndex: columnIndex
          onHover: if @props.editable then (=> @setState(hoverSection: cell.section))
          hoverSection: if @props.editable then @state.hoverSection
          onEditSection: if @props.onEditSection then @props.onEditSection.bind(null, cell.section)
          onSummarizeSegment: if @props.onSummarizeSegment then @props.onSummarizeSegment.bind(null, cell.section)

  renderHoverPlusIcon: (key, x, y, onClick) =>
    # Render a plus box
    R 'div', key: key, onClick: onClick, style: { 
      position: "absolute"
      left: x - 7
      top: y - 6
      border: "solid 1px #337ab7"
      backgroundColor: "white"
      paddingLeft: 3
      paddingRight: 3
      paddingTop: 0
      color: "#337ab7" 
      fontSize: 9
      cursor: "pointer"
      opacity: 0.8
    },
      R ui.Icon, id: "fa-plus"

  renderHoverRemoveIcon: (key, x, y, onClick) =>
    # Render a plus box
    R 'div', key: key, onClick: onClick, style: { 
      position: "absolute"
      left: x - 7
      top: y - 6
      border: "solid 1px #337ab7"
      backgroundColor: "white"
      paddingLeft: 3
      paddingRight: 3
      paddingTop: 0
      color: "#337ab7"
      fontSize: 9
      cursor: "pointer"
      opacity: 0.8
    },
      R ui.Icon, id: "fa-remove"

  # Render floating hover controls
  renderHoverControls: =>
    if not @state.hoverSection
      return 

    # Determine hover rectangle and section type (row, column or intersection)
    minX = maxX = minY = maxY = null
    sectionType = null
    for key, cell of @cellComps
      rowIndex = parseInt(key.split(":")[0])
      columnIndex = parseInt(key.split(":")[1])

      cellTd = cell.getTdComponent()
      if not cellTd
        continue

      # If hover
      if @props.layout.rows[rowIndex]?.cells[columnIndex]?.section == @state.hoverSection 
        # Add bounds
        minX = if not minX? or cellTd.offsetLeft < minX then cellTd.offsetLeft else minX
        minY = if not minY? or cellTd.offsetTop < minY then cellTd.offsetTop else minY
        maxX = if not maxX? or cellTd.offsetLeft + cellTd.offsetWidth > maxX then cellTd.offsetLeft + cellTd.offsetWidth else maxX
        maxY = if not maxY? or cellTd.offsetTop + cellTd.offsetHeight > maxY then cellTd.offsetTop + cellTd.offsetHeight else maxY

        # Record type
        sectionType = @props.layout.rows[rowIndex].cells[columnIndex].type

    if not minX? or not sectionType
      return null

    # Determine types of controls to show
    controls = []
    if sectionType == "row" and @props.onInsertBeforeSegment
      controls.push(@renderHoverPlusIcon("top", (minX + maxX) / 2, minY, @props.onInsertBeforeSegment.bind(null, @state.hoverSection)))

    if sectionType == "row" and @props.onInsertAfterSegment
      controls.push(@renderHoverPlusIcon("bottom", (minX + maxX) / 2, maxY, @props.onInsertAfterSegment.bind(null, @state.hoverSection)))

    if sectionType == "row" and @props.onAddChildSegment
      controls.push(@renderHoverPlusIcon("right", maxX, (minY + maxY) / 2, @props.onAddChildSegment.bind(null, @state.hoverSection)))

    if sectionType == "column" and @props.onInsertBeforeSegment
      controls.push(@renderHoverPlusIcon("left", minX, (minY + maxY) / 2, @props.onInsertBeforeSegment.bind(null, @state.hoverSection)))

    if sectionType == "column" and @props.onInsertAfterSegment
      controls.push(@renderHoverPlusIcon("right", maxX, (minY + maxY) / 2, @props.onInsertAfterSegment.bind(null, @state.hoverSection)))

    if sectionType == "column" and @props.onAddChildSegment
      controls.push(@renderHoverPlusIcon("bottom", (minX + maxX) / 2, maxY, @props.onAddChildSegment.bind(null, @state.hoverSection)))

    if sectionType in ['row', 'column'] and @props.onRemoveSegment
      controls.push(@renderHoverRemoveIcon("topright", maxX, minY, @props.onRemoveSegment.bind(null, @state.hoverSection)))

    return R 'div', key: "hover-controls", controls

  render: ->
    R 'div', 
      style: { position: "relative" } 
      onMouseLeave: (=> @setState(hoverSection: null)),
        # Define CSS classes to keep HTML as small as possible
        R 'style', null, '''
          .pivot-chart-table {
            width: 100%;
            border-spacing: 0;
            border-collapse: collapse;
            position: relative;
          }

          .pivot-chart-table .cell {
            padding: 5px;
            vertical-align: top;
            position: relative;
            background-color: white;
          }

          .pivot-chart-table .bt1 { border-top: solid 1px #f4f4f4 }
          .pivot-chart-table .bt2 { border-top: solid 1px #ccc }
          .pivot-chart-table .bt3 { border-top: solid 1px #888 }

          .pivot-chart-table .bb1 { border-bottom: solid 1px #f4f4f4 }
          .pivot-chart-table .bb2 { border-bottom: solid 1px #ccc }
          .pivot-chart-table .bb3 { border-bottom: solid 1px #888 }

          .pivot-chart-table .bl1 { border-left: solid 1px #f4f4f4 }
          .pivot-chart-table .bl2 { border-left: solid 1px #ccc }
          .pivot-chart-table .bl3 { border-left: solid 1px #888 }

          .pivot-chart-table .br1 { border-right: solid 1px #f4f4f4 }
          .pivot-chart-table .br2 { border-right: solid 1px #ccc }
          .pivot-chart-table .br3 { border-right: solid 1px #888 }
        '''
        if @props.layout.tooManyRows
          R 'div', className: "text-warning", style: { fontSize: 12 },
            R('i', className: "fa fa-exclamation-circle")
            " Warning: Too many rows in table to display"

        if @props.layout.tooManyColumns
          R 'div', className: "text-warning", style: { fontSize: 12 },
            R('i', className: "fa fa-exclamation-circle")
            " Warning: Too many columns in table to display"

        R 'table', className: "pivot-chart-table",
          R 'tbody', null,
            _.map @props.layout.rows, (row, rowIndex) =>
              @renderRow(row, rowIndex)
        @renderHoverControls()

# Single layout cell
class LayoutCellComponent extends React.Component
  @propTypes:
    layout: PropTypes.object.isRequired  # See PivotChart Design.md
    rowIndex: PropTypes.number.isRequired  
    columnIndex: PropTypes.number.isRequired
    hoverSection: PropTypes.string       # Which section is currently hovered over
    onHover: PropTypes.func # Called when hovered over
    onEditSection: PropTypes.func
    onSummarizeSegment: PropTypes.func

  handleClick: (ev) =>
    # Ignore blanks
    cell = @props.layout.rows[@props.rowIndex].cells[@props.columnIndex]
    if not cell.section
      return 

    # Ignore unconfigured cells
    if cell.unconfigured
      return

    if @props.onEditSection
      @props.onEditSection()

  # Gets cell component
  getTdComponent: -> @tdComponent

  # Render an unconfigured cell
  renderUnconfigured: (cell) ->
    R 'span', style: { fontSize: "90%" },
      R 'a', style: { cursor: "pointer" }, onClick: @props.onEditSection,
        "Edit"
      if cell.summarize
        [
          R 'span', className: "text-muted",
            " / "
          R 'a', style: { cursor: "pointer" }, onClick: @props.onSummarizeSegment,
            "Summarize"
        ]

  render: ->
    cell = @props.layout.rows[@props.rowIndex].cells[@props.columnIndex]

    if cell.skip
      return null

    isHover = @props.hoverSection and cell.section == @props.hoverSection

    # Determine background color
    backgroundColor = if cell.unconfigured and @props.onEditSection
      "#eff5fb"
    else
      cell.backgroundColor or null

    if isHover
      backgroundColor = Color(backgroundColor or "#ffffff").darken(0.03)

    # Add striping
    if @props.layout.striping == "columns" and cell.type in ['column', 'intersection'] and @props.columnIndex % 2 == 0
      backgroundColor = Color(backgroundColor or "#ffffff").darken(0.03)
    else if @props.layout.striping == "rows" and cell.type in ['row', 'intersection'] and @props.rowIndex % 2 == 0
      backgroundColor = Color(backgroundColor or "#ffffff").darken(0.03)

    borderWeights = [null, "solid 1px #f4f4f4", "solid 1px #ccc", "solid 1px #888"]

    # Collapsed borders mean that weights need to be combined for adjacent cells
    borderBottom = Math.max(cell.borderBottom or 0, @props.layout.rows[@props.rowIndex + 1]?.cells[@props.columnIndex].borderTop or 0)
    borderRight = Math.max(cell.borderRight or 0, @props.layout.rows[@props.rowIndex].cells[@props.columnIndex + 1]?.borderLeft or 0)

    style = {
      backgroundColor: backgroundColor
      textAlign: cell.align
      cursor: if isHover and not cell.unconfigured then "pointer"
    }
    classes = classNames({
      cell: true
      # List out borders in compact way to keep HTML smaller
      bt1: cell.borderTop == 1
      bt2: cell.borderTop == 2
      bt3: cell.borderTop == 3
      bb1: cell.borderBottom == 1
      bb2: cell.borderBottom == 2
      bb3: cell.borderBottom == 3
      bl1: cell.borderLeft == 1
      bl2: cell.borderLeft == 2
      bl3: cell.borderLeft == 3
      br1: cell.borderRight == 1
      br2: cell.borderRight == 2
      br3: cell.borderRight == 3
    })

    # Style that should not affect popup menu
    innerStyle = {
      fontWeight: if cell.bold then "bold"
      fontStyle: if cell.italic then "italic"
      marginLeft: if cell.indent then cell.indent * 5
    }

    R 'td', 
      ref: ((c) => @tdComponent = c)
      onMouseEnter: @props.onHover
      onClick: @handleClick
      className: classes
      style: style,
      colSpan: cell.columnSpan or null
      rowSpan: cell.rowSpan or null,
        R 'span', style: innerStyle,
          if cell.unconfigured and @props.onEditSection
            @renderUnconfigured(cell)
          else
            cell.text or "\u00A0\u00A0\u00A0" # Placeholder
