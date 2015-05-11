assert = require('chai').assert
fixtures = require './fixtures'

DesignCompiler = require '../src/DesignCompiler'

describe "DesignCompiler", ->
  before ->
    @dc = new DesignCompiler(fixtures.simpleSchema())

  it "compiles field", ->
    jql = @dc.compileExpr(expr: { type: "field", tableId: "t1", columnId: "integer" }, baseTableId: "t1", baseTableAlias: "T1")
    assert _.isEqual jql, {
      type: "field"
      tableAlias: "T1"
      column: "integer"
    }

  it "checks baseTable of field", ->
    assert.throws () =>
      @dc.compileExpr(expr: { type: "field", tableId: "t1", columnId: "integer" }, baseTableId: "t2", baseTableAlias: "T2")

  it "compiles scalar with no joins, simplifying", ->
    expr = { type: "scalar", expr: { type: "field", tableId: "t1", columnId: "integer" }, joinIds: [] }
    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

    assert _.isEqual(jql, { type: "field", tableAlias: "T1", column: "integer" }), JSON.stringify(jql, null, 2)

  it "compiles scalar with one join", ->
    expr = { type: "scalar", expr: { type: "field", tableId: "t2", columnId: "integer" }, joinIds: ["1-2"] }
    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

    assert _.isEqual(jql, {
      type: "scalar"
      expr: { type: "field", tableAlias: "j1", column: "integer" }
      from: { type: "table", table: "t2", alias: "j1" }
      where: { type: "op", op: "=", exprs: [
        { type: "field", tableAlias: "j1", column: "t1" }
        { type: "field", tableAlias: "T1", column: "primary" }
        ]}
    }), JSON.stringify(jql, null, 2)

  it "compiles scalar with one join and sql aggr", ->
    expr = { type: "scalar", expr: { type: "field", tableId: "t2", columnId: "integer" }, joinIds: ["1-2"], aggrId: "count" }
    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

    assert _.isEqual(jql, {
      type: "scalar"
      expr: { type: "op", op: "count", exprs: [{ type: "field", tableAlias: "j1", column: "integer" }] }
      from: { type: "table", table: "t2", alias: "j1" }
      where: { type: "op", op: "=", exprs: [
        { type: "field", tableAlias: "j1", column: "t1" }
        { type: "field", tableAlias: "T1", column: "primary" }
        ]}
    }), JSON.stringify(jql, null, 2)

  it "compiles scalar with one join and latest aggr", ->
    expr = { type: "scalar", expr: { type: "field", tableId: "t2", columnId: "integer" }, joinIds: ["1-2"], aggrId: "latest" }
    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

    refJql = {
      type: "scalar"
      expr: { type: "field", tableAlias: "j1", column: "integer" }
      from: { type: "table", table: "t2", alias: "j1" }
      where: { type: "op", op: "=", exprs: [
        { type: "field", tableAlias: "j1", column: "t1" }
        { type: "field", tableAlias: "T1", column: "primary" }
        ]}
      orderBy: [{ expr: { type: "field", tableAlias: "j1", column: "integer" }, direction: "desc" }]
      limit: 1
    }

    assert _.isEqual(jql, refJql), "\n" + JSON.stringify(jql) + "\n" + JSON.stringify(refJql)

  it "compiles scalar with two joins", -> 
    expr = { type: "scalar", expr: { type: "field", tableId: "t1", columnId: "integer" }, joinIds: ["1-2", "2-1"], aggrId: "count" }
    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

    assert _.isEqual(jql, {
      type: "scalar"
      expr: { type: "op", op: "count", exprs: [{ type: "field", tableAlias: "j2", column: "integer" }] }
      from: { 
        type: "join" 
        left: { type: "table", table: "t2", alias: "j1" }
        right: { type: "table", table: "t1", alias: "j2" }
        kind: "left"
        on: { type: "op", op: "=", exprs: [
          { type: "field", tableAlias: "j1", column: "t1" }
          { type: "field", tableAlias: "j2", column: "primary" }
          ]}
        } 
      where: { type: "op", op: "=", exprs: [
        { type: "field", tableAlias: "j1", column: "t1" }
        { type: "field", tableAlias: "T1", column: "primary" }
        ]}
    }), JSON.stringify(jql, null, 2)

  it "compiles scalar with one join and where", ->
    where = {
      "type": "logical",
      "op": "and",
      "exprs": [
        {
          "type": "comparison",
          "lhs": {
            "type": "scalar",
            "baseTableId": "t2",
            "expr": {
              "type": "field",
              "tableId": "t2",
              "columnId": "decimal"
            },
            "joinIds": []
          },
          "op": "=",
          "rhs": {
            "type": "decimal",
            "value": 3
          }
        }
      ]
    }

    expr = { 
      type: "scalar", 
      expr: { type: "field", tableId: "t2", columnId: "integer" }, 
      joinIds: ["1-2"], 
      where: where
    }
    jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

    assert _.isEqual(jql, {
      type: "scalar"
      expr: { type: "field", tableAlias: "j1", column: "integer" }
      from: { type: "table", table: "t2", alias: "j1" }
      where: {
        type: "op"
        op: "and"
        exprs: [
          { type: "op", op: "=", exprs: [
            { type: "field", tableAlias: "j1", column: "t1" }
            { type: "field", tableAlias: "T1", column: "primary" }
            ]
          }
          {
            type: "op", op: "=", exprs: [
              { type: "field", tableAlias: "j1", column: "decimal" }
              { type: "literal", value: 3 }
            ]
          }
        ]
      }
    }), JSON.stringify(jql, null, 2)

  it "compiles literals", ->
    assert.deepEqual @dc.compileExpr(expr: { type: "text", value: "abc" }), { type: "literal", value: "abc" }
    assert.deepEqual @dc.compileExpr(expr: { type: "integer", value: 123 }), { type: "literal", value: 123 }
    assert.deepEqual @dc.compileExpr(expr: { type: "decimal", value: 123.4 }), { type: "literal", value: 123.4 }
    assert.deepEqual @dc.compileExpr(expr: { type: "enum", value: "id1" }), { type: "literal", value: "id1" }
    assert.deepEqual @dc.compileExpr(expr: { type: "boolean", value: true }), { type: "literal", value: true }

  describe "comparisons", ->
    it "compiles =", ->
      expr = { 
        type: "comparison"
        op: "="
        lhs: { type: "field", tableId: "t1", columnId: "integer" }
        rhs: { type: "integer", value: 3 }
      }

      jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

      assert _.isEqual(jql, {
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "T1", column: "integer" }
          { type: "literal", value: 3 }
        ]
        }), JSON.stringify(jql, null, 2)
    
    it "compiles = true", ->
      expr = { type: "comparison", op: "= true", lhs: { type: "field", tableId: "t1", columnId: "integer" } }

      jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

      assert _.isEqual(jql, {
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "T1", column: "integer" }
          { type: "literal", value: true }
        ]
        }), JSON.stringify(jql, null, 2)

  describe "logicals", ->
    it "simplifies logical", ->
      expr1 = { type: "comparison", op: "= true", lhs: { type: "field", tableId: "t1", columnId: "integer" } }

      expr = { type: "logical", op: "and", exprs: [expr1] }

      jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

      assert _.isEqual(jql, 
        {
          type: "op"
          op: "="
          exprs: [
            { type: "field", tableAlias: "T1", column: "integer" }
            { type: "literal", value: true }
          ]
        }
      ), JSON.stringify(jql, null, 2)

    it "compiles logical", ->
      expr1 = { type: "comparison", op: "= true", lhs: { type: "field", tableId: "t1", columnId: "integer" } }

      expr2 = { type: "comparison", op: "= false", lhs: { type: "field", tableId: "t1", columnId: "decimal" } }

      expr = { type: "logical", op: "and", exprs: [expr1, expr2] }
      jql = @dc.compileExpr(expr: expr, baseTableId: "t1", baseTableAlias: "T1")

      assert _.isEqual(jql, 
        { type: "op", op: "and", exprs: [
          {
            type: "op"
            op: "="
            exprs: [
              { type: "field", tableAlias: "T1", column: "integer" }
              { type: "literal", value: true }
            ]
          },
          {
            type: "op"
            op: "="
            exprs: [
              { type: "field", tableAlias: "T1", column: "decimal" }
              { type: "literal", value: false }
            ]
          }
        ]}
      ), JSON.stringify(jql, null, 2)

