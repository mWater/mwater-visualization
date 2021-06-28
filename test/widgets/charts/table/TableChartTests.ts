// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import { assert } from "chai"
import * as fixtures from "../../../fixtures"
import TableChart from "../../../../src/widgets/charts/table/TableChart"
import canonical from "canonical-json"

function compare(actual: any, expected: any) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    `\ngot:${canonical(actual)}\nexp:${canonical(expected)}\n`
  )
}

describe("TableChart", function () {
  before(function () {
    this.schema = fixtures.simpleSchema()
    this.dataSource = {
      performQuery: (query: any) => {
        return (this.query = query)
      }
    }

    this.chart = new TableChart()

    this.exprNumber = { type: "field", table: "t1", column: "number" }
    this.exprText = { type: "field", table: "t1", column: "text" }
    this.exprDate = { type: "field", table: "t1", column: "date" }
    this.exprEnum = { type: "field", table: "t1", column: "enum" }
    this.exprEnumset = { type: "field", table: "t1", column: "enumset" }
    this.exprGeometry = { type: "field", table: "t1", column: "geometry" }

    this.axisNumber = { expr: this.exprNumber }
    this.axisNumberSum = { expr: { type: "op", op: "sum", table: "t1", exprs: [this.exprNumber] } }
    this.axisEnum = { expr: this.exprEnum }
    this.axisEnumset = { expr: this.exprEnumset }
    this.axisText = { expr: this.exprText }
    this.axisDate = { expr: this.exprDate }
    return (this.axisGeometry = { expr: this.exprGeometry })
  })

  describe("createQueries", function () {
    // it "includes _id if no grouping", ->

    it("includes id if no aggr", function () {
      const design = {
        table: "t1",
        columns: [{ textAxis: this.axisText }, { textAxis: this.axisNumber }],
        orderings: []
      }

      this.chart.getData(design, this.schema, this.dataSource, [])
      const expectedQuery = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
          { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "c1" },
          { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [],
        orderBy: [],
        limit: 1000
      }

      return compare(this.query, expectedQuery)
    })

    it("groups all non-aggr", function () {
      const design = {
        table: "t1",
        columns: [{ textAxis: this.axisText }, { textAxis: this.axisNumberSum }],
        orderings: []
      }

      this.chart.getData(design, this.schema, this.dataSource, [])
      const expectedQuery = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
          {
            type: "select",
            expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] },
            alias: "c1"
          }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [1],
        orderBy: [],
        limit: 1000
      }

      return compare(this.query, expectedQuery)
    })

    it("adds order with groupBy", function () {
      const design = {
        table: "t1",
        columns: [{ textAxis: this.axisText }, { textAxis: this.axisNumberSum }],
        orderings: [{ axis: this.axisNumber, direction: "desc" }]
      }

      this.chart.getData(design, this.schema, this.dataSource, [])
      const expectedQuery = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
          {
            type: "select",
            expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] },
            alias: "c1"
          },
          { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "o0" }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [1, 3],
        orderBy: [{ ordinal: 3, direction: "desc", nulls: "last" }],
        limit: 1000
      }

      return compare(this.query, expectedQuery)
    })

    return it("gets geojson for geometry", function () {
      const design = {
        table: "t1",
        columns: [{ textAxis: this.axisGeometry }]
      }

      this.chart.getData(design, this.schema, this.dataSource, [])
      const expectedQuery = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: {
              type: "op",
              op: "ST_AsGeoJSON",
              exprs: [
                {
                  type: "op",
                  op: "ST_Transform",
                  exprs: [
                    {
                      type: "op",
                      op: "::geometry",
                      exprs: [{ type: "field", tableAlias: "main", column: "geometry" }]
                    },
                    4326
                  ]
                }
              ]
            },
            alias: "c0"
          },
          { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" }
        ],
        from: { type: "table", table: "t1", alias: "main" },
        groupBy: [],
        orderBy: [],
        limit: 1000
      }

      return compare(this.query, expectedQuery)
    })
  })

  // describe "cleanDesign", ->
  //   it "cleans column expressions", ->
  //     design = {
  //       table: "t1"
  //       columns: [
  //         { expr: { type: "field", table: "t2", column: "text "} } # Wrong table
  //       ]
  //     }

  //     design = @chart.cleanDesign(design)

  //     expectedDesign = {
  //       table: "t1"
  //       columns: [
  //         { expr: null }
  //       ]
  //     }

  //     compare(design, expectedDesign)

  //   it "removes invalid aggrs", ->
  //     design = {
  //       table: "t1"
  //       columns: [
  //         { expr: @exprText, aggr: "sum" }
  //       ]
  //     }

  //     design = @chart.cleanDesign(design)

  //     expectedDesign = {
  //       table: "t1"
  //       columns: [
  //         { expr: @exprText }
  //       ]
  //     }

  //     compare(design, expectedDesign)

  //   it "defaults aggr to count if no expression type", ->
  //     design = {
  //       table: "t1"
  //       columns: [
  //         { expr: { type: "scalar", table: "t1", expr: null, joins: [] }, aggr: "sum" }
  //       ]
  //     }

  //     design = @chart.cleanDesign(design)

  //     expectedDesign = {
  //       table: "t1"
  //       columns: [
  //         { expr: { type: "scalar", table: "t1", expr: null, joins: [] }, aggr: "count" }
  //       ]
  //     }

  //     compare(design, expectedDesign)

  //   it "cleans filter"

  return describe("validateDesign", function () {
    it("allows valid design", function () {
      const design = {
        table: "t1",
        columns: [{ textAxis: this.axisText }],
        orderings: []
      }

      return assert(!this.chart.validateDesign(design, this.schema))
    })

    it("validates column expressions", function () {
      const design = {
        table: "t1",
        columns: [{ textAxis: null }],
        orderings: []
      }

      return assert(this.chart.validateDesign(design, this.schema))
    })

    return it("validates filter")
  })
})
