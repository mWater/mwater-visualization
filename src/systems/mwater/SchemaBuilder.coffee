
# Builds a schema from properties and entity types
module.exports = class SchemaBuilder 
  addEntities: (schema, entityTypes, properties, units) ->
    # Keep list of reverse join columns (one to many) to add later. table and column
    reverseJoins = []

    # For each entity type
    for entityType in entityTypes
      
      # Create table
      tableId = "entities.#{entityType.code}"
      schema.addTable({ 
        id: tableId
        name: entityType.name.en
        ordering: "_created_on"
      })

      # Sort properties by known fields first
      knownProps = ['type', 'code', 'name', 'desc', 'location']
      properties = _.sortBy(properties, (p) -> if _.contains(knownProps, p.code) then _.indexOf(knownProps, p.code) else 9999)

      # Add properties
      for prop in properties
        # Filter for this entity only
        if prop.entity_type != entityType.code
          continue

        if prop.type == "measurement"
          # Add magnitude and units
          schema.addColumn(tableId, {
            id: prop.code + ".magnitude"
            name: prop.name.en + " (magnitude)"
            type: "decimal"
          })

          schema.addColumn(tableId, {
            id: prop.code + ".unit"
            name: prop.name.en + " (units)"
            type: "enum"
            values: _.map(prop.units, (u) -> { id: u, name: _.findWhere(units, { code: u }).name.en })
          })

        else if prop.type == "entity"
          # Add two joins (to and from)
          schema.addColumn(tableId, { 
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
            table: tableId
            column: {
              id: "!#{tableId}.#{prop.code}"
              name: entityType.name.en
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
          schema.addColumn(tableId, {
            id: prop.code
            name: prop.name.en
            type: prop.type
            values: _.map(prop.values, (v) -> { id: v.code, name: v.name.en })
          })

        else if prop.type not in ['json', 'image', 'imagelist']
          schema.addColumn(tableId, {
            id: prop.code
            name: prop.name.en
            type: prop.type
            values: prop.values
          })

      # Add extra columns
      schema.addColumn(tableId, {
        id: "_created_by"
        name: "Created by user"
        type: "text"
      })

      schema.addColumn(tableId, {
        id: "_created_for"
        name: "Created by group"
        type: "text"
      })

      # Special columns
      if entityType.code == "water_point"
        schema.addColumn(tableId, {
          id: "wpdx.management"
          name: "Management (WPDX)"
          type: "enum"
          values: [
            { id: "Community Management", name: "Community Management" }
            { id: "Private Operator/Delegated Management", name: "Private Operator/Delegated Management" }
            { id: "Institutional Management", name: "Institutional Management" }
            { id: "Other", name: "Other" }
            { id: "Direct Government Operation", name: "Direct Government Operation" }
          ]
        })        

        schema.addColumn(tableId, {
          id: "wpdx.install_year"
          name: "Install Year (WPDX)"
          type: "integer"
        })        

    # Add reverse join columns
    for rj in reverseJoins
      schema.addColumn(rj.table, rj.column)

    # Add names expressions
    schema.addNamedExpr("entities.water_point", {
      id: "Water Point Type"
      name: "Water Point Type"
      expr: { type: "field", table: "entities.water_point", column: "type" }
      })

    schema.addNamedExpr("entities.water_point", {
      id: "Functional Status"
      name: "Functional Status"
      expr: { 
        type: "scalar"
        table: "entities.water_point"
        joins: ["source_notes"]
        aggr: "last"
        expr: { type: "field", table: "source_notes", column: "status" }
      }
    })

  addLegacyTables: (schema) ->
    # Add source notes
    schema.addTable({ 
      id: "source_notes"
      name: "Functionality Reports"
      ordering: "date"
    })

    # Add columns
    schema.addColumn("source_notes", { id: "source", name: "Water Point Code", type: "text" })
    schema.addColumn("source_notes", { id: "date", name: "Report Date", type: "date" })
    schema.addColumn("source_notes", { id: "status", name: "Functional Status", type: "enum", values: [
      { id: 'ok', name: 'Functional' }
      { id: 'maint', name: 'Needs maintenance' }
      { id: 'broken', name: 'Non-functional' }
      { id: 'missing', name: 'No longer exists' }
      ] })
    schema.addColumn("source_notes", { id: "notes", name: "Notes", type: "text" })

    schema.addColumn("entities.water_point", {
      id: "source_notes"
      name: "Functional Reports"
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

    # # Add source notes
    # schema.addTable({ 
    #   id: "ecoli_statuses"
    #   name: "E.Coli Tests"
    #   ordering: "date"
    # })

    # schema.addColumn("ecoli_statuses", { id: "_id", name: "Number of Reports", type: "id" })
    # schema.addColumn("ecoli_statuses", { id: "source", name: "Water Point Code", type: "text" })
    # schema.addColumn("ecoli_statuses", { id: "date", name: "Test Date", type: "date" })
    # schema.addColumn("ecoli_statuses", { id: "status", name: "E.Coli Risk Level", type: "enum", values: [
    #   { id: 'red', name: 'High (>=100 CFU/100mL)' }
    #   { id: 'yellow', name: 'Medium (>=1 CFU/100mL)' }
    #   { id: 'green', name: 'Low (<1 CFU/100mL)' }
    #   ] })

    # schema.addColumn("entities.water_point", {
    #   id: "entities.water_point.ecoli_statuses"
    #   name: "E.Coli Tests"
    #   type: "join"
    #   join: {
    #     fromTable: "entities.water_point"
    #     fromColumn: "code"
    #     toTable: "ecoli_statuses"
    #     toColumn: "source"
    #     op: "="
    #     multiple: true
    #   }
    # })


