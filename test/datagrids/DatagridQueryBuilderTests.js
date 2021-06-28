import _ from 'lodash';
import { assert } from 'chai';
import fixtures from '../fixtures';
import DatagridQueryBuilder from '../../src/datagrids/DatagridQueryBuilder';
import canonical from 'canonical-json';
import { Schema } from 'mwater-expressions';

const compare = (actual, expected) => assert.equal(canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n");

describe("DatagridQueryBuilder", function() {
  before(function() {
    this.schema = fixtures.simpleSchema();
    this.qb = new DatagridQueryBuilder(this.schema);

    this.exprText = { type: "field", table: "t1", column: "text" };
    return this.exprNumber = { type: "field", table: "t1", column: "number" };});
    // @exprDate = { type: "field", table: "t1", column: "date" }
    // @exprEnum = { type: "field", table: "t1", column: "enum" }
    // @exprInvalid = { type: "field", table: "t1", column: "NONSUCH" }


  it("creates simple query", function() {
    const design = {
      table: "t1",
      columns: [{
        id: "cid1",
        type: "expr",
        expr: this.exprText
      }]
    };

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" },
        // Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        // Orders by primary key for consistency
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s0" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      orderBy: [
        { ordinal: 3, direction: "asc" }
      ],
      limit: null,
      offset: null
    });
});

  it("creates simple query with natural ordering", function() {
    const schemaJson = _.cloneDeep(this.schema.toJSON());
    schemaJson.tables[0].ordering = "number";
    const schema = new Schema(schemaJson);
    const qb = new DatagridQueryBuilder(schema);

    const design = {
      table: "t1",
      columns: [{
        id: "cid1",
        type: "expr",
        expr: this.exprText
      }]
    };

    const jsonql = qb.createQuery(design, { limit: null, offset: null });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" },
        // Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        // Orders by natural order
        { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "s0" },
        // Orders by primary key for consistency
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s1" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      orderBy: [
        { ordinal: 3, direction: "asc" },
        { ordinal: 4, direction: "asc" }
      ],
      limit: null,
      offset: null
    });
});


  it("creates filtered simple query", function() {
    const design = {
      table: "t1",
      columns: [{
        id: "cid1",
        type: "expr",
        expr: this.exprText
      }],
      filter: {
        type: "op",
        op: "=",
        exprs: [
          { type: "field", table: "t1", column: "number" },
          { type: "literal", valueType: "number", value: 1 }
        ]
      }
    };

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" },
        // Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        // Orders by primary key for consistency
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s0" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      where: {
        type: "op",
        op: "=",
        exprs: [
          { type: "field", tableAlias: "main", column: "number" },
          { type: "literal", value: 1 }
        ]
      },
      orderBy: [
        { ordinal: 3, direction: "asc" }
      ],
      limit: null,
      offset: null
    });
});

  it("creates ordered query", function() {
    const design = {
      table: "t1",
      columns: [{
        id: "cid1",
        type: "expr",
        expr: this.exprText
      }],
      orderBys: [
        { expr: this.exprNumber, direction: "desc" }
      ]
    };

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" },
        // Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        // Include order by as column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "number" }, alias: "s0" },
        // Orders by primary key for consistency
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s1" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      orderBy: [
        { ordinal: 3, direction: "desc" },
        { ordinal: 4, direction: "asc" }
      ],
      limit: null,
      offset: null
    });
});

  it("allows aggregate select", function() {
    const design = {
      table: "t1",
      columns: [{
        id: "cid1",
        type: "expr",
        expr: { table: "t1", type: "op", op: "sum", exprs: [this.exprNumber] }
      }]
    };

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes column
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "c0" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      orderBy: [],
      groupBy: [],
      limit: null,
      offset: null
    });
});

  it("allows aggregate select with group by", function() {
    const design = {
      table: "t1",
      columns: [
        {
          id: "cid1",
          type: "expr",
          expr: { table: "t1", type: "op", op: "sum", exprs: [this.exprNumber] }
        },
        {
          id: "cid2",
          type: "expr",
          expr: this.exprText
        }
      ]
    };

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes columns
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "c0" },
        // Includes columns
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c1" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      orderBy: [],
      groupBy: [2],
      limit: null,
      offset: null
    });
});

  it("allows aggregate select with order by grouped", function() {
    const design = {
      table: "t1",
      columns: [
        {
          id: "cid1",
          type: "expr",
          expr: { table: "t1", type: "op", op: "sum", exprs: [this.exprNumber] }
        }
      ],
      orderBys: [
        { expr: this.exprText, direction: "desc" }
      ]
    };

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes columns
        { type: "select", expr: { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "main", column: "number" }] }, alias: "c0" },
        // Includes order
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "s0" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      orderBy: [{ ordinal: 2, direction: "desc" }],
      groupBy: [2],
      limit: null,
      offset: null
    });
});


  it("creates adds extra filter query", function() {
    const design = {
      table: "t1",
      columns: [{
        id: "cid1",
        type: "expr",
        expr: this.exprText
      }]
    };

    const extraFilters = [
      { 
        table: "t1",
        jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "text" }, "hello" ]}
      }
    ];

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null, extraFilters });
    return compare(jsonql, {
      type: "query",
      selects: [
        // Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" },
        // Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        // Orders by primary key for consistency
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s0" }
      ],
      from: { type: "table", table: "t1", alias: "main" },
      where: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "main", column: "text" }, "hello" ]},
      orderBy: [
        { ordinal: 3, direction: "asc" }
      ],
      limit: null,
      offset: null
    });
});

  return it("adds subtable", function() {
    const design = {
      table: "t1",
      subtables: [
        { id: "st1", joins: ["1-2"] }
      ],
      columns: [
        {
          id: "cid1",
          type: "expr",
          expr: this.exprText
        },
        {
          id: "cid2",
          type: "expr",
          subtable: "st1",
          expr: { type: "field", table: "t1", column: "number" }
        }
      ]
    };

    const jsonql = this.qb.createQuery(design, { limit: null, offset: null });

    // Should union all main query and then inner join query. Sorts by main sorts, then subtable id, then subtable sorts
    /*
    select unioned.id as id, unioned.subtable as subtable, unioned.c0 as c0, unioned.c1 as c1
    from
    (
      (
        select main.primary as id, -1 as subtable, main.primary as s0, null::decimal as st0s0, null::text as st0s1,
          main.text as c0, null::decimal as c1
        from t1 as main
      )
      union all
      (
        select main.primary as id, 0 as subtable, main.primary as s0, st.number as st0s0, st.primary as st0s1,
          null::text as c0, st.number as c1
        from t1 as main inner join t2 as st on st.t1 = main.primary
      )
    ) as unioned
    order by unioned.s0 asc, unioned.subtable asc, unioned.st0s0 asc, unioned.st0s1 asc
    */

    const innermain = {
      type: "query",
      selects: [
        // Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" },
        // Includes -1 subtable
        { type: "select", expr: -1, alias: "subtable" },
        // Includes sorts
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s0" },
        { type: "select", expr: { type: "op", op: "::decimal", exprs: [null] }, alias: "st0s0" },
        { type: "select", expr: { type: "op", op: "::text", exprs: [null] }, alias: "st0s1" },
        // Includes column
        { type: "select", expr: { type: "field", tableAlias: "main", column: "text" }, alias: "c0" },
        // Includes subtable column
        { type: "select", expr: { type: "op", op: "::decimal", exprs: [null] }, alias: "c1" }
      ],
      from: { type: "table", table: "t1", alias: "main" }
    };

    const innerst = {
      type: "query",
      selects: [
        // Includes id
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "id" },
        // Includes -1 subtable
        { type: "select", expr: 0, alias: "subtable" },
        // Includes sorts
        { type: "select", expr: { type: "field", tableAlias: "main", column: "primary" }, alias: "s0" },
        { type: "select", expr: { type: "field", tableAlias: "st", column: "number" }, alias: "st0s0" },
        { type: "select", expr: { type: "field", tableAlias: "st", column: "primary" }, alias: "st0s1" },
        // Includes null for parent
        { type: "select", expr: { type: "op", op: "::text", exprs: [null] }, alias: "c0" },
        // Includes subtable column
        { type: "select", expr: { type: "field", tableAlias: "st", column: "number" }, alias: "c1" }
      ],
      from: {
        type: "join",
        kind: "inner",
        left: { type: "table", table: "t1", alias: "main" },
        right: { type: "table", table: "t2", alias: "st" },
        on: {
          type: "op",
          op: "=",
          exprs: [{ type: "field", tableAlias: "st", column: "t1" }, { type: "field", tableAlias: "main", column: "primary" }]
        }
      }
    };

    const unioned = {
      type: "union all",
      queries: [innermain, innerst]
    };

    // Now take the columns and do the sorting
    return compare(jsonql, {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "id" }, alias: "id" },
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "subtable" }, alias: "subtable" },
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "c0" }, alias: "c0" },
        { type: "select", expr: { type: "field", tableAlias: "unioned", column: "c1" }, alias: "c1" }
      ],
      from: {
        type: "subquery",
        query: unioned,
        alias: "unioned"
      },
      // Orders all sorts, first outer, then subtable, then the subtable sorts
      orderBy: [
        { expr: { type: "field", tableAlias: "unioned", column: "s0" }, direction: "asc" },
        { expr: { type: "field", tableAlias: "unioned", column: "subtable" }, direction: "asc" },
        { expr: { type: "field", tableAlias: "unioned", column: "st0s0" }, direction: "asc" },
        { expr: { type: "field", tableAlias: "unioned", column: "st0s1" }, direction: "asc" }
      ],
      limit: null,
      offset: null
    });
});
});