React = require 'react'
H = React.DOM

module.exports = ListControl = React.createClass {
  propTypes: {
    items: React.PropTypes.array.isRequired # List of items as { id: <comparable>, display: <element> }
    onSelect: React.PropTypes.func.isRequired # Called with id
    selected: React.PropTypes.string # Currently selected item
  }

  render: ->
    H.div null, 
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

    H.div style: style, onMouseOver: @mouseOver, onMouseOut: @mouseOut, onClick: @props.onSelect,
      @props.children
}

