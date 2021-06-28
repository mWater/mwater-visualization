// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ListControl
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

export default ListControl = React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired, // List of items as { id: <comparable>, display: <element> }
    onSelect: PropTypes.func.isRequired, // Called with id
    selected: PropTypes.string // Currently selected item
  },

  render() {
    return R(
      "div",
      null,
      _.map(this.props.items, (item) => {
        return React.createElement(
          ListItem,
          {
            key: item.id,
            onSelect: this.props.onSelect.bind(null, item.id),
            selected: this.props.selected === item.id
          },
          item.display
        )
      })
    )
  }
})

var ListItem = React.createClass({
  getInitialState() {
    return { hover: false }
  },
  mouseOver() {
    return this.setState({ hover: true })
  },
  mouseOut() {
    return this.setState({ hover: false })
  },

  render() {
    const style = {
      border: "solid 1px #DDD",
      marginBottom: -1,
      padding: 3,
      cursor: "pointer"
    }

    if (this.props.selected) {
      style.color = "#EEE"
      style.backgroundColor = this.state.hover ? "#286090" : "#337AB7"
    } else if (this.state.hover) {
      style.backgroundColor = "#EEE"
    }

    return R(
      "div",
      { style, onMouseOver: this.mouseOver, onMouseOut: this.mouseOut, onClick: this.props.onSelect },
      this.props.children
    )
  }
})
