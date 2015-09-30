Schema = require '../src/Schema'

exports.simpleSchema = ->
  schema = new Schema()
  schema.addTable({ id: "t1", name: "T1" })
  schema.addColumn("t1", { id: "text", name: "Text", type: "text" })
  schema.addColumn("t1", { id: "integer", name: "Integer", type: "integer" })
  schema.addColumn("t1", { id: "decimal", name: "Decimal", type: "decimal" })
  schema.addColumn("t1", { id: "enum", name: "Enum", type: "enum", values: [{ id: "a", name: "A"}, { id: "b", name: "B"}] })
  schema.addColumn("t1", { id: "date", name: "Date", type: "date" })
  schema.addColumn("t1", { id: "datetime", name: "Datetime", type: "datetime" })
  schema.addColumn("t1", { id: "boolean", name: "Boolean", type: "boolean" })
  schema.addColumn("t1", { id: "1-2", name: "T1->T2", type: "join", join: { fromTable: "t1", fromColumn: "primary", toTable: "t2", toColumn: "t1", op: "=", multiple: true }})

  schema.addTable({ id: "t2", name: "T2", ordering: "integer" })
  schema.addColumn("t2", { id: "t1", name: "T1", type: "uuid" })
  schema.addColumn("t2", { id: "text", name: "Text", type: "text" })
  schema.addColumn("t2", { id: "integer", name: "Integer", type: "integer" })
  schema.addColumn("t2", { id: "decimal", name: "Decimal", type: "decimal" })
  schema.addColumn("t2", { id: "2-1", name: "T2->T1", type: "join", join: { fromTable: "t2", fromColumn: "t1", toTable: "t1", toColumn: "primary", op: "=", multiple: false }})

  return schema