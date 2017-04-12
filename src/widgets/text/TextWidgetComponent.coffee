React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

TextComponent = require './TextComponent'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Widget which displays styled text with embedded expressions
module.exports = class TextWidgetComponent extends AsyncLoadComponent
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    filters: React.PropTypes.array
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  constructor: (props) ->
    super(props)

    @state = {
      # Map of expression id to expression value
      exprValues: {}
      error: null
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

    # Reload if filters or expressions have changed
    return not _.isEqual(newProps.filters, oldProps.filters) or not _.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Get data
    props.widgetDataSource.getData(props.design, props.filters, (error, data) =>
      callback(error: error, exprValues: data or {})
    )

  render: ->
    # If loading, don't display old values
    exprValues = if not @state.loading then @state.exprValues else {}

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
