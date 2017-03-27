_ = require 'lodash'

Schema = require('mwater-expressions').Schema
MWaterDataSource = require('mwater-expressions/lib/MWaterDataSource')
querystring = require 'querystring'

# Loads a schema and data source that is specific to mWater server
# options: 
#   apiUrl: e.g. "https://api.mwater.co/v3/". required
#   client: client id if logged in. optional
#   share: share if using a share to get schema. optional
#   asUser: Load schema as a specific user (for shared dashboards, etc). optional
#   extraTables: Extra tables to load in schema. Forms are not loaded by default as they are too many
# callback is called with (error, config) where config is { schema, dataSource }
module.exports = (options, callback) ->
  # Load schema
  query = {}
  if options.client
    query.client = options.client
  if options.share
    query.share = options.share
  if options.asUser
    query.asUser = options.asUser
  if options.extraTables and options.extraTables.length > 0
    query.extraTables = options.extraTables.join(',')

  url = options.apiUrl + "jsonql/schema?" + querystring.stringify(query)

  $.getJSON url, (schemaJson) =>
    schema = new Schema(schemaJson)
    dataSource = new MWaterDataSource(options.apiUrl, options.client, { serverCaching: false, localCaching: true })

    callback(null, {
      schema: schema
      dataSource: dataSource
      })
  .fail (xhr) =>
    console.error xhr.responseText
    callback(new Error(xhr.responseText))