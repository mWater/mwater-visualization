import React, { useEffect, useState } from "react"
import { DataSource, ExprCompiler, Schema, injectTableAlias } from "mwater-expressions"
import { JsonQLSelectQuery } from "jsonql"
import { JsonQLFilter } from ".."
import { compact } from "lodash"
import { HoverOverItem } from "./maps"

export interface HoverContentProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** Design of the marker layer */
  design: any
  filters?: JsonQLFilter[]
  /** Table that popup is for */
  // table: string
  // /** Table of the row that join is to. Usually same as table except for choropleth maps */
  // idTable: string
  // defaultPopupFilterJoins: any
}

const HoverContent: React.FC<HoverContentProps> = props => {
  const [value, setValue] = useState<{ [key: string]: string }>({})
  useEffect(() => {
    const items = props.design.hoverOver?.items ?? []
    if (items.length > 0) {
      const exprCompiler = new ExprCompiler(props.schema)
      const query: JsonQLSelectQuery = {
        type: "query",
        selects: [],
        from: exprCompiler.compileTable(props.design.table, "main"),
        limit: 1
      }

      items.forEach((item: HoverOverItem) => {
        if (item.value) {
          query.selects.push({
            type: "select",
            expr: exprCompiler.compileExpr({ expr: item.value, tableAlias: "main" }),
            alias: item.id
          })
        }
      })

      if (props.filters) {
        let whereClauses = props.filters.map(f => injectTableAlias(f.jsonql, "main"))

        whereClauses = compact(whereClauses)

        // Wrap if multiple
        if (whereClauses.length > 1) {
          query.where = { type: "op", op: "and", exprs: whereClauses }
        } else {
          query.where = whereClauses[0]
        }
      }

      props.dataSource.performQuery(query, (error: any, data: any) => {
        setValue(data?.[0] ?? {})
      })
    }
  }, [])
  return (
    <div className="_mviz-map-hover-content">
      {props.design.hoverOver?.items.map((item: HoverOverItem) => (
        <>
          <span>{item.label}:</span>
          <span className="text-muted">{value[item.id] === null ? "n/a" : value[item.id] ?? "■■■■"}</span>
        </>
      ))}
    </div>
  )
}

export default HoverContent
