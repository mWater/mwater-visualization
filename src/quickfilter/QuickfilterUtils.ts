import _ from 'lodash'
import { ExprCompiler, ExprUtils, injectTableAlias, DataSource, Expr, Schema, FieldExpr, OpExpr } from 'mwater-expressions'
import { JsonQLFilter } from '..'
import { JsonQLQuery } from 'jsonql'

/** Perform query to find quickfilter values for text and text[] expressions
 * text[] expressions are tricky as they need a special query
 * In order to filter the text[] queries, filters must use table "value" and filter on no column
 */
export function findExprValues(
    expr: Expr, 
    schema: Schema, 
    dataSource: DataSource, 
    filters: JsonQLFilter[] | undefined, 
    offset: number | undefined, 
    limit: number | undefined, 
    callback: (err: any, values?: string[]) => void) {

  const exprCompiler = new ExprCompiler(schema)
  const exprUtils = new ExprUtils(schema)

  // Get type of expression
  const exprType = exprUtils.getExprType(expr)

  // Table
  const table = (expr as FieldExpr).table

  let query: JsonQLQuery

  if (exprType == "text") {
    // select distinct <compiled expr> as value from <table> where <filters> order by 1 offset limit 
    query = {
      type: "query",
      distinct: true,
      selects: [
        { type: "select", expr: exprCompiler.compileExpr({ expr, tableAlias: "main" }), alias: "value" }
      ],
      from: exprCompiler.compileTable(table, "main"),
      where: {
        type: "op",
        op: "and",
        exprs: []
      },
      orderBy: [{ ordinal: 1, direction: "asc" }],
      limit: limit,
      offset: offset
    }

    // Add filters if present
    for (const filter of (filters || [])) {
      if (filter.table == table) {
        // TODO Type this properly
        (query.where as any).exprs.push(injectTableAlias(filter.jsonql, "main"))
      }
    }
  }
  else if (exprType == "text[]") {
    // select distinct value from 
    // <table> as main cross join jsonb_array_elements_text(<compiled expr>) as value
    // where value like 'abc%' 
    // order by 1
    query = {
      type: "query",
      distinct: true,
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "value" }, alias: "value" }
      ],
      from: {
        type: "join",
        kind: "cross",
        left: exprCompiler.compileTable(table, "main"),
        right: {
          type: "subexpr",
          expr: { type: "op", op: "jsonb_array_elements_text", exprs: [
            { type: "op", op: "to_jsonb", exprs: [exprCompiler.compileExpr({ expr, tableAlias: "main" })] }
          ]},
          alias: "value"
        }
      },        
      where: {
        type: "op",
        op: "and",
        exprs: []
      },
      orderBy: [{ ordinal: 1, direction: "asc" }],
      limit: limit,
      offset: offset
    }

    // Add filters if present. Value filters must be for pseudo-table "_values_" on column "value"
    for (const filter of (filters || [])) {
      if (filter.table == table) {
        // TODO Type this properly
        (query.where as any).exprs.push(injectTableAlias(filter.jsonql, "main"))
      }
      if (filter.table == "value") {
        // TODO Type this properly
        (query.where as any).exprs.push(injectTableAlias(filter.jsonql, "value"))
      }
    }
  }
  else {
    return callback(new Error(`Filter type ${exprType} not supported`))
  }

  // Execute query
  dataSource.performQuery(query, (err, rows) => {
    if (err) {
      callback(err)
      return 
    }

    // Filter null and blank
    rows = _.filter(rows, (row) => row.value)

    callback(null, _.pluck(rows, "value"))
  })
}