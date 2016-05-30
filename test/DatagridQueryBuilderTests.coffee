_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
DatagridQueryBuilder = require '../src/datagrids/DatagridQueryBuilder'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "DatagridQueryBuilder", ->
  before ->
    @schema = fixtures.simpleSchema()
    @qb = new DatagridQueryBuilder(@schema)

    # @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    # @exprDate = { type: "field", table: "t1", column: "date" }
    # @exprEnum = { type: "field", table: "t1", column: "enum" }
    # @exprInvalid = { type: "field", table: "t1", column: "NONSUCH" }


  it "creates simple query", ->
    design = {
      table: "t1"
      columns: [{
        id: "cid1"
        type: "expr"
        expr: @exprText
      }]
    }

    jsonql = @qb.createQuery(design, null, null)
    compare jsonql, {
      type: "query"
      selects: [
        # Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" }
        # Includes -1 subtable
        { type: "select", expr: -1, alias: "subtable" }
        # Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
      ]
      from: { type: "table", table: "t1", alias: "main" }
      orderBy: [
        # Orders by primary key for consistency
        { expr: { type: "field", tableAlias: "main", column: "primary" }, direction: "asc" }
      ]
      limit: null
      offset: null
    }

  it "adds subtable", ->
    design = {
      table: "t1"
      subtables: [
        { id: "st1", joins: ["1-2"] }
      ]
      columns: [
        {
          id: "cid1"
          type: "expr"
          expr: @exprText
        }
        {
          id: "cid2"
          type: "expr"
          subtable: "st1"
          expr: { type: "field", table: "t1", column: "number" }
        }
      ]
    }

    jsonql = @qb.createQuery(design, null, null)

    # Should union all main query and then inner join query. Sorts by main sorts, then subtable id, then subtable sorts
    ###
    select unioned.id as id, unioned.subtable as subtable, unioned.c0 as c0, unioned.c1 as c1
    from
    (
      (
        select main.primary as id, -1 as subtable, main.primary as s0, null as st0s0, null as st0s1,
          main.text as c0, null as c1
        from t1 as main
      )
      union all
      (
        select main.primary as id, 0 as subtable, main.primary as s0, st.number as st0s0, st.primary as st0s1,
          main.text as c0, st.number as c1
        from t1 as main inner join t2 as st on st.t1 = main.primary
      )
    ) as unioned
    order by unioned.s0 asc, unioned.subtable asc, unioned.st0s0 asc, unioned.st0s1 asc
    ###

    innermain = {
      type: "query"
      selects: [
        # Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" }
        # Includes -1 subtable
        { type: "select", expr: -1, alias: "subtable" }
        # Includes sorts
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s0" }
        { type: "select", expr: null, alias: "st0s0" }
        { type: "select", expr: null, alias: "st0s1" }
        # Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
        # Includes subtable column
        { type: "select", expr: null, alias: "c1" }
      ]
      from: { type: "table", table: "t1", alias: "main" }
    }

    innerst = {
      type: "query"
      selects: [
        # Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" }
        # Includes -1 subtable
        { type: "select", expr: 0, alias: "subtable" }
        # Includes sorts
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s0" }
        { type: "select", expr: { type: "field", tableAlias: "st", column: "number" }, alias: "st0s0" }
        { type: "select", expr: { type: "field", tableAlias: "st", column: "primary" }, alias: "st0s1" }
        # Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" }
        # Includes subtable column
        { type: "select", expr: { type: "field", tableAlias: "st", column: "number" }, alias: "c1" }
      ]
      from: {
        type: "join"
        kind: "inner"
        left: { type: "table", table: "t1", alias: "main" }
        right: { type: "table", table: "t2", alias: "st" }
        on: {
          type: "op"
          op: "="
          exprs: [{ type: "field", tableAlias: "st", column: "t1" }, { type: "field", tableAlias: "main", column: "primary" }]
        }
      }
    }

    unioned = {
      type: "union all"
      queries: [innermain, innerst]
    }

    # Now take the columns and do the sorting
    compare jsonql, {
      type: "query"
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "id" }, alias: "id" }
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "subtable" }, alias: "subtable" }
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "c0" }, alias: "c0" }
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "c1" }, alias: "c1" }
      ]
      from: {
        type: "subquery"
        query: unioned
        alias: "unioned"
      }
      # Orders all sorts, first outer, then subtable, then the subtable sorts
      orderBy: [
        { expr: { type: "field", tableAlias: "unioned", column: "s0" }, direction: "asc" }
        { expr: { type: "field", tableAlias: "unioned", column: "subtable" }, direction: "asc" }
        { expr: { type: "field", tableAlias: "unioned", column: "st0s0" }, direction: "asc" }
        { expr: { type: "field", tableAlias: "unioned", column: "st0s1" }, direction: "asc" }
      ]
      limit: null
      offset: null
    }