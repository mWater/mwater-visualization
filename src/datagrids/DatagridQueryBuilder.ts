import _ from "lodash"
import { ExprCompiler } from "mwater-expressions"
import { ExprCleaner } from "mwater-expressions"
import { ExprUtils } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"

// Builds a datagrid query.
// columns are named c0, c1, c2...
// primary key is included as id
// subtable index is included as subtable. -1 for main table so it sorts first
// Warning: mwater-server requires this directly!
export default class DatagridQueryBuilder {
  constructor(schema: any) {
    this.schema = schema
  }

  // Create the query for the design
  // options:
  //  offset: start at row offset
  //  limit: limit rows
  //  extraFilters: array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
  //  fillSubtableRows: repeat main level values in subtable rows instead of leaving blank
  createQuery(design: any, options = {}) {
    // Create query to get the page of rows at the specific offset
    // Handle simple case
    if (!design.subtables || design.subtables.length === 0) {
      return this.createSimpleQuery(design, options)
    } else {
      return this.createComplexQuery(design, options)
    }
  }

  // Simple query with no subtables
  createSimpleQuery(design: any, options: any) {
    let column, expr, i
    const exprUtils = new ExprUtils(this.schema)
    const exprCompiler = new ExprCompiler(this.schema)
    const exprCleaner = new ExprCleaner(this.schema)

    const isAggr = this.isMainAggr(design)

    const query = {
      type: "query",
      selects: this.createSimpleSelects(design, isAggr),
      from: { type: "table", table: design.table, alias: "main" },
      orderBy: [],
      offset: options.offset,
      limit: options.limit
    }

    // Filter by filter
    let wheres = []
    if (design.filter) {
      expr = exprCleaner.cleanExpr(design.filter, { table: design.table })
      wheres.push(exprCompiler.compileExpr({ expr, tableAlias: "main" }))
    }

    // Add global filters
    for (let filter of design.globalFilters || []) {
      // Check if exists and is correct type
      column = this.schema.getColumn(design.table, filter.columnId)
      if (!column) {
        continue
      }

      const columnExpr = { type: "field", table: design.table, column: column.id }
      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue
      }

      // Create expr
      expr = { type: "op", op: filter.op, table: design.table, exprs: [columnExpr].concat(filter.exprs) }

      // Clean expr
      expr = exprCleaner.cleanExpr(expr, { table: design.table })

      wheres.push(exprCompiler.compileExpr({ expr, tableAlias: "main" }))
    }

