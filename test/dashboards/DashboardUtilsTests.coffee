assert = require('chai').assert
fixtures = require '../fixtures'
_ = require 'lodash'
React = require 'react'
R = React.createElement

DashboardUtils = require '../../src/dashboards/DashboardUtils'

canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected)

describe "DashboardUtils", ->
  before ->
    @schema = fixtures.simpleSchema()

  it "gets filterable tables", ->
    assert.deepEqual DashboardUtils.getFilterableTables(simpleDashboardDesign, @schema), ["t1"]

  it "compiles filters", ->
    design = _.extend({}, simpleDashboardDesign, filters: {
      "t1": { type: "op", op: ">", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }, { type: "literal", value: 4 } ]}
    })
    compiledFilters = DashboardUtils.getCompiledFilters(design, @schema, ["t1"])
    assert.deepEqual compiledFilters, [
      {"table":"t1","jsonql":{"type":"op","op":">","exprs":[{"type":"field","tableAlias":"{alias}","column":"number"},{"type":"literal","value":4}]}}
    ]

  it "compiles global filters", ->
    design = _.extend({}, simpleDashboardDesign, globalFilters: [
      { columnId: "number", columnType: "number", op: ">", exprs: [{ type: "literal", value: 4 }]}
    ])

    compiledFilters = DashboardUtils.getCompiledFilters(design, @schema, ["t1"])
    assert.deepEqual compiledFilters, [
      {"table":"t1","jsonql":{"type":"op","op":">","exprs":[{"type":"field","tableAlias":"{alias}","column":"number"},{"type":"literal","value":4}]}}
    ]

simpleDashboardDesign = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
        "type": "widget",
        "widgetType": "LayeredChart",
        "design": {
          "version": 2,
          "layers": [
            {
              "axes": {
                "x": {
                  "expr": {
                    "type": "field",
                    "table": "t1",
                    "column": "enum"
                  }
                },
                "y": {
                  "expr": {
                    "type": "op",
                    "op": "count",
                    "table": "t1",
                    "exprs": []
                  }
                }
              },
              "filter": null,
              "table": "t1"
            }
          ],
          "header": {
            "style": "header",
            "items": []
          },
          "footer": {
            "style": "footer",
            "items": []
          },
          "type": "bar",
          "labels": true
        },
        "id": "76e204b3-a21f-491e-9e16-353274491b49"
      }
    ]
  },
  "layout": "blocks",
  "style": "greybg",
  "quickfilters": [],
  "popups": [],
  "filters": {},
  "implicitFiltersEnabled": false
}