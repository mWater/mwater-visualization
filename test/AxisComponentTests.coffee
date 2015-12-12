assert = require('chai').assert
_ = require 'lodash'
React = require 'react'
R = React.createElement
AxisComponent = require '../src/axes/AxisComponent'
TestComponent = require './TestComponent'
fixtures = require './fixtures'

describe "AxisComponent", ->
  it "computes min and max for bin expressions", (done) ->
    queried = false

    dataSource = {
      performQuery: (query, cb) =>
        # TODO Check query
        cb(null, [{ min: 2, max: 8 }])
    }
    comp = new TestComponent(R(AxisComponent, {
      editorTitle: ""
      schema: fixtures.simpleSchema()
      dataSource: dataSource
      table: "t1"
      aggrNeed: 'none'
      value: { expr: { type: "field", table: "t1", column: "number" }, xform: { type: "bin", numBins: 10 }}
      onChange: (val) =>
        assert.equal val.xform.min, 2
        assert.equal val.xform.max, 8
        done()
      }))


