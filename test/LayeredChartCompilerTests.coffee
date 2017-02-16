_ = require 'lodash'
assert = require('chai').assert
fixtures = require './fixtures'
LayeredChartCompiler = require '../src/widgets/charts/LayeredChartCompiler'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "LayeredChartCompiler", ->
  before ->
    @schema = fixtures.simpleSchema()
    @compiler = new LayeredChartCompiler(schema: @schema)

    @exprNumber = { type: "field", table: "t1", column: "number" }
    @exprText = { type: "field", table: "t1", column: "text" }
    @exprDate = { type: "field", table: "t1", column: "date" }
    @exprEnum = { type: "field", table: "t1", column: "enum" }
    @exprEnumset = { type: "field", table: "t1", column: "enumset" }

    @axisNumber = { expr: @exprNumber }
    @axisNumberSum = { expr: @exprNumber, aggr: "sum" }
    @axisEnum = { expr: @exprEnum }  
    @axisEnumset = { expr: @exprEnumset } 
    @axisText = { expr: @exprText } 
    @axisDate = { expr: @exprDate } 

  describe "createQueries", ->
    it "creates single grouped query", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisNumberSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
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
          { axes: { color: @axisEnum, y: @axisNumberSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "filters query", ->
      filter = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "number" }, op: ">", rhs: { type: "literal", valueType: "number", value: 4 } }

      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisNumberSum }, table: "t1", filter: filter }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "number" }
            { type: "literal", value: 4 }
          ]}
          groupBy: [1]
          orderBy: [{ ordinal: 1 }]
          limit: 1000
        }
      }

      compare(queries, expectedQueries)

    it "filters if by relevant extra filters", ->
      relevantFilter = { table: "t1", jsonql: { type: "op", op: ">", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, { type: "literal", value: 4 }] } }

      # Wrong table
      otherFilter = { table: "t2", jsonql: { type: "op", op: ">", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, { type: "literal", value: 5 }] } }

      filters = [
        relevantFilter
        otherFilter
      ]

      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, y: @axisNumberSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design, filters)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ]
          from: { type: "table", table: "t1", alias: "main" }
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "number" }
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
          { axes: { x: @axisNumber, y: @axisNumber }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "x" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "y" }
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
          { axes: { x: @axisText, color: @axisEnum, y: @axisNumberSum }, table: "t1" }
        ]
      }

      queries = @compiler.createQueries(design)

      expectedQueries = {
        layer0: {
          type: "query"
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" }
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" }
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
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
        beforeEach ->
          @design = {
            type: "pie"
            layers: [
              { table: "t1", axes: { color: @axisEnum, y: @axisNumber } }
            ]
          }

          # Intentionally scramble order for enum value as sort is not always same as enum order
          @data = { layer0: [
            { color: "b", y: 2 }
            { color: "a", y: 1 }
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
            "0:0": { layerIndex: 0, row: @data.layer0[1] }
            "0:1": { layerIndex: 0, row: @data.layer0[0] }
            })

        it "names", ->
          compare(@res.names, {
            "0:0": "A"
            "0:1": "B"
            })

        it "colors based on color map", ->
          @design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ]
          @res = @compiler.compileData(@design, @data)
          
          compare(@res.colors, {
            "0:1": "green"
            })          

        it "colors based on color map with series default", ->
          @design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ]
          @res = @compiler.compileData(@design, @data)
          
          compare(@res.colors, {
            "0:1": "green"
            })          

        # Removed since we don't allow pie slice coloring
        # it "colors based on color map defaulting to series", ->
        #   @design.layers[0].color = "red"
        #   @design.layers[0].axes.color.colorMap = [
        #     { value: "b", color: "green" }
        #   ]
        #   @res = @compiler.compileData(@design, @data)
          
        #   compare(@res.colors, {
        #     "0:0": "red"
        #     "0:1": "green"
        #     })          


        it "sets x axis type to category", ->
          assert.equal @res.xAxisType, "category"

      describe "multiple layer", ->
        before ->
          @design = {
            type: "pie"
            layers: [
              { table: "t1", axes: { y: @axisNumber } }
              { table: "t1", axes: { y: @axisNumber }, name: "Y", color: "red" }
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
      describe "number x, no color axis", ->
        beforeEach ->
          @design = {
            type: "line"
            layers: [
              { table: "t1", axes: { x: @axisNumber, y: @axisNumber }, name: "X", color: "red" }
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

        it "parses string y values", ->
          @data = { 
            layer0: [{ x: 1, y: "1" }, { x: 2, y: "4" }]
          }

          @res = @compiler.compileData(@design, @data)

          compare(@res.columns, [
            ["0:y", 1, 4]
            ["0:x", 1, 2]
            ])

        it "totals for cumulative", ->
          @data = { 
            layer0: [{ x: 1, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 5 }]
          }
          @design.layers[0].cumulative = true
          @res = @compiler.compileData(@design, @data)
          compare(@res.columns, [
            ["0:y", 1, 5, 10]
            ["0:x", 1, 2, 3]
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

      describe "number x, enum color axis", ->
        before ->
          @design = {
            type: "line"
            layers: [
              { table: "t1", axes: { x: @axisNumber, color: @axisEnum, y: @axisNumber }, name: "X" }
            ]
          }

          # Intentionally scramble enum order
          @data = { 
            layer0: [
              { x: 1, color: "b", y: 2 }
              { x: 2, color: "b", y: 5 }            
              { x: 1, color: "a", y: 1 }
              { x: 2, color: "a", y: 4 }
            ]
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
            "0:a:y:0": { layerIndex: 0, row: @data.layer0[2] }
            "0:a:y:1": { layerIndex: 0, row: @data.layer0[3] }
            "0:b:y:0": { layerIndex: 0, row: @data.layer0[0] }
            "0:b:y:1": { layerIndex: 0, row: @data.layer0[1] }
            })

        it "names", ->
          compare(@res.names, {
            "0:a:y": "A"
            "0:b:y": "B"
            })

        it "colors based on color map", ->
          @design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ]
          @res = @compiler.compileData(@design, @data)
          
          compare(@res.colors, {
            "0:b:y": "green"
            })          

        it "colors based on color map defaulting to series", ->
          @design.layers[0].color = "red"
          @design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ]
          @res = @compiler.compileData(@design, @data)
          
          compare(@res.colors, {
            "0:a:y": "red"
            "0:b:y": "green"
            })          

        it "sets x axis type to indexed", ->
          assert.equal @res.xAxisType, "indexed"

      describe "date x", ->
        before ->
          @design = {
            type: "line"
            layers: [
              { table: "t1", axes: { x: @axisDate, y: @axisNumber } }
            ]
          }

          @data = { 
            layer0: [{ x: "2015-01-02", y: 1 }, { x: "2015-03-04", y: 4 }]
          }

          @res = @compiler.compileData(@design, @data)

        it "sets x axis type to timeseries", ->
          assert.equal @res.xAxisType, "timeseries"

    describe "bar (or category)", ->
      it "groups for stacked", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum, color: @axisEnum } }
          ]
          stacked: true
        }

        data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }]
        }

        res = @compiler.compileData(design, data)

        compare(res.groups, [
          ["0:a", "0:b"]
          ])

      it "groups partially for stacked", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum, color: @axisEnum } }
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum } }
          ]
          stacked: false
        }

        data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }]
          layer1: [{ x: "t1", y: 11 }, { x: "t2", y: 12 }]
        }

        res = @compiler.compileData(design, data)

        compare(res.groups, [
          ["0:a", "0:b"]
          ])

      it "totals for cumulative", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum }, cumulative: true }
          ]
        }

        data = { 
          layer0: [{ x: "t1", y: 1 }, { x: "t2", y: 2 }, { x: "t3", y: 3 }]
        }

        res = @compiler.compileData(design, data)
        compare(res.columns, [
          ["x", "t1", "t2", "t3", "None"]
          ["0", 1, 3, 6, null]
        ])

      it "totals for cumulative, including excluded x-values", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum }, cumulative: true }
          ]
        }
        design.layers[0].axes.x = _.extend({}, design.layers[0].axes.x, { excludedValues: ["t1", null] })

        data = { 
          layer0: [{ x: "t1", y: 3 }, { x: "t2", y: 4 }, { x: "t3", y: 5 }]
        }

        res = @compiler.compileData(design, data)
        compare(res.columns, [
          ["x", "t2", "t3"]
          ["0", 7, 12]
        ])

      it "totals for cumulative with color split missing values", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum, color: @axisEnum }, cumulative: true }
          ]
        }

        data = { 
          layer0: [{ x: "t1", y: 3, color: "a" }, { x: "t1", y: 4, color: "b" }, { x: "t2", y: 8, color: "a" }]
        }

        res = @compiler.compileData(design, data)
        compare(res.columns, [
          ["x", "t1", "t2", "None"]
          ["0:a", 3, 11, null]
          ["0:b", 4, 4, null]
        ])

      it "percentages for proportional", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum, color: @axisEnum } }
          ]
          stacked: true
          proportional: true
        }

        data = { 
          layer0: [
            { x: "t1", y: 10, color: "a" }
            { x: "t1", y: 30, color: "b" }
            { x: "t2", y: 20, color: "a" }
          ]
        }

        res = @compiler.compileData(design, data)

        compare(res.groups, [
          ["0:a", "0:b"]
          ])

        compare(res.columns, [
          ["x", "t1", "t2", "None"]
          ["0:a", 25, 100, null]
          ["0:b", 75, null, null]
          ])

      it "colors based on color map", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum, color: @axisEnum } }
          ]
        }

        design.layers[0].axes.color.colorMap = [
          { value: "b", color: "green" }
        ]

        data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }]
        }

        res = @compiler.compileData(design, data)
        compare(res.colors, {
          "0:b": "green"
          })          

      it "colors based on color map defaulting to series", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisText, y: @axisNumberSum, color: @axisEnum } }
          ]
        }

        design.layers[0].color = "red"
        design.layers[0].axes.color.colorMap = [
          { value: "b", color: "green" }
        ]

        data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }]
        }

        res = @compiler.compileData(design, data)
        
        compare(res.colors, {
          "0:a": "red"
          "0:b": "green"
          })          

      # x axis as number (integer) no longer supported without binning
      # describe "x axis range", ->
      #   describe "number", ->
      #     before ->
      #       @design = {
      #         type: "bar"
      #         layers: [
      #           { table: "t1", axes: { x: @axisNumber, y: @axisNumberSum }, color: "red" }
      #           { table: "t1", axes: { x: @axisNumber, y: @axisNumberSum }, name: "#2" }
      #         ]
      #       }

      #       @data = { 
      #         layer0: [{ x: 1, y: 11 }]
      #         layer1: [{ x: 3, y: 13 }, { x: 4, y: 14 }]
      #       }

      #       @res = @compiler.compileData(@design, @data)

      #     it "sets types to bar", -> 
      #       compare(@res.types, {
      #         "0": "bar"
      #         "1": "bar"})

      #     it "makes columns with y values with common x axis", ->
      #       compare(@res.columns, [
      #         ["x", "1", "2", "3", "4"]
      #         ["0", 11, null, null, null]
      #         ["1", null, null, 13, 14]
      #         ])

      #     it "maps back to rows", ->
      #       compare(@res.dataMap, {
      #         "0:0": { layerIndex: 0, row: @data.layer0[0] }
      #         "1:2": { layerIndex: 1, row: @data.layer1[0] }
      #         "1:3": { layerIndex: 1, row: @data.layer1[1] }
      #         })

      #     it "uses series color", ->
      #       compare(@res.colors, { "0": "red" })

      #     it "sets xs to common axis", ->
      #       compare(@res.xs, {
      #         "0": "x"
      #         "1": "x"
      #         })

      #     it "names", ->
      #       compare(@res.names, {
      #         "0": "Series 1"
      #         "1": "#2"
      #         })

      #     it "colors based on color map"

      #     it "sets x axis type to category", ->
      #       assert.equal @res.xAxisType, "category"

      it "fills out range types" # year, date, month, yearmonth, number
      it "supports enum types" # enum, boolean, bins ??
      it "supports text type" # text

      it "supports enumset x axis", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisEnumset, y: @axisNumberSum } }
          ]
        }

        data = { 
          layer0: [
            { x: ["a", "b"], y: 10 }
            { x: ["b"], y: 8 }
          ]
        }

        res = @compiler.compileData(design, data)

        compare(res.columns, [
          ["x", "A", "B", "None"]
          ["0", 10, 18, null] # Totals
          ])

      it "supports enumset x axis with JSON encoded x", ->
        design = {
          type: "bar"
          layers: [
            { table: "t1", axes: { x: @axisEnumset, y: @axisNumberSum } }
          ]
        }

        data = { 
          layer0: [
            { x: JSON.stringify(["a", "b"]), y: 10 }
            { x: JSON.stringify(["b"]), y: 8 }
          ]
        }

        res = @compiler.compileData(design, data)

        compare(res.columns, [
          ["x", "A", "B", "None"]
          ["0", 10, 18, null] # Totals
          ])

      # describe "enum x axis" 
      # describe "text x axis"

  describe "createScope", ->
    it "creates x filter", ->
      design = {
        type: "line"
        layers: [
          { axes: { x: @axisNumber, y: @axisNumberSum }, table: "t1" }
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
            { type: "field", tableAlias: "{alias}", column: "number" }
            { type: "literal", value: 1 }
          ]
        }
      }

      compare(scope.filter, expectedFilter)
      compare(scope.data, { layerIndex: 0, x: 1 })
      compare(scope.name, "T1 Number is 1")

    it "creates x-color filter", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisText, color: @axisEnum, y: @axisNumberSum }, table: "t1" }
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
          { axes: { color: @axisEnum, y: @axisNumberSum }, table: "t1" }
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
          { axes: { color: @axisEnum, y: @axisNumberSum }, table: "t1" }
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

    it "creates x filter when enumset which is expanded to enum", ->
      design = {
        type: "bar"
        layers: [
          { axes: { x: @axisEnumset, y: @axisNumberSum }, table: "t1" }
        ]
      }

      row = { x: "a", y: 10 }
      scope = @compiler.createScope(design, 0, row)

      expectedFilter = {
        table: "t1"
        jsonql: {
          type: "op"
          op: "@>"
          exprs: [
            { type: "op", op: "::jsonb", exprs: [{ type: "field", tableAlias: "{alias}", column: "enumset" }] }
            { type: "op", op: "::jsonb", exprs: ["\"a\""] }
          ]
        }
      }

      compare(scope.filter, expectedFilter)
      compare(scope.data, { layerIndex: 0, x: "a" })
      compare(scope.name, "T1 Enumset includes A")
