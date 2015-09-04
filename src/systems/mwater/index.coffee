Schema = require '../../Schema'
SchemaBuilder = require './SchemaBuilder'
MWaterDataSource = require './MWaterDataSource'
fs = require 'fs'

# Note: Requires jQuery!!

exports.SchemaBuilder = SchemaBuilder

# Create a data source for mWater API
exports.createDataSource = (apiUrl, client) ->
  return new MWaterDataSource(apiUrl, client)

# Options are:
# apiUrl, client, user, groups
# form is optional complete form
exports.createSchema = (options, cb) ->
  if options.client
    clientUrl = "?client=#{options.client}"
  else
    clientUrl = ""

  # Get properties and entity types
  $.getJSON options.apiUrl + "entity_types#{clientUrl}", (entity_types) => 
    $.getJSON options.apiUrl + "properties#{clientUrl}", (properties) => 
      $.getJSON options.apiUrl + "units#{clientUrl}", (units) => 
        # Create schema
        schema = new Schema()
        schemaBuilder = new SchemaBuilder(schema)
        if options.form
          schemaBuilder.addForm(options.form)
        schemaBuilder.addEntities(entity_types, properties, units, options.user, options.groups)
        schemaBuilder.addLegacyTables()

        cb(null, schema)
      .fail (xhr) =>
        cb(new Error(xhr.responseText))
    .fail (xhr) =>
      cb(new Error(xhr.responseText))
  .fail (xhr) =>
    cb(new Error(xhr.responseText))

# Gets the structure of the properties of an entity type
# { type: "property", property: the property }
# and 
# { type: "section", name: section name, contents: array of properties/sections etc. }
# properties is properties of the entity type
exports.getPropertiesStructure = (properties, entityType) ->
  # TODO this is all a massive hack to be better organized when structure will be built into properties
  # and schemas will have sections for tables directly
  structure = null
  switch entityType
    when "water_point"
      structure = Schema.parseStructureFromText(
        fs.readFileSync(__dirname + '/structures/water_point.txt', 'utf-8'))

  if not structure
    return _.map(properties, (p) -> { type: "property", property: p })

  mapStructure = (str) ->
    return _.compact(
      _.map(str, (item) ->
        if item.type == "column"
          prop = _.findWhere(properties, code: item.column)
          if prop
            return { type: "property", property: prop }
        else if item.type == "section"
          return { type: "section", name: item.name, contents: mapStructure(item.contents) }
      )
    )

  return mapStructure(structure)
