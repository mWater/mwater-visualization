import _ from "lodash"
import { Column, Expr, ExprUtils, LocalizedString, Schema } from "mwater-expressions"

/** Expression with a label attached */
export interface LabeledExpr {
  expr: Expr
  label: string
  /** Which joins from the originating table to get to expression */
  joins: string[]
}

export interface LabeledExprGeneratorOptions {
  /** e.g. "en". Uses _base by default, then en [null] */
  locale?: string | null

  /** "text", "code" or "both" ["code"] */
  headerFormat?: "text" | "code" | "both"

  /** "name" or "code" ["name"] */
  enumFormat?: "name" | "code"

  /** split geometry into lat/lng [false] */
  splitLatLng?: boolean

  /** split enumset into true/false expressions [false] */
  splitEnumset?: boolean

  /** use ids of n-1 joins, not the code/name/etc [false] */
  useJoinIds?: boolean

  /** optional boolean predicate to filter columns included. Called with table id, column object */
  columnFilter?: (tableId: string, column: Column) => boolean

  /** optional boolean predicate to filter 1-n/n-n joins to include. Called with table id, join column object. Default is to not include those joins */
  multipleJoinCondition?: (tableId: string, column: Column) => boolean

  /** optional boolean to replace redacted columns with unredacted ones */
  useConfidential?: boolean

  /** number duplicate label columns with " (1)", " (2)" , etc. */
  numberDuplicatesLabels?: boolean

  /** Override how a column is processed. Return array if processed, null to pass through */
  overrideColumn?: (tableId: string, column: Column, joins: string[], label: string) => null | LabeledExpr[]
}

/** Generates labeled expressions (expr, label and joins) for a table. Used to make a datagrid, do export or import. */
export default class LabeledExprGenerator {
  schema: Schema

  constructor(schema: Schema) {
    this.schema = schema
  }

