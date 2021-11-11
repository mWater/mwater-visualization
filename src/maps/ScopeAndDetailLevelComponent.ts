import _ from "lodash"
import React from "react"
const R = React.createElement
import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import RegionSelectComponent from "./RegionSelectComponent"
import * as ui from "react-library/lib/bootstrap"

export interface ScopeAndDetailLevelComponentProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** admin region that is outside bounds. null for whole world */
  scope?: string
  /** level of scope region. null for whole world */
  scopeLevel?: number | null
  /** Detail level within scope region */
  detailLevel?: number
  /** Called with (scope, scopeLevel, detailLevel) */
  onScopeAndDetailLevelChange: any
  regionsTable: string
}

// Generic scope and detail level setter for AdminChoropleth layers
export default class ScopeAndDetailLevelComponent extends React.Component<ScopeAndDetailLevelComponentProps> {
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
        { className: "mb-3" },
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
        { className: "mb-3" },
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
