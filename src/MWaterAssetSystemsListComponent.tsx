import _ from "lodash"
import { Schema, LocalizedString, Table, ExprUtils } from "mwater-expressions"
import { useState, useEffect } from "react"
import React from "react"
import { OptionListComponent } from "./UIComponents"
import { TextInput } from "react-library/lib/bootstrap"

/** Searchable list of asset system tables */
export const MWaterAssetSystemsListComponent = (props: {
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
  const [systems, setSystems] = useState<AssetSystem[]>()
  const [search, setSearch] = useState<string | null>("")
  const [extraTableNeeded, setExtraTableNeeded] = useState<string>()

  // Get list of all systems
  useEffect(() => {
    fetch(`${props.apiUrl}asset_systems?client=${props.client || ""}`)
      .then((response) => response.json())
      .then((body) => {
        // Put included ones first
        setSystems(
          _.sortByAll(body, [
            (m) => (props.extraTables.some(t => t == `assets:${m.sid}`)) ? 0 : 1,
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

  const selectTable = (system: AssetSystem) => {
    const qualifiedTableId = `assets:${system.sid}`

    // If already included, select it
    if (props.schema.getTable(qualifiedTableId)) {
      props.onChange(qualifiedTableId)
      return
    }

    // Request extra tables as wildcard
    setExtraTableNeeded(qualifiedTableId)
    props.onExtraTableAdd(qualifiedTableId)
  }

  const handleRemove = (system: AssetSystem) => {
    // Remove from extra tables
    const match = props.extraTables.find((t) => t == `assets:${system.sid}`)
    if (match) {
      if (confirm("Remove this table? Some widgets may not work correctly.")) {
        props.onChange(null)
        props.onExtraTableRemove(match)
      }
    }
  }

  if (!systems || extraTableNeeded) {
    return (
      <div>
        <i className="fa fa-spin fa-spinner" /> Loading...
      </div>
    )
  }

  const renderAssetSystems = () => {
    const items = systems
      .map((m) => {
        const alreadyIncluded = props.extraTables.some((t) => t == `systems:${m.sid}`)
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
      <div className="alert alert-info">
        <i className="fa fa-info-circle" /> This is a beta feature.
      </div>
      {renderAssetSystems()}
    </div>
  )
}

/** Partial definition for use here only */
interface AssetSystem {
  sid: number
  design: {
    name: LocalizedString
    description: LocalizedString
  }
}
