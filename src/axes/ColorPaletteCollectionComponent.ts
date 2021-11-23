import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import ColorSchemeFactory from "../ColorSchemeFactory"
import { Axis, AxisCategory } from "./Axis"

export interface ColorPaletteCollectionComponentProps {
  onPaletteSelected: any
  axis: Axis
  categories: AxisCategory[]
  onCancel: any
}

export default class ColorPaletteCollectionComponent extends React.Component<ColorPaletteCollectionComponentProps> {
  static palettes = [
    { type: "schemeSet1", reversed: false },
    { type: "schemeSet2", reversed: false },
    { type: "schemeSet3", reversed: false },
    { type: "schemeAccent", reversed: false },
    { type: "schemeDark2", reversed: false },
    { type: "schemePaired", reversed: false },
    { type: "schemePastel1", reversed: false },
    { type: "schemePastel2", reversed: false },
    { type: "interpolateSpectral", reversed: false },
    { type: "interpolateSpectral", reversed: true },
    { type: "interpolateBlues", reversed: false },
    { type: "interpolateBlues", reversed: true },
    { type: "interpolateGreens", reversed: false },
    { type: "interpolateGreens", reversed: true },
    { type: "interpolateGreys", reversed: false },
    { type: "interpolateGreys", reversed: true },
    { type: "interpolateOranges", reversed: false },
    { type: "interpolateOranges", reversed: true },
    { type: "interpolatePurples", reversed: false },
    { type: "interpolatePurples", reversed: true },
    { type: "interpolateReds", reversed: false },
    { type: "interpolateReds", reversed: true },
    { type: "interpolateBuGn", reversed: false },
    { type: "interpolateBuGn", reversed: true },
    { type: "interpolateBuPu", reversed: false },
    { type: "interpolateBuPu", reversed: true },
    { type: "interpolateGnBu", reversed: false },
    { type: "interpolateGnBu", reversed: true },
    { type: "interpolateOrRd", reversed: false },
    { type: "interpolateOrRd", reversed: true },
    { type: "interpolatePuBuGn", reversed: false },
    { type: "interpolatePuBuGn", reversed: true },
    { type: "interpolatePuBu", reversed: false },
    { type: "interpolatePuBu", reversed: true },
    { type: "interpolatePuRd", reversed: false },
    { type: "interpolatePuRd", reversed: true },
    { type: "interpolateRdPu", reversed: false },
    { type: "interpolateRdPu", reversed: true },
    { type: "interpolateYlGnBu", reversed: false },
    { type: "interpolateYlGnBu", reversed: true },
    { type: "interpolateYlGn", reversed: false },
    { type: "interpolateYlGn", reversed: true },
    { type: "interpolateYlOrBr", reversed: false },
    { type: "interpolateYlOrBr", reversed: true },
    { type: "interpolateYlOrRd", reversed: false },
    { type: "interpolateYlOrRd", reversed: true },
    { type: "interpolateBrBG", reversed: false },
    { type: "interpolateBrBG", reversed: true },
    { type: "interpolatePRGn", reversed: false },
    { type: "interpolatePRGn", reversed: true },
    { type: "interpolatePiYG", reversed: false },
    { type: "interpolatePiYG", reversed: true },
    { type: "interpolatePuOr", reversed: false },
    { type: "interpolatePuOr", reversed: true },
    { type: "interpolateRdBu", reversed: false },
    { type: "interpolateRdBu", reversed: true },
    { type: "interpolateRdGy", reversed: false },
    { type: "interpolateRdGy", reversed: true },
    { type: "interpolateRdYlBu", reversed: false },
    { type: "interpolateRdYlBu", reversed: true },
    { type: "interpolateRdYlGn", reversed: false },
    { type: "interpolateRdYlGn", reversed: true }
  ]

  onPaletteSelected = (index: any) => {
    // Generate color map
    const scheme = ColorSchemeFactory.createColorScheme({
      type: ColorPaletteCollectionComponent.palettes[index].type,
      // Null doesn't count to length
      number: _.any(this.props.categories, (c) => c.value == null)
        ? this.props.categories.length - 1
        : this.props.categories.length,
      reversed: ColorPaletteCollectionComponent.palettes[index].reversed
    })

    const colorMap = _.map(this.props.categories, (category, i) => ({
      value: category.value,
      color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
    }))
    return this.props.onPaletteSelected(colorMap)
  }

  renderCancel = () => {
    if (this.props.axis.colorMap) {
      return R(
        "div",
        null,
        R("a", { className: "link-plain", onClick: this.props.onCancel, key: "cancel-customize" }, "Cancel")
      )
    }
    return null
  }

  render() {
    return R(
      "div",
      null,
      R("p", null, "Please select a color scheme"),
      _.map(ColorPaletteCollectionComponent.palettes, (config, index) => {
        return R(ColorPaletteComponent, {
          key: index,
          index,
          colorSet: ColorSchemeFactory.createColorScheme({
            type: config.type,
            number: Math.min(this.props.categories.length - 1, 6),
            reversed: config.reversed
          }),
          onPaletteSelected: this.onPaletteSelected,
          number: this.props.categories.length
        })
      }),
      this.renderCancel()
    )
  }
}

interface ColorPaletteComponentProps {
  index: number
  colorSet: any
  onPaletteSelected: any
  number?: number
}

class ColorPaletteComponent extends React.Component<ColorPaletteComponentProps> {
  static defaultProps = { number: 6 }

  handleSelect = () => {
    return this.props.onPaletteSelected(this.props.index)
  }

  render() {
    return R(
      "div",
      { onClick: this.handleSelect, className: "axis-palette" },
      _.map(this.props.colorSet.slice(0, this.props.number), (color, i) => {
        const cellStyle = {
          display: "inline-block",
          height: 20,
          width: 20,
          backgroundColor: color
        }
        return R("div", { style: cellStyle, key: i }, " ")
      })
    )
  }
}
