PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

TextComponent = require './TextComponent'
TextWidget = require './TextWidget'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Widget which displays styled text with embedded expressions
module.exports = class TextWidgetComponent extends AsyncLoadComponent
  @propTypes: 
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func # Called with new design. null/undefined for readonly
    filters: PropTypes.array
    
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: PropTypes.object.isRequired

    width: PropTypes.number
    height: PropTypes.number
    standardWidth: PropTypes.number

    singleRowTable: PropTypes.string  # Table that is filtered to have one row
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  constructor: (props) ->
    super(props)

    @state = {
      # Map of expression id to expression value
      exprValues: {}
      error: null
      cacheExpiry: props.dataSource.getCacheExpiry()  # Save cache expiry to see if changes
    }

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    # Get expression items recursively
    getExprItems = (items) ->
      exprItems = []
      for item in (items or [])
        if item.type == "expr"
          exprItems.push(item)
        if item.items
          exprItems = exprItems.concat(getExprItems(item.items))
      return exprItems    

    # Reload if filters or expressions have changed or cache expiry
    return not _.isEqual(newProps.filters, oldProps.filters) or not _.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items)) or newProps.dataSource.getCacheExpiry() != @state.cacheExpiry

  # Call callback with state changes
  load: (props, prevProps, callback) ->
    # Shortcut if no expressions in text widget
    widget = new TextWidget()
    if widget.getExprItems(props.design.items).length == 0
      callback(error: null, exprValues: {}, props.dataSource.getCacheExpiry())
      return

    # Get data
    props.widgetDataSource.getData(props.design, props.filters, (error, data) =>
      callback(error: error, exprValues: data or {}, cacheExpiry: props.dataSource.getCacheExpiry())
    )

  scrollToTOCEntry: (entryId) ->
    # Find entry in divComp
    entries = @divComp.querySelectorAll("h1,h2,h3,h4,h5,h6,h7,h8,h9")

    entry = entries[entryId]
    if entry
      entry.scrollIntoView(true)

  render: ->
    # If loading, don't display old values
    exprValues = if not @state.loading then @state.exprValues else {}

    H.div 
      ref: ((c) => @divComp = c),
        R TextComponent,
          design: @props.design
          onDesignChange: @props.onDesignChange
          filters: @props.filters
          schema: @props.schema
          dataSource: @props.dataSource
          exprValues: exprValues
          width: @props.width
          height: @props.height
          standardWidth: @props.standardWidth
          singleRowTable: @props.singleRowTable
          namedStrings: @props.namedStrings
