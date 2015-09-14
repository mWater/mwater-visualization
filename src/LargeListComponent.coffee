React = require 'react'
H = React.DOM
_ = require 'lodash'
shallowequal = require('shallowequal')

###
List with an unlimited number of rows
It shows a scrolling window with up to 1 million or more rows. It works by knowing the height of rows and 
then only rendering a part of the list that is visible at any given moment.

Internally, it divides the rows into pages, each with a fixed size. It calculates which pages are visible
and then loads those pages, optionally putting a placeholder while the pages are being loaded.
###
module.exports = class LargeListComponent extends React.Component
  @propTypes: 
    loadRows: React.PropTypes.func.isRequired     # Row source. Function with (offset, number, cb) called back with rows array
    renderRow: React.PropTypes.func.isRequired    # Called with (row, index) to get React node. Row is null for placeholder while loading
    rowHeight: React.PropTypes.number.isRequired  # Height of rows in pixels
    pageSize: React.PropTypes.number.isRequired   # Number of rows per page
    height: React.PropTypes.number.isRequired     # Height of control in pixels
    rowCount: React.PropTypes.number.isRequired   # number of rows
    bufferSize: React.PropTypes.number.isRequired # Number of extra rows to pull down on each size for nicer scrolling
    useLoadingPlaceholder: React.PropTypes.bool   # true to use row placeholders when loading. calls renderRow with null row

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
    
  componentWillReceiveProps: (nextProps) ->
    # Reload everything if anything other than renderRow changed
    reload = false
    for key, value of nextProps
      if @props[key] != value 
        if key != "renderRow"
          reload = true
        else
          refresh = true

    if reload
      @reload()

  # Optimize rendering
  shouldComponentUpdate: (nextProps, nextState) ->
    return not shallowequal(nextProps, @props) or not shallowequal(nextState, @state)

  componentWillUnmount: ->
    # Record to prevent invalid updates
    @unmounted = true

  # Gets the size of a page (all same except last)
  getPageRowCount: (page) ->
    return Math.min(@props.pageSize, @props.rowCount - page * @props.pageSize)

  # Forces a reload of all data
  reload: ->
    @setState({ loadedPages: [], loadingPages: [] }, => @loadVisiblePages())    

  handleScroll: (ev) =>
    @loadVisiblePages()

  loadVisiblePages: ->
    # Determine which pages are visible
    visiblePages = @getVisiblePages()

    # Determine which ones to load
    toLoadPages = _.difference(visiblePages, @state.loadingPages)
    toLoadPages = _.difference(toLoadPages, _.pluck(@state.loadedPages, "page"))

    # Do nothing if nothing to load
    if toLoadPages.length == 0
      return

    # Load those pages (but record that loading ones are still loading)
    @setState(loadingPages: _.union(toLoadPages, @state.loadingPages), =>
      for page in toLoadPages
        do (page) =>
          @props.loadRows(page * @props.pageSize, @getPageRowCount(page), (err, rows) =>
            if @unmounted
              return
              
            # Remove from loading pages
            loadingPages = _.without(@state.loadingPages, page)
            if not err
              loadedPages = @state.loadedPages.slice()
              # Remove if already loaded
              loadedPages = _.filter(loadedPages, (p) -> p.page != page)
              loadedPages.push({ page: page, rows: rows })

              # Clean invisible pages
              visiblePages = @getVisiblePages()
              loadedPages = _.filter(loadedPages, (p) => p.page in visiblePages)

            @setState(loadingPages: loadingPages, loadedPages: loadedPages)
          )
      )


  # Get an array of visible page IDs
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
    React.createElement(LoadedPageComponent, 
      key: loadedPage.page
      loadedPage: loadedPage
      pageSize: @props.pageSize
      rowHeight: @props.rowHeight
      renderRow: @props.renderRow)

  renderLoadingPage: (loadingPage) =>
    React.createElement(LoadingPageComponent, 
      key: loadingPage
      loadingPage: loadingPage
      pageSize: @props.pageSize
      rowHeight: @props.rowHeight
      renderRow: @props.renderRow
      rowCount: @props.rowCount)

  render: ->
    # Outer scrollable container
    H.div style: { height: @props.height, overflowY: "scroll", position: "relative" }, # ref: "outer",
      # Inner tall container
      H.div style: { height: @props.rowHeight * @props.rowCount }, # ref: "inner",
        _.map(@state.loadedPages, @renderLoadedPage)
        if @props.useLoadingPlaceholder then _.map(@state.loadingPages, @renderLoadingPage)

# Displays a single page that is loading
class LoadingPageComponent extends React.Component
  @propTypes:
    loadingPage: React.PropTypes.number.isRequired # page number
    renderRow: React.PropTypes.func.isRequired    # Called with (row, index) to get React node. Row is null for placeholder while loading
    rowHeight: React.PropTypes.number.isRequired  # Height of rows in pixels
    pageSize: React.PropTypes.number.isRequired   # Number of rows per page
    rowCount: React.PropTypes.number.isRequired   # number of rows

  # Optimize rendering
  shouldComponentUpdate: (nextProps, nextState) ->
    return not shallowequal(nextProps, @props)

  # Gets the size of a page (all same except last)
  getPageRowCount: (page) ->
    return Math.min(@props.pageSize, @props.rowCount - page * @props.pageSize)

  render: (loadingPage) =>
    loadingPage = @props.loadingPage

    H.div style: { position: "absolute", top: loadingPage * @props.pageSize * @props.rowHeight, left: 0, right: 0 }, 
      _.map(_.range(0, @getPageRowCount(loadingPage)), (i) => @props.renderRow(null, i + loadingPage * @props.pageSize))

# Displays a single page that has loaded
class LoadedPageComponent extends React.Component
  @propTypes:
    loadedPage: React.PropTypes.object.isRequired # { page: page number, rows: rows of page }
    renderRow: React.PropTypes.func.isRequired    # Called with (row, index) to get React node. Row is null for placeholder while loading
    rowHeight: React.PropTypes.number.isRequired  # Height of rows in pixels
    pageSize: React.PropTypes.number.isRequired   # Number of rows per page

  # Optimize rendering
  shouldComponentUpdate: (nextProps, nextState) ->
    return not shallowequal(nextProps, @props)

  render: ->
    loadedPage = @props.loadedPage

    H.div style: { position: "absolute", top: loadedPage.page * @props.pageSize * @props.rowHeight, left: 0, right: 0 }, 
      _.map loadedPage.rows, (row, i) => @props.renderRow(row, i + loadedPage.page * @props.pageSize) 
