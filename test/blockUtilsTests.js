_ = require 'lodash'
assert = require('chai').assert
canonical = require 'canonical-json'

blockUtils = require '../src/layouts/blocks/blockUtils'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "blockUtils", ->
  it "updates nested block", ->
    design = {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }, { id: "e", type: "e" }] }
      ]
    }

    newDesign = blockUtils.updateBlock(design, { id: "d", type: "xyz" })
    compare(newDesign, {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "xyz" }, { id: "e", type: "e" }] }
      ]
    })

  it "removes nested block", ->
    design = {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }, { id: "e", type: "e" }] }
      ]
    }

    newDesign = blockUtils.removeBlock(design, { id: "d", type: "d" })
    compare(newDesign, {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "horizontal", blocks: [{ id: "e", type: "e" }] }
      ]
    })

  it "removes empty horizontal", ->
    design = {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }] }
      ]
    }

    newDesign = blockUtils.removeBlock(design, { id: "d", type: "d" })
    compare(newDesign, {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
      ]
    })

  it "simplifies vertical inside root", ->
    design = {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "vertical", blocks: [{ id: "d", type: "d" }, { id: "e", type: "e" }] }
      ]
    }

    newDesign = blockUtils.cleanBlock(design)
    compare(newDesign, {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "d", type: "d" }
        { id: "e", type: "e" }
      ]
    })


  it "removes empty vertical"

  it "simplifies horizontal with one child", ->
    design = {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "horizontal", blocks: [{ id: "d", type: "d" }] }
      ]
    }

    newDesign = blockUtils.cleanBlock(design)
    compare(newDesign, {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "d", type: "d" }
      ]
    })

  it "simplifies vertical with one child", ->
    design = {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "c", type: "vertical", blocks: [{ id: "d", type: "d" }] }
      ]
    }

    newDesign = blockUtils.cleanBlock(design)
    compare(newDesign, {
      id: "root"
      type: "root"
      blocks: [
        { id: "a", type: "a" }
        { id: "b", type: "b" }
        { id: "d", type: "d" }
      ]
    })


  describe "in vertical", ->
    before ->
      @design = {
        id: "root"
        type: "root"
        blocks: [
          { id: "a", type: "a" }
          { id: "b", type: "b" }
        ]
      }

    it "adds left", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "left")

      compare(newDesign.blocks[0].type, "horizontal")
      compare(newDesign.blocks[0].blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
      ])

    it "adds right", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "right")

      compare(newDesign.blocks[0].type, "horizontal")
      compare(newDesign.blocks[0].blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
      ])

    it "adds top", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "top")

      compare(newDesign.blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
        { id: "b", type: "b" }
      ])

    it "adds bottom", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "bottom")

      compare(newDesign.blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
        { id: "b", type: "b" }
      ])

  describe "in horizontal", ->
    before ->
      @design = {
        id: "horizontal"
        type: "horizontal"
        blocks: [
          { id: "a", type: "a" }
          { id: "b", type: "b" }
        ]
      }

    it "adds top", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "top")

      compare(newDesign.blocks[0].type, "vertical")
      compare(newDesign.blocks[0].blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
      ])

    it "adds bottom", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "bottom")

      compare(newDesign.blocks[0].type, "vertical")
      compare(newDesign.blocks[0].blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
      ])

    it "adds left", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "left")

      compare(newDesign.blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
        { id: "b", type: "b" }
      ])

    it "adds right", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.blocks[0], "right")

      compare(newDesign.blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
        { id: "b", type: "b" }
      ])
