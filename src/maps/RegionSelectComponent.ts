// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let RegionSelectComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { IdLiteralComponent } from "mwater-expressions-ui"

// Allows selecting of a single region
export default RegionSelectComponent = (function () {
  RegionSelectComponent = class RegionSelectComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        region: PropTypes.number, // _id of region
        onChange: PropTypes.func.isRequired, // Called with (_id, level)
        placeholder: PropTypes.string,
        regionsTable: PropTypes.string.isRequired, // e.g. "admin_regions"
        maxLevel: PropTypes.number // Maximum region level allowed
      }

      this.defaultProps = {
        placeholder: "All Countries",
        regionsTable: "admin_regions"
      }
      // Default for existing code
    }

    handleChange = (id: any) => {
      if (!id) {
        this.props.onChange(null, null)
        return
      }

      // Look up level
      const query = {
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
      });
    }

    render() {
      let filter = null
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
  RegionSelectComponent.initClass()
  return RegionSelectComponent
})()
