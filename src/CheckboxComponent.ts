import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

interface CheckboxComponentProps {
  /** True to check */
  checked?: boolean
  /** Called when clicked */
  onClick?: any
  onChange?: any
}

// Pretty checkbox component
export default class CheckboxComponent extends React.Component<CheckboxComponentProps> {
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
        className: this.props.checked ? "mwater-visualization-checkbox checked" : "mwater-visualization-checkbox",
        onClick: this.handleClick
      },
      this.props.children
    )
  }
}
