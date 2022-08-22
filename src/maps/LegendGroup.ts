import React from "react"
const R = React.createElement
import _ from "lodash"

export interface LegendGroupProps {
  items?: { color: string, name: string }[]
  radiusLayer?: boolean
  defaultColor?: string
  name?: string
  symbol?: string | null
  markerSize?: number
}

export default class LegendGroup extends React.Component<LegendGroupProps> {
  static defaultProps = {
    items: [],
    radiusLayer: false,
    symbol: null
  }

  render() {
    return R(
      "div",
      { style: { marginBottom: 5 } },
      React.createElement(LegendItem, {
        hasChildren: (this.props.items || []).length > 0,
        symbol: this.props.symbol ?? undefined,
        markerSize: this.props.markerSize,
        color: this.props.defaultColor,
        name: this.props.name,
        key: this.props.name,
        radiusLayer: this.props.radiusLayer
      }),
      _.map((this.props.items || []), (item) => {
        return React.createElement(LegendItem, {
          isChild: true,
          symbol: this.props.symbol ?? undefined,
          markerSize: this.props.markerSize,
          color: item.color,
          name: item.name,
          key: item.name,
          radiusLayer: this.props.radiusLayer
        })
      })
    )
  }
}

interface LegendItemProps {
  color?: string
  name?: string
  radiusLayer?: boolean
  symbol?: string
  markerSize?: number
  hasChildren?: boolean
  isChild?: boolean
}

class LegendItem extends React.Component<LegendItemProps> {
  static defaultProps = {
    radiusLayer: false,
    hasChildren: false,
    isChild: false
  }

  renderSymbol() {
    const symbolStyle = {
      color: this.props.color,
      display: "inline-block",
      marginRight: 4,
      fontSize: this.props.markerSize
    }

    const className = this.props.symbol!.replace("font-awesome/", "fa fa-")
    return R("span", { className, style: symbolStyle }, "")
  }

  renderColorIndicator() {
    const indicatorStyle = {
      height: 10,
      width: 10,
      backgroundColor: this.props.color,
      display: "inline-block",
      marginRight: 4
    }

    if (this.props.radiusLayer) {
      indicatorStyle["borderRadius"] = 5
    }

    return R("span", { style: indicatorStyle }, "")
  }

  renderIndicator() {
    if (this.props.symbol) {
      return this.renderSymbol()
    } else {
      return this.renderColorIndicator()
    }
  }

  render() {
    let titleStyle = {}
    if (!this.props.isChild) {
      titleStyle = {
        margin: 2,
        fontWeight: "bold"
      }
    }

    const containerStyle = { paddingLeft: this.props.isChild ? 5 : 0 }

    return R(
      "div",
      { style: containerStyle },
      !this.props.hasChildren ? this.renderIndicator() : undefined,
      R("span", { style: titleStyle }, this.props.name)
    )
  }
}
