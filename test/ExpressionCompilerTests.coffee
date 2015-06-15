assert = require('chai').assert
fixtures = require './fixtures'

ExpressionCompiler = require '../src/ExpressionCompiler'

describe "ExpressionCompiler", ->
  before ->
    @ec = new ExpressionCompiler(fixtures.simpleSchema())

  it "compiles field", ->
    jql = @ec.compileExpr(expr: { type: "field", table: "t1", column: "integer" }, tableAlias: "T1")
    assert _.isEqual jql, {
      type: "field"
      tableAlias: "T1"
      column: "integer"
    }

  it "compiles scalar with no joins, simplifying", ->
    expr = { type: "scalar", table: "t1", expr: { type: "field", table: "t1", column: "integer" }, joins: [] }
    jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

    assert _.isEqual(jql, { type: "field", tableAlias: "T1", column: "integer" }), JSON.stringify(jql, null, 2)

  it "compiles scalar with one join", ->
    expr = { type: "scalar", table: "t1", expr: { type: "field", table: "t2", column: "integer" }, joins: ["1-2"] }
    jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

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
    expr = { type: "scalar", table: "t1", expr: { type: "field", table: "t2", column: "integer" }, joins: ["1-2"], aggr: "count" }
    jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

    assert _.isEqual(jql, {
      type: "scalar"
      expr: { type: "op", op: "count", exprs: [{ type: "field", tableAlias: "j1", column: "integer" }] }
      from: { type: "table", table: "t2", alias: "j1" }
      where: { type: "op", op: "=", exprs: [
        { type: "field", tableAlias: "j1", column: "t1" }
        { type: "field", tableAlias: "T1", column: "primary" }
        ]}
    }), JSON.stringify(jql, null, 2)

  it "compiles scalar with one join and last aggr", ->
    expr = { type: "scalar", table: "t1", expr: { type: "field", table: "t2", column: "integer" }, joins: ["1-2"], aggr: "last" }
    jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

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
    expr = { type: "scalar", table: "t1", expr: { type: "field", table: "t1", column: "integer" }, joins: ["1-2", "2-1"], aggr: "count" }
    jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

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
              "table": "t2",
              "column": "decimal"
            },
            "joins": []
          },
          "op": "=",
          "rhs": {
            "type": "literal",
            "valueType": "decimal",
            "value": 3
          }
        }
      ]
    }

    expr = { 
      type: "scalar", 
      table: "t1",      
      expr: { type: "field", table: "t2", column: "integer" }, 
      joins: ["1-2"], 
      where: where
    }
    jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

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
    assert.deepEqual @ec.compileExpr(expr: { type: "literal", valueType: "text", value: "abc" }), { type: "literal", value: "abc" }
    assert.deepEqual @ec.compileExpr(expr: { type: "literal", valueType: "integer", value: 123 }), { type: "literal", value: 123 }
    assert.deepEqual @ec.compileExpr(expr: { type: "literal", valueType: "decimal", value: 123.4 }), { type: "literal", value: 123.4 }
    assert.deepEqual @ec.compileExpr(expr: { type: "literal", valueType: "enum", value: "id1" }), { type: "literal", value: "id1" }
    assert.deepEqual @ec.compileExpr(expr: { type: "literal", valueType: "boolean", value: true }), { type: "literal", value: true }

  describe "comparisons", ->
    it "compiles =", ->
      expr = { 
        type: "comparison"
        op: "="
        lhs: { type: "field", table: "t1", column: "integer" }
        rhs: { type: "literal", valueType: "integer", value: 3 }
      }

      jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

      assert _.isEqual(jql, {
        type: "op"
        op: "="
        exprs: [
          { type: "field", tableAlias: "T1", column: "integer" }
          { type: "literal", value: 3 }
        ]
        }), JSON.stringify(jql, null, 2)
    
    it "compiles = true", ->
      expr = { type: "comparison", op: "= true", lhs: { type: "field", table: "t1", column: "integer" } }

      jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

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
      expr1 = { type: "comparison", op: "= true", lhs: { type: "field", table: "t1", column: "integer" } }

      expr = { type: "logical", op: "and", exprs: [expr1] }

      jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

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
      expr1 = { type: "comparison", op: "= true", lhs: { type: "field", table: "t1", column: "integer" } }

      expr2 = { type: "comparison", op: "= false", lhs: { type: "field", table: "t1", column: "decimal" } }

      expr = { type: "logical", op: "and", exprs: [expr1, expr2] }
      jql = @ec.compileExpr(expr: expr, tableAlias: "T1")

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

