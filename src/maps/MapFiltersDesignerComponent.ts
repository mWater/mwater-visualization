import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { FilterExprComponent } from "mwater-expressions-ui"
import { ExprCleaner } from "mwater-expressions"
import { ExprUtils } from "mwater-expressions"
import PopoverHelpComponent from "react-library/lib/PopoverHelpComponent"
import FiltersDesignerComponent from "../FiltersDesignerComponent"
import * as MapUtils from "./MapUtils"

interface MapFiltersDesignerComponentProps {
  /** Schema to use */
  schema: any
  /** Data source to use */
  dataSource: any
  /** See Map Design.md */
  design: any
  /** Called with new design */
  onDesignChange: any
}

// Designer for filters for a map
export default class MapFiltersDesignerComponent extends React.Component<MapFiltersDesignerComponentProps> {
  static contextTypes = { globalFiltersElementFactory: PropTypes.func }

  handleFiltersChange = (filters: any) => {
    const design = _.extend({}, this.props.design, { filters })
    return this.props.onDesignChange(design)
  }

  handleGlobalFiltersChange = (globalFilters: any) => {
    const design = _.extend({}, this.props.design, { globalFilters })
    return this.props.onDesignChange(design)
  }

  render() {
    // Get filterable tables
    const filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema)
    if (filterableTables.length === 0) {
      return null
    }

    return R(
      "div",
      null,
      R(
        "div",
        { className: "form-group" },
        R(
          "label",
          { className: "text-muted" },
          "Filters ",
          R(
            PopoverHelpComponent,
            { placement: "left" },
            "Filters all layers in the map. Individual layers can be filtered by clicking on Customize..."
          )
        ),

        R(
          "div",
          { style: { margin: 5 } },
          R(FiltersDesignerComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            filters: this.props.design.filters,
            onFiltersChange: this.handleFiltersChange,
            filterableTables
          })
        )
      ),

      this.context.globalFiltersElementFactory
        ? R(
            "div",
            { className: "form-group" },
            R("label", { className: "text-muted" }, "Global Filters "),

            R(
              "div",
              { style: { margin: 5 } },
              this.context.globalFiltersElementFactory({
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                filterableTables,
                globalFilters: this.props.design.globalFilters || [],
                onChange: this.handleGlobalFiltersChange
              })
            )
          )
        : undefined
    )
  }
}
