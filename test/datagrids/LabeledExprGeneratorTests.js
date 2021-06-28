import _ from 'lodash';
import { assert } from 'chai';
import fixtures from '../fixtures';
import LabeledExprGenerator from '../../src/datagrids/LabeledExprGenerator';
import canonical from 'canonical-json';

const compare = (actual, expected) => assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n");

describe("LabeledExprGenerator", function() {
  before(function() {
    this.schema = fixtures.simpleSchema();
    return this.labeledExprGenerator = new LabeledExprGenerator(this.schema);
  });

  it("creates basic list", function() {
    const les = this.labeledExprGenerator.generate("t1", {});

    // Make equivalent list
    const expectedLes = [];
    for (let column of this.schema.getColumns("t1")) {
      if (column.type !== "join") {
        expectedLes.push({ expr: { type: "field", table: "t1", column: column.id }, label: column.name.en, joins: [] });
      }
    }

    return compare(les, expectedLes);
  });

  it("includes cascading ref columns", function() {
    let column;
    const schema = fixtures.cascadingRefSchema();
    const labeledExprGenerator = new LabeledExprGenerator(schema);

    const les = labeledExprGenerator.generate("t2");
    // Make equivalent list
    const expectedLes = [];
    for (column of schema.getColumns("t2")) {
      if (column.type !== "join") {
        expectedLes.push({ expr: { type: "field", table: "t2", column: column.id }, label: column.name.en, joins: [] });
      }
    }
    
    for (column of schema.getColumns("custom.ts15.t0")) {
      if (column.id[0] === "c") {
        expectedLes.push({ expr: {table: "t2", type: "scalar", joins: ["2-1"], expr : { type: "field", table: "custom.ts15.t0", column: column.id }}, label: `T2->T1 > ${column.name.en}`, joins: [] });
      }
    }
    
    return compare(les, expectedLes);
  });

  it("includes 1-n joins", function() {
    let column;
    const les = this.labeledExprGenerator.generate("t1", { multipleJoinCondition() { return true; } });

    // Make equivalent list
    const expectedLes = [];
    for (column of this.schema.getColumns("t1")) {
      if (column.type !== "join") {
        expectedLes.push({ expr: { type: "field", table: "t1", column: column.id }, label: column.name.en, joins: [] });
      }
    }

    // Add t2
    for (column of this.schema.getColumns("t2")) {
      if (column.type !== "join") {
        expectedLes.push({ expr: { type: "field", table: "t2", column: column.id }, label: column.name.en, joins: ["1-2"] });
      }
    }

    return compare(les, expectedLes);
  });

  return it("numbers duplicate named columns", function() {
    // Create t1 with duplicate named column
    let t1 = this.schema.getTable("t1");
    t1 = _.cloneDeep(t1);
    t1.contents.push({ id: "text2", name: { en: "Text" }, type: "text" });
    const schema = this.schema.addTable(t1);

    const les = new LabeledExprGenerator(schema).generate("t1", { numberDuplicatesLabels: true });

    // Make equivalent list
    const expectedLes = [];
    for (let column of schema.getColumns("t1")) {
      if (column.type !== "join") {
        expectedLes.push({ expr: { type: "field", table: "t1", column: column.id }, label: column.name.en, joins: [] });
      }
    }

    expectedLes[0].label = "Text (1)";
    _.last(expectedLes).label = "Text (2)";

    return compare(les, expectedLes);
  });
});

