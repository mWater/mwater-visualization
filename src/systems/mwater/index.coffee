Schema = require '../../Schema'
SchemaBuilder = require './SchemaBuilder'
MWaterDataSource = require './MWaterDataSource'

# Note: Requires jQuery!!

# Create a data source for mWater API
exports.createDataSource = (apiUrl, client) ->
  return new MWaterDataSource(apiUrl, client)

exports.createSchema = (apiUrl, client, user, groups, cb) ->
  if client
    clientUrl = "?client=#{client}"
  else
    clientUrl = ""

  # Get properties and entity types
  $.getJSON apiUrl + "entity_types#{clientUrl}", (entity_types) => 
    $.getJSON apiUrl + "properties#{clientUrl}", (properties) => 
      $.getJSON apiUrl + "units#{clientUrl}", (units) => 
        # Create schema
        schema = new Schema()
        schemaBuilder = new SchemaBuilder()
        schemaBuilder.addEntities(schema, entity_types, properties, units, user, groups)
        schemaBuilder.addLegacyTables(schema)

        cb(null, schema)
      .fail (xhr) =>
        cb(new Error(xhr.responseText))
    .fail (xhr) =>
      cb(new Error(xhr.responseText))
  .fail (xhr) =>
    cb(new Error(xhr.responseText))


