import _ from 'lodash'
import { Schema, LocalizedString, Table, ExprUtils } from "mwater-expressions"
import { useState, useEffect } from "react"
import React from "react"
import { OptionListComponent } from "./UIComponents"
import { TextInput } from "react-library/lib/bootstrap"


/** Searchable list of custom tables */
export const CustomTablesetListComponent = (props: {
  apiUrl: string
  schema: Schema
  client?: string

  /** User id */
  user?: string

  /** Called with table selected */
  onChange: (tableId: string) => void 
  extraTables: string[]
  onExtraTableAdd: (tableId: string) => void
  onExtraTableRemove: (tableId: string) => void

  /** e.g. "en" */
  locale?: string
}) => {
  const [tablesets, setTablesets] = useState<CustomTableset[]>()
  const [search, setSearch] = useState<string | null>("")
  const [extraTableNeeded, setExtraTableNeeded] = useState<string>()

  // Get list of all tablesets
  useEffect(() => {
    fetch(`${props.apiUrl}custom_tablesets?client=${props.client || ""}`).then(response => response.json()).then(body => {
      setTablesets(_.sortBy(body, ts => ts.code))
    })
  }, [])

  useEffect(() => {
    if (extraTableNeeded && props.extraTables.includes(extraTableNeeded)) {
      props.onChange(extraTableNeeded)
    }
  })

  const selectTable = (ts: CustomTableset, tableId: string) => {
    const qualifiedTableId = `custom.${ts.code}.${tableId}`

    // If already included, select it
    if (props.schema.getTable(qualifiedTableId)) {
      props.onChange(qualifiedTableId)
      return
    }

    // Request extra tables
    setExtraTableNeeded(qualifiedTableId)
    props.onExtraTableAdd(qualifiedTableId)
  }

  const handleRemove = (ts: CustomTableset) => {
    // Remove from extra tables
    const match = props.extraTables.find(t => (t || "").startsWith(`custom.${ts.code}.`))
    if (match) {
      if (confirm("Remove this set of tables? Some widgets may not work correctly.")) {
        props.onExtraTableRemove(match)
      }
    }
  }

  if (!tablesets || extraTableNeeded) {
    return <div><i className="fa fa-spin fa-spinner"/> Loading...</div>
  }

  const renderTableset = (ts: CustomTableset) => {
    const name = ExprUtils.localizeString(ts.design.name, props.locale)

    // Check search 
    if (search && !name.toLowerCase().includes(search.toLowerCase())) {
      return null
    }

    const items = ts.design.tables.map(t => ({ 
      name: ExprUtils.localizeString(t.name, props.locale), 
      onClick: () => selectTable(ts, t.id)
    }))

    const alreadyIncluded = props.extraTables.some(t => (t || "").startsWith(`custom.${ts.code}.`))

    return <div key={ts.code}>
      { alreadyIncluded
      ? <div style={{ float: "right" }}>
        <button className="btn btn-xs btn-link" type="button" onClick={() => handleRemove(ts)}>
          <i className="fa fa-remove"/>
        </button>
      </div>
      : null}
      <h4 className="text-muted">{name}</h4>
      <OptionListComponent items={items}/>
    </div>
  }

  return <div>
    <TextInput value={search} onChange={setSearch} placeholder="Search..."/>
    {tablesets.map(ts => renderTableset(ts))}
  </div>
}


/** Partial definition for use here only */
interface CustomTableset {
  code: string
  type: string
  design: {
    /** localized name of tableset */
    name: LocalizedString

    /** Localized description */
    desc?: LocalizedString

    tables: Table[]
  }
}