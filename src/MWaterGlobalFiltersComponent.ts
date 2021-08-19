import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import querystring from "querystring"
import * as ui from "react-library/lib/bootstrap"
import { IdLiteralComponent } from "mwater-expressions-ui"

interface MWaterGlobalFiltersComponentProps {
  /** Schema of the database */
  schema: any
  /** Data source to use to get values */
  dataSource: any
  filterableTables: any
  globalFilters?: any
  onChange: any
}

// Control to edit the global filters (_managed_by and admin_region)
export default class MWaterGlobalFiltersComponent extends React.Component<MWaterGlobalFiltersComponentProps> {
  handleRegionsChange = (regions: any) => {
    // Remove existing filter
    const globalFilters = _.filter(
      this.props.globalFilters || [],
      (gf) => !(gf.op === "within any" && gf.columnId === "admin_region")
    )

    // Add new filter if present
    if (regions && regions.length > 0) {
      globalFilters.push({
        columnId: "admin_region",
        columnType: "id",
        op: "within any",
        exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: regions }]
      })
    }

    return this.props.onChange(globalFilters)
  }

  handleManagedByChange = (managedBy: any) => {
    // Remove existing filter
    const globalFilters = _.filter(
      this.props.globalFilters || [],
      (gf) => !(gf.op === "within" && gf.columnId === "_managed_by")
    )

    // Add new filter if present
    if (managedBy) {
      globalFilters.push({
        columnId: "_managed_by",
        columnType: "id",
        op: "within",
        exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:" + managedBy }]
      })
    }

    return this.props.onChange(globalFilters)
  }

  render() {
    // Find managed by
    let adminRegions, managedBy
    const managedByEntry = _.find(this.props.globalFilters, (gf) => gf.op === "within" && gf.columnId === "_managed_by")
    if (managedByEntry) {
      managedBy = managedByEntry.exprs[0].value.split(":")[1]
    } else {
      managedBy = null
    }

    // Find admin region
    const adminRegionEntry = _.find(
      this.props.globalFilters,
      (gf) => gf.op === "within any" && gf.columnId === "admin_region"
    )
    if (adminRegionEntry) {
      adminRegions = adminRegionEntry.exprs[0].value
    } else {
      adminRegions = null
    }

    return R(
      "div",
      null,
      R(
        ui.FormGroup,
        { label: "Only sites managed by", labelMuted: true },
        R(IdLiteralComponent, {
          value: managedBy,
          onChange: this.handleManagedByChange,
          idTable: "groups",
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          placeholder: "All Organizations",
          multi: false,
          filter: { type: "field", tableAlias: "main", column: "canManageEntities" }
        })
      ),

      R(
        ui.FormGroup,
        { label: "Only sites located in", labelMuted: true },
        R(IdLiteralComponent, {
          value: adminRegions,
          onChange: this.handleRegionsChange,
          idTable: "admin_regions",
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          placeholder: "All Regions",
          multi: true,
          orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }]
        })
      )
    )
  }
}
