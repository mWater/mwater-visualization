import _ from "lodash"
import { Schema, LocalizedString, Table, ExprUtils } from "mwater-expressions"
import { useState, useEffect } from "react"
import React from "react"
import { OptionListComponent } from "./UIComponents"
import { TextInput } from "react-library/lib/bootstrap"

/** Searchable list of metric tables */
export const MWaterMetricsTableListComponent = (props: {
  apiUrl: string
  schema: Schema
  client?: string

  /** User id */
  user?: string

  /** Called with table selected */
  onChange: (tableId: string | null) => void
  extraTables: string[]
  onExtraTableAdd: (tableId: string) => void
  onExtraTableRemove: (tableId: string) => void

  /** e.g. "en" */
  locale?: string
}) => {
  const [metrics, setMetrics] = useState<Metric[]>()
  const [search, setSearch] = useState<string | null>("")
  const [extraTableNeeded, setExtraTableNeeded] = useState<string>()

  // Get list of all metrics
  useEffect(() => {
    fetch(`${props.apiUrl}metrics?client=${props.client || ""}`)
      .then((response) => response.json())
      .then((body) => {
        // Put included ones first
        setMetrics(
          _.sortByAll(body, [
            (m) => (props.extraTables.some((t) => (t = `metrics:${m._id}`)) ? 0 : 1),
            (m) => ExprUtils.localizeString(m.design.name, props.locale)
          ])
        )
      })
  }, [])

  useEffect(() => {
    if (extraTableNeeded && props.schema.getTable(extraTableNeeded)) {
      props.onChange(extraTableNeeded)
    }
  })

  const selectTable = (metric: Metric) => {
    const qualifiedTableId = `metrics:${metric._id}`

    // If already included, select it
    if (props.schema.getTable(qualifiedTableId)) {
      props.onChange(qualifiedTableId)
      return
    }

    // Request extra tables as wildcard
    setExtraTableNeeded(qualifiedTableId)
    props.onExtraTableAdd(qualifiedTableId)
  }

  const handleRemove = (metric: Metric) => {
    // Remove from extra tables
    const match = props.extraTables.find((t) => t == `metrics:${metric._id}`)
    if (match) {
      if (confirm("Remove this tables? Some widgets may not work correctly.")) {
        props.onChange(null)
        props.onExtraTableRemove(match)
      }
    }
  }

  if (!metrics || extraTableNeeded) {
    return (
      <div>
        <i className="fa fa-spin fa-spinner" /> Loading...
      </div>
    )
  }

  const renderMetrics = () => {
    const items = metrics
      .filter((m) => !m.design.deprecated)
      .map((m) => {
        const alreadyIncluded = props.extraTables.some((t) => t == `metrics:${m._id}`)
        return {
          name: ExprUtils.localizeString(m.design.name, props.locale) || "",
          onClick: () => selectTable(m),
          onRemove: alreadyIncluded ? handleRemove.bind(null, m) : undefined
        }
      })
      .filter((item) => !search || !item.name.toLowerCase().includes(search.toLowerCase()))

    return <OptionListComponent items={items} />
  }

  return (
    <div>
      <TextInput value={search} onChange={setSearch} placeholder="Search..." />
      {renderMetrics()}
    </div>
  )
}

/** Partial definition for use here only */
interface Metric {
  _id: string
  design: {
    /** localized name of tableset */
    name: LocalizedString

    /** Localized description */
    desc: LocalizedString

    deprecated?: boolean
  }
}