    // Add extra filters
    for (let extraFilter of options.extraFilters || []) {
      if (extraFilter.table === design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))
      }
    }

    wheres = _.compact(wheres)

    if (wheres.length === 1) {
      query.where = wheres[0]
    } else if (wheres.length > 1) {
      query.where = { type: "op", op: "and", exprs: wheres }
    }

    // Add order of main
    const iterable = this.getMainOrderByDirections(design, isAggr)
    for (i = 0; i < iterable.length; i++) {
      // Leave room for primary key (if not aggr) and columns
      const direction = iterable[i]
      query.orderBy.push({ ordinal: i + (isAggr ? 1 : 2) + design.columns.length, direction })
    }

    // Add group bys if any expressions are individual and overall is aggregate
    if (isAggr) {
      query.groupBy = []

      for (i = 0; i < design.columns.length; i++) {
        column = design.columns[i]
        if (exprUtils.getExprAggrStatus(column.expr) === "individual") {
          query.groupBy.push(i + 1)
        }
      }

      const iterable1 = design.orderBys || []
      for (i = 0; i < iterable1.length; i++) {
        const orderBy = iterable1[i]
        if (exprUtils.getExprAggrStatus(orderBy.expr) === "individual") {
          query.groupBy.push(i + 1 + design.columns.length)
        }
      }
    }

    return query
  }

  // Query with subtables
  createComplexQuery(design: any, options: any) {
    // Queries to union
    let column, direction, i, index, subtable
    const unionQueries = []

    // Create main query
    unionQueries.push(this.createComplexMainQuery(design, options))

    for (index = 0; index < design.subtables.length; index++) {
      subtable = design.subtables[index]
      unionQueries.push(this.createComplexSubtableQuery(design, options, subtable, index))
    }

    // Union together
    const unionQuery = {
      type: "union all",
      queries: unionQueries
    }

    // Create wrapper query that orders
    const query = {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "id" }, alias: "id" },
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "subtable" }, alias: "subtable" }
      ],
      from: { type: "subquery", query: unionQuery, alias: "unioned" },
      orderBy: [],
      offset: options.offset,
      limit: options.limit
    }

    // Add column references
    for (index = 0; index < design.columns.length; index++) {
      column = design.columns[index]
      query.selects.push({
        type: "select",
        expr: { type: "field", tableAlias: "unioned", column: `c${index}` },
        alias: `c${index}`
      })
    }

    // Add order of main
    const iterable = this.getMainOrderByDirections(design)
    for (i = 0; i < iterable.length; i++) {
      direction = iterable[i]
      query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: `s${i}` }, direction })
    }

    // Add subtable order
    query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: "subtable" }, direction: "asc" })

    // Add orders of subtables
    for (let stindex = 0; stindex < design.subtables.length; stindex++) {
      subtable = design.subtables[stindex]
      const iterable1 = this.getSubtableOrderByDirections(design, subtable)
      for (i = 0; i < iterable1.length; i++) {
        direction = iterable1[i]
        query.orderBy.push({ expr: { type: "field", tableAlias: "unioned", column: `st${stindex}s${i}` }, direction })
      }
    }

    return query
  }

  // Create the main query (not joined to subtables) part of the overall complex query. See tests for more details
  createComplexMainQuery(design: any, options: any) {
    let expr, i, type
    const exprCompiler = new ExprCompiler(this.schema)
    const exprCleaner = new ExprCleaner(this.schema)

    // Create selects
    let selects = [
      // Primary key
      {
        type: "select",
        expr: { type: "field", tableAlias: "main", column: this.schema.getTable(design.table).primaryKey },
        alias: "id"
      },
      { type: "select", expr: -1, alias: "subtable" }
    ]

    // Add order bys of main
    const iterable = this.getMainOrderByExprs(design)
    for (i = 0; i < iterable.length; i++) {
      expr = iterable[i]
      selects.push({ type: "select", expr, alias: `s${i}` })
    }

    // Add order bys of subtables
    for (let stindex = 0; stindex < design.subtables.length; stindex++) {
      const subtable = design.subtables[stindex]
      const iterable1 = this.getSubtableOrderByExprTypes(design, subtable)
      for (i = 0; i < iterable1.length; i++) {
        type = iterable1[i]
        selects.push({ type: "select", expr: this.createNullExpr(type), alias: `st${stindex}s${i}` })
      }
    }

    // Add columns
    selects = selects.concat(
      _.map(design.columns, (column, columnIndex) => this.createColumnSelect(column, columnIndex))
    )

    const query = {
      type: "query",
      selects,
      from: { type: "table", table: design.table, alias: "main" }
    }

    // Filter by filter
    let wheres = []
    if (design.filter) {
      wheres.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }))
    }

    // Add global filters
    for (let filter of design.globalFilters || []) {
      // Check if exists and is correct type
      const column = this.schema.getColumn(design.table, filter.columnId)
      if (!column) {
        continue
      }

      const columnExpr = { type: "field", table: design.table, column: column.id }
      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue
      }

      // Create expr
      expr = { type: "op", op: filter.op, table: design.table, exprs: [columnExpr].concat(filter.exprs) }

      // Clean expr
      expr = exprCleaner.cleanExpr(expr, { table: design.table })
      wheres.push(exprCompiler.compileExpr({ expr, tableAlias: "main" }))
    }

    // Add extra filters
    for (let extraFilter of options.extraFilters || []) {
      if (extraFilter.table === design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))
      }
    }

    wheres = _.compact(wheres)

    if (wheres.length === 1) {
      query.where = wheres[0]
    } else if (wheres.length > 1) {
      query.where = { type: "op", op: "and", exprs: wheres }
    }

    return query
  }

  // Create one subtable query part of the overall complex query. See tests for more details
  createComplexSubtableQuery(design: any, options: any, subtable: any, subtableIndex: any) {
    let expr, i
    const exprUtils = new ExprUtils(this.schema)
    const exprCompiler = new ExprCompiler(this.schema)
    const exprCleaner = new ExprCleaner(this.schema)

    // Create selects
    let selects = [
      // Primary key
      {
        type: "select",
        expr: { type: "field", tableAlias: "main", column: this.schema.getTable(design.table).primaryKey },
        alias: "id"
      },
      { type: "select", expr: subtableIndex, alias: "subtable" }
    ]

    // Add order bys of main
    const iterable = this.getMainOrderByExprs(design)
    for (i = 0; i < iterable.length; i++) {
      expr = iterable[i]
      selects.push({ type: "select", expr, alias: `s${i}` })
    }

    // Add order bys of subtables
    for (let stindex = 0; stindex < design.subtables.length; stindex++) {
      const st = design.subtables[stindex]
      const iterable1 = this.getSubtableOrderByExprs(design, st)
      for (i = 0; i < iterable1.length; i++) {
        expr = iterable1[i]
        if (stindex === subtableIndex) {
          selects.push({ type: "select", expr, alias: `st${stindex}s${i}` })
        } else {
          // Null placeholder
          const types = this.getSubtableOrderByExprTypes(design, st)
          selects.push({ type: "select", expr: this.createNullExpr(types[i]), alias: `st${stindex}s${i}` })
        }
      }
    }

    // Add columns
    selects = selects.concat(
      _.map(design.columns, (column, columnIndex) =>
        this.createColumnSelect(column, columnIndex, subtable, options.fillSubtableRows)
      )
    )

    // Get subtable actual table
    const subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    // Can't handle multiple joins yet
    if (subtable.joins.length > 1) {
      throw new Error("Multiple subtable joins not implemented")
    }

    const query = {
      type: "query",
      selects,
      from: {
        type: "join",
        kind: "inner",
        left: { type: "table", table: design.table, alias: "main" },
        right: { type: "table", table: subtableTable, alias: "st" },
        on: exprCompiler.compileJoin(design.table, this.schema.getColumn(design.table, subtable.joins[0]), "main", "st")
      }
    }

    // Filter by filter
    let wheres = []
    if (design.filter) {
      expr = exprCleaner.cleanExpr(design.filter, { table: design.table })
      wheres.push(exprCompiler.compileExpr({ expr, tableAlias: "main" }))
    }

    // Add extra filters
    for (let extraFilter of options.extraFilters || []) {
      if (extraFilter.table === design.table) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "main"))
      }
      if (extraFilter.table === subtableTable) {
        wheres.push(injectTableAlias(extraFilter.jsonql, "st"))
      }
    }

    wheres = _.compact(wheres)

    if (wheres.length === 1) {
      query.where = wheres[0]
    } else if (wheres.length > 1) {
      query.where = { type: "op", op: "and", exprs: wheres }
    }

    return query
  }

  // Get expressions to order main query by
  // isAggr is true if any column or ordering is aggregate.
  // If so, only use explicit ordering
  getMainOrderByExprs(design: any, isAggr = false) {
    const exprCompiler = new ExprCompiler(this.schema)
    const exprCleaner = new ExprCleaner(this.schema)

    const exprs = []

    // First explicit order bys
    for (let orderBy of design.orderBys || []) {
      // Clean first
      const orderByExpr = exprCleaner.cleanExpr(orderBy.expr, { table: design.table })
      exprs.push(exprCompiler.compileExpr({ expr: orderByExpr, tableAlias: "main" }))
    }

    if (!isAggr) {
      // Natural order if present
      const { ordering } = this.schema.getTable(design.table)
      if (ordering) {
        exprs.push(
          exprCompiler.compileExpr({
            expr: { type: "field", table: design.table, column: ordering },
            tableAlias: "main"
          })
        )
      }

      // Always primary key
      exprs.push({ type: "field", tableAlias: "main", column: this.schema.getTable(design.table).primaryKey })
    }

    return exprs
  }

  // Get directions to order main query by (asc/desc)
  // isAggr is true if any column or ordering is aggregate.
  // If so, only use explicit ordering
  getMainOrderByDirections(design: any, isAggr = false) {
    const directions = []

    // First explicit order bys
    for (let orderBy of design.orderBys || []) {
      directions.push(orderBy.direction)
    }

    if (!isAggr) {
      // Natural order if present
      const { ordering } = this.schema.getTable(design.table)
      if (ordering) {
        directions.push("asc")
      }

      // Always primary key
      directions.push("asc")
    }

    return directions
  }

  // Get expressions to order subtable query by
  getSubtableOrderByExprs(design: any, subtable: any) {
    let expr
    const exprUtils = new ExprUtils(this.schema)
    const exprCompiler = new ExprCompiler(this.schema)
    const exprCleaner = new ExprCleaner(this.schema)

    // Get subtable actual table
    const subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    const exprs = []

    // First explicit order bys
    for (let orderBy of subtable.orderBys || []) {
      expr = exprCleaner.cleanExpr(orderBy.expr, { table: subtableTable })
      exprs.push(exprCompiler.compileExpr({ expr, tableAlias: "st" }))
    }

    // Natural order if present
    const { ordering } = this.schema.getTable(subtableTable)
    if (ordering) {
      exprs.push(
        exprCompiler.compileExpr({ expr: { type: "field", table: subtableTable, column: ordering }, tableAlias: "st" })
      )
    }

    // Always primary key
    exprs.push({ type: "field", tableAlias: "st", column: this.schema.getTable(subtableTable).primaryKey })
    return exprs
  }

  // Get directions to order subtable query by (asc/desc)
  getSubtableOrderByDirections(design: any, subtable: any) {
    const exprUtils = new ExprUtils(this.schema)

    // Get subtable actual table
    const subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    const directions = []

    // First explicit order bys
    for (let orderBy of subtable.orderBys || []) {
      directions.push(orderBy.direction)
    }

    // Natural order if present
    const { ordering } = this.schema.getTable(subtableTable)
    if (ordering) {
      directions.push("asc")
    }

    // Always primary key
    directions.push("asc")
    return directions
  }

  // Get types of expressions to order subtable query by.
  getSubtableOrderByExprTypes(design: any, subtable: any) {
    const exprUtils = new ExprUtils(this.schema)

    // Get subtable actual table
    const subtableTable = exprUtils.followJoins(design.table, subtable.joins)

    const types = []

    // First explicit order bys
    for (let orderBy of subtable.orderBys || []) {
      types.push(exprUtils.getExprType(orderBy.expr))
    }

    // Natural order if present
    const { ordering } = this.schema.getTable(subtableTable)
    if (ordering) {
      types.push(exprUtils.getExprType({ type: "field", table: subtableTable, column: ordering }))
    }

    // Always primary key. Assume text
    types.push("text")

    return types
  }

  // Create the select for a column in JsonQL format
  createColumnSelect(column: any, columnIndex: any, subtable: any, fillSubtableRows: any) {
    const exprUtils = new ExprUtils(this.schema)
    const exprCleaner = new ExprCleaner(this.schema)

    // Get expression type
    const exprType = exprUtils.getExprType(column.expr)

    // Null if wrong subtable
    if (column.subtable && !subtable) {
      return { type: "select", expr: this.createNullExpr(exprType), alias: `c${columnIndex}` }
    }

    // Null if from wrong subtable
    if (column.subtable && subtable) {
      if (subtable.id !== column.subtable) {
        return { type: "select", expr: this.createNullExpr(exprType), alias: `c${columnIndex}` }
      }
    }

    // Null if main column and in subtable and not fillSubtableRows
    if (!column.subtable && subtable && !fillSubtableRows) {
      return { type: "select", expr: this.createNullExpr(exprType), alias: `c${columnIndex}` }
    }

    // Compile expression
    const exprCompiler = new ExprCompiler(this.schema)
    let compiledExpr = exprCompiler.compileExpr({
      expr: exprCleaner.cleanExpr(column.expr, { aggrStatuses: ["individual", "literal", "aggregate"] }),
      tableAlias: column.subtable ? "st" : "main"
    })

    // Handle special case of geometry, converting to GeoJSON
    if (exprType === "geometry") {
      // Convert to 4326 (lat/long). Force ::geometry for null
      compiledExpr = {
        type: "op",
        op: "ST_AsGeoJSON",
        exprs: [
          { type: "op", op: "ST_Transform", exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr] }, 4326] }
        ]
      }
    }

    return { type: "select", expr: compiledExpr, alias: `c${columnIndex}` }
  }

  // Create selects to load given a design
  createSimpleSelects(design: any, isAggr: any) {
    let selects = []

    // Primary key if not aggr
    if (!isAggr) {
      selects.push({
        type: "select",
        expr: { type: "field", tableAlias: "main", column: this.schema.getTable(design.table).primaryKey },
        alias: "id"
      })
    }

    selects = selects.concat(
      _.map(design.columns, (column, columnIndex) => this.createColumnSelect(column, columnIndex))
    )

    // Add sorting
    const iterable = this.getMainOrderByExprs(design, isAggr)
    for (let i = 0; i < iterable.length; i++) {
      const expr = iterable[i]
      selects.push({ type: "select", expr, alias: `s${i}` })
    }

    return selects
  }

  // Create a null expression, but cast to correct type. See https://github.com/mWater/mwater-visualization/issues/183
  createNullExpr(exprType: any) {
    switch (exprType) {
      // Geometry is as textual geojson
      case "text":
      case "enum":
      case "geometry":
      case "id":
      case "date":
      case "datetime":
        return { type: "op", op: "::text", exprs: [null] }
      case "boolean":
        return { type: "op", op: "::boolean", exprs: [null] }
      case "number":
        return { type: "op", op: "::decimal", exprs: [null] }
      case "enumset":
      case "text[]":
      case "image":
      case "imagelist":
        return { type: "op", op: "::jsonb", exprs: [null] }
      default:
        return null
    }
  }

  // Determine if main is aggregate
  isMainAggr(design: any) {
    const exprUtils = new ExprUtils(this.schema)

    for (let column of design.columns) {
      if (exprUtils.getExprAggrStatus(column.expr) === "aggregate") {
        return true
      }
    }

    for (let orderBy of design.orderBys || []) {
      if (exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate") {
        return true
      }
    }

    return false
  }
}
