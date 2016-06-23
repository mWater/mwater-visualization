assert = require('chai').assert
updt = require '../src/updt'

describe "updt", ->
  it "updates object directly", ->
    assert.deepEqual updt({ a: 3 }, "b", 4), { a: 3, b: 4 }
    assert.deepEqual updt({ a: 3 }, ["b"], 4), { a: 3, b: 4 }

  it "creates callback", ->
    assert.deepEqual updt({ a: 3 }, "b")(4), { a: 3, b: 4 }

  it "runs callback", (done) ->
    cb = (val) ->
      assert.deepEqual val, { a: 3, b: 4 }
      done()

    updt(cb, { a: 3 }, "b", 4)

  it "creates callback", (done) ->
    cb = (val) ->
      assert.deepEqual val, { a: 3, b: 4 }
      done()

    updt(cb, { a: 3 }, "b")(4)

  it "pushes", ->
    assert.deepEqual updt([1], [null], 4), [1,4]
