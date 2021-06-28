// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let RadioButtonComponent
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

// Pretty radio button component
export default RadioButtonComponent = (function () {
  RadioButtonComponent = class RadioButtonComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        checked: PropTypes.bool, // True to check
        onClick: PropTypes.func, // Called when clicked
        onChange: PropTypes.func
      }
      // Called with new value
    }

    handleClick = () => {
      if (this.props.onChange) {
        this.props.onChange(!this.props.checked)
      }
      if (this.props.onClick) {
        return this.props.onClick()
      }
    }

    render() {
      return R(
        "div",
        {
          className: this.props.checked ? "mwater-visualization-radio checked" : "mwater-visualization-radio",
          onClick: this.handleClick
        },
        this.props.children
      )
    }
  }
  RadioButtonComponent.initClass()
  return RadioButtonComponent
})()
