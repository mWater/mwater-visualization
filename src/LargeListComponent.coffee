React = require 'react'
H = React.DOM
_ = require 'lodash'


# List with an unlimited number of rows
module.exports = class LargeListComponent extends React.Component
  @propTypes: 
    rowSource: React.PropTypes.func.isRequired    # Row source. Function with (offset, number, cb) called back with rows array
    rowRenderer: React.PropTypes.func.isRequired  # Called with (row, index) to get React node
    rowHeight: React.PropTypes.number.isRequired  # Height of rows in pixels
    pageSize: React.PropTypes.number.isRequired   # Number of rows per page
    height: React.PropTypes.number.isRequired     # Height of control in pixels
    rowCount: React.PropTypes.number.isRequired   # number of rows
    bufferSize: React.PropTypes.number.isRequired # Number of extra rows to pull down on each size for nicer scrolling

  constructor: (props) ->
    super
    @state = {
      loadedPages: []  # Array of { page: number of page (0-based), rows: array of rows }
      loadingPages: [] # Array of page numbers that are loading
    }

  componentDidMount: ->
    # Load visible pages
    @loadVisiblePages()

    React.findDOMNode(this).addEventListener("scroll", @handleScroll)
    
  handleScroll: (ev) =>
    @loadVisiblePages()

  componentWillReceiveProps: (nextProps) ->
    # TODO

  loadVisiblePages: ->
    @setState(loadingPages: @getVisiblePages())
    # Determine which pages are visible
    # visiblePages = @getVisiblePages()

    # Get visible rows

    # Load those pages

  getVisiblePages: ->
    # Get pixel range visible
    minPixels = React.findDOMNode(this).scrollTop
    maxPixels = minPixels + @props.height

    # Get rows visible
    minRow = Math.floor(minPixels / @props.rowHeight)
    maxRow = Math.ceil(maxPixels / @props.rowHeight)

    # Add buffer
    minRow -= @props.bufferSize
    maxRow += @props.bufferSize

    # Clip
    if minRow < 0
      minRow = 0
    if maxRow >= @props.rowCount
      maxRow = @props.rowCount - 1

    # Get pages
    minPage = Math.floor(minRow / @props.pageSize)
    maxPage = Math.floor(maxRow / @props.pageSize)

    return _.range(minPage, maxPage + 1)

  renderPage: (page) =>
    H.div style: { position: "absolute", top: page * @props.pageSize * @props.rowHeight, left: 0, right: 0 },
      _.map(_.range(0, @props.pageSize), (r) =>
        H.div style: { height: @props.rowHeight, borderBottom: "solid 1px red" }, 
          "#{r + @props.pageSize * page}"
      )

  renderPages: ->
    _.map(@state.loadingPages, @renderPage)

  render: ->
    # Outer scrollable container
    H.div style: { height: @props.height, overflowY: "scroll", position: "relative" }, # ref: "outer",
      # Inner tall container
      H.div style: { height: @props.rowHeight * @props.rowCount }, # ref: "inner",
        @renderPages()
