
# Fetches data for the charts
module.exports = class DataSource
  # Gets the data for a lookup of queries
  # e.g. { a: <some jsonql>, b: <some jsonql> }
  # Calls cb with (null, { a: <rows for a query>, b: <rows for b query> }
  # or (error) if there was an error
  fetchData: (queries, cb) ->
    throw new Error("Not implemented")
