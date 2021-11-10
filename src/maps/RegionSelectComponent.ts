import _ from "lodash"
import React from "react"
const R = React.createElement

import { IdLiteralComponent } from "mwater-expressions-ui"
import { DataSource, Schema } from "mwater-expressions"
import { JsonQLExpr, JsonQLSelectQuery } from "jsonql"

interface RegionSelectComponentProps {
  schema: Schema
  dataSource: DataSource
  /** _id of region */
  region: number | null | undefined
  onChange: (region: number | null, level: number | null) => void
  /** Default "All Countries" */
  placeholder?: string
  /** e.g. "admin_regions" */
  regionsTable?: string
  /** Maximum region level allowed */
  maxLevel?: number
}

// Allows selecting of a single region
export default class RegionSelectComponent extends React.Component<RegionSelectComponentProps> {
  static defaultProps = {
    placeholder: "All Countries",
    regionsTable: "admin_regions"
  }

  handleChange = (id: any) => {
    if (!id) {
      this.props.onChange(null, null)
      return
    }

    // Look up level
    const query: JsonQLSelectQuery = {
      type: "query",
      selects: [{ type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" }],
      from: { type: "table", table: this.props.regionsTable, alias: "main" },
      where: {
        type: "op",
        op: "=",
        exprs: [{ type: "field", tableAlias: "main", column: "_id" }, id]
      }
    }

    // Execute query
    return this.props.dataSource.performQuery(query, (err: any, rows: any) => {
      if (err) {
        console.log("Error getting regions: " + err?.message)
        return
      }

      return this.props.onChange(id, rows[0].level)
    })
  }

  render() {
    let filter: JsonQLExpr | undefined = undefined
    if (this.props.maxLevel != null) {
      filter = {
        type: "op",
        op: "<=",
        exprs: [{ type: "field", tableAlias: "main", column: "level" }, this.props.maxLevel]
      }
    }

    return R(IdLiteralComponent, {
      value: this.props.region,
      onChange: this.handleChange,
      idTable: this.props.regionsTable,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      placeholder: this.props.placeholder,
      orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }],
      filter
    })
  }
}
