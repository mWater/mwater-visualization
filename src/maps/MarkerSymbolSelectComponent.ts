import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import { default as ReactSelect } from "react-select"
import { mapSymbols } from "./mapSymbols"

interface MarkerSymbolSelectComponentProps {
  symbol?: string
  onChange: any
}

// Allows selecting of map marker symbol
export default class MarkerSymbolSelectComponent extends React.Component<MarkerSymbolSelectComponentProps> {
  render() {
    // Create options
    const options = mapSymbols

    const optionRenderer = (option: any) =>
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
