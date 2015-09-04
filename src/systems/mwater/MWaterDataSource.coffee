LRU = require("lru-cache")
DataSource = require '../../DataSource'

# Caching data source for mWater. Requires jQuery
module.exports = class MWaterDataSource extends DataSource
  constructor: (apiUrl, client) ->
    @apiUrl = apiUrl
    @client = client
    @cache = LRU({ max: 50, maxAge: 1000 * 15 * 60 })

  # Resets the cache
  clearCache: -> 
    @cache.reset()

  performQuery: (query, cb) ->
    cacheKey = JSON.stringify(query)
    cachedRows = @cache.get(cacheKey)
    if cachedRows
      return cb(null, cachedRows)

    url = @apiUrl + "jsonql?jsonql=" + encodeURIComponent(JSON.stringify(query))
    if @client
      url += "&client=#{@client}"

    $.getJSON url, (rows) =>
      # Cache rows
      @cache.set(cacheKey, rows)
      cb(null, rows)
    .fail (xhr) =>
      cb(new Error(xhr.responseText))
