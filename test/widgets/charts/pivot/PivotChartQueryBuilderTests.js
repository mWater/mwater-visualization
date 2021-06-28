import { assert } from 'chai';
import fixtures from '../../../fixtures';
import _ from 'lodash';
import PivotChartQueryBuilder from '../../../../src/widgets/charts/pivot/PivotChartQueryBuilder';
import canonical from 'canonical-json';
const compare = (actual, expected) => assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n");

describe("PivotChartQueryBuilder", function() {
  before(function() {
    this.qb = new PivotChartQueryBuilder({schema: fixtures.simpleSchema()});
    this.exprBoolean = { type: "field", table: "t1", column: "boolean" };
    this.exprNumber = { type: "field", table: "t1", column: "number" };
    this.exprText = { type: "field", table: "t1", column: "text" };
    this.exprEnum = { type: "field", table: "t1", column: "enum" };
    this.exprNumberSum = { type: "op", op: "sum", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }] };

    this.axisNumber = { expr: this.exprNumber };
    this.axisNumberSum = { expr: this.exprNumberSum };
    this.axisCount = { expr: { type: "op", op: "count", table: "t1", exprs: [] } };
    this.axisEnum = { expr: this.exprEnum }; 
    return this.axisText = { expr: this.exprText };}); 

  it("creates single query", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum
        }
      }
    };

    const queries = this.qb.createQueries(design);
    assert.equal(_.values(queries).length, 1, "Should have single query");

    const query = queries["r1:c1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" },
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      limit: 10000,
      groupBy: [1, 2]
    });
});

  it("creates nested query");

  it("adds filters query", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum, filter: this.exprBoolean }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum
        }
      }
    };

    const queries = this.qb.createQueries(design);
    assert.equal(_.values(queries).length, 1, "Should have single query");

    const query = queries["r1:c1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" },
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      where: { type: "field", tableAlias: "main", column: "boolean" },
      limit: 10000,
      groupBy: [1, 2]
    });
});

  it("adds double filtered query", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum, filter: this.exprBoolean }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum,
          filter: { type: "literal", valueType: "boolean", value: true }
        }
      }
    };

    const queries = this.qb.createQueries(design);
    assert.equal(_.values(queries).length, 1, "Should have single query");

    const query = queries["r1:c1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" },
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      where: {
        type: "op",
        op: "and",
        exprs: [
          { type: "field", tableAlias: "main", column: "boolean" },
          { type: "literal", value: true }
        ]
      },
      limit: 10000,
      groupBy: [1, 2]
    });
});

  it("adds background color axis", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum,
          backgroundColorAxis: this.axisCount
        }
      }
    };

    const queries = this.qb.createQueries(design);
    assert.equal(_.values(queries).length, 1, "Should have single query");

    const query = queries["r1:c1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" },
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" },
        { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "bc" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      limit: 10000,
      groupBy: [1, 2]
    });
});

  it("adds background color conditions", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum,
          backgroundColorConditions: [
            { condition: { type: "op", op: ">", table: "t1", exprs: [this.exprNumberSum, { type: "literal", valueType: "number", value: 5 }]}, color: "red" }
          ]
        }
      }
    };

    const queries = this.qb.createQueries(design);
    assert.equal(_.values(queries).length, 1, "Should have single query");

    const query = queries["r1:c1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "r0" },
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "value" },
        { 
          type: "select",
          expr: { 
            type: "op",
            op: ">",
            exprs: [
              { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] },
              { type: "literal", value: 5 }
            ]
          },
          alias: "bcc0" 
        }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      limit: 10000,
      groupBy: [1, 2]
    });
});

  it("creates ordered single query", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum, orderExpr: this.exprNumberSum, orderDir: "desc" }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum
        }
      }
    };

    const queries = this.qb.createQueries(design);

    const query = queries["r1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "value" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      where: { type: "op", op: "or", exprs: [{ type: "literal", value: true }] },
      groupBy: [1],
      orderBy: [{ expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, direction: "desc" }]
    });
});


  it("creates ordered single query which includes filters", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum, orderExpr: this.exprNumberSum, orderDir: "desc", filter: this.exprBoolean }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum,
          filter: { type: "literal", valueType: "boolean", value: true }
        }
      }
    };

    const queries = this.qb.createQueries(design);

    const query = queries["r1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "value" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      where: {
        type: "op",
        op: "and",
        exprs: [
          { type: "field", tableAlias: "main", column: "boolean" },
          {
            type: "op",
            op: "or",
            exprs: [
              { type: "literal", value: true }
            ]
          }
        ]
      },
      groupBy: [1],
      orderBy: [{ expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, direction: "desc" }]
    });
});

  return it("creates ordered single query with extraFilters", function() {
    const design = {
      table: "t1",
      rows: [
        { id: "r1", valueAxis: this.axisEnum, orderExpr: this.exprNumberSum, orderDir: "desc" }
      ],
      columns: [
        { id: "c1", valueAxis: this.axisText }
      ],
      intersections: {
        "r1:c1": {
          valueAxis: this.axisNumberSum
        }
      }
    };

    const queries = this.qb.createQueries(design, [{ table: "t1", jsonql: { type: "literal", value: false }}, { table: "t2", jsonql: { type: "literal", value: true }}]);

    const query = queries["r1"];
    return compare(query, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "main", column: "enum" }, alias: "value" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      where: { type: "op", op: "and", exprs: [
        { type: "op", op: "or", exprs: [{ type: "literal", value: true }] },
        { type: "literal", value: false }
      ]},
      groupBy: [1],
      orderBy: [{ expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, direction: "desc" }]
    });
});
});
