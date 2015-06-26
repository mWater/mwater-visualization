_ = require 'lodash'
async = require 'async'

# Fetches data for the charts
module.exports = class DataSource
  # Gets the data for a lookup of queries
  # e.g. { a: <some jsonql>, b: <some jsonql> }
  # Calls cb with (null, { a: <rows for a query>, b: <rows for b query> }
  # or (error) if there was an error
  performQueries: (queries, cb) ->
    async.map _.pairs(queries), (item, callback) =>
      @performQuery(item[1], (err, rows) =>
        callback(err, [item[0], rows])
        )
    , (err, items) =>
      if err
        return cb(err)
      else
        cb(null, _.object(items))

  # Performs a single query. Calls cb with rows
  performQuery: (query, cb) ->
    throw new Error("Not implemented")
