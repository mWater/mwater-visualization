Schema = require '../src/Schema'

exports.simpleSchema = ->
  schema = new Schema()
  schema.addTable({ id: "t1", name: "T1" })
  schema.addColumn("t1", { id: "primary", name: "Primary", type: "uuid", primary: true })
  schema.addColumn("t1", { id: "text", name: "Text", type: "text" })
  schema.addColumn("t1", { id: "integer", name: "Integer", type: "integer" })
  schema.addColumn("t1", { id: "decimal", name: "Decimal", type: "decimal" })

  schema.addTable({ id: "t2", name: "T2" })
  schema.addColumn("t2", { id: "primary", name: "Primary", type: "uuid", primary: true })
  schema.addColumn("t2", { id: "t1", name: "T1", type: "uuid" })
  schema.addColumn("t2", { id: "text", name: "Text", type: "text" })
  schema.addColumn("t2", { id: "integer", name: "Integer", type: "integer" })
  schema.addColumn("t2", { id: "decimal", name: "Decimal", type: "decimal" })

  schema.addJoin({ id: "1-2", name: "T1->T2", fromTableId: "t1", fromColumnId: "primary", toTableId: "t2", toColumnId: "t1", op: "=", oneToMany: true })
  schema.addJoin({ id: "2-1", name: "T2->T1", fromTableId: "t2", fromColumnId: "t1", toTableId: "t1", toColumnId: "primary", op: "=", oneToMany: false })

  return schema