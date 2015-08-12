Schema = require '../../Schema'

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

    schema.setTableStructure("entities.water_point", Schema.parseStructureFromText('''
type Type
mwa_scheme_type MWA scheme type

+Name and location data
  name Name
  desc Description
  location Location
  location_accuracy Location Accuracy
  location_altitude Location Altitude
  admin_02_country Country
  admin_08_ethiopia_woreda Woreda
  admin_10_ethiopia_kebele Kebele
  photos Photos

+Technical attributes
  installation_date Date of installation
  supply Supply
  supply_other Supply (other)
  treatment_works Treatment works
  drilling_method Drilling method
  drilling_method_other Drilling method (other)
  pump_lifting_device Pump/lifting device
  pump_lifting_device_other Pump lifting device (Other)
  rehab Rehabilitated water point

+Identification codes
  code mWater Code
  the_water_trust_uganda_id The Water Trust Uganda Id
  oxfam_south_sudan_id Oxfam South Sudan Id
  charity_water_id charity: water Id
  tz_wpms_id Tz-WPMS Id

+Program and funding data
  wo_initiative Water.org Initiative
  wo_partner_name Water.org Partner Name
  wo_program_number Water.org Program Number
  wo_program_type Water.org Program Type
  twp_partner TWP Partner
  twp_project_id TWP Project ID
  twp_project_location TWP Project Location
  twp_project_type TWP Project Type
  twp_url TWP Project Link

+Other
  legacy_attrs Attributes
  legacy_custom Custom Fields
  legacy_tags Tags

+Water Point Data Exchange (WPDX)
  wpdx_converted_fields WPDX Converted fields
  wpdx_country WPDX Country (ISO 2-letter code)
  wpdx_data_source WPDX Data source
  wpdx_id WPDX Water point ID
  wpdx_installer WPDX Installer
  wpdx_management_structure WPDX Management structure
  wpdx_primary_admin_div WPDX Primary administrative division
  wpdx_raw_data_source_url WPDX Raw data source URL
  wpdx_secondary_admin_div WPDX Secondary administrative division
  wpdx_water_point_technology WPDX Water point technology
  wpdx_water_source WPDX Water Source
'''))
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


