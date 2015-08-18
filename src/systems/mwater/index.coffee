Schema = require '../../Schema'
SchemaBuilder = require './SchemaBuilder'
MWaterDataSource = require './MWaterDataSource'

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


