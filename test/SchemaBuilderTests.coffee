_ = require 'lodash'
assert = require('chai').assert
Schema = require '../src/Schema'
SchemaBuilder = require '../src/systems/mwater/SchemaBuilder'

compare = (actual, expected) ->
  assert _.isEqual(actual, expected) or JSON.stringify(actual) == JSON.stringify(expected), "\n" + JSON.stringify(actual) + "\n" + JSON.stringify(expected)

describe "SchemaBuilder", ->
  describe "addForm", ->
    describe "Answer types", ->
      before ->
        @testQuestion = (questionOptions, expectedColumns) ->
          # Create question
          question = {
            _id: "questionid"
            text: { _base: "en", en: "Title" } 
            conditions: []
          }
          _.extend(question, questionOptions)

          # Create form
          form = {
            _id: "formid"
            design: {
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
        
      it "units"
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

      it "entity"
        # @testQuestion({ _type: "EntityQuestion" }, [
        #   { 
        #     id: "data:questionid:value" 
        #     type: "join"
        #     # data#>>'{questionid,value}'
        #     jsonql: {
        #       type: "op"
        #       op: "::boolean"
        #       exprs: [
        #         { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{questionid,value}"] }
        #       ]
        #     }
        #   }
        # ])

      # it "site", ->
      # it "image", ->
      # it "images", ->
      # it "texts", ->