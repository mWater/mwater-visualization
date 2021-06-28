import { assert } from 'chai';
import fixtures from '../../../fixtures';
import _ from 'lodash';
import PivotChart from '../../../../src/widgets/charts/pivot/PivotChart';
import canonical from 'canonical-json';
const compare = (actual, expected) => assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n");

describe("PivotChart", function() {
  before(function() {
    this.schema = fixtures.simpleSchema();

    this.pc = new PivotChart();
    this.exprNumber = { type: "field", table: "t1", column: "number" };
    this.exprText = { type: "field", table: "t1", column: "text" };
    this.exprEnum = { type: "field", table: "t1", column: "enum" };

    this.axisNumber = { expr: this.exprNumber };
    this.axisCount = { expr: { type: "op", op: "count", table: "t1", exprs: [] } };
    this.axisNumberSum = { expr: { type: "op", op: "sum", table: "t1", exprs: [this.exprNumber] }};
    this.axisEnum = { expr: this.exprEnum }; 
    return this.axisText = { expr: this.exprText };}); 

  return describe("cleanDesign", function() {
    it("adds missing intersections as blank", function() {
      let design = {
        table: "t1",
        rows: [{ id: "row1"}],
        columns: [{ id: "col1"}]
      };

      design = this.pc.cleanDesign(design, this.schema);
      return compare(design.intersections, {
        "row1:col1": { }
      });
  });

    return it("removes extra intersections", function() {
      let design = {
        table: "t1",
        rows: [{ id: "row1"}],
        columns: [{ id: "col1"}],
        intersections: {
          "row1:col1": { valueAxis: this.axisNumberSum },
          "rowX:col1": { valueAxis: this.axisNumberSum }
        }
      };

      design = this.pc.cleanDesign(design, this.schema);
      return compare(design.intersections, {
        "row1:col1": { valueAxis: this.axisNumberSum }
      });
  });
});
});      
