import _ from "lodash"
import React from "react"
const R = React.createElement

import NumberInputComponent from "react-library/lib/NumberInputComponent"

export interface ZoomLevelsComponentProps {
  design: any
  onDesignChange: any
}

interface ZoomLevelsComponentState {
  expanded: any
}

// Zoom level min and max control
export default class ZoomLevelsComponent extends React.Component<ZoomLevelsComponentProps, ZoomLevelsComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  render() {
    if (!this.state.expanded) {
      return R(
        "div",
        null,
        R(
          "a",
          { className: "btn btn-link btn-sm", onClick: () => this.setState({ expanded: true }) },
          "Zoom level options..."
        )
      )
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, "Zoom level options"),
      R(
        "div",
        { key: "min" },
        R("span", { className: "text-muted" }, "Minimum Zoom Level:"),
        " ",
        R(NumberInputComponent, {
          small: true,
          style: { display: "inline-block" },
          placeholder: "None",
          value: this.props.design.minZoom,
          onChange: (v: any) => this.props.onDesignChange(_.extend({}, this.props.design, { minZoom: v }))
        })
      ),

      R(
        "div",
        { key: "max" },
        R("span", { className: "text-muted" }, "Maximum Zoom Level: "),
        " ",
        R(NumberInputComponent, {
          small: true,
          style: { display: "inline-block" },
          placeholder: "None",
          value: this.props.design.maxZoom,
          onChange: (v: any) => this.props.onDesignChange(_.extend({}, this.props.design, { maxZoom: v }))
        })
      )
    )
  }
}
