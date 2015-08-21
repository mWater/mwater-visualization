_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
LayeredChartCompiler = require '../src/widgets/charts/LayeredChartCompiler'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected) or JSON.stringify(actual) == JSON.stringify(expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

describe "LayeredChartCompiler", ->
  before ->
    @schema = fixtures.simpleSchema()
    @compiler = new LayeredChartCompiler(schema: @schema)

    @exprDecimal = { type: "field", table: "t1", column: "decimal" }
    @exprInteger = { type: "field", table: "t1", column: "integer" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }

    @axisDecimal = { expr: @exprDecimal }
    @axisIntegerSum = { expr: @exprInteger, aggr: "sum" }
    @axisInteger = { expr: @exprInteger }
    @axisEnum = { expr: @exprEnum } 
    @axisText = { expr: @exprText } 
    @axisDate = { expr: @exprDate } 

  describe "createQueries", ->
    it "creates single grouped query", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "creates single grouped query without x", ->
      design = {
        type: "pie"
        layers: [
          { axes: { color: @axisEnum, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "filters query", ->
      filter = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "integer" }, op: ">", rhs: { type: "literal", valueType: "integer", value: 4 } }

      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisIntegerSum }, table: "t1", filter: filter }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "integer" }
            { type: "literal", value: 4 }
          ]}
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "filters if by relevant extra filters", ->
      relevantFilter = { table: "t1", jsonql: { type: "op", op: ">", exprs: [{ type: "field", tableAlias: "{alias}", column: "integer" }, { type: "literal", value: 4 }] } }

      # Wrong table
      otherFilter = { table: "t2", jsonql: { type: "op", op: ">", exprs: [{ type: "field", tableAlias: "{alias}", column: "integer" }, { type: "literal", value: 5 }] } }

      filters = [
        relevantFilter
        otherFilter
      ]

      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design, filters)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "integer" }
            { type: "literal", value: 4 }
          ]}
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "creates single ungrouped query", ->
      design = {
        type: "scatter"
        layers: [
          { axes: { x: @axisInteger, y: @axisDecimal }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "integer" }, alias: "x" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "decimal" }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: []
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "adds color grouping", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, color: @axisEnum, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "integer" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1, 2]
          orderBy: [{ ordinal: 1 }, { ordinal: 2 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

  describe "compileData", ->
    describe "pie/donut", ->
      describe "single layer", ->
        before ->
          @design = {
            type: "pie"
            layers: [
              { table: "t1", axes: { color: @axisEnum, y: @axisDecimal } }
            ]
          }

          @data = { layer0: [
            { color: "a", y: 1 }
            { color: "b", y: 2 }
          ]}

          @res = @compiler.compileData(@design, @data)

        it "sets types to pie", -> 
          compare(@res.types, {
            "0:0": "pie"
            "0:1": "pie"})

        it "makes columns with y value", ->
          compare(@res.columns, [
            ["0:0", 1]
            ["0:1", 2]
            ])

        it "maps back to rows", ->
          compare(@res.dataMap, {
            "0:0": { layerIndex: 0, row: @data.layer0[0] }
            "0:1": { layerIndex: 0, row: @data.layer0[1] }
            })

        it "names", ->
          compare(@res.names, {
            "0:0": "A"
            "0:1": "B"
            })

        it "colors based on color map"

        it "sets x axis type to category", ->
          assert.equal @res.xAxisType, "category"

      describe "multiple layer", ->
        before ->
          @design = {
            type: "pie"
            layers: [
              { table: "t1", axes: { y: @axisDecimal } }
              { table: "t1", axes: { y: @axisDecimal }, name: "Y", color: "red" }
            ]
          }

          @data = { 
            layer0: [{ y: 1 }]
            layer1: [{ y: 2 }]
          }

          @res = @compiler.compileData(@design, @data)

        it "sets types to pie", -> 
          compare(@res.types, {
            "0": "pie"
            "1": "pie"})

        it "makes columns with y value", ->
          compare(@res.columns, [
            ["0", 1]
            ["1", 2]
            ])

        it "maps back to rows", ->
          compare(@res.dataMap, {
            "0": { layerIndex: 0, row: @data.layer0[0] }
            "1": { layerIndex: 1, row: @data.layer1[0] }
            })

        it "uses series color", ->
          compare(@res.colors, {
            "1": "red"
            })

        it "names", ->
          compare(@res.names, {
            "0": "Series 1"
            "1": "Y"
            })

        it "colors based on color map"

        it "sets x axis type to category", ->
          assert.equal @res.xAxisType, "category"

    describe "scatter/line (continuous)", ->
      # TODO Support these?
      # describe "timeseries x"
      # describe "enum x"
      # describe "text x"
      # describe "boolean x"
      describe "decimal x, no color axis", ->
        before ->
          @design = {
            type: "line"
            layers: [
              { table: "t1", axes: { x: @axisDecimal, y: @axisDecimal }, name: "X", color: "red" }
            ]
          }

          @data = { 
            layer0: [{ x: 1, y: 1 }, { x: 2, y: 4 }]
          }

          @res = @compiler.compileData(@design, @data)

        it "sets types to line", -> 
          compare(@res.types, {
            "0:y": "line"
          })

        it "makes columns with y values and x values", ->
          compare(@res.columns, [
            ["0:y", 1, 4]
            ["0:x", 1, 2]
            ])

        it "makes xs", ->
          compare(@res.xs, {
            "0:y": "0:x"
            })

        it "maps back to rows", ->
          compare(@res.dataMap, {
            "0:y:0": { layerIndex: 0, row: @data.layer0[0] }
            "0:y:1": { layerIndex: 0, row: @data.layer0[1] }
            })

        it "names", ->
          compare(@res.names, {
            "0:y": "X"
            })

        it "uses series color", ->
          compare(@res.colors, {
            "0:y": "red"
            })

        it "sets x axis type to indexed", ->
          assert.equal @res.xAxisType, "indexed"

      describe "decimal x, enum color axis", ->
        before ->
          @design = {
            type: "line"
            layers: [
              { table: "t1", axes: { x: @axisDecimal, color: @axisEnum, y: @axisDecimal }, name: "X" }
            ]
          }

          @data = { 
            layer0: [
              { x: 1, color: "a", y: 1 }
              { x: 2, color: "a", y: 4 }
              { x: 1, color: "b", y: 2 }
              { x: 2, color: "b", y: 5 }            ]
          }

          @res = @compiler.compileData(@design, @data)

        it "sets types to line", -> 
          compare(@res.types, {
            "0:a:y": "line"
            "0:b:y": "line"
          })

        it "makes columns with y values and x values", ->
          compare(@res.columns, [
            ["0:a:y", 1, 4]
            ["0:a:x", 1, 2]
            ["0:b:y", 2, 5]
            ["0:b:x", 1, 2]
            ])

        it "makes xs", ->
          compare(@res.xs, {
            "0:a:y": "0:a:x"
            "0:b:y": "0:b:x"
            })

        it "maps back to rows", ->
          compare(@res.dataMap, {
            "0:a:y:0": { layerIndex: 0, row: @data.layer0[0] }
            "0:a:y:1": { layerIndex: 0, row: @data.layer0[1] }
            "0:b:y:0": { layerIndex: 0, row: @data.layer0[2] }
            "0:b:y:1": { layerIndex: 0, row: @data.layer0[3] }
            })

        it "names", ->
          compare(@res.names, {
            "0:a:y": "A"
            "0:b:y": "B"
            })

        it "uses color maps"

        it "sets x axis type to indexed", ->
          assert.equal @res.xAxisType, "indexed"

      describe "date x", ->
        before ->
          @design = {
            type: "line"
            layers: [
              { table: "t1", axes: { x: @axisDate, y: @axisDecimal } }
            ]
          }

          @data = { 
            layer0: [{ x: "2015-01-02", y: 1 }, { x: "2015-03-04", y: 4 }]
          }

          @res = @compiler.compileData(@design, @data)

        it "sets x axis type to timeseries", ->
          assert.equal @res.xAxisType, "timeseries"

    describe "bar (or category)", ->
      it "groups for stacked"
      describe "x axis range", ->
        describe "integer", ->
          before ->
            @design = {
              type: "bar"
              layers: [
                { table: "t1", axes: { x: @axisInteger, y: @axisIntegerSum }, color: "red" }
                { table: "t1", axes: { x: @axisInteger, y: @axisIntegerSum }, name: "#2" }
              ]
            }

            @data = { 
              layer0: [{ x: 1, y: 11 }]
              layer1: [{ x: 3, y: 13 }, { x: 4, y: 14 }]
            }

            @res = @compiler.compileData(@design, @data)

          it "sets types to bar", -> 
            compare(@res.types, {
              "0": "bar"
              "1": "bar"})

          it "makes columns with y values with common x axis", ->
            compare(@res.columns, [
              ["x", "1", "2", "3", "4"]
              ["0", 11, null, null, null]
              ["1", null, null, 13, 14]
              ])

          it "maps back to rows", ->
            compare(@res.dataMap, {
              "0:0": { layerIndex: 0, row: @data.layer0[0] }
              "1:2": { layerIndex: 1, row: @data.layer1[0] }
              "1:3": { layerIndex: 1, row: @data.layer1[1] }
              })

          it "uses series color", ->
            compare(@res.colors, { "0": "red" })

          it "sets xs to common axis", ->
            compare(@res.xs, {
              "0": "x"
              "1": "x"
              })

          it "names", ->
            compare(@res.names, {
              "0": "Series 1"
              "1": "#2"
              })

          it "colors based on color map"

          it "sets x axis type to category", ->
            assert.equal @res.xAxisType, "category"

      it "fills out range types" # year, date, month, yearmonth, integer
      it "supports enum types" # enum, boolean, bins ??
      it "supports text type" # text
      # describe "enum x axis" 
      # describe "text x axis"

  describe "createScope", ->
    it "creates x filter", ->
      design = {
        type: "line"
        layers: [
          { axes: { x: @axisDecimal, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      row = { x: 1, y: 10 }
      scope = @compiler.createScope(design, 0, row)

      expectedFilter = {
        table: "t1"
        jsonql: {
          type: "op"
          op: "="
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "decimal" }
            { type: "literal", value: 1 }
          ]
        }
      }

      compare(scope.filter, expectedFilter)
      compare(scope.data, { layerIndex: 0, x: 1 })
      compare(scope.name, "T1 Decimal is 1")

    it "creates x-color filter", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, color: @axisEnum, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      row = { x: "1", color: "b", y: 20 }
      scope = @compiler.createScope(design, 0, row)

      expectedFilter = {
        table: "t1"
        jsonql: {
          type: "op"
          op: "and"
          exprs: [
            {
              type: "op"
              op: "="
              exprs: [
                { type: "field", tableAlias: "{alias}", column: "text" }
                { type: "literal", value: "1" }
              ]
            }
            {
              type: "op"
              op: "="
              exprs: [
                { type: "field", tableAlias: "{alias}", column: "enum" }
                { type: "literal", value: "b" }
              ]
            }
          ]
        }
      }

      compare(scope.filter, expectedFilter)
      compare(scope.data, { layerIndex: 0, x: "1", color: "b" })
      compare(scope.name, "T1 Text is 1 and Enum is B")

    it "creates color filter", ->
      design = {
        type: "pie"
        layers: [
          { axes: { color: @axisEnum, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      row = { color: "b", y: 20 }
      scope = @compiler.createScope(design, 0, row)

      expectedFilter = {
        table: "t1"
        jsonql: {
          type: "op"
          op: "="
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" }
            { type: "literal", value: "b" }
          ]
        }
      }

      compare(scope.filter, expectedFilter)
      compare(scope.data, { layerIndex: 0, color: "b" })
      compare(scope.name, "T1 Enum is B")

    it "creates null color filter", ->
      design = {
        type: "pie"
        layers: [
          { axes: { color: @axisEnum, y: @axisIntegerSum }, table: "t1" }
        ]
      }

      row = { color: null, y: 20 }
      scope = @compiler.createScope(design, 0, row)

      expectedFilter =  {
        table: "t1"
        jsonql: {
          type: "op"
          op: "is null"
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" }
          ]
        }
      }

      compare(scope.filter, expectedFilter)
      compare(scope.data, { layerIndex: 0, color: null })
      compare(scope.name, "T1 Enum is None")
