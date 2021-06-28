// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import { assert } from 'chai';
import * as fixtures from './fixtures';
import LayeredChartCompiler from '../src/widgets/charts/layered/LayeredChartCompiler';
import canonical from 'canonical-json';

function compare(actual, expected) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected)
  );
}

describe("LayeredChartCompiler", function() {
  before(function() {
    this.schema = fixtures.simpleSchema();
    this.compiler = new LayeredChartCompiler({schema: this.schema});

    this.exprNumber = { type: "field", table: "t1", column: "number" };
    this.exprText = { type: "field", table: "t1", column: "text" };
    this.exprDate = { type: "field", table: "t1", column: "date" };
    this.exprEnum = { type: "field", table: "t1", column: "enum" };
    this.exprEnumset = { type: "field", table: "t1", column: "enumset" };

    this.axisNumber = { expr: this.exprNumber };
    this.axisNumberSum = { expr: this.exprNumber, aggr: "sum" };
    this.axisEnum = { expr: this.exprEnum };  
    this.axisEnumset = { expr: this.exprEnumset }; 
    this.axisText = { expr: this.exprText }; 
    return this.axisDate = { expr: this.exprDate };}); 

  describe("createQueries", function() {
    it("creates single grouped query", function() {
      const design = {
        type: "bar",
        layers: [
          { axes: { x: this.axisText, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const queries = this.compiler.createQueries(design);

      const expectedQueries = {
        layer0: {
          type: "query",
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" },
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ],
          from: { type: "table", table: "t1", alias: "main" },
          groupBy: [1],
          orderBy: [{ ordinal: 1 }],
          limit: 1000
        }
      };

      return compare(queries, expectedQueries);
    });

    it("creates single grouped query without x", function() {
      const design = {
        type: "pie",
        layers: [
          { axes: { color: this.axisEnum, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const queries = this.compiler.createQueries(design);

      const expectedQueries = {
        layer0: {
          type: "query",
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" },
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ],
          from: { type: "table", table: "t1", alias: "main" },
          groupBy: [1],
          orderBy: [{ ordinal: 1 }],
          limit: 1000
        }
      };

      return compare(queries, expectedQueries);
    });

    it("filters query", function() {
      const filter = { type: "comparison", table: "t1", lhs: { type: "field", table: "t1", column: "number" }, op: ">", rhs: { type: "literal", valueType: "number", value: 4 } };

      const design = {
        type: "bar",
        layers: [
          { axes: { x: this.axisText, y: this.axisNumberSum }, table: "t1", filter }
        ]
      };

      const queries = this.compiler.createQueries(design);

      const expectedQueries = {
        layer0: {
          type: "query",
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" },
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ],
          from: { type: "table", table: "t1", alias: "main" },
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "number" },
            { type: "literal", value: 4 }
          ]},
          groupBy: [1],
          orderBy: [{ ordinal: 1 }],
          limit: 1000
        }
      };

      return compare(queries, expectedQueries);
    });

    it("filters if by relevant extra filters", function() {
      const relevantFilter = { table: "t1", jsonql: { type: "op", op: ">", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, { type: "literal", value: 4 }] } };

      // Wrong table
      const otherFilter = { table: "t2", jsonql: { type: "op", op: ">", exprs: [{ type: "field", tableAlias: "{alias}", column: "number" }, { type: "literal", value: 5 }] } };

      const filters = [
        relevantFilter,
        otherFilter
      ];

      const design = {
        type: "bar",
        layers: [
          { axes: { x: this.axisText, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const queries = this.compiler.createQueries(design, filters);

      const expectedQueries = {
        layer0: {
          type: "query",
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" },
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ],
          from: { type: "table", table: "t1", alias: "main" },
          where: { type: "op", op: ">", exprs: [
            { type: "field", tableAlias: "main", column: "number" },
            { type: "literal", value: 4 }
          ]},
          groupBy: [1],
          orderBy: [{ ordinal: 1 }],
          limit: 1000
        }
      };

      return compare(queries, expectedQueries);
    });

    it("creates single ungrouped query", function() {
      const design = {
        type: "scatter",
        layers: [
          { axes: { x: this.axisNumber, y: this.axisNumber }, table: "t1" }
        ]
      };

      const queries = this.compiler.createQueries(design);

      const expectedQueries = {
        layer0: {
          type: "query",
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "x" },
            { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "y" }
          ],
          from: { type: "table", table: "t1", alias: "main" },
          groupBy: [],
          orderBy: [{ ordinal: 1 }],
          limit: 10000
        }
      };

      return compare(queries, expectedQueries);
    });

    return it("adds color grouping", function() {
      const design = {
        type: "bar",
        layers: [
          { axes: { x: this.axisText, color: this.axisEnum, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const queries = this.compiler.createQueries(design);

      const expectedQueries = {
        layer0: {
          type: "query",
          selects: [
            { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "x" },
            { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "color" },
            { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "y" }
          ],
          from: { type: "table", table: "t1", alias: "main" },
          groupBy: [1, 2],
          orderBy: [{ ordinal: 1 }, { ordinal: 2 }],
          limit: 1000
        }
      };

      return compare(queries, expectedQueries);
    });
  });

  describe("compileData", function() {
    describe("pie/donut", function() {
      describe("single layer", function() {
        beforeEach(function() {
          this.design = {
            type: "pie",
            layers: [
              { table: "t1", axes: { color: this.axisEnum, y: this.axisNumber } }
            ]
          };

          // Intentionally scramble order for enum value as sort is not always same as enum order
          this.data = { layer0: [
            { color: "b", y: 2 },
            { color: "a", y: 1 }
          ]};

          return this.res = this.compiler.compileData(this.design, this.data);
        });

        it("sets types to pie", function() { 
          return compare(this.res.types, {
            "0:0": "pie",
            "0:1": "pie"});
        });

        it("makes columns with y value", function() {
          return compare(this.res.columns, [
            ["0:0", 1],
            ["0:1", 2]
            ]);
        });

        it("maps back to rows", function() {
          return compare(this.res.dataMap, {
            "0:0": { layerIndex: 0, row: this.data.layer0[1] },
            "0:1": { layerIndex: 0, row: this.data.layer0[0] }
            });
        });

        it("names", function() {
          return compare(this.res.names, {
            "0:0": "A",
            "0:1": "B"
            });
        });

        it("colors based on color map", function() {
          this.design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ];
          this.res = this.compiler.compileData(this.design, this.data);
          
          return compare(this.res.colors, {
            "0:1": "green"
            });
        });          

        it("colors based on color map with series default", function() {
          this.design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ];
          this.res = this.compiler.compileData(this.design, this.data);
          
          return compare(this.res.colors, {
            "0:1": "green"
            });
        });          

        // Removed since we don't allow pie slice coloring
        // it "colors based on color map defaulting to series", ->
        //   @design.layers[0].color = "red"
        //   @design.layers[0].axes.color.colorMap = [
        //     { value: "b", color: "green" }
        //   ]
        //   @res = @compiler.compileData(@design, @data)
          
        //   compare(@res.colors, {
        //     "0:0": "red"
        //     "0:1": "green"
        //     })          


        return it("sets x axis type to category", function() {
          return assert.equal(this.res.xAxisType, "category");
        });
      });

      return describe("multiple layer", function() {
        before(function() {
          this.design = {
            type: "pie",
            layers: [
              { table: "t1", axes: { y: this.axisNumber } },
              { table: "t1", axes: { y: this.axisNumber }, name: "Y", color: "red" }
            ]
          };

          this.data = { 
            layer0: [{ y: 1 }],
            layer1: [{ y: 2 }]
          };

          return this.res = this.compiler.compileData(this.design, this.data);
        });

        it("sets types to pie", function() { 
          return compare(this.res.types, {
            "0": "pie",
            "1": "pie"});
        });

        it("makes columns with y value", function() {
          return compare(this.res.columns, [
            ["0", 1],
            ["1", 2]
            ]);
        });

        it("maps back to rows", function() {
          return compare(this.res.dataMap, {
            "0": { layerIndex: 0, row: this.data.layer0[0] },
            "1": { layerIndex: 1, row: this.data.layer1[0] }
            });
        });

        it("uses series color", function() {
          return compare(this.res.colors, {
            "1": "red"
            });
        });

        it("names", function() {
          return compare(this.res.names, {
            "0": "Series 1",
            "1": "Y"
            });
        });

        it("colors based on color map");

        return it("sets x axis type to category", function() {
          return assert.equal(this.res.xAxisType, "category");
        });
      });
    });

    describe("scatter/line (continuous)", function() {
      // TODO Support these?
      // describe "timeseries x"
      // describe "enum x"
      // describe "text x"
      // describe "boolean x"
      describe("number x, no color axis", function() {
        beforeEach(function() {
          this.design = {
            type: "line",
            layers: [
              { table: "t1", axes: { x: this.axisNumber, y: this.axisNumber }, name: "X", color: "red" }
            ]
          };

          this.data = { 
            layer0: [{ x: 1, y: 1 }, { x: 2, y: 4 }]
          };

          return this.res = this.compiler.compileData(this.design, this.data);
        });

        it("sets types to line", function() { 
          return compare(this.res.types, {
            "0:y": "line"
          });
        });

        it("makes columns with y values and x values", function() {
          return compare(this.res.columns, [
            ["0:y", 1, 4],
            ["0:x", 1, 2]
            ]);
        });

        it("parses string y values", function() {
          this.data = { 
            layer0: [{ x: 1, y: "1" }, { x: 2, y: "4" }]
          };

          this.res = this.compiler.compileData(this.design, this.data);

          return compare(this.res.columns, [
            ["0:y", 1, 4],
            ["0:x", 1, 2]
            ]);
        });

        it("totals for cumulative", function() {
          this.data = { 
            layer0: [{ x: 1, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 5 }]
          };
          this.design.layers[0].cumulative = true;
          this.res = this.compiler.compileData(this.design, this.data);
          return compare(this.res.columns, [
            ["0:y", 1, 5, 10],
            ["0:x", 1, 2, 3]
            ]);
        });

        it("makes xs", function() {
          return compare(this.res.xs, {
            "0:y": "0:x"
            });
        });

        it("maps back to rows", function() {
          return compare(this.res.dataMap, {
            "0:y:0": { layerIndex: 0, row: this.data.layer0[0] },
            "0:y:1": { layerIndex: 0, row: this.data.layer0[1] }
            });
        });

        it("names", function() {
          return compare(this.res.names, {
            "0:y": "X"
            });
        });

        it("uses series color", function() {
          return compare(this.res.colors, {
            "0:y": "red"
            });
        });

        return it("sets x axis type to indexed", function() {
          return assert.equal(this.res.xAxisType, "indexed");
        });
      });

      describe("number x, enum color axis", function() {
        before(function() {
          this.design = {
            type: "line",
            layers: [
              { table: "t1", axes: { x: this.axisNumber, color: this.axisEnum, y: this.axisNumber }, name: "X" }
            ]
          };

          // Intentionally scramble enum order
          this.data = { 
            layer0: [
              { x: 1, color: "b", y: 2 },
              { x: 2, color: "b", y: 5 },            
              { x: 1, color: "a", y: 1 },
              { x: 2, color: "a", y: 4 }
            ]
          };

          return this.res = this.compiler.compileData(this.design, this.data);
        });

        it("sets types to line", function() { 
          return compare(this.res.types, {
            "0:a:y": "line",
            "0:b:y": "line"
          });
        });

        it("makes columns with y values and x values", function() {
          return compare(this.res.columns, [
            ["0:a:y", 1, 4],
            ["0:a:x", 1, 2],
            ["0:b:y", 2, 5],
            ["0:b:x", 1, 2]
            ]);
        });

        it("makes xs", function() {
          return compare(this.res.xs, {
            "0:a:y": "0:a:x",
            "0:b:y": "0:b:x"
            });
        });

        it("maps back to rows", function() {
          return compare(this.res.dataMap, {
            "0:a:y:0": { layerIndex: 0, row: this.data.layer0[2] },
            "0:a:y:1": { layerIndex: 0, row: this.data.layer0[3] },
            "0:b:y:0": { layerIndex: 0, row: this.data.layer0[0] },
            "0:b:y:1": { layerIndex: 0, row: this.data.layer0[1] }
            });
        });

        it("names", function() {
          return compare(this.res.names, {
            "0:a:y": "A",
            "0:b:y": "B"
            });
        });

        it("colors based on color map", function() {
          this.design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ];
          this.res = this.compiler.compileData(this.design, this.data);
          
          return compare(this.res.colors, {
            "0:b:y": "green"
            });
        });          

        it("colors based on color map defaulting to series", function() {
          this.design.layers[0].color = "red";
          this.design.layers[0].axes.color.colorMap = [
            { value: "b", color: "green" }
          ];
          this.res = this.compiler.compileData(this.design, this.data);
          
          return compare(this.res.colors, {
            "0:a:y": "red",
            "0:b:y": "green"
            });
        });          

        return it("sets x axis type to indexed", function() {
          return assert.equal(this.res.xAxisType, "indexed");
        });
      });

      return describe("date x", function() {
        before(function() {
          this.design = {
            type: "line",
            layers: [
              { table: "t1", axes: { x: this.axisDate, y: this.axisNumber } }
            ]
          };

          this.data = { 
            layer0: [{ x: "2015-01-02", y: 1 }, { x: "2015-03-04", y: 4 }]
          };

          return this.res = this.compiler.compileData(this.design, this.data);
        });

        return it("sets x axis type to timeseries", function() {
          return assert.equal(this.res.xAxisType, "timeseries");
        });
      });
    });

    return describe("bar (or category)", function() {
      it("groups for stacked", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum, color: this.axisEnum } }
          ],
          stacked: true
        };

        const data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }]
        };

        const res = this.compiler.compileData(design, data);

        return compare(res.groups, [
          ["0:a", "0:b"]
          ]);
      });

      it("groups partially for unstacked with color", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum, color: this.axisEnum } },
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum } }
          ],
          stacked: false
        };

        const data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }],
          layer1: [{ x: "t1", y: 11 }, { x: "t2", y: 12 }]
        };

        const res = this.compiler.compileData(design, data);

        return compare(res.groups, [
          ["0:a", "0:b"]
          ]);
      });

      it("does not group partially for unstacked with layer stacked", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum, color: this.axisEnum }, stacked: false },
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum } }
          ],
          stacked: false
        };

        const data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }],
          layer1: [{ x: "t1", y: 11 }, { x: "t2", y: 12 }]
        };

        const res = this.compiler.compileData(design, data);

        return compare(res.groups, []);
      });

      it("totals for cumulative", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum }, cumulative: true }
          ]
        };

        const data = { 
          layer0: [{ x: "t1", y: 1 }, { x: "t2", y: 2 }, { x: "t3", y: 3 }]
        };

        const res = this.compiler.compileData(design, data);
        return compare(res.columns, [
          ["x", "t1", "t2", "t3"],
          ["0", 1, 3, 6]
        ]);
      });

      it("totals for cumulative, including excluded x-values", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum }, cumulative: true }
          ]
        };
        design.layers[0].axes.x = _.extend({}, design.layers[0].axes.x, { excludedValues: ["t1"] });

        const data = { 
          layer0: [{ x: "t1", y: 3 }, { x: "t2", y: 4 }, { x: "t3", y: 5 }]
        };

        const res = this.compiler.compileData(design, data);
        return compare(res.columns, [
          ["x", "t2", "t3"],
          ["0", 7, 12]
        ]);
      });

      it("totals for cumulative with color split missing values", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum, color: this.axisEnum }, cumulative: true }
          ]
        };

        const data = { 
          layer0: [{ x: "t1", y: 3, color: "a" }, { x: "t1", y: 4, color: "b" }, { x: "t2", y: 8, color: "a" }]
        };

        const res = this.compiler.compileData(design, data);
        return compare(res.columns, [
          ["x", "t1", "t2"],
          ["0:a", 3, 11],
          ["0:b", 4, 4]
        ]);
      });

      it("percentages for proportional", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum, color: this.axisEnum } }
          ],
          stacked: true,
          proportional: true
        };

        const data = { 
          layer0: [
            { x: "t1", y: 10, color: "a" },
            { x: "t1", y: 30, color: "b" },
            { x: "t2", y: 20, color: "a" }
          ]
        };

        const res = this.compiler.compileData(design, data);

        compare(res.groups, [
          ["0:a", "0:b"]
          ]);

        return compare(res.columns, [
          ["x", "t1", "t2"],
          ["0:a", 25, 100],
          ["0:b", 75, null]
          ]);
      });

      it("colors based on color map", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum, color: this.axisEnum } }
          ]
        };

        design.layers[0].axes.color.colorMap = [
          { value: "b", color: "green" }
        ];

        const data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }]
        };

        const res = this.compiler.compileData(design, data);
        return compare(res.colors, {
          "0:b": "green"
          });
      });          

      it("colors based on color map defaulting to series", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisText, y: this.axisNumberSum, color: this.axisEnum } }
          ]
        };

        design.layers[0].color = "red";
        design.layers[0].axes.color.colorMap = [
          { value: "b", color: "green" }
        ];

        const data = { 
          layer0: [{ x: "t1", y: 11, color: "a" }, { x: "t2", y: 12, color: "b" }]
        };

        const res = this.compiler.compileData(design, data);
        
        return compare(res.colors, {
          "0:a": "red",
          "0:b": "green"
          });
      });          

      // x axis as number (integer) no longer supported without binning
      // describe "x axis range", ->
      //   describe "number", ->
      //     before ->
      //       @design = {
      //         type: "bar"
      //         layers: [
      //           { table: "t1", axes: { x: @axisNumber, y: @axisNumberSum }, color: "red" }
      //           { table: "t1", axes: { x: @axisNumber, y: @axisNumberSum }, name: "#2" }
      //         ]
      //       }

      //       @data = { 
      //         layer0: [{ x: 1, y: 11 }]
      //         layer1: [{ x: 3, y: 13 }, { x: 4, y: 14 }]
      //       }

      //       @res = @compiler.compileData(@design, @data)

      //     it "sets types to bar", -> 
      //       compare(@res.types, {
      //         "0": "bar"
      //         "1": "bar"})

      //     it "makes columns with y values with common x axis", ->
      //       compare(@res.columns, [
      //         ["x", "1", "2", "3", "4"]
      //         ["0", 11, null, null, null]
      //         ["1", null, null, 13, 14]
      //         ])

      //     it "maps back to rows", ->
      //       compare(@res.dataMap, {
      //         "0:0": { layerIndex: 0, row: @data.layer0[0] }
      //         "1:2": { layerIndex: 1, row: @data.layer1[0] }
      //         "1:3": { layerIndex: 1, row: @data.layer1[1] }
      //         })

      //     it "uses series color", ->
      //       compare(@res.colors, { "0": "red" })

      //     it "sets xs to common axis", ->
      //       compare(@res.xs, {
      //         "0": "x"
      //         "1": "x"
      //         })

      //     it "names", ->
      //       compare(@res.names, {
      //         "0": "Series 1"
      //         "1": "#2"
      //         })

      //     it "colors based on color map"

      //     it "sets x axis type to category", ->
      //       assert.equal @res.xAxisType, "category"

      it("fills out range types"); // year, date, month, yearmonth, number
      it("supports enum types"); // enum, boolean, bins ??
      it("supports text type"); // text

      it("supports enumset x axis", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisEnumset, y: this.axisNumberSum } }
          ]
        };

        const data = { 
          layer0: [
            { x: ["a", "b"], y: 10 },
            { x: ["b"], y: 8 }
          ]
        };

        const res = this.compiler.compileData(design, data);

        return compare(res.columns, [
          ["x", "A", "B", "None"],
          ["0", 10, 18, null] // Totals
          ]);
      });

      return it("supports enumset x axis with JSON encoded x", function() {
        const design = {
          type: "bar",
          layers: [
            { table: "t1", axes: { x: this.axisEnumset, y: this.axisNumberSum } }
          ]
        };

        const data = { 
          layer0: [
            { x: JSON.stringify(["a", "b"]), y: 10 },
            { x: JSON.stringify(["b"]), y: 8 }
          ]
        };

        const res = this.compiler.compileData(design, data);

        return compare(res.columns, [
          ["x", "A", "B", "None"],
          ["0", 10, 18, null] // Totals
          ]);
      });
    });
  });

      // describe "enum x axis" 
      // describe "text x axis"

  return describe("createScope", function() {
    it("creates x filter", function() {
      const design = {
        type: "line",
        layers: [
          { axes: { x: this.axisNumber, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const row = { x: 1, y: 10 };
      const scope = this.compiler.createScope(design, 0, row);

      const expectedFilter = {
        table: "t1",
        jsonql: {
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "number" },
            { type: "literal", value: 1 }
          ]
        }
      };

      compare(scope.filter, expectedFilter);
      compare(scope.data, { layerIndex: 0, x: 1 });
      return compare(scope.name, "T1 Number is 1");
    });

    it("creates x-color filter", function() {
      const design = {
        type: "bar",
        layers: [
          { axes: { x: this.axisText, color: this.axisEnum, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const row = { x: "1", color: "b", y: 20 };
      const scope = this.compiler.createScope(design, 0, row);

      const expectedFilter = {
        table: "t1",
        jsonql: {
          type: "op",
          op: "and",
          exprs: [
            {
              type: "op",
              op: "=",
              exprs: [
                { type: "field", tableAlias: "{alias}", column: "text" },
                { type: "literal", value: "1" }
              ]
            },
            {
              type: "op",
              op: "=",
              exprs: [
                { type: "field", tableAlias: "{alias}", column: "enum" },
                { type: "literal", value: "b" }
              ]
            }
          ]
        }
      };

      compare(scope.filter, expectedFilter);
      compare(scope.data, { layerIndex: 0, x: "1", color: "b" });
      return compare(scope.name, "T1 Text is 1 and Enum is B");
    });

    it("creates color filter", function() {
      const design = {
        type: "pie",
        layers: [
          { axes: { color: this.axisEnum, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const row = { color: "b", y: 20 };
      const scope = this.compiler.createScope(design, 0, row);

      const expectedFilter = {
        table: "t1",
        jsonql: {
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" },
            { type: "literal", value: "b" }
          ]
        }
      };

      compare(scope.filter, expectedFilter);
      compare(scope.data, { layerIndex: 0, color: "b" });
      return compare(scope.name, "T1 Enum is B");
    });

    it("creates null color filter", function() {
      const design = {
        type: "pie",
        layers: [
          { axes: { color: this.axisEnum, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const row = { color: null, y: 20 };
      const scope = this.compiler.createScope(design, 0, row);

      const expectedFilter =  {
        table: "t1",
        jsonql: {
          type: "op",
          op: "is null",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" }
          ]
        }
      };

      compare(scope.filter, expectedFilter);
      compare(scope.data, { layerIndex: 0, color: null });
      return compare(scope.name, "T1 Enum is None");
    });

    return it("creates x filter when enumset which is expanded to enum", function() {
      const design = {
        type: "bar",
        layers: [
          { axes: { x: this.axisEnumset, y: this.axisNumberSum }, table: "t1" }
        ]
      };

      const row = { x: "a", y: 10 };
      const scope = this.compiler.createScope(design, 0, row);

      const expectedFilter = {
        table: "t1",
        jsonql: {
          type: "op",
          op: "@>",
          exprs: [
            { type: "op", op: "::jsonb", exprs: [{ type: "field", tableAlias: "{alias}", column: "enumset" }] },
            { type: "op", op: "::jsonb", exprs: ["\"a\""] }
          ]
        }
      };

      compare(scope.filter, expectedFilter);
      compare(scope.data, { layerIndex: 0, x: "a" });
      return compare(scope.name, "T1 Enumset includes A");
    });
  });
});
