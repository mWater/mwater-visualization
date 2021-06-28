// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { Schema } from 'mwater-expressions';

export function simpleSchema() {
  let schema = new Schema();
  schema = schema.addTable({ id: "t1", name: { en: "T1" }, primaryKey: "primary", contents: [
    { id: "text", name: { en: "Text" }, type: "text" },
    { id: "number", name: { en: "Number" }, type: "number" },
    { id: "enum", name: { en: "Enum" }, type: "enum", enumValues: [{ id: "a", name: "A"}, { id: "b", name: "B"}] },
    { id: "enumset", name: { en: "Enumset" }, type: "enumset", enumValues: [{ id: "a", name: "A"}, { id: "b", name: "B"}] },
    { id: "date", name: { en: "Date" }, type: "date" },
    { id: "datetime", name: { en: "Datetime" }, type: "datetime" },
    { id: "boolean", name: { en: "Boolean" }, type: "boolean" },
    { id: "geometry", name: { en: "Geometry" }, type: "geometry" },
    { id: "text[]", name: { en: "Textarr" }, type: "text[]" },
    { id: "expr", name: { en: "Expr" }, type: "number", expr: { type: "op", op: "+", table: "t1", exprs: [{ type: "field", table: "t1", column: "number" }, { type: "literal", valueType: "number", value: 1 }]}},
    { id: "1-2", name: { en: "T1->T2" }, type: "join", join: { fromColumn: "primary", toTable: "t2", toColumn: "t1", type: "1-n" }}
  ]});

  schema = schema.addTable({ id: "t2", name: { en: "T2" }, primaryKey: "primary", ordering: "number", contents: [
    { id: "t1", name: { en: "T1" }, type: "uuid" },
    { id: "text", name: { en: "Text" }, type: "text" },
    { id: "number", name: { en: "Number" }, type: "number" },
    { id: "2-1", name: { en: "T2->T1" }, type: "join", join: { fromColumn: "t1", toTable: "t1", toColumn: "primary", type: "n-1" }}
  ]});

  return schema;
}

export function cascadingRefSchema() {
  let schema = new Schema();
  schema = schema.addTable({ id: "t2", name: { en: "T2" }, primaryKey: "primary", ordering: "number", contents: [
    { id: "t1", name: { en: "T1" }, type: "uuid" },
    { id: "text", name: { en: "Text" }, type: "text" },
    { id: "number", name: { en: "Number" }, type: "number" },
    { id: "2-1", name: { en: "T2->T1" }, type: "join", join: { fromColumn: "t1", toTable: "custom.ts15.t0", toColumn: "_id", type: "n-1" }}
  ]});
  return schema = schema.addTable({ id: "custom.ts15.t0", name: { _base: "en", en: "Cascading List Ref test 1"}, primaryKey: "_id", contents: [
    { id: "c0", name: { en: "Region", _base: "en"}, type: "enum", enumValues: [
        {
          "id": "ev0",
          "name": {
            "en": "Elmond Akava",
            "_base": "en"
          }
        },
        {
          "id": "ev1",
          "name": {
            "en": "Elmond Denpasar",
            "_base": "en"
          }
        },
        {
          "id": "ev2",
          "name": {
            "en": "Elmond Hellikki",
            "_base": "en"
          }
        },
      ]
    },
    {
      id: "c1", name: { en: "District", _base: "en" }, type: "enum", enumValues: [
        {
          "id": "ev0",
          "name": {
            "en": "Huu Jorva",
            "_base": "en"
          }
        },
        {
          "id": "ev1",
          "name": {
            "en": "Huu Karkaaja",
            "_base": "en"
          }
        },
        {
          "id": "ev2",
          "name": {
            "en": "Huu Mikkola",
            "_base": "en"
          }
        }
      ]
    },
    {
      "id": "c2",
      "name": {
        "en": "Village",
        "_base": "en"
      },
      "type": "enum",
      "enumValues": [
        {
          "id": "ev0",
          "name": {
            "en": "Adela Aleksandria",
            "_base": "en"
          }
        },
        {
          "id": "ev1",
          "name": {
            "en": "Adela Anaksagoras",
            "_base": "en"
          }
        },
        {
          "id": "ev2",
          "name": {
            "en": "Adela Datang",
            "_base": "en"
          }
        }
      ]
    },
    {
      "id": "_created_by",
      "name": {
        "_base": "en",
        "en": "Added by user"
      },
      "desc": {
        "_base": "en",
        "en": "User that added this to the database"
      },
      "type": "id",
      "idTable": "users"
    },
    {
      "id": "_created_on",
      "name": {
        "_base": "en",
        "en": "Date added"
      },
      "desc": {
        "_base": "en",
        "en": "Date that this was added to the database"
      },
      "type": "datetime"
    },
    {
      "id": "_modified_by",
      "name": {
        "_base": "en",
        "en": "Last modified by user"
      },
      "desc": {
        "_base": "en",
        "en": "User that modified this last"
      },
      "type": "id",
      "idTable": "users"
    },
    {
      "id": "_modified_on",
      "name": {
        "_base": "en",
        "en": "Date last modified"
      },
      "desc": {
        "_base": "en",
        "en": "Date that this was last modified"
      },
      "type": "datetime"
    }
  ]});
}