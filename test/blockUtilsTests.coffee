_ = require 'lodash'
assert = require('chai').assert
canonical = require 'canonical-json'

blockUtils = require '../src/blocks/blockUtils'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "blockUtils", ->
  it "removes nested block", ->
    design = {
      id: "root"
      type: "root"
      design: {
        blocks: [
          { id: "a", type: "a" }
          { id: "b", type: "b" }
          { id: "c", type: "horizontal", design: { blocks: [{ id: "d", type: "d" }, { id: "e", type: "e" }]} }
        ]
      }
    }

    newDesign = blockUtils.removeBlock(design, { id: "d", type: "d" })
    compare(newDesign, {
      id: "root"
      type: "root"
      design: {
        blocks: [
          { id: "a", type: "a" }
          { id: "b", type: "b" }
          { id: "c", type: "horizontal", design: { blocks: [{ id: "e", type: "e" }]} }
        ]
      }
    })

  it "removes empty horizontal", ->
    design = {
      id: "root"
      type: "root"
      design: {
        blocks: [
          { id: "a", type: "a" }
          { id: "b", type: "b" }
          { id: "c", type: "horizontal", design: { blocks: [{ id: "d", type: "d" }]} }
        ]
      }
    }

    newDesign = blockUtils.removeBlock(design, { id: "d", type: "d" })
    compare(newDesign, {
      id: "root"
      type: "root"
      design: {
        blocks: [
          { id: "a", type: "a" }
          { id: "b", type: "b" }
        ]
      }
    })


  it "removes empty vertical"

  describe "in vertical", ->
    before ->
      @design = {
        id: "root"
        type: "root"
        design: {
          blocks: [
            { id: "a", type: "a" }
            { id: "b", type: "b" }
          ]
        }
      }

    it "adds left", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "left")

      compare(newDesign.design.blocks[0].type, "horizontal")
      compare(newDesign.design.blocks[0].design.blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
      ])

    it "adds right", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "right")

      compare(newDesign.design.blocks[0].type, "horizontal")
      compare(newDesign.design.blocks[0].design.blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
      ])

    it "adds top", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "top")

      compare(newDesign.design.blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
        { id: "b", type: "b" }
      ])

    it "adds bottom", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "bottom")

      compare(newDesign.design.blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
        { id: "b", type: "b" }
      ])

  describe "in horizontal", ->
    before ->
      @design = {
        id: "horizontal"
        type: "horizontal"
        design: {
          blocks: [
            { id: "a", type: "a" }
            { id: "b", type: "b" }
          ]
        }
      }

    it "adds top", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "top")

      compare(newDesign.design.blocks[0].type, "vertical")
      compare(newDesign.design.blocks[0].design.blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
      ])

    it "adds bottom", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "bottom")

      compare(newDesign.design.blocks[0].type, "vertical")
      compare(newDesign.design.blocks[0].design.blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
      ])

    it "adds left", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "left")

      compare(newDesign.design.blocks, [
        { id: "new", type: "new" }
        { id: "a", type: "a" }
        { id: "b", type: "b" }
      ])

    it "adds right", ->
      newDesign = blockUtils.dropBlock(@design, { id: "new", type: "new" }, @design.design.blocks[0], "right")

      compare(newDesign.design.blocks, [
        { id: "a", type: "a" }
        { id: "new", type: "new" }
        { id: "b", type: "b" }
      ])
