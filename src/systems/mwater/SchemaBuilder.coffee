_ = require 'lodash'
Schema = require '../../Schema'
fs = require 'fs'
formUtils = require 'mwater-forms/lib/formUtils'

# Make a plural form
pluralize = (str) ->
  # Water doesn't pluralize
  if str.match(/ater$/)
    return str
  if str.match(/s$/)
    return str + "es"
  if str.match(/y$/)
    return str.substr(0, str.length - 1) + "ies"
  return str + "s"

# Builds a schema from properties and entity types
module.exports = class SchemaBuilder 
  constructor: (schema) ->
    @schema = schema

  # Pass in:
  #   entityTypes: list of entity types objects
  #   properties: list of all properties objects
  #   units: list of all units objects
  #   user: current username
  #   groups: current groups
  addEntities: (options) ->
    # Keep list of reverse join columns (one to many) to add later. table and column
    reverseJoins = []

    # For each entity type
    for entityType in options.entityTypes
      
      # Create table
      tableId = "entities.#{entityType.code}"
      @schema.addTable({ 
        id: tableId
        name: pluralize(entityType.name.en)
        ordering: "_created_on"
        primaryKey: "_id"
      })

      # Add properties
      for prop in options.properties
        # Filter out invisible ones
        if not _.any(prop._roles, (r) ->
          if r.to == "all"
            return true
          if options.user and r.to == "user:#{options.user}"
            return true
          if options.groups and r.to in _.map(options.groups or [], (g) -> "group:#{g}")
            return true
          return false
          )
          continue

        # Filter for this entity only
        if prop.entity_type != entityType.code
          continue

        if prop.type == "measurement"
          # Add magnitude and units
          @schema.addColumn(tableId, {
            id: prop.code + ".magnitude"
            name: prop.name.en + " (magnitude)"
            type: "decimal"
          })

          @schema.addColumn(tableId, {
            id: prop.code + ".unit"
            name: prop.name.en + " (units)"
            type: "enum"
            values: _.map(prop.units, (u) -> { id: u, name: _.findWhere(options.units, { code: u }).name.en })
          })

        else if prop.type == "entity"
          # Add two joins (to and from)
          @schema.addColumn(tableId, { 
            id: "#{tableId}.#{prop.code}"
            name: prop.name.en
            type: "join"
            join: {
              fromTable: tableId
              fromColumn: prop.code
              toTable: "entities." + prop.ref_entity_type
              toColumn: "_id"
              op: "="
              multiple: false
            }
          })

          reverseJoins.push({
            table: "entities." + prop.ref_entity_type
            column: {
              id: "!#{tableId}.#{prop.code}"
              name: pluralize(entityType.name.en)
              type: "join"
              join: {
                fromTable: "entities." + prop.ref_entity_type
                fromColumn: "_id"
                toTable: tableId
                toColumn: prop.code
                op: "="
                multiple: true 
              }
            }
          })

        else if prop.type == "enum"
          @schema.addColumn(tableId, {
            id: prop.code
            name: prop.name.en
            type: prop.type
            values: _.map(prop.values, (v) -> { id: v.code, name: v.name.en })
          })

        else if prop.type not in ['json', 'image', 'imagelist']
          @schema.addColumn(tableId, {
            id: prop.code
            name: prop.name.en
            type: prop.type
            values: prop.values
          })

      # Add extra columns
      @schema.addColumn(tableId, {
        id: "_created_by"
        name: "Added by user"
        type: "text"
      })

      @schema.addColumn(tableId, {
        id: "_created_for"
        name: "Added by group"
        type: "text"
      })

      @schema.addColumn(tableId, {
        id: "_created_on"
        name: "Date added"
        type: "datetime"
      })

    # Add reverse join columns
    for rj in reverseJoins
      @schema.addColumn(rj.table, rj.column)

    # # Add named expressions
    # @schema.addNamedExpr("entities.water_point", {
    #   id: "Water point type"
    #   name: "Water point type"
    #   expr: { type: "field", table: "entities.water_point", column: "type" }
    #   })

    # @schema.addNamedExpr("entities.water_point", {
    #   id: "Functional status"
    #   name: "Functional status"
    #   expr: { 
    #     type: "scalar"
    #     table: "entities.water_point"
    #     joins: ["source_notes"]
    #     aggr: "last"
    #     expr: { type: "field", table: "source_notes", column: "status" }
    #   }
    # })

    # @schema.addNamedExpr("entities.water_point", {
    #   id: "Date of last water test"
    #   name: "Date of last water test"
    #   expr: { 
    #     "type": "scalar",
    #     "table": "entities.water_point",
    #     "joins": [
    #       "!entities.water_test.water_point"
    #     ],
    #     "expr": {
    #       "type": "field",
    #       "table": "entities.water_test",
    #       "column": "_created_on"
    #     },
    #     "aggr": "last"
    #   }
    # })

    # # TODO name of these admin levels?
    # @schema.addNamedExpr("entities.water_point", {
    #   id: "State"
    #   name: "State"
    #   expr: { type: "field", table: "entities.water_point", column: "admin_04" }
    #   })

    # # TODO name of these admin levels?
    # @schema.addNamedExpr("entities.water_point", {
    #   id: "District"
    #   name: "District"
    #   expr: { type: "field", table: "entities.water_point", column: "admin_05" }
    #   })

    # Set table structure for water points
    @schema.setTableStructure("entities.water_point", 
      Schema.parseStructureFromText(
        fs.readFileSync(__dirname + '/structures/water_point.txt', 'utf-8')))

  addLegacyTables: () ->
    # TODO REMOVE STARTING HERE
    # Add source notes
    @schema.addTable({ 
      id: "source_notes"
      name: "Functionality Reports (legacy. do not use!)"
      ordering: "date"
    })

    # Add columns
    @schema.addColumn("source_notes", { id: "source", name: "Water Point Code", type: "text" })
    @schema.addColumn("source_notes", { id: "date", name: "Report Date", type: "date" })
    @schema.addColumn("source_notes", { id: "status", name: "Functional Status", type: "enum", values: [
      { id: 'ok', name: 'Functional' }
      { id: 'maint', name: 'Needs maintenance' }
      { id: 'broken', name: 'Non-functional' }
      { id: 'missing', name: 'No longer exists' }
      ] })
    @schema.addColumn("source_notes", { id: "notes", name: "Notes", type: "text" })

    @schema.addColumn("entities.water_point", {
      id: "source_notes"
      name: "Functional Reports (legacy. do not use!)"
      type: "join"
      join: {
        fromTable: "entities.water_point"
        fromColumn: "code"
        toTable: "source_notes"
        toColumn: "source"
        op: "="
        multiple: true
      }
    })
    # TODO REMOVE ENDING HERE

    # Add ecoli statuses pseudo-table
    @schema.addTable({ 
      id: "ecoli_statuses"
      name: "E.Coli Risk Level (experimental)"
      ordering: "date"
    })

    @schema.addColumn("ecoli_statuses", { id: "date", name: "Test Date", type: "date" })
    @schema.addColumn("ecoli_statuses", { id: "status", name: "E.Coli Risk Level", type: "enum", values: [
      { id: 'red', name: 'High (>=100 CFU/100mL)' }
      { id: 'yellow', name: 'Medium (>=1 CFU/100mL)' }
      { id: 'green', name: 'Low (<1 CFU/100mL)' }
      ] })

    @schema.addColumn("ecoli_statuses", {
      id: "water_point"
      name: "Water Point"
      type: "join"
      join: {
        fromTable: "ecoli_statuses"
        fromColumn: "water_point"
        toTable: "entities.water_point"
        toColumn: "_id"
        op: "="
        multiple: false
      }
    })

    @schema.addColumn("entities.water_point", {
      id: "ecoli_statuses"
      name: "E.Coli Risk Levels (experimental)"
      type: "join"
      join: {
        fromTable: "entities.water_point"
        fromColumn: "_id"
        toTable: "ecoli_statuses"
        toColumn: "water_point"
        op: "="
        multiple: true
      }
    })

  addForm: (form) ->
    # Create table
    @schema.addTable({
      id: "responses:#{form._id}"
      name: "Form: " + formUtils.localizeString(form.design.name)
      primaryKey: "_id"
    })

    structure = []
    
    # Get deployments
    deploymentValues = _.map(form.deployments, (dep) -> { id: dep._id, name: dep.name })
    @schema.addColumn("responses:#{form._id}", { id: "deployment", type: "enum", name: "Deployment", values: deploymentValues })
    structure.push({ type: "column", column: "deployment" })

    # Add user
    @schema.addColumn("responses:#{form._id}", { id: "user", type: "text", name: "Enumerator" })
    structure.push({ type: "column", column: "user" })

    # Add submitted on
    @schema.addColumn("responses:#{form._id}", { id: "submittedOn", type: "datetime", name: "Submitted On" })
    structure.push({ type: "column", column: "submittedOn" })

    # # Add status ONLY FINAL FOR NOW
    # @schema.addColumn("responses:#{form._id}", { id: "status", type: "enum", name: "Status", values: [
    #   { id: "draft", name: "Draft" }
    #   { id: "rejected", name: "Rejected" }
    #   { id: "pending", name: "Pending" }
    #   { id: "final", name: "Final" }
    # ]})
    # structure.push({ type: "column", column: "status" })

    @addFormItem(form, form.design, structure)
    @schema.setTableStructure("responses:#{form._id}", structure)

  addFormItem: (form, item, structure) ->
    addColumn = (column) =>
      @schema.addColumn("responses:#{form._id}", column)
      structure.push({ type: "column", column: column.id })

    # Add sub-items
    if item.contents
      if item._type == "Form"
        for subitem in item.contents
          @addFormItem(form, subitem, structure)

      else if item._type == "Section"        
        # Create section structure
        sectionStructure = []
        for subitem in item.contents
          @addFormItem(form, subitem, sectionStructure)
        structure.push({ type: "section", name: formUtils.localizeString(item.name), contents: sectionStructure })

    else if formUtils.isQuestion(item)
      # Get type of answer
      answerType = formUtils.getAnswerType(item)
      switch answerType
        when "text"
          # Get a simple text column
          column = {
            id: "data:#{item._id}:value"
            type: "text"
            name: formUtils.localizeString(item.text)
            jsonql: {
              type: "op"
              op: "#>>"
              exprs: [
                { type: "field", tableAlias: "{alias}", column: "data" }
                "{#{item._id},value}"
              ]
            }
          }
          addColumn(column)

        when "number"
          # Get a decimal or integer column
          if item.decimal
            column = {
              id: "data:#{item._id}:value"
              type: "decimal"
              name: formUtils.localizeString(item.text)
              jsonql: {
                type: "op"
                op: "::decimal"
                exprs: [
                  {
                    type: "op"
                    op: "#>>"
                    exprs: [
                      { type: "field", tableAlias: "{alias}", column: "data" }
                      "{#{item._id},value}"
                    ]
                  }
                ]
              }
            }
          else
            column = {
              id: "data:#{item._id}:value"
              type: "integer"
              name: formUtils.localizeString(item.text)
              jsonql: {
                type: "op"
                op: "::integer"
                exprs: [
                  {
                    type: "op"
                    op: "#>>"
                    exprs: [
                      { type: "field", tableAlias: "{alias}", column: "data" }
                      "{#{item._id},value}"
                    ]
                  }
                ]
              }
            }
          addColumn(column)

        when "choice"
          # Get a simple text column
          column = {
            id: "data:#{item._id}:value"
            type: "enum"
            name: formUtils.localizeString(item.text)
            jsonql: {
              type: "op"
              op: "#>>"
              exprs: [
                { type: "field", tableAlias: "{alias}", column: "data" }
                "{#{item._id},value}"
              ]
            }
            values: _.map(item.choices, (c) -> { id: c.id, name: formUtils.localizeString(c.label) })
          }
          addColumn(column)

        when "choices"
          for choice in item.choices
            column = {
              id: "data:#{item._id}:value:#{choice.id}"
              type: "boolean"
              name: formUtils.localizeString(item.text) + ": " + formUtils.localizeString(choice.label)
              jsonql: {
                type: "op"
                op: "like"
                exprs: [
                  {
                    type: "op"
                    op: "#>>"
                    exprs: [
                      { type: "field", tableAlias: "{alias}", column: "data" }
                      "{#{item._id},value}"
                    ]
                  }
                  "%\"#{choice.id}\"%"
                ]
              }
            }
            addColumn(column)

        when "date"
          # Fill in month and year and remove timestamp
          column = {
            id: "data:#{item._id}:value"
            type: "date"
            name: formUtils.localizeString(item.text)
            jsonql: {
              type: "op"
              op: "substr"
              exprs: [
                {
                  type: "op"
                  op: "rpad"
                  exprs:[
                    {
                      type: "op"
                      op: "#>>"
                      exprs: [
                        { type: "field", tableAlias: "{alias}", column: "data" }
                        "{#{item._id},value}"
                      ]
                    }
                    10
                    '-01-01'
                  ]
                }
                1
                10
              ]
            }
          }
          addColumn(column)

        when "boolean"
          column = {
            id: "data:#{item._id}:value"
            type: "boolean"
            name: formUtils.localizeString(item.text)
            jsonql: {
              type: "op"
              op: "::boolean"
              exprs: [
                {
                  type: "op"
                  op: "#>>"
                  exprs: [
                    { type: "field", tableAlias: "{alias}", column: "data" }
                    "{#{item._id},value}"
                  ]
                }
              ]
            }
          }

          addColumn(column)

        when "units"
          # Get a decimal or integer column
          name = formUtils.localizeString(item.text)
          if item.units.length > 1
            name += " (magnitude)"
          else if item.units.length == 1
            name += " (#{formUtils.localizeString(item.units[0].label)})"

          if item.decimal
            column = {
              id: "data:#{item._id}:value:quantity"
              type: "decimal"
              name: name
              jsonql: {
                type: "op"
                op: "::decimal"
                exprs: [
                  {
                    type: "op"
                    op: "#>>"
                    exprs: [
                      { type: "field", tableAlias: "{alias}", column: "data" }
                      "{#{item._id},value,quantity}"
                    ]
                  }
                ]
              }
            }
          else
            column = {
              id: "data:#{item._id}:value:quantity"
              type: "integer"
              name: name
              jsonql: {
                type: "op"
                op: "::integer"
                exprs: [
                  {
                    type: "op"
                    op: "#>>"
                    exprs: [
                      { type: "field", tableAlias: "{alias}", column: "data" }
                      "{#{item._id},value,quantity}"
                    ]
                  }
                ]
              }
            }
          addColumn(column)

          # If multiple units, add units column
          if item.units.length > 1
            column = {
              id: "data:#{item._id}:value:units"
              type: "enum"
              name: formUtils.localizeString(item.text) + " (units)"
              jsonql: {
                type: "op"
                op: "#>>"
                exprs: [
                  { type: "field", tableAlias: "{alias}", column: "data" }
                  "{#{item._id},value,units}"
                ]
              }
              values: _.map(item.units, (c) -> { id: c.id, name: formUtils.localizeString(c.label) })
            }
            addColumn(column)

        when "location"
          column = {
            id: "data:#{item._id}:value"
            type: "geometry"
            name: formUtils.localizeString(item.text)
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
                        { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{#{item._id},value,latitude}"] }
                      ]
                    }
                    {
                      type: "op"
                      op: "::decimal"
                      exprs: [
                        { type: "op", op: "#>>", exprs: [{ type: "field", tableAlias: "{alias}", column: "data" }, "{#{item._id},value,longitude}"] }
                      ]
                    }
                  ]
                }
                4326
              ]
            }
          }
          
          addColumn(column)

        when "site"
          column = {
            id: "data:#{item._id}:value"
            type: "join"
            name: formUtils.localizeString(item.text)
            join: {
              fromTable: "responses"
              fromColumn: {
                type: "op"
                op: "#>>"
                exprs: [
                  { type: "field", tableAlias: "{alias}", column: "data" }
                  "{#{item._id},value,code}"
                ]
              }
              toTable: if item.siteTypes then "entities." + _.first(item.siteTypes).toLowerCase().replace(" ", "_") else "entities.water_point"
              toColumn: "code"
              op: "="
              multiple: true
            }
          }

          addColumn(column)

        when "entity"
          column = {
            id: "data:#{item._id}:value"
            type: "join"
            name: formUtils.localizeString(item.text)
            join: {
              fromTable: "responses"
              fromColumn: {
                type: "op"
                op: "#>>"
                exprs: [
                  { type: "field", tableAlias: "{alias}", column: "data" }
                  "{#{item._id},value}"
                ]
              }
              toTable: "entities.#{item.entityType}"
              toColumn: { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "{alias}", column: "_id" }] }
              op: "="
              multiple: true
            }
          }

          addColumn(column)

