assert = require('chai').assert

WidgetScoper = require '../src/WidgetScoper'

describe "WidgetScoper", ->
  it "applies scope to scoped widget", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", { data: "scope1", filter: "filter1" })
    assert.deepEqual scoper.getScope("a"), { data: "scope1", filter: "filter1" }
    assert not scoper.getScope("b")

  it "applies filters to other widgets", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", { data: "scope1", filter: "filter1" })
    assert.deepEqual scoper.getFilters("a"), []
    assert.deepEqual scoper.getFilters("b"), ["filter1"]

  it "does not apply null filters to other widgets", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", { data: "scope1", filter: null })
    assert.deepEqual scoper.getFilters("a"), []
    assert.deepEqual scoper.getFilters("b"), []

  it "clears scope and filter", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", { data: "scope1", filter: "filter1" })
    scoper = scoper.reset()
    assert not scoper.getScope("a")
    assert.deepEqual scoper.getFilters("b"), []
