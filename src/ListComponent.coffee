_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement

module.exports = ListControl = React.createClass {
  propTypes: {
    items: PropTypes.array.isRequired # List of items as { id: <comparable>, display: <element> }
    onSelect: PropTypes.func.isRequired # Called with id
    selected: PropTypes.string # Currently selected item
  }

  render: ->
    R 'div', null, 
      _.map @props.items, (item) =>
        React.createElement(ListItem, { 
          key: item.id
          onSelect: @props.onSelect.bind(null, item.id),
          selected: @props.selected == item.id
         }, item.display)
}

ListItem = React.createClass {
  getInitialState: -> { hover: false }
  mouseOver: -> @setState({ hover: true })
  mouseOut: -> @setState({ hover: false })

  render: ->
    style = { 
      border: "solid 1px #DDD" 
      marginBottom: -1
      padding: 3
      cursor: "pointer"
    }
    
    if @props.selected
      style.color = "#EEE"
      style.backgroundColor = if @state.hover then "#286090" else "#337AB7"
    else if @state.hover
      style.backgroundColor = "#EEE"

    R 'div', style: style, onMouseOver: @mouseOver, onMouseOut: @mouseOut, onClick: @props.onSelect,
      @props.children
}