  // Generate labeled exprs, an array of ({ expr: mwater expression, label: plain string, joins: array of join column ids to get to current table. Usually []. Only present for 1-n joins })
  // table is id of table to generate from
  generate(table: string, options: LabeledExprGeneratorOptions = {}): LabeledExpr[] {
    _.defaults(options, {
      locale: null,
      headerFormat: "code",
      enumFormat: "code",
      splitLatLng: false,
      splitEnumset: false,
      useJoinIds: false,
      columnFilter: null,
      multipleJoinCondition: null,
      useConfidential: false,
      numberDuplicatesLabels: false
    })

    // Create a label for a column
    function createLabel(column: Column, suffix?: LocalizedString | string) {
      // By header mode
      let label
      if (options.headerFormat === "code" && column.code) {
        label = column.code
        if (suffix) {
          label += ` (${ExprUtils.localizeString(suffix, options.locale)})`
        }
      } else if (options.headerFormat === "both" && column.code) {
        label = column.code
        if (suffix) {
          label += ` (${ExprUtils.localizeString(suffix, options.locale)})`
        }
        label += "\n" + ExprUtils.localizeString(column.name, options.locale)
        if (suffix) {
          label += ` (${ExprUtils.localizeString(suffix, options.locale)})`
        }
      } else {
        // text
        label = ExprUtils.localizeString(column.name, options.locale)
        if (suffix) {
          label += ` (${ExprUtils.localizeString(suffix, options.locale)})`
        }
      }

      return label
    }

    // Convert a table + schema column into multiple labeled expres
    var convertColumn = (table: string, column: Column, joins: string[]) => {
      // Filter if present
      let joinColumn
      if (options.columnFilter && !options.columnFilter(table, column)) {
        return []
      }

      // Skip deprecated
      if (column.deprecated) {
        return []
      }

      // Skip redacted if confidential on
      if (column.redacted && options.useConfidential) {
        return []
      }

      // Skip confidential data
      if (column.confidential && !options.useConfidential) {
        return []
      }

      // Override handling
      if (options.overrideColumn) {
        const result = options.overrideColumn(table, column, joins, createLabel(column))
        if (result) {
          return result
        }
      }

      if (column.type === "id") {
        // Use id if that option is enabled
        if (options.useJoinIds) {
          return [
            {
              expr: { type: "scalar", table, joins: [column.id], expr: { type: "id", table: column.idTable } },
              label: createLabel(column),
              joins
            }
          ]
        } else {
          // Use label, code, full name, or name of dest table
          const destTable = this.schema.getTable(column.idTable!)
          if (destTable) {
            const label = destTable.label
            if (label && typeof label == "string") {
              joinColumn = this.schema.getColumn(column.idTable!, label)  
            }
            joinColumn = joinColumn || this.schema.getColumn(column.idTable!, "code")
            joinColumn = joinColumn || this.schema.getColumn(column.idTable!, "full_name")
            joinColumn = joinColumn || this.schema.getColumn(column.idTable!, "name")
            joinColumn = joinColumn || this.schema.getColumn(column.idTable!, "username")
            if (joinColumn) {
              return [
                {
                  expr: {
                    type: "scalar",
                    table,
                    joins: [column.id],
                    expr: { type: "field", table: column.idTable, column: joinColumn.id }
                  },
                  label: createLabel(column),
                  joins
                }
              ]
            } else {
              return []
            }
          }
        }
      }

      if (column.type === "join") {
        // If n-1, 1-1 join, create scalar
        if (["n-1", "1-1"].includes(column.join!.type)) {
          // Use id if that option is enabled
          if (options.useJoinIds) {
            return [
              {
                expr: { type: "scalar", table, joins: [column.id], expr: { type: "id", table: column.join!.toTable } },
                label: createLabel(column),
                joins
              }
            ]
            // Support cascading ref question
          } else if (column.join!.type === "n-1" && column.join!.toTable.match(/^custom./)) {
            return this.schema
              .getColumns(column.join!.toTable)
              .filter((c: any) => c.id[0] !== "_")
              .map((c: any) => ({
                expr: {
                  type: "scalar",
                  table,
                  joins: [column.id],
                  expr: { type: "field", table: column.join!.toTable, column: c.id }
                },

                label: `${createLabel(column)} > ${createLabel(c)}`,
                joins
              }))
          } else {
            // use code, full name, or name of dest table
            joinColumn = this.schema.getColumn(column.join!.toTable, "code")
            joinColumn = joinColumn || this.schema.getColumn(column.join!.toTable, "full_name")
            joinColumn = joinColumn || this.schema.getColumn(column.join!.toTable, "name")
            joinColumn = joinColumn || this.schema.getColumn(column.join!.toTable, "username")
            if (joinColumn) {
              return [
                {
                  expr: {
                    type: "scalar",
                    table,
                    joins: [column.id],
                    expr: { type: "field", table: column.join!.toTable, column: joinColumn.id }
                  },
                  label: createLabel(column),
                  joins
                }
              ]
            } else {
              return []
            }
          }
        }

        // If 1-n/n-1, convert each child
        if (
          ["1-n", "n-n"].includes(column.join!.type) &&
          options.multipleJoinCondition &&
          options.multipleJoinCondition(table, column)
        ) {
          let childExprs: any = []

          for (let childColumn of this.schema.getColumns(column.join!.toTable)) {
            childExprs = childExprs.concat(convertColumn(column.join!.toTable, childColumn, joins.concat([column.id])))
          }

          return childExprs
        }
      } else if (column.type === "geometry" && options.splitLatLng) {
        // Use lat/lng
        return [
          {
            expr: { table, type: "op", op: "latitude", exprs: [{ type: "field", table, column: column.id }] },
            label: createLabel(column, "latitude"),
            joins
          },
          {
            expr: { table, type: "op", op: "longitude", exprs: [{ type: "field", table, column: column.id }] },
            label: createLabel(column, "longitude"),
            joins
          }
        ]
      } else if (column.type === "enumset" && options.splitEnumset) {
        // Split into one for each enumset value
        return _.map(column.enumValues!, (ev) => {
          return {
            expr: {
              table,
              type: "op",
              op: "contains",
              exprs: [
                { type: "field", table, column: column.id },
                { type: "literal", valueType: "enumset", value: [ev.id] }
              ]
            },
            label: createLabel(column, options.enumFormat === "name" ? ev.name : ev.code || ev.name),
            joins
          }
        })
      } else {
        // Simple columns
        return [{ expr: { type: "field", table, column: column.id }, label: createLabel(column), joins }]
      }
    }

    // For each column in form
    let labeledExprs: LabeledExpr[] = []
    for (let column of this.schema.getColumns(table)) {
      // Convert column into labels and exprs
      labeledExprs = labeledExprs.concat(convertColumn(table, column, []))
    }

    // If numberDuplicatesLabels, label distinctly
    if (options.numberDuplicatesLabels) {
      const labelGroups = _.groupBy(labeledExprs, "label")
      for (let key in labelGroups) {
        const group = labelGroups[key]
        if (group.length > 1) {
          for (let i = 0; i < group.length; i++) {
            const item = group[i]
            item.label = item.label + ` (${i + 1})`
          }
        }
      }
    }

    return _.compact(labeledExprs)
  }
}
