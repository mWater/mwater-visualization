React = require 'react'
H = React.DOM
_ = require 'lodash'


# List with an unlimited number of rows
module.exports = class LargeListComponent extends React.Component
  @propTypes: 
    loadRows: React.PropTypes.func.isRequired     # Row source. Function with (offset, number, cb) called back with rows array
    renderRow: React.PropTypes.func.isRequired    # Called with (row, index) to get React node. Row is null for placeholder while loading
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

    # Throttle scrolling
    @handleScroll = _.throttle(@handleScroll, 250)

  componentDidMount: ->
    # Load visible pages
    @loadVisiblePages()

    React.findDOMNode(this).addEventListener("scroll", @handleScroll)
    
  handleScroll: (ev) =>
    @loadVisiblePages()

  componentWillReceiveProps: (nextProps) ->
    # Reset everything if anything other than renderRow changed
    reset = false
    for key, value in nextProps
      if @props[key] != value 
        if key != "renderRow"
          reset = true
        else
          refresh = true

    if reset
      @setState(loadedPages: [], loadingPages: [])

  # Gets the size of a page (all same except last)
  getPageRowCount: (page) ->
    return Math.min(@props.pageSize, @props.rowCount - page * @props.pageSize)

  loadVisiblePages: ->
    # Determine which pages are visible
    visiblePages = @getVisiblePages()

    # Determine which ones to load
    toLoadPages = _.difference(visiblePages, @state.loadingPages)
    toLoadPages = _.difference(toLoadPages, _.pluck(@state.loadedPages, "page"))

    # Load those pages (but record that loading ones are still loading)
    @setState(loadingPages: _.union(toLoadPages, @state.loadingPages))

    for page in toLoadPages
      do (page) =>
        @props.loadRows(page * @props.pageSize, @getPageRowCount(page), (err, rows) =>
          # Remove from loading pages
          loadingPages = _.without(@state.loadingPages, page)
          if not err
            loadedPages = @state.loadedPages.slice()
            loadedPages.push({ page: page, rows: rows })

            # Clean invisible pages
            visiblePages = @getVisiblePages()
            loadedPages = _.filter(loadedPages, (p) => p.page in visiblePages)

          @setState(loadingPages: loadingPages, loadedPages: loadedPages)
        )

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

  renderLoadedPage: (loadedPage) =>
    H.div style: { position: "absolute", top: loadedPage.page * @props.pageSize * @props.rowHeight, left: 0, right: 0 }, key: loadedPage.page,
      _.map loadedPage.rows, (row, i) => @props.renderRow(row, i + loadedPage.page * @props.pageSize) 

  renderLoadingPage: (loadingPage) =>
    # Determine number of rows 
    H.div style: { position: "absolute", top: loadingPage * @props.pageSize * @props.rowHeight, left: 0, right: 0 }, key: loadingPage,
      _.map(_.range(0, @getPageRowCount(loadingPage)), (i) => @props.renderRow(null, i + loadingPage * @props.pageSize))

  renderPages: ->
    [
      _.map(@state.loadedPages, @renderLoadedPage)
      _.map(@state.loadingPages, @renderLoadingPage)
    ]

  render: ->
    # Outer scrollable container
    H.div style: { height: @props.height, overflowY: "scroll", position: "relative" }, # ref: "outer",
      # Inner tall container
      H.div style: { height: @props.rowHeight * @props.rowCount }, # ref: "inner",
        @renderPages()
