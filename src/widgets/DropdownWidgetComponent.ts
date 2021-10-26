import _ from "lodash"
import $ from "jquery"
import PropTypes from "prop-types"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement

interface DropdownWidgetComponentProps {
  /** Width specification */
  width?: any
  /** Height specification */
  height?: any
  dropdownItems: any
}

// Widget wrapper that adds a dropdown menu in a gear floating
export default class DropdownWidgetComponent extends React.Component<DropdownWidgetComponentProps> {
  renderDropdownItem = (item: any, i: any) => {
    return R(
      "li",
      { key: `${i}` },
      R(
        "a",
        { className: "dropdown-item", onClick: item.onClick },
        item.icon ? R("span", { className: `glyphicon glyphicon-${item.icon} text-muted` }) : undefined,
        item.icon ? " " : undefined,
        item.label
      )
    )
  }

  renderDropdown() {
    if (this.props.dropdownItems.length === 0) {
      return null
    }

    const dropdownStyle = {
      position: "absolute",
      right: 3,
      top: 3,
      cursor: "pointer",
      zIndex: 1029
    }

    const elem = R(
      "div",
      { style: dropdownStyle, "data-toggle": "dropdown" },
      R(
        "div",
        { className: "mwater-visualization-simple-widget-gear-button" },
        R("span", { className: "glyphicon glyphicon-cog" })
      )
    )

    return R(
      "div",
      { style: dropdownStyle },
      elem,
      R(
        "ul",
        { className: "dropdown-menu dropdown-menu-right", style: { top: 25 } },
        _.map(this.props.dropdownItems, this.renderDropdownItem)
      )
    )
  }

  closeMenu = () => {
    return $(ReactDOM.findDOMNode(this)).find('[data-bs-toggle="dropdown"]').parent().removeClass("open")
  }

  render() {
    return R(
      "div",
      {
        className: "mwater-visualization-simple-widget",
        onMouseLeave: this.closeMenu,
        style: { width: this.props.width, height: this.props.height }
      },
      this.props.children,
      this.renderDropdown()
    )
  }
}
