// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MarkerSymbolSelectComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import { default as ReactSelect } from "react-select"
import { mapSymbols } from "./mapSymbols"

// Allows selecting of map marker symbol
export default MarkerSymbolSelectComponent = (function () {
  MarkerSymbolSelectComponent = class MarkerSymbolSelectComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        symbol: PropTypes.string,
        onChange: PropTypes.func.isRequired
      }
    }

    render() {
      // Create options
      const options = mapSymbols

      const optionRenderer = (option) =>
        R(
          "span",
          null,
          R("i", { className: `fa fa-${option.value.substr(13)}` }), // Trim "font-awesome/"
          ` ${option.label}`
        )

      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, R("span", { className: "fa fa-star" }), " ", "Symbol"),
        R(ReactSelect, {
          placeholder: "Circle",
          value: _.findWhere(options, { value: this.props.symbol }) || null,
          options,
          formatOptionLabel: optionRenderer,
          isClearable: true,
          onChange: (opt) => this.props.onChange(opt?.value || null)
        })
      )
    }
  }
  MarkerSymbolSelectComponent.initClass()
  return MarkerSymbolSelectComponent
})()
