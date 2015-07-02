assert = require('chai').assert

WidgetScoper = require '../src/WidgetScoper'

describe "WidgetScoper", ->
  it "applies scope to scoped widget", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", "scope1", "filter1")
    assert.deepEqual scoper.getScope("a"), "scope1"
    assert not scoper.getScope("b")

  it "applies filters to other widgets", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", "scope1", "filter1")
    assert.deepEqual scoper.getFilters("a"), []
    assert.deepEqual scoper.getFilters("b"), ["filter1"]

  it "does not apply null filters to other widgets", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", "scope1", null)
    assert.deepEqual scoper.getFilters("a"), []
    assert.deepEqual scoper.getFilters("b"), []

  it "clears scope and filter", ->
    scoper = new WidgetScoper({})
    scoper = scoper.applyScope("a", "scope1", "filter1")
    scoper = scoper.reset()
    assert not scoper.getScope("a"), "scope1"
    assert.deepEqual scoper.getFilters("b"), []
