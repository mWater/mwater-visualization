// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ScopeAndDetailLevelComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const H = React.DOM
const R = React.createElement
import { ExprUtils } from "mwater-expressions"
import RegionSelectComponent from "./RegionSelectComponent"
import DetailLevelSelectComponent from "./DetailLevelSelectComponent"
import ui from "react-library/lib/bootstrap"

// Generic scope and detail level setter for AdminChoropleth layers
export default ScopeAndDetailLevelComponent = (function () {
  ScopeAndDetailLevelComponent = class ScopeAndDetailLevelComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        scope: PropTypes.string, // admin region that is outside bounds. null for whole world
        scopeLevel: PropTypes.number, // level of scope region. null for whole world
        detailLevel: PropTypes.number, // Detail level within scope region
        onScopeAndDetailLevelChange: PropTypes.func.isRequired, // Called with (scope, scopeLevel, detailLevel)
        regionsTable: PropTypes.string.isRequired
      }
      // Table name of regions
    }

    handleScopeChange = (scope: any, scopeLevel: any) => {
      if (scope) {
        return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, scopeLevel + 1)
      } else {
        return this.props.onScopeAndDetailLevelChange(null, null, 0)
      }
    }

    handleDetailLevelChange = (detailLevel: any) => {
      return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel)
    }

    render() {
      // Determine number of levels by looking for levelN field
      let maxLevel = 0
      const detailLevelOptions = []

      for (let level = 0; level <= 9; level++) {
        const levelColumn = this.props.schema.getColumn(this.props.regionsTable, `level${level}`)
        if (levelColumn) {
          maxLevel = level
          // Can't select same detail level as scope
          if (level > (this.props.scopeLevel != null ? this.props.scopeLevel : -1)) {
            detailLevelOptions.push({ value: level, label: ExprUtils.localizeString(levelColumn.name) })
          }
        }
      }

      return R(
        "div",
        null,
        R(
          "div",
          { className: "form-group" },
          R("label", { className: "text-muted" }, "Region to Map"),
          R(RegionSelectComponent, {
            region: this.props.scope,
            onChange: this.handleScopeChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            regionsTable: this.props.regionsTable,
            maxLevel: maxLevel - 1,
            placeholder: "All Regions"
          })
        ),
        R(
          "div",
          { className: "form-group" },
          R("label", { className: "text-muted" }, "Detail Level"),
          R(ui.Select, {
            value: this.props.detailLevel,
            options: detailLevelOptions,
            onChange: this.handleDetailLevelChange
          })
        )
      )
    }
  }
  ScopeAndDetailLevelComponent.initClass()
  return ScopeAndDetailLevelComponent
})()
