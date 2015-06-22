assert = require('chai').assert
_ = require 'lodash'
LegoLayoutEngine = require '../src/LegoLayoutEngine'

describe "LegoLayoutEngine", ->
  before ->
    # 6 blocks across, each 10 px
    @le = new LegoLayoutEngine(60, 6)

  it "snaps to grid", ->
    rectLayout = @le.rectToLayout({ x: 11, y: 19, width: 32, height: 42 })
    assert.deepEqual rectLayout, { x: 1, y: 2, w: 3, h: 4 }

  it "shifts existing to right if room", ->
    existing = { x: 1, y: 2, w: 1, h: 1 }
    newOne = { x: 1, y: 2, w: 3, h: 4 }

    layouts = {
      existing: existing
      newOne: newOne
    }

    layouts = @le.performLayout(layouts, "newOne")
    assert.deepEqual layouts, {
      existing: { x: 4, y: 2, w: 1, h: 1 }
      newOne: { x: 1, y: 2, w: 3, h: 4 }
    }

  it "shifts existing to down if no room", ->
    existing = { x: 1, y: 2, w: 5, h: 1 }
    newOne = { x: 1, y: 2, w: 3, h: 4 }

    layouts = {
      existing: existing
      newOne: newOne
    }

    layouts = @le.performLayout(layouts, "newOne")
    assert.deepEqual layouts, {
      existing: { x: 0, y: 6, w: 5, h: 1 }  # Moves to left
      newOne: { x: 1, y: 2, w: 3, h: 4 }
    }
