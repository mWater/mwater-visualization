import _ from "lodash"
import React from "react"
const R = React.createElement

import RegionSelectComponent from "./RegionSelectComponent"
import DetailLevelSelectComponent from "./DetailLevelSelectComponent"
import { default as ReactSelect } from "react-select"
import { DataSource, Schema } from "mwater-expressions"

export interface AdminScopeAndDetailLevelComponentProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** admin region that is outside bounds. null for whole world */
  scope?: number
  /** level of scope region. null for whole world */
  scopeLevel?: number
  /** Detail level within scope region */
  detailLevel?: number
  onScopeAndDetailLevelChange: (scope: number | null, scopeLevel: number | null, detailLevel: number | null) => void
}

// Scope and detail level setter for AdminChoropleth layers when using admin_regions
export default class AdminScopeAndDetailLevelComponent extends React.Component<AdminScopeAndDetailLevelComponentProps> {
  handleScopeChange = (scope: number | null, scopeLevel: number | null) => {
    if (scope) {
      // Detail level will be set by DetailLevelSelectComponent
      this.props.onScopeAndDetailLevelChange(scope, scopeLevel, null)
    } else {
      this.props.onScopeAndDetailLevelChange(null, null, 0)
    }
  }

  handleDetailLevelChange = (detailLevel: any) => {
    this.props.onScopeAndDetailLevelChange(this.props.scope ?? null, this.props.scopeLevel ?? null, detailLevel)
  }

  render() {
    const basicDetailLevelOptions = [
      { value: 0, label: "Countries" },
      { value: 1, label: "Level 1 (State/Province/District)" }
    ]

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
          dataSource: this.props.dataSource
        })
      ),
      (() => {
        if (this.props.scope != null && this.props.detailLevel != null) {
          return R(
            "div",
            { className: "mb-3" },
            R("label", { className: "text-muted" }, "Detail Level"),
            R(DetailLevelSelectComponent, {
              scope: this.props.scope,
              scopeLevel: this.props.scopeLevel,
              detailLevel: this.props.detailLevel,
              onChange: this.handleDetailLevelChange,
              schema: this.props.schema,
              dataSource: this.props.dataSource
            })
          )
        } else if (this.props.scope == null && this.props.detailLevel != null) {
          // Case of whole world. Allow selecting country or admin level 1
          return R(
            "div",
            { className: "mb-3" },
            R("label", { className: "text-muted" }, "Detail Level"),
            R(ReactSelect, {
              value: _.findWhere(basicDetailLevelOptions, { value: this.props.detailLevel }) || null,
              options: basicDetailLevelOptions,
              onChange: (opt: any) => this.handleDetailLevelChange(opt.value)
            })
          )
        }
        return null
      })()
    )
  }
}
