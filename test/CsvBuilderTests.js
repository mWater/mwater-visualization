import _ from 'lodash';
import { assert } from 'chai';
import fixtures from './fixtures';
import CsvBuilder from '../src/CsvBuilder';
import canonical from 'canonical-json';

const compare = (actual, expected) => assert.equal(canonical(actual), canonical(expected));

describe("CsvBuilder", () => it("handles mixed data types", function() {
  const table = [
    ["a", 1, 4.5],
    [3.2, 4, "b", "x"]
  ];
  const csv = new CsvBuilder().build(table);
  const expectedCsv = "a,1,4.5\r\n3.2,4,b,x";
  return assert.equal(csv, expectedCsv);
}));
