import produce, { original } from "immer"
import _ from "lodash"
import { ExprCleaner, ExprUtils, ExprValidator, Schema } from "mwater-expressions"
import { DatagridDesign } from "./DatagridDesign"

export default class DatagridUtils {
  schema: Schema

  constructor(schema: Schema) {
    this.schema = schema
  }

  // Cleans a datagrid design, removing invalid columns
  cleanDesign(design: DatagridDesign): DatagridDesign {
    if (!design.table) {
      return design
    }

    const exprCleaner = new ExprCleaner(this.schema)

    // Erase all if table doesn't exist
    if (!this.schema.getTable(design.table)) {
      return { table: null, columns: [] }
    }

    // Clean columns
    design = produce(design, draft => {
      for (let column of draft.columns) {
        if (column.type === "expr") {
          // Determine if subtable
          var table
          if (column.subtable) {
            const subtable = _.findWhere(design.subtables!, {id: column.subtable})

            // Now get destination table
            table = new ExprUtils(this.schema).followJoins(design.table!, subtable!.joins)
          } else {
            table = design.table!
          }

          column.expr = exprCleaner.cleanExpr((column.expr ? original(column.expr) || null : null), { table, aggrStatuses: ["individual", "literal", "aggregate"] })
        }
      }

    })
    return design
  }
  
  validateDesign(design: DatagridDesign) {
    if (!design.table) {
      return "Missing table"
    }

    if (!design.columns || !design.columns[0]) {
      return "No columns"
    }

    // Validate column exprs
    for (const column of design.columns) {
      if (column.expr) {
        const error = new ExprValidator(this.schema).validateExpr(column.expr, { aggrStatuses: ["individual", "literal", "aggregate"] })
        if (error) {
          return error
        }
      }
    }

    return null
  }
}
