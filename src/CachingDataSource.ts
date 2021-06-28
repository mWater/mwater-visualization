// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let CachingDataSource
import { DataSource } from "mwater-expressions"
import LRU from "lru-cache"

// Data source that caches requests. Designed to be simple for implementation
// Pass in option of perform which is function with signature (query, cb) where cb is called with (null, rows) on success
export default CachingDataSource = class CachingDataSource extends DataSource {
  constructor(options) {
    super()
    this.perform = options.perform

    this.cache = new LRU({ max: 500, maxAge: 1000 * 15 * 60 })
  }

  performQuery(query, cb) {
    // If no callback, use promise
    if (!cb) {
      return new Promise((resolve, reject) => {
        return this.performQuery(jsonql, (error, rows) => {
          if (error) {
            return reject(error)
          } else {
            return resolve(rows)
          }
        })
      })
    }

    const cacheKey = JSON.stringify(query)
    const cachedRows = this.cache.get(cacheKey)
    if (cachedRows) {
      return cb(null, cachedRows)
    }

    return this.perform(query, (err, rows) => {
      if (!err) {
        // Cache rows
        this.cache.set(cacheKey, rows)
      }

      return cb(err, rows)
    })
  }
}
