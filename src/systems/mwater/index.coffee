Schema = require '../../Schema'
SchemaBuilder = require './SchemaBuilder'
LayerFactory = require '../../maps/LayerFactory'
MWaterDataSource = require './MWaterDataSource'
WidgetFactory = require '../../widgets/WidgetFactory'

fs = require 'fs'
async = require 'async'

exports.SchemaBuilder = SchemaBuilder

# Note: Requires jQuery!!

# Do a complete setup to get a schema, dataSource, properties, units and entityTypes
# Options are:
#   apiUrl: e.g. https://api.mwater.co/v3/
#   client, user, groups: login information. groups is array, user is string, client is string token of login
#   newLayers: Array of new layers that can be created for a map. Defaults to custom markers layer e.g.
#     { name: "Custom Layer", type: "Markers", design: {} }
#   onMarkerClick: Called when a marker is clicked. Called with (table, id) where id is primary key
# 
# cb is called with (err, results) and results contains:
#   schema, dataSource, widgetFactory, layerFactory, entityTypes, properties, units, onFormTableSelect, loadFormTables
#   loadExtraTables(tableIds, callback): loads the specified extra tables (e.g. "responses:someformid"). Calls callback when done
exports.setup = (options, cb) ->
  # Add client url if specified
  if options.client
    clientUrl = "?client=#{options.client}"
  else
    clientUrl = ""

  # Get properties and entity types
  $.getJSON options.apiUrl + "entity_types#{clientUrl}", (entityTypes) => 
    $.getJSON options.apiUrl + "properties#{clientUrl}", (properties) => 
      $.getJSON options.apiUrl + "units#{clientUrl}", (units) => 
        # Create schema
        schema = new Schema()

        schemaBuilder = new SchemaBuilder(schema)
        schemaBuilder.addEntities(entityTypes: entityTypes, properties: properties, units: units, user: options.user, groups: options.groups)
        schemaBuilder.addLegacyTables()

        # Create data source
        dataSource = new MWaterDataSource(options.apiUrl, options.client)

        # Loads the extra table (usually a form)
        loadExtraTable = (tableId, cb) ->
          # If not known type, continue
          if not tableId.match(/^responses:/)
            return cb()

          # If already loaded, continue
          if schema.getTable(tableId)
            return cb()

          formId = tableId.split(":")[1]

          # Load form
          url = options.apiUrl
          url += "forms?selector=" + encodeURIComponent(JSON.stringify(_id:formId))
          if options.client
            url += "&client=" + options.client

          $.getJSON url, (forms) => 
            if forms[0]
              form = forms[0]
              schemaBuilder.addForm(form)
              cb()
            else
              cb(new Error("Form #{formId} not found or access denied"))
          .fail (xhr) =>
            cb(new Error(xhr.responseText))

        loadExtraTables = (tableIds, callback) ->
          # Add forms
          async.eachSeries tableIds or [], loadExtraTable, callback

        layerFactory = new LayerFactory({
          schema: schema
          dataSource: dataSource
          apiUrl: options.apiUrl
          client: options.client
          newLayers: options.newLayers or [{ name: "Custom Layer", type: "Markers", design: {} }]
          onMarkerClick: options.onMarkerClick
        })

        widgetFactory = new WidgetFactory(schema: schema, dataSource: dataSource, layerFactory: layerFactory)

        # Call back with all data
        cb(null, {
          schema: schema
          dataSource: dataSource
          layerFactory: layerFactory
          widgetFactory: widgetFactory
          entityTypes: entityTypes
          properties: properties
          units: units
          loadExtraTables: loadExtraTables
          })

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
