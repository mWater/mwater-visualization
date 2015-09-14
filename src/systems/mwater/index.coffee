Schema = require '../../Schema'
SchemaBuilder = require './SchemaBuilder'
LayerFactory = require '../../maps/LayerFactory'
MWaterDataSource = require './MWaterDataSource'
WidgetFactory = require '../../widgets/WidgetFactory'

ReactSelect = require 'react-select'
fs = require 'fs'
async = require 'async'
querystring = require 'querystring'

exports.SchemaBuilder = SchemaBuilder

# Note: Requires jQuery!!

# Do a complete setup to get a schema, dataSource, properties, units and entityTypes
# Options are:
#   apiUrl: e.g. https://api.mwater.co/v3/
#   client, user, groups: login information. groups is array, user is string, client is string token of login
#   formIds: forms to include in schema
#   onFormIdsChange: called with new form ids if a form is added
#   newLayers: Array of new layers that can be created for a map. Defaults to custom markers layer e.g.
#     { name: "Custom Layer", type: "Markers", design: {} }
#   onMarkerClick: Called when a marker is clicked. Called with (table, id) where id is primary key
# 
# cb is called with (err, results) and results contains:
#   schema, dataSource, widgetFactory, layerFactory, entityTypes, properties, units,
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

        # Loads the form into the schema
        addFormToSchema = (formId, cb) ->
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
          .fail (xhr) =>
            cb(new Error(xhr.responseText))

        # Save form ids
        formIds = options.formIds

        # Create override for createTableSelectElement so that forms can be selected too
        createTableSelectElement = (table, onChange) ->
          React.createElement MWaterTableSelectElement, 
            apiUrl: options.apiUrl
            client: options.client
            schema: schema
            table: table
            onChange: (newTable) ->
              # If nothing, do that
              if not newTable
                return onChange(newTable)

              # If already loaded, just select it
              if schema.getTable(newTable)
                return onChange(newTable)

              # Get id of form (is in format responses:<some form id>)
              formId = newTable.split(":")[1]

              # Load form
              addFormToSchema(formId, (err) ->
                if err
                  throw err

                # Add to list of form ids
                formIds = _.union(formIds, [formId])

                # Fire change
                options.onFormIdsChange(formIds)

                # Accept change
                return onChange(newTable)                
              )

        # Override table selection
        schema.setCreateTableSelectElement(createTableSelectElement)

        # Add forms
        async.eachSeries options.formIds or [], (formId, callback) =>
          addFormToSchema(formId, callback)
        , (err) =>
          if err then return cb(err)

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
            })

      .fail (xhr) =>
        cb(new Error(xhr.responseText))
    .fail (xhr) =>
      cb(new Error(xhr.responseText))
  .fail (xhr) =>
    cb(new Error(xhr.responseText))

# Allows selection of a table. Loads forms as well and calls event if modified
class MWaterTableSelectElement extends React.Component
  @propTypes:
    apiUrl: React.PropTypes.string.isRequired # Url to hit api
    client: React.PropTypes.string            # Optional client
    schema: React.PropTypes.object.isRequired

    table: React.PropTypes.string
    onChange: React.PropTypes.func.isRequired # Called with table selected

  # Call back with array of { label:, value: }
  getFormOptions: (cb) =>
    query = {}
    if @props.client
      query.client = @props.client

    # Get names and basic of forms
    query.fields = JSON.stringify({ "design.name": 1, roles: 1, created: 1, modified: 1, state: 1 })
    query.selector = JSON.stringify({ design: { $exists: true }, state: { $ne: "deleted" } })

    # Get list of all form names
    $.getJSON @props.apiUrl + "forms?" + querystring.stringify(query), (forms) => 
      # TODO use name instead of design.name
      cb(null, _.map(forms, (form) -> { label: form.design.name.en, value: "responses:" + form._id }))
    .fail (xhr) =>
      cb(new Error(xhr.responseText))

  # Get table options in react-select format
  getAsyncOptions: (input, cb) =>
    # Get loaded tables
    options = _.map(@props.schema.getTables(), (t) -> { value: t.id, label: t.name })

    # Get form options
    @getFormOptions (err, formOptions) =>
      # Add non-duplicates
      for opt in formOptions
        if not @props.schema.getTable(opt.value)
          options.push(opt)

      cb(null, { options: options, complete: true })

  render: ->
    React.createElement(ReactSelect, 
      value: @props.table
      onChange: @props.onChange
      asyncOptions: @getAsyncOptions)

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
