_ = require 'lodash'
assert = require('chai').assert
Schema = require '../src/Schema'
SchemaBuilder = require '../src/systems/mwater/SchemaBuilder'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected) or JSON.stringify(actual) == JSON.stringify(expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

describe "SchemaBuilder", ->
  describe "addForm", ->
    it "adds form as table", ->
      # Create form
      form = {
        _id: "formid"
        design: {
          _type: "Form"
          name: { en: "Form" }
          contents: []
        }
      }

      # Add to blank schema
      schema = new Schema()
      schemaBuilder = new SchemaBuilder(schema)
      schemaBuilder.addForm(form)

      table = schema.getTable("form:formid")

      compare(table.id, "form:formid")
      compare(table.name, "Form")
      compare(table.jsonql, { 
        type: "query" 
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "responses", column: "data" }, alias: "data" }
          { type: "select", expr: { type: "field", tableAlias: "responses", column: "deployment" }, alias: "deployment" }
          { type: "select", expr: { type: "field", tableAlias: "responses", column: "submittedOn" }, alias: "submittedOn" }
        ]
        from: { type: "table", table: "responses", alias: "responses" }
        where: { 
          type: "op", 
          op: "=",
          exprs: [
            { type: "field", tableAlias: "responses", column: "form" }
            "formid"
          ]
        }
      })

    it "adds structure", ->
      # Create form
      form = {
        _id: "formid"
        design: {
          _type: "Form"
          name: { en: "Form" }
          contents: [
            {
              _type: "Section"
              name: { en: "Section X" }
              contents: [
                {
                  _id: "questionid"
                  _type: "TextQuestion"
                  text: { _base: "en", en: "Question" } 
                  conditions: []
                }              
              ]
            }
          ]
        }
      }

      # Add to blank schema
      schema = new Schema()
      schemaBuilder = new SchemaBuilder(schema)
      schemaBuilder.addForm(form)

      compare(schema.getTable("form:formid").structure, [
        { 
          type: "section", 
          name: "Section X"
          contents: [
            { type: "column", column: "data:questionid:value" }
          ]
        }
      ])

    describe "Answer types", ->
      before ->
        @testQuestion = (questionOptions, expectedColumns) ->
          # Create question
          question = {
            _id: "questionid"
            text: { _base: "en", en: "Question" } 
            conditions: []
          }
          _.extend(question, questionOptions)

          # Create form
          form = {
            _id: "formid"
            design: {
              _type: "Form"
              name: { en: "Form" }
              contents: [question]
            }
          }

          # Add to blank schema
          schema = new Schema()
          schemaBuilder = new SchemaBuilder(schema)
          schemaBuilder.addForm(form)

          # Get column
          for expectedColumn in expectedColumns
            column = schema.getColumn("form:formid", expectedColumn.id)
  
            # Compare specified keys to expected
            for key, value of expectedColumn
              compare(column[key], value)

      it "text", ->
        @testQuestion({ _type: "TextQuestion" }, [
          { 
            id: "data:questionid:value" 
            type: "text"
            # data#>>'{questionid,value}'
            jsonql: { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
          }
        ])

      it "number", ->
        @testQuestion({ _type: "NumberQuestion", decimal: false }, [
          { 
            id: "data:questionid:value" 
            type: "integer"
            # data#>>'{questionid,value}'::integer'
            jsonql: {
              type: "op"
              op: "::integer"
              exprs: [
                { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
              ]
            }
          }
        ])

        @testQuestion({ _type: "NumberQuestion", decimal: true }, [
          { 
            id: "data:questionid:value" 
            type: "decimal"
            # data#>>'{questionid,value}'::integer'
            jsonql: {
              type: "op"
              op: "::decimal"
              exprs: [
                { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
              ]
            }
          }
        ])

      it "choice", ->
        @testQuestion({ 
          _type: "RadioQuestion",  
          choices: [
            { id: "yes", label: { _base:"en", en: "Yes"}}
            { id: "no", label: { _base:"en", en: "No"}}
          ]
         }, [
          { 
            id: "data:questionid:value"
            type: "enum"
            # data#>>'{questionid,value}''
            jsonql: { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
            values: [
              { id: "yes", name: "Yes" }
              { id: "no", name: "No" }
            ]
          }
        ])

      it "choices", ->
        @testQuestion({ 
          _type: "MulticheckQuestion",  
          choices: [
            { id: "yes", label: { _base:"en", en: "Yes"}}
            { id: "no", label: { _base:"en", en: "No"}}
          ]
         }, [
          { 
            id: "data:questionid:value:yes"
            type: "boolean"
            name: "Question: Yes"
            # data#>>'{questionid,value}' link '%"id here"%'
            jsonql: {
              type: "op"
              op: "like"
              exprs: [
                { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
                '%"yes"%'
              ]
            }
          }
          { 
            id: "data:questionid:value:no"
            type: "boolean"
            name: "Question: No"
            # data#>>'{questionid,value}' like '%"id here"%'
            jsonql: {
              type: "op"
              op: "like"
              exprs: [
                { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
                '%"no"%'
              ]
            }
          }
        ])

      it "date", ->
        # Take as datetime, padding out to date minimum
        @testQuestion({ 
          _type: "DateQuestion",  
          format: "YYYY-MM"
         }, [
          { 
            id: "data:questionid:value"
            type: "date"
            # substr(rpad(data#>>'{questionid,value}',10, '-01-01'), 1, 10)
            jsonql: {
              type: "op"
              op: "substr"
              exprs: [
                {
                  type: "op"
                  op: "rpad"
                  exprs: [
                    { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
                    10
                    "-01-01"
                  ]
                }
                1
                10
              ]
            }
          }
        ])

      it "datetime"
        
      it "units integer with multiple", ->
        @testQuestion({ 
          _type: "UnitsQuestion",  
          decimal: false
          units: [
            { id: "m", label: { _base:"en", en: "M"}}
            { id: "ft", label: { _base:"en", en: "Ft"}}
          ]
         }, [
          { 
            id: "data:questionid:value:quantity"
            type: "integer"
            name: "Question (magnitude)"
            # data#>>'{questionid,value,quantity}::integer
            jsonql: {
              type: "op"
              op: "::integer"
              exprs: [
                { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value,quantity}"] }
              ]
            }
          }
          { 
            id: "data:questionid:value:units"
            type: "enum"
            name: "Question (units)"
            # data#>>'{questionid,value,units}'
            jsonql: { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value,units}"] }
            values: [
              { id: "m", name: "M" }
              { id: "ft", name: "Ft" }
            ]
          }
        ])

      it "units decimal with single", ->
        @testQuestion({ 
          _type: "UnitsQuestion",  
          decimal: true
          units: [
            { id: "m", label: { _base:"en", en: "M"}}
          ]
         }, [
          { 
            id: "data:questionid:value:quantity"
            type: "decimal"
            name: "Question (M)"
            # data#>>'{questionid,value,quantity}::decimal
            jsonql: {
              type: "op"
              op: "::decimal"
              exprs: [
                { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value,quantity}"] }
              ]
            }
          }
        ])

      it "boolean", ->
        @testQuestion({ _type: "CheckQuestion" }, [
          { 
            id: "data:questionid:value" 
            type: "boolean"
            # data#>>'{questionid,value}'
            jsonql: {
              type: "op"
              op: "::boolean"
              exprs: [
                { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
              ]
            }
          }
        ])

      it "location", ->
        @testQuestion({ _type: "LocationQuestion" }, [
          { 
            id: "data:questionid:value" 
            type: "geometry"
            # ST_SetSRID(ST_MakePoint(data#>>'{questionid,value,latitude}'::decimal, data#>>'{questionid,value,longitude}'::decimal),4326)
            jsonql: {
              type: "op"
              op: "ST_SetSRID"
              exprs: [
                {
                  type: "op"
                  op: "ST_MakePoint"
                  exprs: [
                    {
                      type: "op"
                      op: "::decimal"
                      exprs: [
                        { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value,latitude}"] }
                      ]
                    }
                    {
                      type: "op"
                      op: "::decimal"
                      exprs: [
                        { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value,longitude}"] }
                      ]
                    }
                  ]
                }
                4326
              ]
            }
          }
        ])

      it "entity", ->
        @testQuestion({ 
          _type: "EntityQuestion" 
          entityType: "water_point"
        }, [
          { 
            id: "data:questionid:value" 
            type: "join"
            # data#>>'{questionid,value}'
            join: {
              fromTable: "responses"
              fromColumn: { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
              toTable: "entities.water_point"
              toColumn: "_id"
              op: "="
              multiple: true
            }
          }
        ])

      it "site", ->
        @testQuestion({ 
          _type: "SiteQuestion" 
          # Only takes first
          siteTypes: ["Water point", "Sanitation facility"]
        }, [
          { 
            id: "data:questionid:value" 
            type: "join"
            # data#>>'{questionid,value,code}'
            join: {
              fromTable: "responses"
              fromColumn: { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value,code}"] }
              toTable: "entities.water_point"
              toColumn: "code"
              op: "="
              multiple: true
            }
          }
        ])

      # it "image", ->
      # it "images", ->
      # it "texts", ->