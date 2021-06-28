// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from 'chai';
import WidgetScoper from '../src/widgets/WidgetScoper';

describe("WidgetScoper", function() {
  it("applies scope to scoped widget", function() {
    let scoper = new WidgetScoper({});
    scoper = scoper.applyScope("a", { data: "scope1", filter: "filter1" });
    assert.deepEqual(scoper.getScope("a"), { data: "scope1", filter: "filter1" });
    return assert(!scoper.getScope("b"));
  });

  it("applies filters to other widgets", function() {
    let scoper = new WidgetScoper({});
    scoper = scoper.applyScope("a", { data: "scope1", filter: "filter1" });
    assert.deepEqual(scoper.getFilters("a"), []);
    return assert.deepEqual(scoper.getFilters("b"), ["filter1"]);
});

  it("does not apply null filters to other widgets", function() {
    let scoper = new WidgetScoper({});
    scoper = scoper.applyScope("a", { data: "scope1", filter: null });
    assert.deepEqual(scoper.getFilters("a"), []);
    return assert.deepEqual(scoper.getFilters("b"), []);
});

  return it("clears scope and filter", function() {
    let scoper = new WidgetScoper({});
    scoper = scoper.applyScope("a", { data: "scope1", filter: "filter1" });
    scoper = scoper.reset();
    assert(!scoper.getScope("a"));
    return assert.deepEqual(scoper.getFilters("b"), []);
});
});
