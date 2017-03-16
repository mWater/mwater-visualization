_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
H = React.DOM

# Displays a pivot chart from a layout
module.exports = class PivotChartLayoutComponent extends React.Component
  @propTypes: 
    layout: React.PropTypes.object.isRequired  # See PivotChart Design.md

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
          onHover: => @setState(hoverSection: cell.section)
          hoverSection: @state.hoverSection

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
    onHover: React.PropTypes.func

  renderEditMenu: ->
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
        H.li key: "1",
          H.a null, "TEST" # onClick: item.onClick, 

  render: ->
    cell = @props.layout.rows[@props.rowIndex].cells[@props.columnIndex]

    # Determine if top right of section
    isTop = cell.section and (@props.rowIndex == 0 or @props.layout.rows[@props.rowIndex - 1].cells[@props.columnIndex].section != cell.section) 
    isRight = cell.section and (@props.columnIndex >= @props.layout.rows[0].cells.length - 1 or @props.layout.rows[@props.rowIndex].cells[@props.columnIndex + 1].section != cell.section)

    isHover = @props.hoverSection and cell.section == @props.hoverSection

    style = {
      backgroundColor: if isHover then "#F8F8F8"
      position: "relative"
    }

    H.td 
      onMouseEnter: @props.onHover, 
      style: style,
      colSpan: cell.columnSpan or 1
      rowSpan: cell.rowSpan or 1,
        if isTop and isRight and isHover
          @renderEditMenu()

        cell.text
