import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

interface RadioButtonComponentProps {
  /** True to check */
  checked?: boolean
  /** Called when clicked */
  onClick?: any
  onChange?: any
}

// Pretty radio button component
export default class RadioButtonComponent extends React.Component<RadioButtonComponentProps> {
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
