// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ZoomLevelsComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import NumberInputComponent from "react-library/lib/NumberInputComponent"

// Zoom level min and max control
export default ZoomLevelsComponent = (function () {
  ZoomLevelsComponent = class ZoomLevelsComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired,
        onDesignChange: PropTypes.func.isRequired
      }
    }

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
            { className: "btn btn-link btn-xs", onClick: () => this.setState({ expanded: true }) },
            "Advanced options..."
          )
        )
      }

      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, "Advanced"),
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
      );
    }
  }
  ZoomLevelsComponent.initClass()
  return ZoomLevelsComponent
})()
