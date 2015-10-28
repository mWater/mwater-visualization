DataSource = require '../../DataSource'

# Caching data source for mWater. Requires jQuery
module.exports = class MWaterDataSource extends DataSource
  constructor: (apiUrl, client) ->
    @apiUrl = apiUrl
    @client = client

  performQuery: (query, cb) ->
    url = @apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query))
    if @client
      url += "&client=#{@client}"

    $.getJSON url, (rows) =>
      cb(null, rows)
    .fail (xhr) =>
      cb(new Error(xhr.responseText))
