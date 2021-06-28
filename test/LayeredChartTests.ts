// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from 'lodash';
import { assert } from 'chai';
import * as fixtures from './fixtures';
import LayeredChart from '../src/widgets/charts/layered/LayeredChart';
import canonical from 'canonical-json';

function compare(actual, expected) {
  return assert.equal(
    canonical(actual),
    canonical(expected),
    "\n" + canonical(actual) + "\n" + canonical(expected)
  );
}

describe("LayeredChart", function() {
  before(function() {
    this.schema = fixtures.simpleSchema();
    this.chart = new LayeredChart();

    this.exprNumber = { type: "field", table: "t1", column: "number" };
    this.exprText = { type: "field", table: "t1", column: "text" };
    this.exprDate = { type: "field", table: "t1", column: "date" };
    this.exprEnum = { type: "field", table: "t1", column: "enum" };

    this.axisNumber = { expr: this.exprNumber };
    this.axisNumberSum = { expr: this.exprNumber, aggr: "sum" };
    this.axisEnum = { expr: this.exprEnum }; 
    this.axisEnumset = { expr: this.exprEnumset }; 
    this.axisText = { expr: this.exprText }; 
    return this.axisDate = { expr: this.exprDate };}); 

  return describe("cleanDesign", () => // Removed as was making impossible to choose other than count
  // it "defaults y axis to count", ->
  //   design = {
  //     type: "bar"
  //     layers: [
  //       { axes: { x: @axisEnum, y: null }, table: "t1" }
  //     ]
  //   }
  // 
  //   design = @chart.cleanDesign(design, @schema)
  // 
  //   expectedY = {
  //     expr: { type: "id", table: "t1" }
  //     xform: null
  //     aggr: "count"
  //   }
  // 
  //   compare(design.layers[0].axes.y, expectedY)

  // it "does not default y axis if scatter", ->
  //   design = {
  //     type: "scatter"
  //     layers: [
  //       { axes: { x: @axisEnum, y: null }, table: "t1" }
  //     ]
  //   }

  // it "does not default y axis if scatter", ->
  //   design = {
  //     type: "scatter"
  //     layers: [
  //       { axes: { x: @axisEnum, y: null }, table: "t1" }
  //     ]
  //   }

  //   design = @chart.cleanDesign(design, @schema)

  //   assert not design.layers[0].axes.y

  it("removes aggr from y if scatter", function() {
    let design = {
      type: "scatter",
      layers: [
        { axes: { x: this.axisEnum, y: { expr: { type: "id", table: "t1" }, xform: null, aggr: "count" } }, table: "t1" }
      ]
    };

    design = this.chart.cleanDesign(design, this.schema);

    const expectedY = this.axisNumber;

    return assert(!design.layers[0].axes.y);
  }));
});
