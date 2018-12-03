PropTypes = require('prop-types')
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
_ = require 'lodash'

# Lays out divs vertically, allowing fractional allocation combined with auto-sized ones
# Children must all have keys
# Children will be cloned with height: prop set in case of fractional ones
module.exports = class VerticalLayoutComponent extends React.Component
  @propTypes:
    height: PropTypes.number.isRequired
    relativeHeights: PropTypes.object.isRequired  # Fraction to allocate for fractional heights. Should total 1.0. Keyed by key

  constructor: (props) ->
    super(props)
    @state = { availableHeight: 0 }
    @childRefs = {}

  componentWillReceiveProps: (nextProps) -> 
    if nextProps.height != @props.height or not _.isEqual(nextProps.relativeHeights, @props.relativeHeights)
      @recalculateSize(nextProps)

  componentDidMount: -> 
    @recalculateSize(@props)

  recalculateSize: (props) ->
    # Calculate available height 
    availableHeight = props.height

    for child in props.children
      if not child then continue
      if props.relativeHeights[child.key] then continue

      node = ReactDOM.findDOMNode(@childRefs[child.key])
      availableHeight -= $(node).outerHeight()

    @setState(availableHeight: availableHeight)

  # Get a subcomponent
  getComponent: (key) ->
    return @childRefs[key]

  render: ->
    # Calculate scaling
    R 'div', style: { height: @props.height }, 
      React.Children.map(@props.children, (child) =>
        if not child
          return

        # If variable height
        if child.key and @props.relativeHeights[child.key]
          # If available height is known, render variable
          if @state.availableHeight
            height = @state.availableHeight * @props.relativeHeights[child.key]
            return R 'div', style: { height: height, position: "relative" },
              R 'div', 
                style: { height: height }, 
                ref: ((c) => @childRefs[child.key] = c),
                React.cloneElement(child, { height: height })
          # Otherwise don't show until available height is known
          return null
        return R 'div', ref: ((c) => @childRefs[child.key] = c),
          child
        )

