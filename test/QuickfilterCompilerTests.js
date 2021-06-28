// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from 'chai';
import * as fixtures from './fixtures';
import _ from 'lodash';
import QuickfilterCompiler from '../src/quickfilter/QuickfilterCompiler';
import canonical from 'canonical-json';

function compare(actual, expected) {
  return assert.equal(canonical(actual), canonical(expected));
}

describe("QuickfilterCompiler", function() {
  before(function() {
    this.schema = fixtures.simpleSchema();
    return this.qc = new QuickfilterCompiler(this.schema);
  });

  it("compiles enum filter", function() {
    const filters = this.qc.compile([{ expr: { type: "field", table: "t1", column: "enum"}, label: "Enum" }], ["a"]);
    return compare(filters, [
      { 
        table: "t1",
        jsonql: { 
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" },
            { type: "literal", value: "a" }
          ]
        }
      }
      ]);
  });

  it("compiles enumset filter", function() {
    const filters = this.qc.compile([{ expr: { type: "field", table: "t1", column: "enumset"}, label: "Enumset" }], ["a"]);
    return compare(filters, [
      { 
        table: "t1",
        jsonql: { 
          type: "op",
          op: "@>",
          exprs: [
            { type: "op", op: "to_jsonb", exprs: [{ type: "field", tableAlias: "{alias}", column: "enumset" }] },
            { type: "op", op: "::jsonb", exprs: [{ type: "literal", value: '["a"]' }] }
          ]
        }        
      }
    ]);
  });

  it("compiles multi filter", function() {
    const filters = this.qc.compile([{ expr: { type: "field", table: "t1", column: "enum"}, label: "Enum", multi: true }], [["a"]]);
    return compare(filters, [
      { 
        table: "t1",
        jsonql: { 
          type: "op",
          op: "=",
          modifier: "any",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" },
            { type: "literal", value: ["a"] }
          ]
        }
      }
      ]);
  });

  it("compiles enumset multi filter", function() {
    const filters = this.qc.compile([{ expr: { type: "field", table: "t1", column: "enumset"}, label: "Enumset", multi: true }], [["a"]]);
    return compare(filters, [
      { 
        table: "t1",
        jsonql: {
          type: "scalar",
          expr: { type: "op", op: "bool_or", exprs: [{ type: "field", tableAlias: "elements", column: "value" }] },
          from: { 
            type: "subquery",
            alias: "elements",
            query: {
              type: "query",
              selects: [
                { 
                  type: "select", 
                  expr: { type: "op", op: "@>", exprs: [
                    { type: "op", op: "to_jsonb", exprs: [{ type: "field", tableAlias: "{alias}", column: "enumset" }] },
                    { type: "op", op: "jsonb_array_elements", exprs: [{ type: "op", op: "::jsonb", exprs: [{ type: "literal", value: '["a"]' }]}] }
                  ]}, 
                  alias: "value" 
                }
              ]
            }
          }
        }
      }
    ]);
  });

  it("compiles filter with locks", function() {
    const filters = this.qc.compile([{ expr: { type: "field", table: "t1", column: "enum" }, label: "Enum" }], ["a"], [{ expr: { type: "field", table: "t1", column: "enum"}, value: "b" }]);
    return compare(filters, [
      { 
        table: "t1",
        jsonql: { 
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "enum" },
            { type: "literal", value: "b" }
          ]
        }
      }
      ]);
  });

  return it("ignores null values");
});