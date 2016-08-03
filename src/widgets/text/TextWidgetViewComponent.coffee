React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

ItemsHtmlConverter = require './ItemsHtmlConverter'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# View of a text widget when non-editable
module.exports = class TextWidgetViewComponent extends AsyncLoadComponent
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    schema: React.PropTypes.object.isRequired
    widgetDataSource: React.PropTypes.object.isRequired

  constructor: (props) ->
    super(props)

    @state = {
      # Map of expression id to expression value
      exprValues: {}
      error: null
    }

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    return not _.isEqual(_.pick(newProps, "filters", "design"), _.pick(oldProps, "filters", "design"))

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # Get data
    props.widgetDataSource.getData(props.filters, (error, data) =>
      callback(error: error, exprValues: data or {})
    )

  createHtml: ->
    new ItemsHtmlConverter(@props.schema, false, (if not @state.loading then @state.exprValues else {})).itemsToHtml(@props.design.items)

  render: ->
    if @props.design.items?[0]?
      H.div className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}", dangerouslySetInnerHTML: { __html: @createHtml() }
    else
      H.div className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"} text-muted", 
        "Click to Edit"
