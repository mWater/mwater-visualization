// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LayerLegendComponent
import PropTypes from "prop-types"
import React from "react"
import _ from "lodash"
const R = React.createElement
import AxisBuilder from "../axes/AxisBuilder"
import LegendGroup from "./LegendGroup"
import { ExprUtils } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"

// wraps the legends for a layer
export default LayerLegendComponent = (function () {
  LayerLegendComponent = class LayerLegendComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        radiusLayer: PropTypes.bool,
        axis: PropTypes.object,
        symbol: PropTypes.string,
        markerSize: PropTypes.number,
        defaultColor: PropTypes.string,
        filters: PropTypes.array, // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
        locale: PropTypes.string
      }

      this.defaultProps = { radiusLayer: false }
    }

    getCategories() {
      const axisBuilder = new AxisBuilder({ schema: this.props.schema })

      if (!this.props.axis || !this.props.axis.colorMap) {
        return
      }

      // Get categories (value + label)
      const categories = axisBuilder.getCategories(this.props.axis, null, this.props.locale)

      // Just "None" and so doesn't count
      if (_.any(categories, (category) => category.value != null)) {
        return categories
      }

      // Can't get values of aggregate axis
      if (axisBuilder.isAxisAggr(this.props.axis)) {
        return []
      }

      // If no categories, use values from color map as input
      return axisBuilder.getCategories(this.props.axis, _.pluck(this.props.axis.colorMap, "value"), this.props.locale)
    }

    render() {
      let items: any
      const axisBuilder = new AxisBuilder({ schema: this.props.schema })
      const categories = this.getCategories()

      if (this.props.axis && this.props.axis.colorMap) {
        items = _.map(categories, (category) => {
          // Exclude if excluded
          if (_.includes(this.props.axis.excludedValues, category.value)) {
            return null
          }

          const label = axisBuilder.formatCategory(this.props.axis, category)
          const color = _.find(this.props.axis.colorMap, { value: category.value })
          if (color) {
            return { color: color.color, name: label }
          } else {
            // old color maps dont have null value
            return { color: this.props.defaultColor, name: label }
          }
        })

        // Compact out nulls
        items = _.compact(items)
      } else {
        items = []
      }

      return React.createElement(LegendGroup, {
        symbol: this.props.symbol,
        markerSize: this.props.markerSize,
        items,
        defaultColor: this.props.defaultColor,
        name: this.props.name,
        radiusLayer: this.props.radiusLayer
      })
    }
  }
  LayerLegendComponent.initClass()
  return LayerLegendComponent
})()
