import { omit } from "lodash"
import { DataSource, Expr, Schema } from "mwater-expressions"
import { ExprComponent } from "mwater-expressions-ui"
import React, { useState } from "react"
import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import * as ui from "react-library/lib/bootstrap"
import uuid from "uuid"
import { HoverOverItem } from "./maps"

export interface EditHoverOverProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** Design of the marker layer */
  design: any
  /** Called with new design */
  onDesignChange: any
  /** Table that popup is for */
  table: string
  /** Table of the row that join is to. Usually same as table except for choropleth maps */
  idTable: string
  defaultPopupFilterJoins: any
}

const EditHoverOver: React.FC<EditHoverOverProps> = props => {
  const [editing, setEditing] = useState(false)

  const handleRemovePopup = () => {
    const design = omit(props.design, "hoverOver")
    props.onDesignChange(design)
  }

  const handleDesignChange = (items: HoverOverItem[]) => {
    const hoverOver = { ...(props.design.hoverOver ?? {}), items }
    const design = { ...props.design, hoverOver }

    return props.onDesignChange(design)
  }

  const handleItemChange = (item: HoverOverItem) => {
    const items = (props.design.hoverOver?.items ?? []).map((i: HoverOverItem) => (item.id === i.id ? item : i))
    const design = { ...props.design, hoverOver: { ...props.design.hoverOver, items } }

    return props.onDesignChange(design)
  }

  const handleItemDelete = (item: HoverOverItem) => {
    const items = (props.design.hoverOver?.items ?? []).filter((i: HoverOverItem) => item.id !== i.id)
    const design = { ...props.design, hoverOver: { ...props.design.hoverOver, items } }

    return props.onDesignChange(design)
  }

  return (
    <>
      <button className="btn btn-link" onClick={() => setEditing(true)}>
        <span className="fa fa-pencil" /> Customize Hoverover
      </button>
      {props.design.hoverOver && (
        <button className="btn btn-link" onClick={handleRemovePopup}>
          <span className="fa fa-times" /> Remove Hover over
        </button>
      )}

      {editing && (
        <ModalWindowComponent isOpen onRequestClose={() => setEditing(false)}>
          {(props.design.hoverOver?.items ?? []).length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {props.design.hoverOver?.items.map((item: HoverOverItem) => (
                  <HoverOverItemEditor
                    schema={props.schema}
                    dataSource={props.dataSource}
                    table={props.design.table}
                    onItemChange={handleItemChange}
                    onItemDelete={handleItemDelete}
                    item={item}
                  />
                ))}
              </tbody>
            </table>
          )}

          {(props.design.hoverOver?.items ?? []).length < 3 && (
            <button
              className="btn btn-link"
              onClick={() =>
                handleDesignChange([
                  ...(props.design.hoverOver?.items ?? []),
                  { id: uuid().replace(/-/g, ""), label: "" }
                ])
              }>
              <span className="fa fa-plus" />
              Add item
            </button>
          )}
        </ModalWindowComponent>
      )}
    </>
  )
}

interface HoverOverItemEditorProps {
  schema: Schema
  dataSource: DataSource
  item: HoverOverItem
  onItemChange: (item: HoverOverItem) => void
  onItemDelete: (item: HoverOverItem) => void
  table: string
}
const HoverOverItemEditor: React.FC<HoverOverItemEditorProps> = ({
  schema,
  dataSource,
  table,
  item,
  onItemChange,
  onItemDelete
}) => {
  return (
    <tr>
      <td>
        <ui.TextInput value={item.label} onChange={value => onItemChange({ ...item, label: value })} />
      </td>
      <td>
        <ExprComponent
          schema={schema}
          dataSource={dataSource}
          table={table}
          types={["text", "number", "enum", "boolean", "date", "datetime", "id"]}
          onChange={expr => onItemChange({ ...item, value: expr })}
          value={item.value ?? null}
          aggrStatuses={["individual", "literal", "aggregate"]}
        />
      </td>
      <td>
        <button className="btn btn-link" onClick={() => onItemDelete(item)}>
          <span className="fa fa-close" />
        </button>
      </td>
    </tr>
  )
}

export default EditHoverOver
