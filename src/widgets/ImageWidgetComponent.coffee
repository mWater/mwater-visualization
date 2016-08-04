React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

uuid = require 'node-uuid'

AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

module.exports = class ImageWidgetComponent extends AsyncLoadComponent
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    filters: React.PropTypes.array
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    width: React.PropTypes.number
    height: React.PropTypes.number

  constructor: (props) ->
    super(props)

    @state = {
      # Widget data
      data: {}
      error: null
    }

  # Override to determine if a load is needed. Not called on mounting
  isLoadNeeded: (newProps, oldProps) -> 
    # TODO load the expression value from the widget data source if needed
    return false

  # Call callback with state changes
  load: (props, prevProps, callback) -> 
    # TODO load the expression value from the widget data source only if needed
    callback(null)
    return

    # Get data
    props.widgetDataSource.getData(props.filters, (error, data) =>
      callback(error: error, data: data )
    )
  
  # TODO add editor 
  # TODO display "Click to edit" if image not specified: e.g.
  # Render a link to start editing
  # renderEditLink: ->
  #   H.div style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
  #     H.a className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Edit"

  render: ->
    H.div style: { position: "relative", width: @props.width, height: @props.height, textAlign: "center" },
      H.img style: { maxWidth: "100%", maxHeight: "100%"}, src: "https://realfood.tesco.com/media/images/Orange-and-almond-srping-cake-hero-58d07750-0952-47eb-bc41-a1ef9b81c01a-0-472x310.jpg"
