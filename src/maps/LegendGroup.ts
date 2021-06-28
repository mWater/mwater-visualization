// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LegendGroup
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"

export default LegendGroup = (function () {
  LegendGroup = class LegendGroup extends React.Component {
    static initClass() {
      this.propTypes = {
        items: PropTypes.array,
        radiusLayer: PropTypes.bool,
        defaultColor: PropTypes.string,
        name: PropTypes.string,
        symbol: PropTypes.string,
        markerSize: PropTypes.number
      }

      this.defaultProps = {
        items: [],
        radiusLayer: false,
        symbol: null
      }
    }

    render() {
      return R(
        "div",
        { style: { marginBottom: 5 } },
        React.createElement(LegendItem, {
          hasChildren: this.props.items.length > 0,
          symbol: this.props.symbol,
          markerSize: this.props.markerSize,
          color: this.props.defaultColor,
          name: this.props.name,
          key: this.props.name,
          radiusLayer: this.props.radiusLayer
        }),
        _.map(this.props.items, (item) => {
          return React.createElement(LegendItem, {
            isChild: true,
            symbol: this.props.symbol,
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
  LegendGroup.initClass()
  return LegendGroup
})()

class LegendItem extends React.Component {
  static initClass() {
    this.propTypes = {
      color: PropTypes.string,
      name: PropTypes.string,
      radiusLayer: PropTypes.bool,
      symbol: PropTypes.string,
      markerSize: PropTypes.number,
      hasChildren: PropTypes.bool,
      isChild: PropTypes.bool
    }

    this.defaultProps = {
      radiusLayer: false,
      hasChildren: false,
      isChild: false
    }
  }

  renderSymbol() {
    const symbolStyle = {
      color: this.props.color,
      display: "inline-block",
      marginRight: 4,
      fontSize: this.props.markerSize
    }

    const className = this.props.symbol.replace("font-awesome/", "fa fa-")
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
LegendItem.initClass()
