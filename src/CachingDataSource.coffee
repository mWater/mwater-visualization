DataSource = require('mwater-expressions').DataSource
LRU = require("lru-cache")

# Data source that caches requests. Designed to be simple for implementation
# Pass in option of perform which is function with signature (query, cb) where cb is called with (null, rows) on success
module.exports = class CachingDataSource extends DataSource
  constructor: (options) ->
    super()
    @perform = options.perform

    @cache = LRU({ max: 500, maxAge: 1000 * 15 * 60 })

  performQuery: (query, cb) ->
    cacheKey = JSON.stringify(query)
    cachedRows = @cache.get(cacheKey)
    if cachedRows
      return cb(null, cachedRows)

    @perform(query, (err, rows) =>
      if not err
        # Cache rows
        @cache.set(cacheKey, rows)
        
      cb(err, rows)
    )

